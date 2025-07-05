"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useEffect, useState } from "react";
import {
  FileText,
  CreditCard,
  User,
  Car,
  Check,
  AlertCircle,
  Info,
} from "lucide-react";

const SelectDocumentType = () => {
  const { setDocumentType, updateVerificationData } = useTrackedProgress();
  const [document, setDocument] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (document) {
      setError("");
      updateVerificationData("documentType", document as string);
      setDocumentType(document as string);
    }
  }, [document, setDocumentType, updateVerificationData]);

  const documentOptions = [
    {
      id: "national_id",
      value: "national_id",
      label: "National ID Card",
      description: "Government-issued national identity card",
      icon: <User className="w-6 h-6" />,
      recommended: true,
    },
    {
      id: "passport",
      value: "passport",
      label: "Passport",
      description: "International travel document",
      icon: <FileText className="w-6 h-6" />,
      recommended: false,
    },
    {
      id: "drivers_license",
      value: "drivers_license",
      label: "Driver's License",
      description: "Government-issued driving permit",
      icon: <Car className="w-6 h-6" />,
      recommended: false,
    },
  ];

  const handleDocumentSelect = (value: string) => {
    setDocument(value);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto p-2 md:p-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">
          Select Document Type
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Choose the type of government-issued document you&apos;ll be using for
          verification
        </p>
      </div>

      {/* Info Box */}
      <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Document Requirements
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Ensure your document is valid, unexpired, and contains clear,
              readable text
            </p>
          </div>
        </div>
      </div>

      {/* Document Options */}
      <div className="w-full space-y-3">
        {documentOptions.map((option) => (
          <div
            key={option.id}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              document === option.value
                ? "border-purple-500 bg-purple-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
            onClick={() => handleDocumentSelect(option.value)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-lg ${
                  document === option.value
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {option.label}
                  </h3>
                  {option.recommended && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {option.description}
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  document === option.value
                    ? "border-purple-500 bg-purple-500"
                    : "border-gray-300"
                }`}
              >
                {document === option.value && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {document && (
        <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">
                {document === "national_id" &&
                  "You will need to upload both front and back of your ID"}
                {document === "passport" &&
                  "You will need to upload the main page of your passport"}
                {document === "drivers_license" &&
                  "You will need to upload both front and back of your license"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="w-full flex gap-3 pt-4">
        <button
          className="flex-1 px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          onClick={() => window.history.back()}
        >
          Back
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm text-white rounded-lg transition-colors ${
            document
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!document}
          onClick={() => {
            if (!document) {
              setError("Please select a document type to continue");
            }
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectDocumentType;
