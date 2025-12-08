import localforage from "localforage";

/**
 * Check if verification data exists in localforage
 * Useful for determining if user can retry without re-capturing
 */
export const checkVerificationData = async (): Promise<{
  hasFront: boolean;
  hasBack: boolean;
  hasFaceVideo: boolean;
  hasAll: boolean;
}> => {
  try {
    const front = await localforage.getItem("front");
    const back = await localforage.getItem("back");
    const faceVideoBlob = await localforage.getItem("faceVideoBlob");

    const hasFront = !!front;
    const hasBack = !!back;
    const hasFaceVideo = !!faceVideoBlob;
    const hasAll = hasFront && hasFaceVideo; // Back is optional for passports

    return {
      hasFront,
      hasBack,
      hasFaceVideo,
      hasAll,
    };
  } catch (error) {
    console.error("Error checking verification data:", error);
    return {
      hasFront: false,
      hasBack: false,
      hasFaceVideo: false,
      hasAll: false,
    };
  }
};

/**
 * Clear all verification data
 */
export const clearAllVerificationData = async (): Promise<void> => {
  try {
    await localforage.removeItem("front");
    await localforage.removeItem("back");
    await localforage.removeItem("faceVideoBlob");
  } catch (error) {
    console.error("Error clearing verification data:", error);
  }
};
