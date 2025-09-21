"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
  audio?: boolean;
}

export const useCamera = (options: UseCameraOptions = {}) => {
  const { facingMode = "user", audio = false } = options;
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<{
    status: boolean;
    message: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initCamera = useCallback(async () => {
    setHasPermission(null);
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode,
          frameRate: { ideal: 30, min: 15 },
        },
        audio,
      };

      const getUserMediaWithTimeout = (
        constraints: MediaStreamConstraints,
        timeout: number = 10000,
      ) => {
        return Promise.race([
          navigator.mediaDevices.getUserMedia(constraints),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Camera permission timeout")),
              timeout,
            ),
          ),
        ]);
      };

      const stream = await getUserMediaWithTimeout(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current)
            return reject(new Error("Video element not found"));

          const handleCanPlay = () => {
            videoRef.current?.removeEventListener("canplay", handleCanPlay);
            resolve();
          };

          const handleError = () => {
            videoRef.current?.removeEventListener("error", handleError);
            reject(new Error("Video playback failed"));
          };

          videoRef.current.addEventListener("canplay", handleCanPlay);
          videoRef.current.addEventListener("error", handleError);

          // Fallback timeout
          setTimeout(() => {
            videoRef.current?.removeEventListener("canplay", handleCanPlay);
            videoRef.current?.removeEventListener("error", handleError);
            resolve();
          }, 3000);
        });

        // Ensure video starts playing
        if (videoRef.current) {
          videoRef.current.play().catch((err) => {
            console.error("Video play error:", err);
          });
        }

        setHasPermission(true);
      }
    } catch (err) {
      console.error("Camera init error:", err);
      setHasPermission(false);

      let message = "Camera access failed. Please check permissions.";
      if (err instanceof Error) {
        if (err.message === "Camera not supported in this browser") {
          message =
            "Camera is not supported in this browser. Please use a different browser or device.";
        } else if (err.message === "Camera permission timeout") {
          message =
            "Camera permission request timed out. Please try again or check your browser settings.";
        } else if (err.name === "NotAllowedError") {
          message =
            "Camera access denied. Please allow camera permissions and refresh the page.";
        } else if (err.name === "NotFoundError") {
          message =
            "No camera found. Please connect a camera and refresh the page.";
        } else if (err.name === "NotReadableError") {
          message =
            "Camera is busy. Close other apps using the camera and refresh the page.";
        } else if (err.name === "OverconstrainedError") {
          message =
            "Camera doesn't support required settings. Trying with basic settings...";
          // // Try with minimal constraints
          // try {
          //   const basicStream = await getUserMediaWithTimeout({
          //     video: true,
          //     audio,
          //   });
          //   streamRef.current = basicStream;
          //   if (videoRef.current) {
          //     videoRef.current.srcObject = basicStream;
          //     // Ensure video starts playing
          //     videoRef.current.play().catch((err) => {
          //       console.error("Video play error:", err);
          //     });
          //     setHasPermission(true);
          //     return;
          //   }
          // } catch {
          //   message = "Camera initialization failed completely.";
          // }
        }
      }
      setError({ status: true, message });
    }
  }, [facingMode, audio]);

  const retryCamera = useCallback(async () => {
    // Cleanup existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    initCamera();
  }, [initCamera]);

  useEffect(() => {
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initCamera]);

  return {
    videoRef,
    hasPermission,
    error,
    initCamera,
    retryCamera,
    streamRef,
  };
};
