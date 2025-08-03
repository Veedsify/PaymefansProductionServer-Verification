"use client";
import {
  Camera,
  LucideLoader,
  AlertCircle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import localforage from "localforage";
import { useEffect, useRef, useState, useCallback } from "react";
import handleMediaProcessing from "@/utils/handleMediaProcessing";
import toast from "react-hot-toast";
import {
  printCameraDiagnostics,
  debugCameraSetup,
} from "@/utils/cameraDiagnostics";

const FaceVerification = () => {
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // null = checking, false = denied, true = granted
  const [countdown, setCountdown] = useState<number>(0);
  const [captureComplete, setCaptureComplete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // New state for server submission
  const [error, setError] = useState<{
    status: boolean;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const checkCameraPermissions = async () => {
      console.log("Starting camera permission check...");

      try {
        // First check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("getUserMedia not supported");
          setHasPermission(false);
          setError({
            status: true,
            message:
              "Camera is not supported on this device or browser. Please use a modern browser that supports camera access.",
          });
          return;
        }

        // Check existing permissions if available
        if (navigator.permissions) {
          try {
            const permission = await navigator.permissions.query({
              name: "camera" as PermissionName,
            });
            console.log("Camera permission status:", permission.state);

            if (permission.state === "denied") {
              console.log("Camera permission explicitly denied");
              setHasPermission(false);
              setError({
                status: true,
                message:
                  "Camera access has been denied. Please enable camera permissions in your browser settings and refresh the page.",
              });
              return;
            }
          } catch {
            console.log(
              "Permission query not supported, proceeding with direct access"
            );
          }
        }

        console.log("Attempting to get camera access...");

        // Attempt to get camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        console.log("Camera stream obtained successfully");

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          // Set up event handlers before trying to play
          const videoElement = videoRef.current;

          const handleVideoReady = () => {
            console.log("Video is ready and playing");
            setHasPermission(true);
            setCanContinue(true);
            setError(null);
          };

          const handleVideoError = (e: string | Event) => {
            console.error("Video element error:", e);
            setHasPermission(false);
            setError({
              status: true,
              message:
                "Failed to display camera feed. Please refresh the page and try again.",
            });
          };

          // Multiple ways to detect when video is ready
          videoElement.onloadedmetadata = handleVideoReady;
          videoElement.oncanplay = handleVideoReady;
          videoElement.onerror = handleVideoError;

          // Try to play the video
          try {
            await videoElement.play();
            console.log("Video play() successful");

            // If we get here and haven't set permission yet, set it now
            if (hasPermission === null) {
              console.log("Setting permission to true after successful play");
              handleVideoReady();
            }
          } catch (playError) {
            console.log("Video play failed, but this might be OK:", playError);
            // Don't fail here - some browsers block autoplay but camera still works
            // Set a timeout to check if video is actually working
            setTimeout(() => {
              if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                console.log("Video dimensions detected, camera is working");
                handleVideoReady();
              }
            }, 1000);
          }

          // Fallback timeout in case events don't fire
          setTimeout(() => {
            if (hasPermission === null) {
              console.log("Timeout reached - forcing camera to active state");
              handleVideoReady();
            }
          }, 2000);
        }
      } catch (err: unknown) {
        console.error("Camera access error:", err);
        setHasPermission(false);

        // Provide more specific error messages based on the error type
        let errorMessage =
          "Camera access is required for verification. Please allow camera permission and refresh the page.";

        if (err instanceof Error) {
          console.log("Error name:", err.name, "Error message:", err.message);

          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            errorMessage =
              "Camera access was denied. Please click &apos;Allow&apos; when prompted for camera permission, or enable camera access in your browser settings.";
          } else if (
            err.name === "NotFoundError" ||
            err.name === "DevicesNotFoundError"
          ) {
            errorMessage =
              "No camera found on this device. Please ensure you have a working camera connected.";
          } else if (
            err.name === "NotReadableError" ||
            err.name === "TrackStartError"
          ) {
            errorMessage =
              "Camera is already in use by another application. Please close other apps using the camera and try again.";
          } else if (
            err.name === "OverconstrainedError" ||
            err.name === "ConstraintNotSatisfiedError"
          ) {
            errorMessage =
              "Camera doesn&apos;t meet the required specifications. Please try with a different camera.";
          } else if (err.name === "NotSupportedError") {
            errorMessage =
              "Camera access is not supported on this browser. Please use a modern browser like Chrome, Firefox, or Safari.";
          } else if (err.name === "AbortError") {
            errorMessage = "Camera access was interrupted. Please try again.";
          }
        }

        setError({
          status: true,
          message: errorMessage,
        });
      }
    };

    checkCameraPermissions();

    return () => {
      // Cleanup camera stream
      if (streamRef.current) {
        console.log("Cleaning up camera stream");
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [hasPermission]);

  const handleStopRecording = useCallback(async () => {
    setProcessing(true);
    setIsRecording(false);

    try {
      if (recordedChunks.current.length > 0) {
        // Create video from recorded chunks
        const recordedBlob = new Blob(recordedChunks.current, {
          type: "video/webm",
        });

        // Create a temporary video element to extract frame
        const tempVideo = document.createElement("video");
        tempVideo.src = URL.createObjectURL(recordedBlob);

        await new Promise((resolve) => {
          tempVideo.onloadeddata = resolve;
        });

        tempVideo.currentTime = 1.5; // Extract frame from middle of video

        await new Promise((resolve) => {
          tempVideo.onseeked = resolve;
        });

        // Create canvas to capture frame
        const canvas = document.createElement("canvas");
        canvas.width = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);

        // Convert canvas to JPEG Blob
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const fileReader = new FileReader();
              fileReader.readAsDataURL(blob);
              fileReader.onloadend = async () => {
                // Save face video for verification
                await localforage.setItem("faceVideo", fileReader.result);
                setCaptureComplete(true);
                setProcessing(false);
                toast.success("Face capture completed successfully!");

                // Don't automatically submit - let user click Continue
              };
            }
          },
          "image/jpeg",
          0.9
        );

        // Cleanup
        URL.revokeObjectURL(tempVideo.src);
      }
    } catch (err: unknown) {
      console.error("Processing error:", err);
      setError({
        status: true,
        message: "Failed to process face capture. Please try again.",
      });
      setProcessing(false);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    try {
      recordedChunks.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStopRecording;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop recording after 3 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 3000);
    } catch {
      setError({
        status: true,
        message: "Failed to start recording. Please try again.",
      });
    }
  }, [handleStopRecording]);

  const startCountdown = useCallback(() => {
    setError(null);
    setCountdown(3);
    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [startRecording]);

  const resetCapture = () => {
    setCaptureComplete(false);
    setCountdown(0);
    setError(null);
    recordedChunks.current = [];
  };

  const handleContinueToServer = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      toast.loading("Submitting verification...", {
        id: "verification-submit",
      });

      const uploadMediaForVerification = await handleMediaProcessing();

      if (!uploadMediaForVerification.error) {
        toast.success("Verification submitted successfully!", {
          id: "verification-submit",
        });
        sessionStorage.clear();
        // Redirect to pending status page instead of waiting for processing
        window.location.href = `/verification/pending/${uploadMediaForVerification.token}`;
      } else {
        toast.error("Verification failed", { id: "verification-submit" });
        setError({
          status: true,
          message: uploadMediaForVerification.message,
        });
        setIsSubmitting(false);
        // Don't redirect immediately, let the user see the error and potentially retry
        // setTimeout(() => {
        //   window.location.href = `/verification/failed/${uploadMediaForVerification.token}`;
        // }, 3000);
      }
    } catch (processingError: unknown) {
      console.error("Media processing error:", processingError);
      toast.error("Submission failed", { id: "verification-submit" });
      setError({
        status: true,
        message: "Failed to submit verification. Please try again.",
      });
      setIsSubmitting(false);
    }
  }, []);

  const retryCamera = useCallback(async () => {
    setHasPermission(null); // Set to checking state
    setError(null);

    // Cleanup existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Re-trigger camera initialization
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        const videoElement = videoRef.current;

        const handleRetrySuccess = () => {
          console.log("Camera retry successful");
          setHasPermission(true);
          setCanContinue(true);
          setError(null);
        };

        // Multiple ways to detect when video is ready
        videoElement.onloadedmetadata = handleRetrySuccess;
        videoElement.oncanplay = handleRetrySuccess;

        // Try to play the video
        try {
          await videoElement.play();
          console.log("Retry video play() successful");

          // If we get here and haven't set permission yet, set it now
          if (hasPermission === null) {
            handleRetrySuccess();
          }
        } catch (playError) {
          console.log(
            "Retry video play failed, checking dimensions:",
            playError
          );
          // Check if video is actually working via dimensions
          setTimeout(() => {
            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
              console.log(
                "Retry: Video dimensions detected, camera is working"
              );
              handleRetrySuccess();
            }
          }, 1000);
        }

        // Fallback timeout for retry
        setTimeout(() => {
          if (hasPermission === null) {
            console.log("Retry timeout - forcing success");
            handleRetrySuccess();
          }
        }, 2000);
      }
    } catch (err: unknown) {
      console.error("Camera retry failed:", err);
      setHasPermission(false);
      setError({
        status: true,
        message:
          "Failed to access camera. Please check your browser permissions and try again.",
      });
    }
  }, [hasPermission]);

  // Loading/checking state
  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center max-w-md p-2 mx-auto space-y-6 md:p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <LucideLoader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-slate-950">
            Checking Camera Access
          </h2>
          <p className="text-sm text-slate-600">
            Please wait while we check for camera permissions...
          </p>
        </div>

        {/* Debug information in development mode */}
        {process.env.NODE_ENV === "development" && (
          <div className="w-full p-3 text-xs rounded-lg text-slate-400 bg-slate-50">
            <p>Debug: Camera initialization in progress</p>
            <p>Stream available: {streamRef.current ? "Yes" : "No"}</p>
            <p>Video element ready: {videoRef.current ? "Yes" : "No"}</p>
            <div className="flex mt-2 gap-2">
              <button
                onClick={() => {
                  console.log("Debug: Force setting permission to true");
                  setHasPermission(true);
                  setCanContinue(true);
                }}
                className="px-3 py-1 text-xs text-yellow-800 bg-yellow-200 rounded hover:bg-yellow-300"
              >
                Force Continue
              </button>
              <button
                onClick={() => debugCameraSetup()}
                className="px-3 py-1 text-xs text-blue-800 bg-blue-200 rounded hover:bg-blue-300"
              >
                Debug Setup
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center max-w-md min-h-screen p-6 mx-auto space-y-6">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-slate-950">
            Camera Access Required
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            {error?.message ||
              "Please allow camera access to continue with face verification."}
          </p>
          <div className="p-3 text-xs rounded-lg text-slate-500 bg-slate-50">
            <p className="mb-2 font-medium">To enable camera access:</p>
            <ul className="text-left space-y-1">
              <li>
                • Click the camera icon in your browser&apos;s address bar
              </li>
              <li>
                • Select &quot;Allow&quot; when prompted for camera permission
              </li>
              <li>• Refresh the page if needed</li>
            </ul>
          </div>
        </div>
        <div className="flex w-full gap-3">
          <button
            onClick={retryCamera}
            className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* Debug mode - only show in development */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => printCameraDiagnostics()}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Run Camera Diagnostics (Check Console)
          </button>
        )}
      </div>
    );
  }

  if (captureComplete) {
    return (
      <div className="flex flex-col items-center justify-center max-w-md p-6 mx-auto">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="my-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-slate-950">
            Face Captured Successfully!
          </h2>
          <p className="text-sm text-slate-600">
            Your face has been captured and will be used for verification.
          </p>
        </div>

        {/* Show loading state when submitting */}
        {isSubmitting && (
          <div className="w-full p-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center gap-3">
              <LucideLoader className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Submitting Verification
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  Please wait while we process your verification...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error?.status && !isSubmitting && (
          <div className="w-full p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Submission Error
                </p>
                <p className="mt-1 text-xs text-red-700">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex w-full gap-3">
          <button
            onClick={resetCapture}
            className="flex items-center justify-center flex-1 px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors gap-2"
            disabled={isSubmitting}
          >
            <RotateCcw className="w-4 h-4" />
            Retake
          </button>
          <button
            onClick={handleContinueToServer}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LucideLoader className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-md p-2 mx-auto space-y-6 md:p-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Face Verification</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Look directly at the camera and follow the instructions
        </p>
      </div>

      {/* Instructions */}
      <div className="w-full p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="mb-2 text-sm font-medium text-blue-900">
          Instructions:
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Face the camera directly</li>
          <li>• Ensure good lighting</li>
          <li>• Remove sunglasses and hats</li>
          <li>• Keep your eyes open</li>
          <li>• Stay still during capture</li>
        </ul>
      </div>

      {/* Camera Preview */}
      <div className="relative w-full bg-gray-200 rounded-xl aspect-[3/4] overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls={false}
          className="object-cover w-full h-full"
        />

        {/* Overlay Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Face Guide Oval */}
          <div className="w-48 h-64 border-4 border-white border-dashed rounded-full opacity-70"></div>
        </div>

        {/* Countdown */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-6xl font-bold text-white">{countdown}</div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute flex items-center px-3 py-1 text-sm text-white bg-red-500 rounded-full top-4 right-4 gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Recording...
          </div>
        )}

        {/* Processing Overlay */}
        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex items-center p-4 bg-white rounded-lg gap-3">
              <LucideLoader className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}

        {/* Guide Video (optional) */}
        {canContinue && !isRecording && countdown === 0 && (
          <video
            autoPlay
            muted
            loop
            className="absolute z-50 object-cover w-20 rounded-full bottom-2 right-2 aspect-square outline outline-1 outline-white"
          >
            <source src="/videos/output.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* Error Display */}
      {error?.status && (
        <div className="w-full p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="mt-1 text-xs text-red-700">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex w-full gap-3">
        <button
          className="flex-1 px-4 py-2 border rounded-lg text-slate-600 border-slate-300 hover:bg-slate-50 transition-colors"
          onClick={() => window.history.back()}
          disabled={processing || isRecording || countdown > 0}
        >
          Back
        </button>
        <button
          onClick={startCountdown}
          disabled={processing || isRecording || countdown > 0 || !canContinue}
          className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
            canContinue && !processing && !isRecording && countdown === 0
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <Camera className="w-4 h-4" />
          {countdown > 0
            ? `Starting in ${countdown}...`
            : isRecording
            ? "Recording..."
            : "Start Capture"}
        </button>
      </div>

      {/* Additional Info */}
      <div className="text-center">
        <p className="text-xs text-gray-600">
          Once capturing is done, you will be automatically redirected.
        </p>
      </div>
    </div>
  );
};

export default FaceVerification;
