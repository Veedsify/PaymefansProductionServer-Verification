"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { countries } from "@/utils/countries";
import { ChangeEvent, useEffect, useState } from "react";
const SelectCountry = () => {
  const { setSelectCountry, updateVerificationData } = useTrackedProgress();
  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    updateVerificationData("country", country as string);
    setSelectCountry(country as string);
  };
  return (
    <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
      <h1 className="text-2xl font-bold text-slate-950 text-center">
        Select the country of your document
      </h1>
      <h3 className="text-wrap text-pink-600 text-sm">
        Please select the country of the document you will be using for
        verification
      </h3>
      <select
        onChange={handleCountryChange}
        defaultValue={"Select Country"}
        className="text-slate-950 px-3 py-4 inline-block text-sm bg-white border rounded-lg w-full"
      >
        <option value="Select Country" disabled>
          Select Country
        </option>
        {countries.map((country, index) => (
          <option key={index} value={country.name.toLowerCase()}>
            {country.name}
          </option>
        ))}
      </select>
      <button className="text-slate-950 text-sm">Cancel</button>
    </div>
  );
};
export default SelectCountry;
