"use client"
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useEffect, useState } from "react";
const SelectDocumentType = () => {
     const { setDocumentType } = useTrackedProgress()
     const [document, setDocument] = useState<string | null>(null);
     useEffect(() => {
          const handleCountryChange = () => {
               setDocumentType(document as string);
          }
          handleCountryChange();
     }, [document])
     return (
          <div className="flex flex-col items-center justify-center space-y-4 max-w-80">
               <h1 className="text-2xl font-bold text-slate-950 text-center">
                    Select the type of document
               </h1>
               <h3 className="text-wrap text-pink-600 text-sm">
                    Please select the type of document you will be using for verification
               </h3>
               <form className="text-slate-950 px-3 py-4 inline-block text-sm bg-white border rounded-lg w-full">
                    <label htmlFor="passport" className="px-2 py-4 duration-200 cursor-pointer hover:bg-gray-50 rounded-xl flex items-center">
                         <input type="radio" className="w-6 h-6 accent-purple-500" id="passport" name="document" value="passport" onClick={() => setDocument("passport")} />
                         <span className="pl-4 font-bold">Passport</span>
                    </label>
                    <label htmlFor="id" className="px-2 py-4 duration-200 cursor-pointer hover:bg-gray-50 rounded-xl flex items-center">
                         <input type="radio" className="w-6 h-6 accent-purple-500" id="id" name="document" value="id" onClick={() => setDocument("id")} />
                         <span className="pl-4 font-bold">ID</span>
                    </label>
                    <label htmlFor="driver" className="px-2 py-4 duration-200 cursor-pointer hover:bg-gray-50 rounded-xl flex items-center">
                         <input type="radio" className="w-6 h-6 accent-purple-500" id="driver" name="document" value="driver" onClick={() => setDocument("driver")} />
                         <span className="pl-4 font-bold">Driver's License</span>
                    </label>
               </form>
               <button className="text-slate-950 text-sm">
                    Cancel
               </button>
          </div>
     );
}
export default SelectDocumentType;