"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { LucideLoader } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import handleMediaProcessing from "@/utils/handleMediaProcessing";
import toast from "react-hot-toast";

const FaceVerification = () => {
     const { updateVerificationData } = useTrackedProgress();
     const [canContinue, setCanContinue] = useState<boolean>(false);
     const [processing, setProcessing] = useState<boolean>(false);
     const [error, setError] = useState<{ status: boolean; message: string } | null>(null);
     const videoRef = useRef<HTMLVideoElement>(null);
     const mediaRecorderRef = useRef<MediaRecorder | null>(null);
     const recordedChunks = useRef<Blob[]>([]);
     const faceDetectedRef = useRef<boolean>(false);
     useEffect(() => {
          const handleResize = () => {
               // setCanContinue(window.innerWidth >= 768);
               setCanContinue(true);
          };
          handleResize();
          window.addEventListener('resize', handleResize);
          return () => {
               window.removeEventListener('resize', handleResize);
          };
     }, []);
     useEffect(() => {
          if (!canContinue) return;
          const startVideo = async () => {
               const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
               });
               if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    startRecording();
               }
          };
          startVideo();
     }, [canContinue]);
     const startRecording = useCallback(() => {
          if (videoRef.current) {
               const stream = videoRef.current.srcObject as MediaStream;
               mediaRecorderRef.current = new MediaRecorder(stream);
               recordedChunks.current = []; // Reset the recorded chunks
               mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                         recordedChunks.current.push(event.data);
                    }
               };
               mediaRecorderRef.current.onstop = handleStopRecording;
               mediaRecorderRef.current.start();
               console.log('Recording started');
               // Stop recording after 10 seconds
               setTimeout(() => {
                    console.log('Stopping recording');
                    stopRecording();
               }, process.env.NEXT_PUBLIC_FACE_VERIFICATION_DURATION as unknown as number);
          }
     }, []);
     const stopRecording = useCallback(() => {
          if (mediaRecorderRef.current) {
               mediaRecorderRef.current.stop();
          }
     }, []);
     const handleStopRecording = async () => {
          if (mediaRecorderRef.current?.state === 'inactive') {
               setProcessing(true)
               videoRef.current?.pause();
               const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
               const fileReader = new FileReader();
               fileReader.readAsDataURL(blob);
               fileReader.onloadend = async () => {
                    updateVerificationData('faceVideo', fileReader.result as string);
               }
               const uploadMediaForVerification = await handleMediaProcessing();
               if (uploadMediaForVerification.status === true) {
                    toast.success('Verification Successful');
                    setProcessing(false)
               } else {
                    setError({ status: true, message: 'An error occurred while uploading the video' });
               }
          }
     };
     if (!canContinue) {
          return (
               <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
                    <h3>Please use a mobile device to continue</h3>
               </div>
          );
     }
     return (
          <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
               <h1 className="text-2xl font-bold text-slate-950 text-center">
                    Align your face in the center and follow the video guide
               </h1>
               <div className="relative w-full bg-gray-200 rounded-xl aspect-[3/4] overflow-hidden">
                    <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                    <div className="absolute top-0 left-0 w-full h-full flex inset-0 items-center justify-center">
                         {processing && (
                              <div className="absolute bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                                   <LucideLoader size={32} className="animate-spin duration-200" stroke="#fff" />
                              </div>
                         )}
                    </div>
                    <video
                         autoPlay
                         muted
                         loop
                         className="absolute w-20 bottom-2 right-2 object-cover aspect-square z-50 rounded-full outline outline-1 outline-white">
                         <source src="/videos/output.mp4" type="video/mp4" />
                    </video>
               </div>
               {error?.status && (
                    <div className="text-red-500 text-sm">
                         {error.message}
                    </div>
               )}
               <div className="mb-4">
                    <h3 className="text-wrap text-gray-800 text-center">
                         Once capturing is done, you will be redirected.
                    </h3>
               </div>
               <button onClick={() => stopRecording()} className="text-slate-950 font-bold">Cancel</button>
          </div>
     );
};
export default FaceVerification;
