"use client";

import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useParams, useRouter } from "next/navigation";
import { ScrollText, ShieldCheck, Check, X } from "lucide-react";
import { clearVerificationData } from "@/utils/clearVerification";

const TermsComponent = () => {
  const { setAgreedToTerms } = useTrackedProgress();
  const router = useRouter();
  const params = useParams();

  const agreeToTerms = () => {
    setAgreedToTerms(true);
    router.push(`/${params.token}/camera`);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 text-center space-y-3">
          <div className="w-14 h-14 mx-auto bg-indigo-50 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">
              Identity Verification
            </h1>
            <p className="text-sm text-gray-500">
              Please review and agree to our biometric data usage terms
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 h-[240px] overflow-y-auto">
            <div className="flex items-start gap-2.5 mb-3">
              <ScrollText className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <h3 className="font-medium text-gray-900 text-sm">
                Terms of Service
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              By clicking “Agree and Continue” I consent to Company and its
              service provider, Paymefans, obtaining and disclosing a scan of my
              face geometry and barcode of my ID for the purpose of verifying my
              identity pursuant to Company and Paymefans&apos;s Privacy Policies
              and for improving and updating Paymefans products or services
              (including its algorithm).
              <br />
              <br />
              Company and Paymefans shall store the biometric data for no longer
              than 3 years (or as determined by your local regulation). I can
              exercise my privacy rights, including withdrawal of my consent, by
              contacting support@Paymefans.com.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-2.5">
          <button
            onClick={agreeToTerms}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            Agree & Continue
          </button>
          <button
            onClick={clearVerificationData}
            className="w-full py-3 px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsComponent;
