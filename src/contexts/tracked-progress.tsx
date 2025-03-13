import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TrackedProgressType = {
  token: string | string[] | null;
  agreedToTerms: boolean;
  agreedToCamera: boolean;
  selectCountry: string | null;
  documentType: string | null;
  uploadDocumentFront: boolean;
  uploadDocumentBack: boolean;
  faceVerification: boolean;
  verificationData: {
    terms: boolean;
    country: string | null;
    documentType: string | null;
    front: string | null;
    back: string | null;
    faceVideo: string | null;
  };
  setToken: (value: string | string[]) => void;
  updateVerificationData: (key: string, value: string) => void;
  setAgreedToTerms: (value: boolean) => void;
  setAgreedToCamera: (value: boolean) => void;
  setSelectCountry: (value: string) => void;
  setDocumentType: (value: string) => void;
  setUploadDocument: (value: boolean, value2: boolean) => void;
  setFaceVerification: () => void;
};

export const useTrackedProgress = create<TrackedProgressType>()(
  persist(
    (set) => ({
      token: null,
      agreedToTerms: false,
      agreedToCamera: false,
      selectCountry: null,
      documentType: null,
      uploadDocumentFront: false,
      uploadDocumentBack: false,
      faceVerification: false,
      verificationData: {
        terms: false,
        country: null,
        documentType: null,
        front: null,
        back: null,
        faceVideo: null,
      },
      updateVerificationData: (key, value) =>
        set((state) => ({
          verificationData: {
            ...state.verificationData,
            [key]: value,
          },
        })),
      setToken: (value) => set({ token: value }),
      setAgreedToTerms: (value) => set({ agreedToTerms: value }),
      setAgreedToCamera: (value) => set({ agreedToCamera: value }),
      setSelectCountry: (value) => set({ selectCountry: value }),
      setDocumentType: (value) => set({ documentType: value }),
      setUploadDocument: (value, value2) =>
        set({ uploadDocumentBack: value2, uploadDocumentFront: value }),
      setFaceVerification: () => set({ faceVerification: true }),
    }),
    {
      name: "track-progress",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
