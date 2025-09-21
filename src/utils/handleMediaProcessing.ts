"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import axios, { AxiosError } from "axios";
import localforage from "localforage";
import { toast } from "react-hot-toast";
import { dataURLtoBlob } from "./dataUrlToBlob";

const handleMediaProcessing = async () => {
  const { verificationData, token, agreedToTerms } =
    useTrackedProgress.getState();
  try {
    const formData = new FormData();

    const front = await localforage.getItem("front");
    const back = await localforage.getItem("back");
    const faceVideoBlob = await localforage.getItem("faceVideoBlob");

    if (!faceVideoBlob && !front && !back) {
      toast.error("Sorry, Some Of Your Documents Are Missing");
      return;
    }

    if (front) {
      const frontData = dataURLtoBlob(front as string);
      formData.append("front", frontData, "front.png");
    }
    if (back) {
      const backData = dataURLtoBlob(back as string);
      formData.append("back", backData, "back.png");
    }
    if (faceVideoBlob) {
      // Extract frame at 2 seconds from the video
      const video = document.createElement("video");
      const videoUrl = URL.createObjectURL(faceVideoBlob as Blob);
      video.src = videoUrl;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => resolve();
      });
      video.currentTime = 2;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, "image/png");
        });
        if (imageBlob) {
          formData.append("faceVideo", imageBlob, "faceImage.png");
        }
      }
      URL.revokeObjectURL(videoUrl);
    }

    if (verificationData.country)
      formData.append("country", verificationData.country);
    if (verificationData.documentType)
      formData.append("documentType", verificationData.documentType);
    if (agreedToTerms) formData.append("terms", "true");

    const SendForVerification = await axios.post(
      `${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/process/${token}`,
      formData,
    );

    return SendForVerification.data;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message: string;
      status: string;
      error: string;
    }>;
    console.error(axiosError);
    toast.error(axiosError?.response?.data?.message || axiosError.message);
    await localforage.removeItem("front");
    await localforage.removeItem("back");
    await localforage.removeItem("faceVideoBlob");
    throw new Error("Error processing media");
  }
};

export default handleMediaProcessing;
