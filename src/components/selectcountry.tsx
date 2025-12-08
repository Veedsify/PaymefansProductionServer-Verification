"use client";
import { useRouter, useParams } from "next/navigation";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { countries } from "@/utils/countries";
import { ChangeEvent, useState } from "react";
import { Globe, AlertCircle, ChevronRight, ChevronDown, X, Search, Check } from "lucide-react";
import { clearVerificationData } from "@/utils/clearVerification";

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

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setError("");

    if (country === "Select Country") {
      setError("Please select a valid country");
      return;
    }

    setSelectedCountry(country);
  };

  const handleContinue = () => {
    if (selectedCountry) {
      updateVerificationData("country", selectedCountry);
      setSelectCountry(selectedCountry);
      router.push(`/${params.token}/document-type`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 md:p-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative">
        {/* Header */}
        <div className="p-6 pb-2 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-50 rounded-2xl flex items-center justify-center transform -rotate-2">
            <Globe className="w-8 h-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Where are you?
            </h1>
            <p className="text-slate-500 text-sm">
              Select the country where your government ID was issued.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Box */}
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-800 px-1">
                Important Note
              </p>
              <p className="text-xs text-amber-700 leading-relaxed px-1">
                Ensure this matches your document. You cannot change this later.
              </p>
            </div>
          </div>

          {/* Country Select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
              Country of Issue
            </label>
            <div className="relative group">
              <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                  w-full px-4 py-4 flex items-center justify-between text-slate-900 bg-slate-50 
                  border-2 rounded-xl cursor-pointer transition-all
                  ${
                    error
                      ? "border-red-500 bg-red-50"
                      : isOpen 
                        ? "border-green-500 ring-4 ring-green-500/10 bg-white" 
                        : "border-slate-100 hover:border-slate-200"
                  }
                `}
              >
                <span className={selectedCountry ? "font-medium" : "text-slate-400"}>
                  {selectedCountry ? 
                    countries.find(c => c.name.toLowerCase() === selectedCountry)?.name || selectedCountry 
                    : "Select Country"}
                </span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </div>

              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 z-20 max-h-64 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-slate-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search country..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500/20 text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
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
                              w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between transition-colors
                              ${selectedCountry === country.name.toLowerCase() 
                                ? "bg-green-50 text-green-700" 
                                : "text-slate-600 hover:bg-slate-50"}
                            `}
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-slate-400 font-mono text-xs w-6">{country.code}</span>
                              {country.name}
                            </span>
                            {selectedCountry === country.name.toLowerCase() && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-slate-400">
                          No country found
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {error && (
              <p className="flex items-center text-xs text-red-500 gap-1.5 ml-1 animate-in slide-in-from-top-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Supported Countries Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Supported Regions
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600">
                🇳🇬 Nigeria
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600">
                🇬🇭 Ghana
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 border-dashed text-xs text-slate-400">
                + More coming soon
              </span>
            </div>
          </div>
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
            className={`
                    flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all shadow-lg
                    ${
                      selectedCountry
                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
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
