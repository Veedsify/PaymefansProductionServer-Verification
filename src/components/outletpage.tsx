"use client"
import {useTrackedProgress} from "@/contexts/tracked-progress";
import TermsComponent from "./term";
import AcceptCamera from "./acceptcamera";
import SelectCountry from "./selectcountry";
import SelectDocumentType from "./selectdocumenttype";
import {useEffect, useState} from "react";
import {LucideLoader} from "lucide-react";
import UploadDocumentFront from "./uploaddocumentfront";
import UploadDocumentBack from "./uploaddocumentback";
import FaceVerification from "./faceverification";

const OutLetPage = () => {
    const {
        uploadDocumentBack,
        faceVerification,
        uploadDocumentFront,
        agreedToTerms,
        agreedToCamera,
        selectCountry,
        documentType
    } = useTrackedProgress()
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
            <div>
                <div className="flex items-center justify-center w-80">
                    <LucideLoader size={32} className="animate-spin duration-200"/>
                </div>
                <p className="text-gray-600 mb-4 text-center">
                    Loading...
                </p>
            </div>
        )
    }


    if (!agreedToTerms) {
        return (
            <TermsComponent/>
        );
    }

    if (!agreedToCamera) {
        return (
            <AcceptCamera/>
        )
    }

    if (!selectCountry) {
        return (
            <SelectCountry/>
        )
    }

    if (!documentType) {
        return (
            <SelectDocumentType/>
        )
    }

    if (!uploadDocumentFront) {
        return <UploadDocumentFront/>
    }

    if (!uploadDocumentBack) {
        return <UploadDocumentBack/>
    }

    if (!faceVerification) {
        return <FaceVerification/>
    }

}

export default OutLetPage;