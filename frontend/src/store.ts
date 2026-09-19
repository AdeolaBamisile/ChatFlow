import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AccentColor, AppSettings, CallInfo, CurrentUser, Theme } from "./types";

interface AppStore extends AppSettings {
  currentUser: CurrentUser | null;
  setTheme: (theme: Theme) => void;
  setAccentColor: (accentColor: AccentColor) => void;
  setCurrentUser: (user: CurrentUser | null) => void;
  updateCurrentUser: (changes: Partial<CurrentUser>) => void;
  setOnlineStatusVisible: (value: boolean) => void;
  setAllowFriendRequests: (value: boolean) => void;
  call: CallInfo | null;
  callIncoming: boolean;
  setCall: (call: CallInfo | null, incoming?: boolean) => void;
  clearCall: () => void;
  reset: () => void;
}

const defaults: AppSettings = {
  theme: "dark",
  accentColor: "blue",
  onlineStatusVisible: true,
  allowFriendRequests: true,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...defaults,
      currentUser: null,
      call: null,
      callIncoming: false,
      setTheme: (theme) => set(() => ({ theme })),
      setAccentColor: (accentColor) => set(() => ({ accentColor })),
      setCurrentUser: (currentUser) => set(() => ({ currentUser })),
      updateCurrentUser: (changes) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...changes }
            : null,
        })),
      setOnlineStatusVisible: (onlineStatusVisible) =>
        set(() => ({ onlineStatusVisible })),
      setAllowFriendRequests: (allowFriendRequests) =>
        set(() => ({ allowFriendRequests })),
      setCall: (call, incoming = false) => set(() => ({ call, callIncoming: incoming })),
      clearCall: () => set(() => ({ call: null, callIncoming: false })),
      reset: () => set({ ...defaults, currentUser: null, call: null, callIncoming: false }),
    }),
    {
      name: "chatflow-settings",
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        onlineStatusVisible: state.onlineStatusVisible,
        allowFriendRequests: state.allowFriendRequests,
        currentUser: state.currentUser,
      }),
    },
  ),
);

export const useTheme = () => useAppStore((state) => state.theme);
export const useAccentColor = () => useAppStore((state) => state.accentColor);
export const useCurrentUser = () => useAppStore((state) => state.currentUser);
