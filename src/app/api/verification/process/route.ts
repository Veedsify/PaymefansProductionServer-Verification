import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds max

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;

    if (!token) {
      return NextResponse.json(
        { error: true, message: "Token is required" },
        { status: 400 }
      );
    }

    const front = formData.get("front") as File | null;
    const back = formData.get("back") as File | null;
    const faceVideo = formData.get("faceVideo") as File | null;
    const country = formData.get("country") as string | null;
    const documentType = formData.get("documentType") as string | null;
    const terms = formData.get("terms") as string | null;

    // Validate required fields
    if (!front || !faceVideo || !country || !documentType || !terms) {
      return NextResponse.json(
        {
          error: true,
          message:
            "Missing required fields. Please ensure all documents and information are provided.",
        },
        { status: 400 }
      );
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (
      front.size > maxSize ||
      (back && back.size > maxSize) ||
      faceVideo.size > maxSize
    ) {
      return NextResponse.json(
        {
          error: true,
          message: "File size too large. Maximum size is 10MB per file.",
        },
        { status: 400 }
      );
    }

    // Forward to server endpoint
    const serverEndpoint = process.env.NEXT_PUBLIC_VERIFICATION_ENDPOINT;
    if (!serverEndpoint) {
      return NextResponse.json(
        { error: true, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create a new FormData to forward to the server
    const serverFormData = new FormData();
    serverFormData.append("front", front);
    if (back) {
      serverFormData.append("back", back);
    }
    serverFormData.append("faceVideo", faceVideo);
    serverFormData.append("country", country);
    serverFormData.append("documentType", documentType);
    serverFormData.append("terms", terms);

    // Forward the request to the server
    const response = await fetch(`${serverEndpoint}/process/${token}`, {
      method: "POST",
      body: serverFormData,
      headers: {
        // Don't set Content-Type, let fetch set it with boundary
      },
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return NextResponse.json(
        {
          error: true,
          message: data.message || "Failed to process verification",
          token: token,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      error: false,
      message: "Verification submitted successfully",
      token: token,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Verification processing error:", error);
    return NextResponse.json(
      {
        error: true,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
