"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useRouter, useParams } from "next/navigation";
import { useCallback } from "react";
import { Camera, Mic, Video, X } from "lucide-react";
import { clearVerificationData } from "@/utils/clearVerification";

const AcceptCamera = () => {
  const { setAgreedToCamera, agreedToCamera } = useTrackedProgress();
  const router = useRouter();
  const params = useParams();

  const handleCameraAccept = useCallback(() => {
    if (agreedToCamera) {
      router.push(`/${params.token}/country`);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (stream) {
          setAgreedToCamera(true);
          stream.getTracks().forEach((track) => track.stop());
          router.push(`/${params.token}/country`);
        }
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  }, [setAgreedToCamera, agreedToCamera, params.token, router]);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 text-center space-y-3">
          <div className="w-14 h-14 mx-auto bg-indigo-50 rounded-full flex items-center justify-center">
            <Camera className="w-7 h-7 text-indigo-600" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">
              Camera Access
            </h1>
            <p className="text-sm text-gray-500">
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
        <div className="px-6 pb-6 space-y-2.5">
          <button
            onClick={handleCameraAccept}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98]"
          >
            Allow Camera Access
          </button>
          <button
            onClick={clearVerificationData}
            className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
