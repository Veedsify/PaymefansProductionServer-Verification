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

        // Proactively request camera permission (video only)
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                if (stream) {
                    setAgreedToCamera(true);
                    stream.getTracks().forEach((track) => track.stop());
                }
            })
            .catch((error) => {
                console.error("Error accessing camera:", error);
            });
    }, [setAgreedToCamera, agreedToCamera]);
    return (
        <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
            <h1 className="text-2xl font-bold text-center text-slate-950">
                Allow Us To <br />
                Use Your Camera and Microphone
            </h1>
            <h3 className="text-sm text-purple-600 text-wrap">
                You&apos;ll see a popup asking you to allow access to your
                camera and microphone. Please be sure to click allow.
            </h3>
            <div>
                <video
                    className="w-full"
                    autoPlay
                    muted
                    loop
                    playsInline
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
            <button
                onClick={() => router.back()}
                className="text-sm text-slate-950"
            >
                Cancel
            </button>
        </div>
    );
};
export default AcceptCamera;
