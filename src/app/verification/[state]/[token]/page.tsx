"use client";
import OutLetPage from "@/components/outletpage";
import TopNav from "@/components/topnav";
import { useParams } from "next/navigation";
import { LucideLoader } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  console.log("Params", params);

  const handleInvalidTokenRedirect = () => {
    if (params.state === "success") {
      window.location.href = `${process.env.NEXT_PUBLIC_MAIN_SITE}/profile`;
      return;
    }
    window.location.href = `${process.env.NEXT_PUBLIC_MAIN_SITE}/verification`;
  };

  useEffect(() => {
    if (params.state !== "success" && params.state !== "failed") {
      window.location.href = `${process.env.NEXT_PUBLIC_MAIN_SITE}/`;
    }
  }, [params]);

  // Loading spinner component
  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-slate-950 min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-80 w-full flex flex-col items-center">
          <TopNav />
          <div className="flex items-center justify-center w-80">
            <LucideLoader size={32} className="animate-spin duration-200" />
          </div>
          <p className="text-gray-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Invalid token component
  if (!isValid) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-slate-950 min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
          <TopNav />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {params.state == "success"
              ? "Your Details Have Been Received"
              : "Oops, Some Of Your Details We're Incorrect"}
          </h1>
          <div>{/* IMAGES HERE */}</div>
          <div className="text-gray-800 mb-6 text-sm">
            {params.state === "success" ? (
              <>
                <p className="text-gray-800 mb-3 text-sm">
                  Thank you! We&apos;ve successfully received your details and
                  have begun the verification process for your account. This
                  process typically takes up to 24 hours, as we carefully review
                  the information provided to ensure everything checks out.
                </p>
                <p className="text-gray-800 mb-3 text-sm">
                  Once your account is verified, you&apos;ll receive a
                  confirmation email with the next steps. We appreciate your
                  patience and thank you for choosing PayMeFans.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-800 mb-3 text-sm">
                  We&apos;re sorry, but some of the information you submitted
                  appears to be incorrect, and we couldn&apos;t complete your
                  account verification at this time.
                </p>
                <p className="text-gray-800 mb-3 text-sm">
                  Please double-check your details and try again later. If the
                  issue persists, consider reaching out to our support team for
                  assistance. We&apos;re here to help and want to get you
                  verified as soon as possible!
                </p>
              </>
            )}
          </div>
          <button
            className="w-full bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
            onClick={handleInvalidTokenRedirect}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            {params.state === "success" ? "Continue" : "Retry Verifcation"}
          </button>
        </div>
      </div>
    );
  }

  // Valid token component
  return (
    <main className="w-full bg-slate-950 min-h-screen flex flex-col">
      <div className="flex flex-col h-full w-full items-center justify-center flex-1">
        <div className="bg-white p-6 rounded-xl">
          <TopNav />
          <OutLetPage />
        </div>
      </div>
    </main>
  );
}
