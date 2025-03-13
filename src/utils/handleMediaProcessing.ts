"use client"
import { useTrackedProgress } from "@/contexts/tracked-progress";
import axios from "axios";
import { bufferToBlob, dataURLtoBlob } from "./dataUrlToBlob";
const { verificationData, token, agreedToTerms } = useTrackedProgress.getState();

const handleMediaProcessing = async () => {
     try {
          const formData = new FormData();

          if (verificationData.front) {
               const front = dataURLtoBlob(verificationData.front);
               formData.append('front', front);
          }
          if (verificationData.back) {
               const back = dataURLtoBlob(verificationData.back);
               formData.append('back', back);
          }
          if (verificationData.faceVideo) {
               const faceVideo = dataURLtoBlob(verificationData.faceVideo);
               formData.append('faceVideo', faceVideo);
          }
          if (verificationData.country) formData.append('country', verificationData.country);
          if (verificationData.documentType) formData.append('documentType', verificationData.documentType);
          if (agreedToTerms) formData.append('terms', 'true');

          console.log(formData.entries())

          const SendForVerification = await axios.post(
               `${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/process/${token}`,
               formData
          );

          if (SendForVerification.data.status === true) {
               console.log('Verification data sent successfully');
               return SendForVerification.data
          } else {
               console.log(SendForVerification.data);
               return SendForVerification.data
          }

     } catch (error) {
          console.error(error);
          return false
     }
}

export default handleMediaProcessing;
