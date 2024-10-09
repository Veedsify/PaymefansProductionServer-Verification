import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type TrackedProgressType = {
     agreedToTerms: boolean;
     agreedToCamera: boolean;
     selectCountry: string | null;
     documentType: string | null;
     setAgreedToTerms: (value: boolean) => void;
     setAgreedToCamera: (value: boolean) => void;
     setSelectCountry: (value: string) => void;
     setDocumentType: (value: string) => void;
}

export const useTrackedProgress = create<TrackedProgressType>()(
     persist((set) => ({
          agreedToTerms: false,
          agreedToCamera: false,
          selectCountry: null,
          documentType: null,
          setAgreedToTerms: (value) => set({ agreedToTerms: value }),
          setAgreedToCamera: (value) => set({ agreedToCamera: value }),
          setSelectCountry: (value) => set({ selectCountry: value }),
          setDocumentType: (value) => set({ documentType: value})
     }),
          {
               name: 'tract-progress',
               storage: createJSONStorage(() => localStorage),
          }
     )
);