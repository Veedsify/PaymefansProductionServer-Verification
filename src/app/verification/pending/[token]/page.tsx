"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Clock, CheckCircle, XCircle, Loader, RefreshCw } from "lucide-react";
import Link from "next/link";

interface VerificationStatus {
  verification_state: "started" | "approved" | "rejected";
  verification_status: boolean;
  minutes_elapsed: number;
  user_name: string;
}

const PendingVerification = () => {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkVerificationStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/status/${token}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check verification status");
      }

      const data = await response.json();

      if (data.error) {
        setError(data.message);
        return;
      }

      setStatus(data);
      setLastChecked(new Date());

      //   // Auto-redirect based on status
      //   if (data.verification_state === "approved") {
      //     setTimeout(() => {
      //       router.push(`/verification/success/${token}`);
      //     }, 2000);
      //   } else if (data.verification_state === "rejected") {
      //     setTimeout(() => {
      //       router.push(`/verification/failed/${token}`);
      //     }, 2000);
      //   }
    } catch (error) {
      console.error("Status check error:", error);
      setError("Unable to check verification status. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    // Initial check
    checkVerificationStatus();

    // Set up polling (check every 10 seconds)
    const interval = setInterval(checkVerificationStatus, 10000);

    return () => clearInterval(interval);
  }, [checkVerificationStatus, token]);

  if (loading && !status) {
    return (
      <div className="flex flex-col items-center justify-center max-w-md min-h-dvh p-4 sm:p-6 mx-auto space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 safe-top safe-bottom">
        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Loader className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="mb-2 text-lg sm:text-xl font-bold text-slate-950 dark:text-gray-100">
            Checking Verification Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
            Please wait while we check your verification...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center max-w-md min-h-dvh p-4 sm:p-6 mx-auto space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 safe-top safe-bottom">
        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-full">
          <XCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-gray-100">
            Error
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
            {error}
          </p>
        </div>
        <button
          onClick={checkVerificationStatus}
          className="flex items-center px-4 py-2 text-sm sm:text-base text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors gap-2 active:scale-[0.98] touch-manipulation"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!status) return null;

  const getStatusIcon = () => {
    switch (status.verification_state) {
      case "approved":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "rejected":
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Clock className="w-8 h-8 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status.verification_state) {
      case "approved":
        return "bg-green-100";
      case "rejected":
        return "bg-red-100";
      default:
        return "bg-blue-100";
    }
  };

  const getStatusMessage = () => {
    switch (status.verification_state) {
      case "approved":
        return {
          title: "Verification Approved! ✅",
          subtitle:
            "Your identity has been successfully verified. Redirecting...",
        };
      case "rejected":
        return {
          title: "Verification Failed ❌",
          subtitle: "There was an issue with your verification. Redirecting...",
        };
      default:
        return {
          title: "Verification in Progress",
          subtitle: "Our team is reviewing your documents. Please wait...",
        };
    }
  };

  const statusMessage = getStatusMessage();
  const estimatedTime = Math.max(5 - status.minutes_elapsed, 0);

  return (
    <div className="flex flex-col items-center justify-center max-w-md min-h-dvh p-4 sm:p-6 mx-auto space-y-4 sm:space-y-6 bg-gray-50 dark:bg-gray-900 safe-top safe-bottom">
      {/* Status Icon */}
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 ${getStatusColor()} dark:opacity-90 rounded-full flex items-center justify-center`}
      >
        {getStatusIcon()}
      </div>

      {/* Status Message */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-gray-100">
          {statusMessage.title}
        </h1>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-gray-400">
          {statusMessage.subtitle}
        </p>
      </div>

      {/* Progress Info */}
      {status.verification_state === "started" && (
        <div className="w-full p-3 sm:p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center mb-3 gap-2 sm:gap-3">
            <Loader className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                Processing Verification
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Time elapsed: {status.minutes_elapsed} minute
                {status.minutes_elapsed !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {estimatedTime > 0 && (
            <div className="p-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded">
              <strong>Estimated time remaining:</strong> {estimatedTime} minute
              {estimatedTime !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* What's happening */}
      <div className="w-full p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <h3 className="mb-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
          What&apos;s happening:
        </h3>
        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
          <li>✓ Documents uploaded successfully</li>
          <li>✓ Face photo captured</li>
          {status.verification_state === "started" ? (
            <>
              <li className="flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin" />
                Verifying face match with document
              </li>
              <li className="flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin" />
                Validating document information
              </li>
              <li className="flex items-center gap-1">
                <Loader className="w-3 h-3 animate-spin" />
                Checking name consistency
              </li>
            </>
          ) : status.verification_state === "approved" ? (
            <>
              <li>✓ Face verification passed</li>
              <li>✓ Document validation completed</li>
              <li>✓ Name verification successful</li>
            </>
          ) : (
            <>
              <li>❌ Verification failed</li>
              <li>❌ Please review failure details</li>
            </>
          )}
        </ul>
      </div>

      {/* Last checked */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
        <button
          onClick={checkVerificationStatus}
          className="flex items-center mx-auto mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 gap-1 touch-manipulation"
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* Navigation */}
      <div className="w-full pt-4 space-y-2 safe-bottom">
        {status.verification_state === "rejected" && (
          <Link
            href={`/${token}/face`}
            className="block w-full px-4 py-2 text-sm text-center border rounded-lg text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium active:scale-[0.98] touch-manipulation"
          >
            Retry Verification
          </Link>
        )}
        <Link
          href={`${process.env.NEXT_PUBLIC_MAIN_SITE}/profile`}
          className="block w-full px-4 py-2 text-sm text-center border rounded-lg text-slate-600 dark:text-gray-300 border-slate-300 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors active:scale-[0.98] touch-manipulation"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PendingVerification;
