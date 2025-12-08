"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { LucideLoader } from "lucide-react";

export default function TokenRootPage() {
  const router = useRouter();
  const params = useParams();
  const {
    agreedToTerms,
    agreedToCamera,
    selectCountry,
    documentType,
    uploadDocumentFront,
    uploadDocumentBack,
    faceVerification,
  } = useTrackedProgress();

  useEffect(() => {
    if (!params.token) return;
    const token = params.token;

    // Determine step based on progress
    if (!agreedToTerms) {
      router.replace(`/${token}/terms`);
    } else if (!agreedToCamera) {
      router.replace(`/${token}/camera`);
    } else if (!selectCountry) {
      router.replace(`/${token}/country`);
    } else if (!documentType) {
      router.replace(`/${token}/document-type`);
    } else if (!uploadDocumentFront) {
      router.replace(`/${token}/document-front`);
    } else if (!uploadDocumentBack) {
      router.replace(`/${token}/document-back`);
    } else if (!faceVerification) {
      router.replace(`/${token}/face`);
    } else {
      router.replace(`/${token}/face`);
    }
  }, [
    params.token,
    agreedToTerms,
    agreedToCamera,
    selectCountry,
    documentType,
    uploadDocumentFront,
    uploadDocumentBack,
    faceVerification,
    router,
  ]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <LucideLoader className="animate-spin text-white" />
    </div>
  );
}
