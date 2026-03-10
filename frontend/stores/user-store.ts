import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Position } from "@/types";

interface UserStore {
  address: string;
  positions: Position[];

  setAddress: (address: string) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  address: "",
  positions: [] as Position[],
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setAddress: (address) => set({ address }),

      addPosition: (position) =>
        set((state) => ({ positions: [...state.positions, position] })),

      updatePosition: (id, updates) =>
        set((state) => ({
          positions: state.positions.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      reset: () => set({ address: "", positions: [] }),
    }),
    {
      name: "pulse-market-user",
      partialize: (state) => ({ positions: state.positions }),
    },
  ),
);
