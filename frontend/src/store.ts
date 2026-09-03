import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  action: {
    setTheme: (theme: Theme) => void;
  };
}

const useThemeStrore = create<ThemeStore>((set) => ({
  theme: "dark",
  action: {
    setTheme: (theme) => set(() => ({ theme })),
  },
}));

export const useTheme = () => useThemeStrore((state) => state.theme);
export const useThemeAction = () => useThemeStrore((store) => store.action);
