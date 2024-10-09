"use client"
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useCallback } from "react";
const AcceptCamera = () => {
     const { setAgreedToCamera, agreedToCamera } = useTrackedProgress();

     const handleCameraAccept = useCallback(() => {
          // If the user has already agreed, no need to request again
          if (agreedToCamera) {
               return;
          }

          // Check if the user has already granted access to the camera
          navigator.mediaDevices.enumerateDevices().then(devices => {
               const hasVideoDevice = devices.some(device => device.kind === 'videoinput');

               if (hasVideoDevice) {
                    navigator.mediaDevices.getUserMedia({
                         video: true,
                         audio: true
                    }).then((stream) => {
                         if (stream) {
                              // Set the state to true once the user agrees
                              setAgreedToCamera(true);
                              // Optionally, you could close the stream after using it to free resources
                              stream.getTracks().forEach(track => track.stop());
                         }
                    }).catch((error) => {
                         // Handle errors, e.g., user denying access
                         console.error("Error accessing media devices:", error);
                    }).finally(() => {
                         setAgreedToCamera(true);
                    })
               } else {
                    console.warn("No video input devices found.");
               }
          }).catch((error) => {
               console.error("Error enumerating devices:", error);
          });
     }, [setAgreedToCamera, agreedToCamera]);
     return (
          <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
               <h1 className="text-2xl font-bold text-slate-950 text-center">
                    Allow Us To <br />Use
                    Your Camera and Microphone
               </h1>
               <h3 className="text-wrap text-purple-600 text-sm">
                    You'll see a popup asking you to allow access to your camera and microphone. Please be sure to click allow.
               </h3>
               <div>
                    <video
                         className="w-full"
                         autoPlay
                         muted
                         loop
                         src="/grantaccess.mp4"
                    >
                    </video>
               </div>
               <button
                    onClick={handleCameraAccept}
                    className="bg-slate-950 text-white px-4 py-2 rounded-lg"
               >
                    OK - I Understand
               </button>
               <button className="text-slate-950 text-sm">
                    Cancel
               </button>
          </div>
     );
}
export default AcceptCamera;