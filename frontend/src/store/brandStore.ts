// store/brandStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Groups } from "../types/type";

interface BrandState {
  brands: Groups[];
  setBrands: (brands: Groups[]) => void;
  selectedBrand: { id: string | null; name: string | null };
  setSelectedBrand: (id: string | null, name: string | null) => void;
}

export const useBrandStore = create<BrandState>()(
  persist(
    (set) => ({
      brands: [],
      setBrands: (brands) => set({ brands }),
      selectedBrand: { id: null, name: null },
      setSelectedBrand: (id, name) =>
        set({
          selectedBrand: { id, name },
        }),
    }),
    { name: "selected-brand-id" }, // persisted to localStorage
  ),
);
