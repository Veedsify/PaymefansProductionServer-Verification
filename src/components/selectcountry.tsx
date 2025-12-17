"use client";
import { useRouter, useParams } from "next/navigation";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { countries } from "@/utils/countries";
import {  useState } from "react";
import { Globe, AlertCircle, ChevronRight, ChevronDown, Search, Check } from "lucide-react";
const SelectCountry = () => {
  const { setSelectCountry, updateVerificationData } = useTrackedProgress();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleContinue = () => {
    if (selectedCountry) {
      updateVerificationData("country", selectedCountry);
      setSelectCountry(selectedCountry);
      router.push(`/${params.token}/document-type`);
    }
  };
  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex-1 flex flex-col animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-gray-700 relative flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="p-4 sm:p-6 pb-2 text-center space-y-3 sm:space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center transform -rotate-2">
            <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-100">
              Where are you?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              Select the country where your government ID was issued.
            </p>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 flex flex-col min-h-0">
          {/* Warning Box */}
          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                Important Note
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Ensure this matches your document. You cannot change this later.
              </p>
            </div>
          </div>
          {/* Country Select */}
          <div className="space-y-2 flex-shrink-0">
            <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider ml-1">
              Country of Issue
            </label>
            <div className="relative group">
              <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                  w-full px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between text-sm sm:text-base text-slate-900 dark:text-gray-100 bg-slate-50 dark:bg-gray-900/50
                  border-2 rounded-xl cursor-pointer transition-all touch-manipulation
                  ${
                    error
                      ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20"
                      : isOpen
                      ? "border-green-500 dark:border-green-500 ring-4 ring-green-500/10 dark:ring-green-500/20 bg-white dark:bg-gray-800"
                      : "border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600"
                  }
                `}
              >
                <span
                  className={
                    selectedCountry
                      ? "font-medium"
                      : "text-slate-400 dark:text-gray-500"
                  }
                >
                  {selectedCountry
                    ? countries.find(
                        (c) => c.name.toLowerCase() === selectedCountry
                      )?.name || selectedCountry
                    : "Select Country"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-gray-500 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-100 dark:border-gray-700 z-20 max-h-[50vh] sm:max-h-64 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-slate-50 dark:border-gray-700 flex-shrink-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-gray-900 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-500/40 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 overscroll-contain p-1">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedCountry(country.name.toLowerCase());
                              setIsOpen(false);
                              setError("");
                              setSearchQuery("");
                            }}
                            className={`
                              w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors touch-manipulation
                              ${
                                selectedCountry === country.name.toLowerCase()
                                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                  : "text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                              }
                            `}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-slate-400 dark:text-gray-500 font-mono text-xs w-6">
                                {country.code}
                              </span>
                              {country.name}
                            </span>
                            {selectedCountry === country.name.toLowerCase() && (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-400 dark:text-gray-500">
                          No country found
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {error && (
              <p className="flex items-center text-xs text-red-500 dark:text-red-400 gap-1.5 ml-1 animate-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>
          {/* Supported Countries Info */}
          {/* <div className="bg-slate-50 dark:bg-gray-900/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
              Supported Regions
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs font-medium text-slate-600 dark:text-gray-300">
                🇳🇬 Nigeria (NGN)
              </span>
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-xs font-medium text-slate-600 dark:text-gray-300">
                🇬🇭 Ghana
              </span>
              <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 border-dashed text-xs text-slate-400 dark:text-gray-500">
                + More coming soon
              </span>
            </div>
          </div> */}
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
            className={`
                    flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl font-medium transition-all shadow-lg touch-manipulation
                    ${
                      selectedCountry
                        ? "bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-slate-800 dark:hover:bg-gray-200 shadow-slate-900/20 dark:shadow-gray-100/20 active:scale-95"
                        : "bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed shadow-none"
                    }
                `}
            disabled={!selectedCountry}
            onClick={handleContinue}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default SelectCountry;
