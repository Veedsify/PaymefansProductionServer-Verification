export function dataURLtoBlob(dataURL: any) {
    const [header, base64] = dataURL.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    const binary = atob(base64);
    const array = [];

    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], { type: mime });
}