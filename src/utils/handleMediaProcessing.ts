"use client";
import { useTrackedProgress } from "@/contexts/tracked-progress";
import axios, { AxiosError } from "axios";
import localforage from "localforage";
import { toast } from "react-hot-toast";
import { dataURLtoBlob } from "./dataUrlToBlob";

const handleMediaProcessing = async () => {
  const { verificationData, token, agreedToTerms } =
    useTrackedProgress.getState();
  try {
    const formData = new FormData();

    const front = await localforage.getItem("front");
    const back = await localforage.getItem("back");
    const faceVideoBlob = await localforage.getItem("faceVideoBlob");

    if (!faceVideoBlob && !front && !back) {
      toast.error("Sorry, Some Of Your Documents Are Missing");
      return;
    }

    if (front) {
      const frontData = dataURLtoBlob(front as string);
      formData.append("front", frontData, "front.png");
    }
    if (back) {
      const backData = dataURLtoBlob(back as string);
      formData.append("back", backData, "back.png");
    }

    if (faceVideoBlob) {
      try {
        console.log("Processing video for screenshot...");
        // Extract frame from the video with improved reliability
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        const videoUrl = URL.createObjectURL(faceVideoBlob as Blob);
        video.src = videoUrl;

        // Wait for metadata & canplay (Safari-friendly)
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Timeout loading video metadata"));
          }, 15000);

          const onReady = () => {
            clearTimeout(timeout);
            // Safari sometimes needs a play attempt before seeking
            video.play().catch(() => {});
            resolve();
          };

          video.onloadedmetadata = onReady;
          video.oncanplay = onReady;
          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Video metadata load error"));
          };
        });

        // Ensure video has valid dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          throw new Error("Video has invalid dimensions");
        }

        // Seek to ~1s mark (or middle if shorter), Safari-friendly fallback
        const desiredTime =
          video.duration && !Number.isNaN(video.duration)
            ? Math.min(
                Math.max(1, video.duration / 2),
                Math.max(0.25, video.duration - 0.1)
              )
            : 1;

        const attemptSeek = (time: number) =>
          new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error("Timeout seeking video"));
            }, 12000);

            const cleanup = () => {
              clearTimeout(timeout);
              video.removeEventListener("seeked", onSeeked);
              video.removeEventListener("timeupdate", onTimeUpdate);
              video.removeEventListener("error", onError);
            };

            const finishIfReady = () => {
              if (video.readyState >= 2) {
                setTimeout(() => {
                  cleanup();
                  resolve();
                }, 120);
                return true;
              }
              return false;
            };

            const onSeeked = () => {
              if (finishIfReady()) return;
            };

            const onTimeUpdate = () => {
              if (finishIfReady()) return;
            };

            const onError = () => {
              cleanup();
              reject(new Error("Video seek error"));
            };

            video.addEventListener("seeked", onSeeked);
            video.addEventListener("timeupdate", onTimeUpdate);
            video.addEventListener("error", onError);

            try {
              video.currentTime = time;
            } catch (e) {
              cleanup();
              reject(e);
            }
          });

        // Try primary seek, then fallback to 0.1s if needed
        try {
          await attemptSeek(desiredTime);
        } catch (seekErr) {
          console.warn("Primary seek failed, retrying near start:", seekErr);
          await attemptSeek(0.1);
        }

        // Create canvas with video dimensions
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d", {
          willReadFrequently: false,
          alpha: false,
        });

        if (!ctx) {
          throw new Error("Failed to get canvas context");
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Verify the canvas has content (not blank/black)
        const imageData = ctx.getImageData(
          0,
          0,
          Math.min(100, canvas.width),
          Math.min(100, canvas.height)
        );
        const pixels = imageData.data;
        let hasContent = false;

        // Check if image has non-black pixels (simple check)
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          // If any pixel is not black/dark, we have content
          if (r > 10 || g > 10 || b > 10) {
            hasContent = true;
            break;
          }
        }

        if (!hasContent) {
          throw new Error(
            "Captured frame appears to be blank. Please try recording again."
          );
        }

        // Convert canvas to blob with high quality
        const imageBlob = await new Promise<Blob | null>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to generate blob from canvas"));
              } else {
                resolve(blob);
              }
            },
            "image/jpeg", // Use JPEG for better compatibility
            0.95 // High quality
          );
        });

        if (!imageBlob || imageBlob.size === 0) {
          throw new Error("Generated image blob is empty");
        }

        console.log("Screenshot generated successfully", {
          size: imageBlob.size,
          dimensions: `${canvas.width}x${canvas.height}`,
        });

        formData.append("faceVideo", imageBlob, "faceImage.jpg");
        URL.revokeObjectURL(videoUrl);
      } catch (videoError) {
        console.error("Error generating video screenshot:", videoError);
        const errorMessage =
          videoError instanceof Error
            ? videoError.message
            : "Failed to extract frame from video";
        toast.error(
          `Video processing error: ${errorMessage}. Please try recording again.`
        );
        throw new Error(errorMessage);
      }
    }

    // Add token - this is required by the API route
    if (!token) {
      toast.error(
        "Verification token is missing. Please start the verification process again."
      );
      throw new Error("Token is required");
    }
    // Handle token as string or array (get first if array)
    const tokenValue = Array.isArray(token) ? token[0] : token;
    if (!tokenValue) {
      toast.error(
        "Verification token is invalid. Please start the verification process again."
      );
      throw new Error("Token is required");
    }
    formData.append("token", tokenValue);

    if (verificationData.country)
      formData.append("country", verificationData.country as string);
    if (verificationData.documentType)
      formData.append("documentType", verificationData.documentType as string);
    if (agreedToTerms) formData.append("terms", "true");

    console.log("Sending verification data...");

    // Use Next.js API route for better error handling
    const apiEndpoint = "/api/verification/process";
    const SendForVerification = await axios.post(apiEndpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000, // 60 second timeout
    });

    return SendForVerification.data;
  } catch (error) {
    const axiosError = error as AxiosError<{
      message: string;
      status: string;
      error: string;
    }>;
    console.error("Verification processing error:", axiosError);

    const errorMessage =
      axiosError?.response?.data?.message ||
      axiosError.message ||
      "Error processing verification";
    toast.error(errorMessage);

    // DO NOT clear data on failure - preserve it for retry
    // Only clear on explicit user action or successful submission
    // This allows users to retry without re-capturing everything

    throw new Error(errorMessage);
  }
};

export default handleMediaProcessing;
