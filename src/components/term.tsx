"use client"

import { useTrackedProgress } from "@/contexts/tracked-progress";

const TermsComponent = () => {
     const { setAgreedToTerms } = useTrackedProgress();

     const agreeToTerms = () => {
          setAgreedToTerms(true);
     }

     return (
          <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
               <h1 className="text-2xl font-bold text-slate-950 text-center">
                    Lets Verify Your<br />
                    Identity
               </h1>
               <h3 className="text-wrap text-pink-600">
                    To get started, please read and agree to the following:
               </h3>
               <p className="text-slate-950  text-sm h-[200px] overflow-auto leading-relaxed border p-1">
                    By clicking “Agree and Continue” I consent to Company and its service provider, Paymefans, obtaining and disclosing a scan of my face geometry and barcode of my ID for the purpose of verifying my identity pursuant to Company and Paymefans's Privacy Policies and for improving and updating Paymefans products or services (including its algorithm). Company and Paymefans shall store the biometric data for no longer than 3 years (or as determined by your local regulation).
                    I can exercise my privacy rights, including withdrawal of my consent, by contacting dataprotection@Paymefans.com.
                    I have read and agreed to Paymefans’s
               </p>
               <button
                    onClick={agreeToTerms}
                    className="bg-slate-950 text-white px-4 py-2 rounded-lg"
               >
                    Agree and Continue
               </button>
               <button className="text-slate-950 text-sm">
                    Cancel
               </button>
          </div>
     );
}

export default TermsComponent;