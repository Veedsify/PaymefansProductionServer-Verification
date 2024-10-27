"use client"

import { useTrackedProgress } from "@/contexts/tracked-progress";
import axios from "axios";

const handleMediaProcessing = async () => {
     const { verificationData, token, agreedToTerms } = useTrackedProgress()
     const formData = new FormData();
     agreedToTerms && formData.append('terms', 'true');
     verificationData.front && formData.append('front', verificationData.front);
     verificationData.back && formData.append('back', verificationData.back);
     verificationData.faceVideo && formData.append('faceVideo', verificationData.faceVideo);
     verificationData.country && formData.append('country', verificationData.country);
     verificationData.documentType && formData.append('documentType', verificationData.documentType);

     try {
          const SendForVerifcation = await axios.post(
               `${process.env.NEXT_PUBLIC_API_URL}/process/vefications/${token}`,
               formData,
               { headers: { 'Content-Type': 'multipart/form-data' } }
          )
          if (SendForVerifcation.data.status === true) {
               console.log('Verification data sent successfully');
               return SendForVerifcation.data
          } else {
               console.log(SendForVerifcation.data);
               return SendForVerifcation.data
          }

     } catch (error) {
          console.error(error);
          return false
     }
}

export default handleMediaProcessing;