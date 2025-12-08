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
    <div className="w-full max-w-md mx-auto p-4 md:p-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-6 pb-2 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-pink-50 rounded-2xl flex items-center justify-center transform rotate-2">
            <CreditCard className="w-8 h-8 text-pink-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Choose Document
            </h1>
            <p className="text-slate-500 text-sm">
              Select the document type you want to use for verification.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              Make sure your document is{" "}
              <span className="font-semibold">valid</span>,{" "}
              <span className="font-semibold">not expired</span>, and physically
              with you right now.
            </p>
          </div>

          {/* Document Grid */}
          <div className="space-y-3">
            {documentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleDocumentSelect(option.value)}
                className={`
                            w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 group
                            ${
                              document === option.value
                                ? "border-pink-500 bg-pink-50/30"
                                : "border-slate-100 hover:border-pink-200 hover:bg-slate-50"
                            }
                        `}
              >
                <div
                  className={`
                            p-3 rounded-xl transition-colors
                            ${
                              document === option.value
                                ? "bg-white text-pink-600 shadow-sm"
                                : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-pink-500"
                            }
                        `}
                >
                  {option.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-semibold text-sm ${
                        document === option.value
                          ? "text-pink-900"
                          : "text-slate-700"
                      }`}
                    >
                      {option.label}
                    </h3>
                    {option.recommended && (
                      <span className="px-2 py-0.5 text-[10px] font-bold text-green-700 bg-green-100/80 rounded-full">
                        BEST
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {option.description}
                  </p>
                </div>

                <div
                  className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${
                              document === option.value
                                ? "border-pink-500 bg-pink-500 scale-100"
                                : "border-slate-200 scale-90 opacity-50"
                            }
                        `}
                >
                  {document === option.value && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            onClick={() => window.history.back()}
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className={`
                    flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all shadow-lg
                    ${
                      document
                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
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
