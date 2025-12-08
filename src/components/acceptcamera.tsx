"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useRouter, useParams } from "next/navigation";
import { useCallback } from "react";
import { Camera, Mic, Video, X } from "lucide-react";
import { clearVerificationData } from "@/utils/clearVerification";
import toast from "react-hot-toast";

const AcceptCamera = () => {
  const { setAgreedToCamera, agreedToCamera } = useTrackedProgress();
  const router = useRouter();
  const params = useParams();

  const handleCameraAccept = useCallback(async () => {
    if (agreedToCamera) {
      router.push(`/${params.token}/country`);
      return;
    }

    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      // Request camera permission with timeout
      const stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ video: true, audio: false }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Camera permission timeout")),
            10000
          )
        ),
      ]);

      if (stream) {
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach((track) => track.stop());
        setAgreedToCamera(true);
        router.push(`/${params.token}/country`);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);

      let errorMessage =
        "Camera access denied. Please allow camera permissions and try again.";
      if (error instanceof DOMException) {
        // Provide user-friendly error messages
        if (
          error.name === "NotAllowedError" ||
          error.message?.includes("permission")
        ) {
          errorMessage =
            "Camera permission was denied. Please allow camera access in your browser settings and try again.";
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          errorMessage = "No camera found on this device.";
        } else if (
          error.name === "NotReadableError" ||
          error.name === "TrackStartError"
        ) {
          errorMessage =
            "Camera is currently in use by another application. Please close other apps using the camera and try again.";
        } else if (error.message?.includes("timeout")) {
          errorMessage =
            "Camera permission request timed out. Please try again.";
        }
      }
      toast.error(errorMessage);
    }
  }, [setAgreedToCamera, agreedToCamera, params.token, router]);

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 text-center space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Camera Access
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              We need permission to use your camera to verify your identity
            </p>
          </div>
        </div>

        {/* Video Preview / Instructions */}
        <div className="px-6 pb-6">
          <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              src="/grantaccess.mp4"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg">
                <p className="text-white text-xs font-medium text-center">
                  Click &quot;Allow&quot; when prompted
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2.5">
              <div className="p-1.5 bg-white rounded-lg">
                <Video className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Video</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2.5">
              <div className="p-1.5 bg-white rounded-lg">
                <Mic className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Audio</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2.5 safe-bottom">
          <button
            onClick={handleCameraAccept}
            className="w-full py-3 px-4 text-sm sm:text-base bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors active:scale-[0.98] touch-manipulation"
          >
            Allow Camera Access
          </button>
          <button
            onClick={clearVerificationData}
            className="w-full py-3 px-4 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptCamera;
