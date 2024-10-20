"use client"
import { useTrackedProgress } from "@/contexts/tracked-progress";
import TermsComponent from "./term";
import AcceptCamera from "./acceptcamera";
import SelectCountry from "./selectcountry";
import SelectDocumentType from "./selectdocumenttype";
import { useEffect, useState } from "react";
import { LucideLoader } from "lucide-react";

const OutLetPage = () => {
     const { agreedToTerms, agreedToCamera, selectCountry, documentType } = useTrackedProgress()
     const [loading, setLoading] = useState<boolean>(true);

     useEffect(() => {
          const timeoutLoading = setTimeout(() => {
               setLoading(false);
          }, 2000);

          return () => {
               clearTimeout(timeoutLoading);
          }
     }, [])

     if (loading) {
          return (
               <div className="flex items-center justify-center w-80">
                    <LucideLoader size={32} className="animate-spin duration-200" />
               </div>
          )
     }


     if (!agreedToTerms) {
          return (
               <TermsComponent />
          );
     }

     if (!agreedToCamera) {
          return (
               <AcceptCamera />
          )
     }

     if (!selectCountry || selectCountry === null) {
          return (
               <SelectCountry />
          )
     }

     if (!documentType || documentType === null) {
          return (
               <SelectDocumentType />
          )
     }


}

export default OutLetPage;