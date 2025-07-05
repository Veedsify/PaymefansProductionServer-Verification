"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { countries } from "@/utils/countries";
import { ChangeEvent, useState } from "react";
import { Check, Globe, AlertCircle } from "lucide-react";

const SelectCountry = () => {
  const { setSelectCountry, updateVerificationData } = useTrackedProgress();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setError("");

    if (country === "Select Country") {
      setError("Please select a valid country");
      return;
    }

    setSelectedCountry(country);
    updateVerificationData("country", country as string);
    setSelectCountry(country as string);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto p-2 md:p-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-950">
          Select Your Country
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Please select the country where your identity document was issued
        </p>
      </div>

      {/* Warning Box */}
      <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">Important</p>
            <p className="text-xs text-amber-700 mt-1">
              Make sure to select the country that matches your document. This
              cannot be changed later.
            </p>
          </div>
        </div>
      </div>

      {/* Country Select */}
      <div className="w-full space-y-2">
        <label
          htmlFor="country-select"
          className="block text-sm font-medium text-slate-700"
        >
          Country of Document
        </label>
        <div className="relative">
          <select
            id="country-select"
            onChange={handleCountryChange}
            value={selectedCountry || "Select Country"}
            className={`w-full px-4 py-3 text-slate-950 bg-white border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors ${
              error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <option value="Select Country" disabled>
              Choose your country...
            </option>
            {countries.map((country, index) => (
              <option key={index} value={country.name.toLowerCase()}>
                {country.name}
              </option>
            ))}
          </select>
          {selectedCountry && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      {/* Supported Countries Info */}
      <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Currently Supported:
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
          <div>• Nigeria</div>
          <div>• Ghana</div>
          {/* <div>• Kenya</div>
          <div>• South Africa</div>
          <div>• Cameroon</div>
          <div>• Uganda</div> */}
        </div>
        <p className="text-xs text-blue-700 mt-2 italic">
          More countries coming soon!
        </p>
      </div>

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
            selectedCountry
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!selectedCountry}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectCountry;
