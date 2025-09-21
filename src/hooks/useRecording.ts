"use client";

import { useRef, useState, useCallback } from "react";
import localforage from "localforage";
import toast from "react-hot-toast";

interface UseRecordingOptions {
  duration?: number; // in seconds
  onComplete?: (blob: Blob) => void;
}

export const useRecording = (
  stream: MediaStream | null,
  options: UseRecordingOptions = {},
) => {
  const { duration = 5, onComplete } = options;
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [error, setError] = useState<{
    status: boolean;
    message: string;
  } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const startRecording = useCallback(() => {
    if (!stream) {
      setError({ status: true, message: "No camera stream available" });
      return;
    }

    try {
      recordedChunks.current = [];
      const options = {
        mimeType: "video/webm;codecs=vp9,opus",
        videoBitsPerSecond: 2500000,
      };

      // Fallback MIME types
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch {
        try {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/webm",
          });
        } catch {
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: "video/mp4",
          });
        }
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: mediaRecorder.mimeType,
        });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);

        // Store the blob for upload
        localforage.setItem("faceVideoBlob", blob);
        setIsRecording(false);
        toast.success("Video recorded successfully!");

        if (onComplete) {
          onComplete(blob);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError({
          status: true,
          message: "Recording failed. Please try again.",
        });
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after full duration if not already stopped
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, duration * 1000);
    } catch (err) {
      console.error("Recording setup error:", err);
      setError({
        status: true,
        message: "Failed to start recording. Please try again.",
      });
    }
  }, [stream, duration, onComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setRecordedVideo(null);
    setError(null);
    recordedChunks.current = [];

    // Clean up video URL
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
  }, [recordedVideo]);

  return {
    isRecording,
    recordedVideo,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
