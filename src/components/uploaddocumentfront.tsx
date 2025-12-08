"use client";

import { useTrackedProgress } from "@/contexts/tracked-progress";
import { Loader2, Smartphone, ScanLine, ArrowLeft } from "lucide-react";
import localforage from "localforage";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const UploadDocumentFront = () => {
  const { documentType, setUploadDocument } = useTrackedProgress();
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState<{
    status: boolean;
    message: string;
  } | null>(null);

  const ref = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleCapture = useCallback(async () => {
    setError(null);
    setProcessing(true);
    const canvas = document.createElement("canvas");
    const video = ref.current;
    if (video) {
      video.pause();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // Draw the current frame onto the canvas
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the data URL of the canvas as PNG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blob);
            fileReader.onloadend = async () => {
              // Store an image
              await localforage.setItem("front", fileReader.result);
              // Now send this buffer to the backend or AWS Rekognition
              setUploadDocument(true, false);
              setProcessing(false);
              router.push(`/${params.token}/document-back`);
            };
          }
        },
        "image/png",
        1
      );
      video.play();
    }
  }, [setUploadDocument, router, params.token]);

  const canContinueHandler = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setCanContinue(true);
    } else {
      setCanContinue(false);
      return;
    }

    // Stop any previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
        },
      })
      .then((stream) => {
        streamRef.current = stream;
        if (ref.current) {
          ref.current.srcObject = stream;
          ref.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        console.error(err);
        setError({
          status: true,
          message: "Camera access denied or used by another app.",
        });
      });
  }, []);

  useEffect(() => {
    canContinueHandler();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [canContinueHandler]);

  // Desktop Block Screen
  if (canContinue === false) {
    return (
      <div className="w-full max-w-md mx-auto p-4 md:p-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center relative">
            <Smartphone className="w-10 h-10 text-slate-400" />
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1.5 border-4 border-white">
              <ScanLine className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Mobile Device Required
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              For the best results with document scanning, please continue this
              verification on your mobile phone or tablet.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-left border border-slate-100">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Why?
            </p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                ✔ better camera quality
              </li>
              <li className="flex items-center gap-2">
                ✔ easier to handle documents
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black dark:bg-gray-900 text-white flex flex-col z-50 safe-top safe-bottom">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white/10 backdrop-blur rounded-full active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="px-3 py-1 bg-black/40 dark:bg-gray-900/40 backdrop-blur rounded-full border border-white/10 dark:border-gray-700/30 text-xs font-medium">
          Front Side
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Main Camera View */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        <video
          ref={ref}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Guide Frame */}
        <div className="absolute inset-0 border-[24px] border-black/50 pointer-events-none z-0">
          <div className="relative w-full h-full border-2 border-white/80 rounded-lg box-content -m-0.5">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-32 left-0 w-full text-center px-6 z-10">
          <h2 className="text-xl font-bold shadow-black drop-shadow-md">
            Scan Front Side
          </h2>
          <p className="text-sm opacity-90 drop-shadow-md mt-1">
            Place the front of your {documentType?.replace("_", " ")} within the
            frame
          </p>
        </div>

        {processing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
              <p className="font-medium">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-28 bg-black flex items-center justify-center relative z-20">
        <button
          onClick={handleCapture}
          disabled={processing}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-white dark:border-gray-200 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 touch-manipulation"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-200 rounded-full"></div>
        </button>
      </div>

      {/* Error Toast style */}
      {error?.status && (
        <div className="absolute top-20 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-sm text-center shadow-lg animate-in slide-in-from-top-2">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default UploadDocumentFront;
