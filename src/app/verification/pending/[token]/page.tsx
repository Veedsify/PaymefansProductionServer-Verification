"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkVerificationStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT}/status/${token}`
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
  }, [token, router]);

  useEffect(() => {
    if (!token) return;

    // Initial check
    checkVerificationStatus();

    // Set up polling (check every 10 seconds)
    const interval = setInterval(checkVerificationStatus, 10000);

    return () => clearInterval(interval);
  }, [token]);

  if (loading && !status) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-950 mb-2">
            Checking Verification Status
          </h2>
          <p className="text-slate-600 text-sm">
            Please wait while we check your verification...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-950">Error</h2>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
        <button
          onClick={checkVerificationStatus}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 max-w-md mx-auto p-6">
      {/* Status Icon */}
      <div
        className={`w-16 h-16 ${getStatusColor()} rounded-full flex items-center justify-center`}
      >
        {getStatusIcon()}
      </div>

      {/* Status Message */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-950">
          {statusMessage.title}
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          {statusMessage.subtitle}
        </p>
      </div>

      {/* Progress Info */}
      {status.verification_state === "started" && (
        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Processing Verification
              </p>
              <p className="text-xs text-blue-700">
                Time elapsed: {status.minutes_elapsed} minute
                {status.minutes_elapsed !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {estimatedTime > 0 && (
            <div className="text-xs text-blue-700 bg-blue-100 rounded p-2">
              <strong>Estimated time remaining:</strong> {estimatedTime} minute
              {estimatedTime !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* What's happening */}
      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          What&apos;s happening:
        </h3>
        <ul className="text-xs text-gray-700 space-y-1">
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
        <p className="text-xs text-gray-500">
          Last checked: {lastChecked.toLocaleTimeString()}
        </p>
        <button
          onClick={checkVerificationStatus}
          className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* Navigation */}
      <div className="w-full pt-4">
        <Link
          href={`${process.env.NEXT_PUBLIC_MAIN_SITE}/profile`}
          className="w-full px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors block text-center"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PendingVerification;
