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

    // Helper to stop current stream
    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError({
        status: true,
        message: "Camera not supported in this browser",
      });
      setHasPermission(false);
      return;
    }

    const getUserMediaWithTimeout = (
      constraints: MediaStreamConstraints,
      timeout: number = 10000
    ) => {
      return Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Camera permission timeout")),
            timeout
          )
        ),
      ]);
    };

    try {
      let stream: MediaStream | null = null;

      // Strategy 1: Ideal constraints
      try {
        stream = await getUserMediaWithTimeout({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode,
          },
          audio,
        });
      } catch (err) {
        console.warn("Strategy 1 failed, trying fallback...", err);
      }

      // Strategy 2: Basic constraints (just facingMode)
      if (!stream) {
        try {
          stream = await getUserMediaWithTimeout({
            video: { facingMode },
            audio,
          });
        } catch (err) {
          console.warn("Strategy 2 failed, trying fallback...", err);
        }
      }

      // Strategy 3: Minimal constraints (any video)
      if (!stream) {
        try {
          stream = await getUserMediaWithTimeout({
            video: true,
            audio,
          });
        } catch (err) {
          console.warn("Strategy 3 failed.", err);
        }
      }

      if (!stream) {
        throw new Error("Could not initialize camera with any constraints");
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          if (!videoRef.current) {
            setHasPermission(true);
            return resolve();
          }

          const videoEl = videoRef.current;

          const onLoadedMetadata = () => {
            cleanup();
            setHasPermission(true);
            resolve();
          };

          const onCanPlay = () => {
            cleanup();
            setHasPermission(true);
            resolve();
          };

          const onError = (e: Event) => {
            cleanup();
            console.error("Video element error:", e);
            // Still set permission to true if we have a stream
            if (streamRef.current) {
              setHasPermission(true);
            }
            resolve();
          };

          const cleanup = () => {
            videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
            videoEl.removeEventListener("canplay", onCanPlay);
            videoEl.removeEventListener("error", onError);
          };

          // Try multiple events to ensure we catch when video is ready
          videoEl.addEventListener("loadedmetadata", onLoadedMetadata, {
            once: true,
          });
          videoEl.addEventListener("canplay", onCanPlay, { once: true });
          videoEl.addEventListener("error", onError, { once: true });

          // Start playing the video
          videoEl.play().catch((e) => {
            console.error("Play error:", e);
            // Even if play fails, if we have metadata, we're good
            if (videoEl.readyState >= 2) {
              cleanup();
              setHasPermission(true);
              resolve();
            }
          });

          // Fallback timeout
          setTimeout(() => {
            if (videoEl.readyState >= 1) {
              cleanup();
              setHasPermission(true);
              resolve();
            }
          }, 2000);
        });
      } else {
        // If no video ref yet, still set permission (component might mount later)
        setHasPermission(true);
      }
    } catch (err) {
      console.error("Camera init error:", err);
      setHasPermission(false);

      let message = "Camera access failed. Please check permissions.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          message =
            "Camera access denied. Please allow camera permissions and refresh.";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          message = "No camera found on this device.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          message = "Camera is currently in use by another application.";
        }
      }

      setError({ status: true, message });
    }
  }, [facingMode, audio]);

  const retryCamera = useCallback(() => {
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
