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
      <div className="flex flex-col items-center justify-center w-full min-h-dvh bg-gray-50 dark:bg-gray-900 safe-top safe-bottom">
        <div className="flex flex-col items-center justify-center gap-3">
          <LucideLoader
            size={32}
            className="animate-spin text-indigo-600 dark:text-indigo-400"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-dvh bg-gray-50 dark:bg-gray-900 p-4 safe-top safe-bottom">
        <div className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-6">
          <TopNav />
          <h1 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invalid Token
          </h1>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your verification link has expired or is invalid. Please request a
            new verification link.
          </p>
          <button
            className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors active:scale-[0.98]"
            onClick={handleInvalidTokenRedirect}
          >
            Go to Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full min-h-dvh bg-gray-50 dark:bg-gray-900 safe-top safe-bottom">
      <div className="flex flex-col items-center justify-center flex-1 w-full p-4 pb-6">
        <div className="w-full max-w-md mx-auto mb-4 sm:mb-6">
          <TopNav />
        </div>
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </main>
  );
}
