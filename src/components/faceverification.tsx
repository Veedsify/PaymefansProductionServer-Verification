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

const FaceVerification = () => {
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [captureComplete, setCaptureComplete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [error, setError] = useState<{
    status: boolean;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera with better error handling
  const initCamera = useCallback(async () => {
    setHasPermission(null);
    setError(null);

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current)
            return reject(new Error("Video element not found"));

          const handleCanPlay = () => {
            videoRef.current?.removeEventListener("canplay", handleCanPlay);
            resolve();
          };

          const handleError = () => {
            videoRef.current?.removeEventListener("error", handleError);
            reject(new Error("Video playback failed"));
          };

          videoRef.current.addEventListener("canplay", handleCanPlay);
          videoRef.current.addEventListener("error", handleError);

          // Fallback timeout
          setTimeout(() => {
            videoRef.current?.removeEventListener("canplay", handleCanPlay);
            videoRef.current?.removeEventListener("error", handleError);
            resolve();
          }, 3000);
        });

        setHasPermission(true);
        setCanContinue(true);
      }
    } catch (err) {
      console.error("Camera init error:", err);
      setHasPermission(false);

      let message = "Camera access failed. Please check permissions.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          message =
            "Camera access denied. Please allow camera permissions and refresh the page.";
        } else if (err.name === "NotFoundError") {
          message =
            "No camera found. Please connect a camera and refresh the page.";
        } else if (err.name === "NotReadableError") {
          message =
            "Camera is busy. Close other apps using the camera and refresh the page.";
        } else if (err.name === "OverconstrainedError") {
          message =
            "Camera doesn't support required settings. Trying with basic settings...";
          // Try with minimal constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            streamRef.current = basicStream;
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream;
              setHasPermission(true);
              setCanContinue(true);
              return;
            }
          } catch {
            message = "Camera initialization failed completely.";
          }
        }
      }
      setError({ status: true, message });
    }
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initCamera]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setError({ status: true, message: "Camera not initialized" });
      return;
    }

    try {
      recordedChunks.current = [];
      const options = {
        mimeType: "video/webm;codecs=vp9,opus",
        videoBitsPerSecond: 2500000,
      };

      // Fallback MIME types
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(streamRef.current, options);
      } catch {
        try {
          mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: "video/webm",
          });
        } catch {
          mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType: "video/mp4",
          });
        }
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: mediaRecorder.mimeType,
        });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);

        // Store the blob for upload
        localforage.setItem("faceVideoBlob", blob);
        setCaptureComplete(true);
        setIsRecording(false);
        toast.success("Video recorded successfully!");
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError({
          status: true,
          message: "Recording failed. Please try again.",
        });
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Record for 5 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
    } catch (err) {
      console.error("Recording setup error:", err);
      setError({
        status: true,
        message: "Failed to start recording. Please try again.",
      });
    }
  }, []);

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
    setRecordedVideo(null);
    setError(null);
    recordedChunks.current = [];

    // Clean up video URL
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
  };

  const handleContinueToServer = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      toast.loading("Submitting verification...", {
        id: "verification-submit",
      });

      const result = await handleMediaProcessing();

      if (!result.error) {
        toast.success("Verification submitted!", {
          id: "verification-submit",
        });
        sessionStorage.clear();
        window.location.href = `/verification/pending/${result.token}`;
      } else {
        toast.error("Verification failed", { id: "verification-submit" });
        setError({
          status: true,
          message: result.message,
        });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Submission failed", { id: "verification-submit" });
      setError({
        status: true,
        message: "Failed to submit verification. Please try again.",
      });
      setIsSubmitting(false);
    }
  }, []);

  const retryCamera = useCallback(async () => {
    // Cleanup existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    initCamera();
  }, [initCamera]);

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
                • Select &qout;Allow&qout; when prompted for camera permission
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
      </div>
    );
  }

  if (captureComplete && recordedVideo) {
    return (
      <div className="flex flex-col items-center justify-center max-w-md p-6 mx-auto">
        <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div className="my-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-slate-950">
            Video Recorded Successfully!
          </h2>
          <p className="text-sm text-slate-600">
            Your face video has been captured and will be used for verification.
          </p>
        </div>

        {/* Video Preview */}
        <div className="w-full mb-4">
          <video
            src={recordedVideo}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: "200px" }}
          />
        </div>

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
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Face Verification</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Record a 5-second video of yourself looking directly at the camera
        </p>
      </div>

      <div className="w-full p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="mb-2 text-sm font-medium text-blue-900">
          Instructions:
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Face the camera directly</li>
          <li>• Ensure good lighting</li>
          <li>• Remove sunglasses and hats</li>
          <li>• Keep your eyes open</li>
          <li>• Stay still during recording</li>
          <li>• Recording will be 5 seconds long</li>
        </ul>
      </div>

      <div className="relative w-full bg-gray-200 rounded-xl aspect-[3/4] overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls={false}
          className="object-cover w-full h-full"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-64 border-4 border-white border-dashed rounded-full opacity-70"></div>
        </div>

        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-6xl font-bold text-white">{countdown}</div>
          </div>
        )}

        {isRecording && (
          <div className="absolute flex items-center px-3 py-1 text-sm text-white bg-red-500 rounded-full top-4 right-4 gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Recording...
          </div>
        )}

        {false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex items-center p-4 bg-white rounded-lg gap-3">
              <LucideLoader className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}

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

      <div className="flex w-full gap-3">
        <button
          className="flex-1 px-4 py-2 border rounded-lg text-slate-600 border-slate-300 hover:bg-slate-50 transition-colors"
          onClick={() => window.history.back()}
          disabled={isRecording || countdown > 0}
        >
          Back
        </button>
        <button
          onClick={startCountdown}
          disabled={isRecording || countdown > 0 || !canContinue}
          className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
            canContinue && !isRecording && countdown === 0
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <Camera className="w-4 h-4" />
          {countdown > 0
            ? `Starting in ${countdown}...`
            : isRecording
            ? "Recording..."
            : "Start Recording"}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-600">
          Make sure you&apos;re in a well-lit area and your face is clearly
          visible.
        </p>
      </div>
    </div>
  );
};

export default FaceVerification;
