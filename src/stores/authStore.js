import { create } from "zustand";
import { apiService } from "../services/apiService";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("lexilearn_user")) || null,
  isAuthenticated: !!localStorage.getItem("lexilearn_token"),
  isLoading: false,
  error: null,

  login: async (role, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiService.login(email, password);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    apiService.logout();
    set({ user: null, isAuthenticated: false });
  },

  register: async (role, data) => {
    set({ isLoading: true, error: null });
    try {
      const userData = {
        email: data.email,
        password: data.password,
        full_name: data.full_name || data.name,
        role: role,
        is_active: true
      };
      const user = await apiService.register(userData);
      // After registration, usually we might want to auto-login or redirect to login
      set({ isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
    checkAuth: async () => {
      const token = localStorage.getItem("lexilearn_token");
      if (!token) return;
      
      try {
        const user = await apiService.getMe();
        if (user) {
          set({ user, isAuthenticated: true });
          localStorage.setItem("lexilearn_user", JSON.stringify(user));
        } else {
          set({ user: null, isAuthenticated: false });
          localStorage.removeItem("lexilearn_token");
          localStorage.removeItem("lexilearn_user");
        }
      } catch (error) {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem("lexilearn_token");
        localStorage.removeItem("lexilearn_user");
      }
    }
}));

export const useAccessibilityStore = create((set) => ({
  fontSize: 18,
  highContrast: false,
  readingPace: 1,
  audioEnabled: true,

  setFontSize: (size) => {
    document.documentElement.style.setProperty("--base-font-size", `${size}px`);
    set({ fontSize: size });
  },
  toggleHighContrast: () =>
    set((state) => {
      const next = !state.highContrast;
      document.documentElement.setAttribute(
        "data-theme",
        next ? "high-contrast" : ""
      );
      return { highContrast: next };
    }),
  setReadingPace: (pace) => set({ readingPace: pace }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
}));
