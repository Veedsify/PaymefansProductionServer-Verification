"use client";
import TopNav from "@/components/topnav";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { LucideLoader } from "lucide-react";

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const { setToken } = useTrackedProgress();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!params.token) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/verify-token`,
          { token: params.token }
        );
        if (response.data.error) {
          setIsValid(false);
        } else {
          setIsValid(true);
          setToken(params.token as string);
        }
      } catch {
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, [params.token, setToken]);

  const handleInvalidTokenRedirect = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_MAIN_SITE}/verification`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-gray-50">
        <div className="flex items-center justify-center">
          <LucideLoader size={32} className="animate-spin text-indigo-600" />
        </div>
        <p className="mt-4 text-gray-500">Authenticating...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-gray-50">
        <div className="w-full p-6 bg-white shadow-sm border border-gray-100 rounded-2xl max-w-sm">
          <TopNav />
          <h1 className="mb-3 text-xl font-semibold text-gray-900">
            Invalid Token
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Your verification link has expired or is invalid. Please request a
            new verification link.
          </p>
          <button
            className="flex items-center justify-center w-full px-6 py-3 font-medium text-white rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors"
            onClick={handleInvalidTokenRedirect}
          >
            Go to Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center flex-1 w-full h-full p-4">
        <div className="w-full max-w-md mx-auto mb-6">
          <TopNav />
        </div>
        {children}
      </div>
    </main>
  );
}
