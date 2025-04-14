"use client"

import {useTrackedProgress} from "@/contexts/tracked-progress";
import {LucideLoader} from "lucide-react";
import Image from "next/image";
import {useCallback, useEffect, useRef, useState} from "react";
import localforage from 'localforage';

const UploadDocumentBack = () => {
    const {documentType, setUploadDocument} = useTrackedProgress()
    const [canContinue, setCanContinue] = useState<boolean>(false);
    const [processing, setProcessing] = useState<boolean>(false);
    const [error, setError] = useState<{ status: boolean, message: string } | null>({
        status: false,
        message: ''
    });
    const ref = useRef<HTMLVideoElement>(null);
    const handleCapture = useCallback(async () => {
        setError(null)
        setProcessing(true);
        const canvas = document.createElement('canvas');
        const video = ref.current;
        if (video) {
            video.pause();
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Draw the current frame onto the canvas
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const fileReader = new FileReader();
                        fileReader.readAsDataURL(blob);
                        fileReader.onloadend = async () => {
                            await localforage.setItem('back', fileReader.result);
                            // Now send this buffer to the backend or AWS Rekognition
                            setUploadDocument(true, true);
                            setProcessing(false);
                        };
                    }
                },
                "image/png",
                1
            );
            video.play();
        }
    }, [])

    const canContinueHandler = useCallback(() => {
        const width = window.innerWidth
        if (width < 768) {
            setCanContinue(true);
        } else {
            // this should be set to false
            setCanContinue(true);
            // return
        }
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
            }
        }).then((stream) => {
            if (ref.current) {
                ref.current.srcObject = stream;
            }
        }).catch((err) => {
            console.error(err);
        })
    }, [])

    useEffect(() => {
        canContinueHandler();
    }, [])

    if (!canContinue) {
        return (
            <>
                <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
                    <h3>
                        Please use a mobile device to continue
                    </h3>
                </div>
            </>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
            <h1 className="text-2xl font-bold text-slate-950 text-center">
                Take a picture of the back of
                your {documentType && documentType?.charAt(0)?.toUpperCase() + documentType?.slice(1)}
            </h1>
            <h3 className="text-wrap text-gray-800 text-sm">
                Please make sure the document is clear and in frame
            </h3>
            <div className="relative w-full bg-gray-200 rounded-xl aspect-[3/4] overflow-hidden">
                <video ref={ref} autoPlay muted className="w-full h-full object-cover"/>
                <div
                    className="absolute top-0 left-0 w-full h-full flex inset-0 items-center justify-center"
                >
                    <Image fill src="/frame.png" className="invert block mx-auto origin-center" alt=""/>
                    {processing && (
                        <div className="absolute bg-black bg-opacity-50 w-full h-full flex items-center justify-center">
                            <LucideLoader size={32} className="animate-spin duration-200" stroke="#fff"/>
                        </div>
                    )}
                </div>
            </div>
            <div>
                {error?.status && (
                    <div className="text-red-500 text-sm">
                        {error.message}
                    </div>
                )}
            </div>
            <button className="text-slate-950 font-bold">
                Cancel
            </button>
            <div>
                <button
                    onClick={handleCapture}
                    className=" bg-indigo-600 active:scale-95 duration-200 transition-all rounded-full shadow shadow-gray-300 inline-block w-16 h-16">
                </button>
            </div>
        </div>
    );
}

export default UploadDocumentBack;
