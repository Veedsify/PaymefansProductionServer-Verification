import localforage from "localforage";

export const clearVerificationData = async () => {
  // Clear session storage
  sessionStorage.clear();

  // Clear localforage
  await localforage.clear();

  // Redirect to main site
  const mainSite = process.env.NEXT_PUBLIC_MAIN_SITE || "/";
  window.location.href = mainSite;
};
