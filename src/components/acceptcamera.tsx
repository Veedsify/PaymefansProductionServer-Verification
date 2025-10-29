"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const AcceptCamera = () => {
  const { setAgreedToCamera, agreedToCamera } = useTrackedProgress();
  const router = useRouter();
  const handleCameraAccept = useCallback(() => {
    // If the user has already agreed, no need to request again
    if (agreedToCamera) {
      return;
    }

    // Check if the user has already granted access to the camera
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const hasVideoDevice = devices.some(
          (device) => device.kind === "videoinput"
        );

        if (hasVideoDevice) {
          navigator.mediaDevices
            .getUserMedia({
              video: true,
              audio: true,
            })
            .then((stream) => {
              if (stream) {
                // Set the state to true once the user agrees
                setAgreedToCamera(true);
                // Optionally, you could close the stream after using it to free resources
                stream.getTracks().forEach((track) => track.stop());
              }
            })
            .catch((error) => {
              // Handle errors, e.g., user denying access
              console.error("Error accessing media devices:", error);
            })
            .finally(() => {
              setAgreedToCamera(true);
            });
        } else {
          console.warn("No video input devices found.");
        }
      })
      .catch((error) => {
        console.error("Error enumerating devices:", error);
      });
  }, [setAgreedToCamera, agreedToCamera]);
  return (
    <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
      <h1 className="text-2xl font-bold text-center text-slate-950">
        Allow Us To <br />
        Use Your Camera and Microphone
      </h1>
      <h3 className="text-sm text-purple-600 text-wrap">
        You&apos;ll see a popup asking you to allow access to your camera and
        microphone. Please be sure to click allow.
      </h3>
      <div>
        <video
          className="w-full"
          autoPlay
          muted
          loop
          controls={false}
          onContextMenu={(e) => e.preventDefault()}
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          src="/grantaccess.mp4"
        ></video>
      </div>
      <button
        onClick={handleCameraAccept}
        className="px-4 py-2 text-white rounded-lg bg-slate-950"
      >
        OK - I Understand
      </button>
      <button onClick={() => router.back()} className="text-sm text-slate-950">
        Cancel
      </button>
    </div>
  );
};
export default AcceptCamera;
