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
      try {
        console.log("Processing video for screenshot...");
        // Extract frame at 2 seconds from the video
        const video = document.createElement("video");
        const videoUrl = URL.createObjectURL(faceVideoBlob as Blob);
        video.src = videoUrl;

        // Use a more robust way to load and seek
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = (e) => reject("Video metadata load error: " + e);
          // Timeout safety
          setTimeout(() => reject("Timeout loading video metadata"), 5000);
        });

        // Seek to 1s or 2s (safety check based on duration)
        const seekTime = Math.min(
          2,
          video.duration > 0.5 ? video.duration / 2 : 0
        );
        video.currentTime = seekTime;

        await new Promise<void>((resolve, reject) => {
          video.onseeked = () => resolve();
          video.onerror = (e) => reject("Video seek error: " + e);
          setTimeout(() => reject("Timeout seeking video"), 5000);
        });

        const canvas = document.createElement("canvas");
        // Ensure valid dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn("Video dimensions are 0, screenshot might fail");
        }
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageBlob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png", 0.8); // Add quality param
          });
          if (imageBlob) {
            console.log("Screenshot generated successfully");
            formData.append("faceVideo", imageBlob, "faceImage.png");
          } else {
            console.error("Failed to generate blob from canvas");
          }
        }
        URL.revokeObjectURL(videoUrl);
      } catch (videoError) {
        console.error("Error generating video screenshot:", videoError);
        // We continue even if screenshot fails, but log it.
        // Depending on backend requirements, we might want to throw here.
        // For now, let's assume valid video is enough if screenshot fails,
        // or backend handles missing faceImage.
      }
    }

    if (verificationData.country)
      formData.append("country", verificationData.country as string);
    if (verificationData.documentType)
      formData.append("documentType", verificationData.documentType as string);
    if (agreedToTerms) formData.append("terms", "true");

    console.log("Sending verification data...");
    const sendForVerification = await axios.post(
      `${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/process/${token}`,
      formData
    );

    return sendForVerification.data;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message: string;
      status: string;
      error: string;
    }>;
    console.error("Verification processing error:", axiosError);
    toast.error(
      axiosError?.response?.data?.message ||
        axiosError.message ||
        "Error processing verification"
    );

    // Clean up stored blobs so user can retry fresh
    try {
      await localforage.removeItem("front");
      await localforage.removeItem("back");
      await localforage.removeItem("faceVideoBlob");
    } catch (e) {
      console.error("Error clearing localforage:", e);
    }

    throw new Error("Error processing media");
  }
};

export default handleMediaProcessing;
