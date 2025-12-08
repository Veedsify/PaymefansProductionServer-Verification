"use client";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  RotateCcw, Info,
  X
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import handleMediaProcessing from "@/utils/handleMediaProcessing";
import toast from "react-hot-toast";
import { useCamera } from "@/hooks/useCamera";
import { useRecording } from "@/hooks/useRecording";
import { useRouter } from "next/navigation";
import { clearVerificationData } from "@/utils/clearVerification";
import localforage from "localforage";
import { checkVerificationData } from "@/utils/checkVerificationData";

const FaceVerification = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState<number>(0);
  const [captureComplete, setCaptureComplete] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [localError, setLocalError] = useState<{
    status: boolean;
    message: string;
  } | null>(null);
  const [hasExistingData, setHasExistingData] = useState<boolean>(false);

  // Check for existing data on mount
  useEffect(() => {
    checkVerificationData().then((data) => {
      if (data.hasAll) {
        setHasExistingData(true);
      }
    });
  }, []);

  const {
    videoRef,
    hasPermission,
    error: cameraError,
    streamRef,
    initCamera,
  } = useCamera({ facingMode: "user", audio: false });

  const {
    isRecording,
    recordedVideo,
    error: recordingError,
    startRecording: startRecordingHook,
    resetRecording,
  } = useRecording(streamRef.current, {
    duration: 5,
    onComplete: () => setCaptureComplete(true),
  });

  const error = cameraError || recordingError || localError;

  // Ensure video element gets the stream when it's ready
  useEffect(() => {
    if (videoRef.current && streamRef.current && hasPermission === true) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }
    }
  }, [hasPermission, streamRef, videoRef]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setLocalError({
        status: true,
        message: "Camera stream not ready. Please wait a moment.",
      });
      return;
    }
    startRecordingHook();
  }, [startRecordingHook, streamRef]);

  const startCountdown = useCallback(() => {
    if (hasPermission !== true || !streamRef.current) {
      setLocalError({
        status: true,
        message: "Please enable camera to start recording.",
      });
      return;
    }
    setLocalError(null);
    setShowInstructions(false);
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
  }, [startRecording, hasPermission, streamRef]);

  const resetCapture = () => {
    setCaptureComplete(false);
    setCountdown(0);
    setLocalError(null);
    resetRecording();
    setShowInstructions(true);
  };

  const handleContinueToServer = useCallback(async () => {
    setIsSubmitting(true);
    setLocalError(null);

    try {
      // Check if we have the required data before submitting
      const front = await localforage.getItem("front");
      const faceVideoBlob = await localforage.getItem("faceVideoBlob");

      if (!front || !faceVideoBlob) {
        setLocalError({
          status: true,
          message:
            "Missing required documents. Please capture your documents again.",
        });
        setIsSubmitting(false);
        return;
      }

      toast.loading("Processing verification...", {
        id: "verification-submit",
      });

      const result = await handleMediaProcessing();

      if (!result.error) {
        toast.success("Verification submitted successfully!", {
          id: "verification-submit",
        });
        // Clear data only on successful submission
        try {
          await localforage.removeItem("front");
          await localforage.removeItem("back");
          await localforage.removeItem("faceVideoBlob");
        } catch (e) {
          console.error("Error clearing localforage:", e);
        }
        // Short delay to let the toast show
        setTimeout(() => {
          sessionStorage.clear();
          router.push(`/verification/pending/${result.token}`);
        }, 1000);
      } else {
        toast.error(result.message || "Verification failed", {
          id: "verification-submit",
        });
        setLocalError({
          status: true,
          message:
            result.message ||
            "Verification failed. You can retry without re-capturing your documents.",
        });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Submission error:", err);
      if (err instanceof DOMException) {
        const errorMessage = err.message;
        toast.error(errorMessage, { id: "verification-submit" });
        setLocalError({
          status: true,
          message: `${errorMessage} Your data has been preserved - you can retry without re-capturing.`,
        });
        setIsSubmitting(false);
      }
    }
  }, [router]);

  // --- RENDER STATES ---

  // 1. Loading State
  if (hasPermission === null) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Initializing Camera
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Please allow camera access when prompted...
              </p>
            </div>
          </div>
        </div>
        {/* Video element must be present for camera initialization */}
        <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      </div>
    );
  }

  // 2. Permission Denied / Error State
  if (hasPermission === false || error?.status) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 flex-1 flex flex-col">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Camera Access Needed
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {error?.message ||
                  "We need access to your camera to verify your identity."}
              </p>
            </div>

            <div className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-left space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Troubleshooting
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400" />
                  <span>Check browser address bar for blocked camera icon</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400" />
                  <span>Ensure no other app is using the camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400" />
                  <span>Reload the page to try again</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col w-full gap-2.5 safe-bottom">
              <button
                onClick={() => {
                  setLocalError(null);
                  initCamera();
                }}
                className="w-full py-3 px-4 text-sm sm:text-base bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors active:scale-[0.98] touch-manipulation"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors active:scale-[0.98] touch-manipulation"
              >
                Refresh Page
              </button>
              <button
                onClick={clearVerificationData}
                className="w-full py-3 px-4 text-sm sm:text-base bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation"
              >
                <X className="w-4 h-4" />
                Cancel Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Post-Recording Review State
  if (captureComplete && recordedVideo) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col flex-1">
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Video Captured
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Review your video before submitting
                </p>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] bg-gray-900 dark:bg-black rounded-xl overflow-hidden">
              <video
                src={recordedVideo}
                controls
                className="w-full h-full object-cover"
                playsInline
              />
            </div>

            {isSubmitting && (
              <div className="flex items-center gap-2.5 p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs sm:text-sm font-medium">
                  Processing verification...
                </span>
              </div>
            )}

            {error && !isSubmitting && (
              <div className="flex flex-col gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm flex-1">
                    {error.message}
                  </span>
                </div>
                {error.message.includes("retry") ||
                error.message.includes("failed") ? (
                  <button
                    onClick={handleContinueToServer}
                    className="text-xs text-red-700 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-300 self-start touch-manipulation"
                  >
                    Click here to retry submission
                  </button>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 safe-bottom">
              <button
                onClick={resetCapture}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 py-3 px-4 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 active:scale-[0.98] touch-manipulation"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleContinueToServer}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 py-3 px-4 text-sm sm:text-base bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-70 active:scale-[0.98] touch-manipulation"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Active Camera / Recording State
  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col flex-1 min-h-0">
        {hasExistingData && !recordedVideo && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-900">
                  Previous data found
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  You can record a new video or submit with existing data
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="text-center p-4 sm:p-6 pb-3 sm:pb-4 space-y-1.5">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Face Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Record a 5-second video to verify your identity
          </p>
        </div>

        <div className="relative w-full bg-gray-900 dark:bg-black aspect-[3/4] overflow-hidden">
          {/* Main Camera Feed */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: isRecording ? "scale(1.05)" : "scale(1)" }}
          />

          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Face Guide Frame */}
            {!isRecording && countdown === 0 && hasPermission && (
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-48 h-48 border-2 border-white/50 rounded-full"></div>
              </div>
            )}

            {/* Loading Overlay */}
            {(!hasPermission || !streamRef.current) && (
              <div className="absolute inset-0 bg-gray-900/80 dark:bg-black/80 flex items-center justify-center z-10">
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-spin" />
              </div>
            )}

            {/* Countdown Overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-20">
                <span className="text-6xl sm:text-7xl font-bold text-white">
                  {countdown}
                </span>
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-600 dark:bg-red-500 text-white rounded-full text-[10px] sm:text-xs font-medium z-20">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                Recording
              </div>
            )}

            {/* Progress Bar during Recording */}
            {isRecording && (
              <div className="absolute top-0 left-0 h-1 bg-red-600/30 w-full z-30">
                <div className="h-full bg-red-600 animate-[progress_5s_linear_forwards]" />
              </div>
            )}
          </div>

          {/* Instructions Overlay */}
          {showInstructions &&
            !isRecording &&
            countdown === 0 &&
            hasPermission && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg z-10">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-gray-900">Tips</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      <li>• Hold camera at eye level</li>
                      <li>• Ensure good lighting</li>
                      <li>• Remove sunglasses or hats</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-6 pt-3 sm:pt-4 flex flex-col items-center space-y-2 sm:space-y-3 safe-bottom">
          <button
            onClick={startCountdown}
            disabled={isRecording || countdown > 0 || hasPermission !== true}
            className={`
              w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 touch-manipulation
              ${
                isRecording
                  ? "bg-red-100 dark:bg-red-900/30 cursor-default"
                  : hasPermission === true
                  ? "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95 shadow-lg shadow-indigo-600/30 dark:shadow-indigo-500/30"
                  : "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              }
            `}
          >
            {isRecording ? (
              <div className="w-6 h-6 bg-red-600 rounded-full animate-pulse" />
            ) : countdown > 0 ? (
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            ) : (
              <div className="w-8 h-8 bg-white rounded-full"></div>
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isRecording
              ? "Recording..."
              : countdown > 0
              ? "Get ready..."
              : "Tap to start"}
          </p>
          <button
            onClick={clearVerificationData}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center gap-1 touch-manipulation"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FaceVerification;
