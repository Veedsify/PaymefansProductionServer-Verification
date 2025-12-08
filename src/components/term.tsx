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
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-4 text-center space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 dark:text-indigo-400" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Identity Verification
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Please review and agree to our biometric data usage terms
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="px-4 sm:px-6 pb-4 flex-1 flex flex-col min-h-0">
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex-1 overflow-y-auto overscroll-contain">
            <div className="flex items-start gap-2.5 mb-3">
              <ScrollText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                Terms of Service
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              By clicking &quot;Agree and Continue&quot; I consent to Company and its
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
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2.5 safe-bottom">
          <button
            onClick={agreeToTerms}
            className="w-full py-3 px-4 text-sm sm:text-base bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation"
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
            Agree & Continue
          </button>
          <button
            onClick={clearVerificationData}
            className="w-full py-3 px-4 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsComponent;
