"use client";

import { useTrackedProgress } from "@/contexts/tracked-progress";
import { Loader2, Smartphone, ScanLine, ArrowLeft } from "lucide-react";
import localforage from "localforage";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";

const UploadDocumentBack = () => {
  const { setUploadDocument } = useTrackedProgress();
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
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blob);
            fileReader.onloadend = async () => {
              await localforage.setItem("back", fileReader.result);
              setUploadDocument(true, true);
              setProcessing(false);
              router.push(`/${params.token}/face`);
            };
          }
        },
        "image/png",
        1
      );
      video.play();
    }
  }, [setUploadDocument]);

  const canContinueHandler = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setCanContinue(true);
    } else {
      setCanContinue(false);
      return;
    }

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

  if (!canContinue) {
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
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col z-50">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white/10 backdrop-blur rounded-full active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="px-3 py-1 bg-black/40 backdrop-blur rounded-full border border-white/10 text-xs font-medium">
          Back Side
        </div>
        <div className="w-10"></div>
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
            Scan Back Side
          </h2>
          <p className="text-sm opacity-90 drop-shadow-md mt-1">
            Turn your document over and scan the back side
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
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-white rounded-full"></div>
        </button>
      </div>

      {error?.status && (
        <div className="absolute top-20 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-sm text-center shadow-lg animate-in slide-in-from-top-2">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default UploadDocumentBack;
