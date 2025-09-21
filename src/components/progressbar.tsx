"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps = 7,
}) => {
  const steps = [
    "Terms",
    "Camera",
    "Country",
    "Document Type",
    "Upload Front",
    "Upload Back",
    "Face Verification",
  ];

  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index < currentStep
                  ? "bg-green-500 text-white"
                  : index === currentStep - 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-1 text-center leading-tight">
              {step}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
