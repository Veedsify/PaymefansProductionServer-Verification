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
    const faceVideo = await localforage.getItem("faceVideo");

    if (!faceVideo && !front && !back) {
      toast.error("Sorry, Some Of Your Documents Are Missing");
      return;
    }

    if (front) {
      const frontData = dataURLtoBlob(front as string);
      formData.append("front", frontData);
    }
    if (back) {
      const backData = dataURLtoBlob(back as string);
      formData.append("back", backData);
    }
    if (faceVideo) {
      const faceVideoData = dataURLtoBlob(faceVideo as string);
      formData.append("faceVideo", faceVideoData);
    }

    if (verificationData.country)
      formData.append("country", verificationData.country);
    if (verificationData.documentType)
      formData.append("documentType", verificationData.documentType);
    if (agreedToTerms) formData.append("terms", "true");

    const SendForVerification = await axios.post(
      `${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/process/${token}`,
      formData
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
    await localforage.removeItem("faceVideo");
    throw new Error("Error processing media");
  }
};

export default handleMediaProcessing;
