export function dataURLtoBlob(dataURL: string | ArrayBuffer | null): Blob {
  if (!dataURL) {
    throw new Error("Invalid data URL");
  }
  if (typeof dataURL === "string") {
    const [header, base64] = dataURL.split(",");
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "";
    const binary = atob(base64);
    const array = [];

    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], { type: mime });
  }
  if (dataURL instanceof ArrayBuffer) {
    return new Blob([dataURL]);
  }
  throw new Error("Invalid data URL format");
}

export function bufferToBlob(
  buffer: Buffer,
  mimeType: string = "application/octet-stream"
): Blob {
  return new Blob([buffer], { type: mimeType });
}
