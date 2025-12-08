"use client";
import { useRouter, useParams } from "next/navigation";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useState } from "react";
import {
  FileText,
  CreditCard,
  User,
  Car,
  Check,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react";

const SelectDocumentType = () => {
  const { setDocumentType, updateVerificationData } = useTrackedProgress();
  const [document, setDocument] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const params = useParams();

  const handleDocumentSelect = (value: string) => {
    setDocument(value);
  };

  const handleContinue = () => {
    if (!document) {
      setError("Please select a document type to continue");
      return;
    }
    setError("");
    updateVerificationData("documentType", document);
    setDocumentType(document);
    router.push(`/${params.token}/document-front`);
  };

  const documentOptions = [
    {
      id: "national_id",
      value: "national_id",
      label: "National ID Card",
      description: "Any valid government ID card",
      icon: <User className="w-5 h-5" />,
      recommended: true,
    },
    {
      id: "passport",
      value: "passport",
      label: "International Passport",
      description: "Standard travel document",
      icon: <FileText className="w-5 h-5" />,
      recommended: false,
    },
    {
      id: "drivers_license",
      value: "drivers_license",
      label: "Driver's License",
      description: "Government driving permit",
      icon: <Car className="w-5 h-5" />,
      recommended: false, 
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden border border-slate-100 dark:border-gray-700 flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-2 text-center space-y-3 sm:space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-pink-50 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center transform rotate-2">
            <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600 dark:text-pink-400" />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-100">
              Choose Document
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Select the document type you want to use for verification.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col min-h-0">
          {/* Info Box */}
          <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex-shrink-0">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
              Make sure your document is{" "}
              <span className="font-semibold">valid</span>,{" "}
              <span className="font-semibold">not expired</span>, and physically
              with you right now.
            </p>
          </div>

          {/* Document Grid */}
          <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto overscroll-contain">
            {documentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleDocumentSelect(option.value)}
                className={`
                            w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 group touch-manipulation
                            ${
                              document === option.value
                                ? "border-pink-500 dark:border-pink-500 bg-pink-50/30 dark:bg-pink-900/20"
                                : "border-slate-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 hover:bg-slate-50 dark:hover:bg-gray-700"
                            }
                        `}
              >
                <div
                  className={`
                            p-2 sm:p-3 rounded-xl transition-colors flex-shrink-0
                            ${
                              document === option.value
                                ? "bg-white dark:bg-gray-800 text-pink-600 dark:text-pink-400 shadow-sm"
                                : "bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-gray-800 group-hover:text-pink-500 dark:group-hover:text-pink-400"
                            }
                        `}
                >
                  {option.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`font-semibold text-sm ${
                        document === option.value
                          ? "text-pink-900 dark:text-pink-200"
                          : "text-slate-700 dark:text-gray-300"
                      }`}
                    >
                      {option.label}
                    </h3>
                    {option.recommended && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-100/80 dark:bg-green-900/40 rounded-full">
                        BEST
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    {option.description}
                  </p>
                </div>

                <div
                  className={`
                            w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                            ${
                              document === option.value
                                ? "border-pink-500 dark:border-pink-500 bg-pink-500 dark:bg-pink-500 scale-100"
                                : "border-slate-200 dark:border-gray-600 scale-90 opacity-50"
                            }
                        `}
                >
                  {document === option.value && (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm animate-in fade-in flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 pt-0 flex gap-2 sm:gap-3 safe-bottom">
          <button
            className="px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors active:scale-[0.98] touch-manipulation"
            onClick={() => window.history.back()}
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className={`
                    flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl font-medium transition-all shadow-lg touch-manipulation
                    ${
                      document
                        ? "bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-slate-800 dark:hover:bg-gray-200 shadow-slate-900/20 dark:shadow-gray-100/20 active:scale-95"
                        : "bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed shadow-none"
                    }
                `}
            disabled={!document}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectDocumentType;
