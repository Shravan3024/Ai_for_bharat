import { create } from "zustand";
import { apiService } from "../services/apiService";
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../config/cognitoConfig";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("lexilearn_user")) || null,
  isAuthenticated: !!localStorage.getItem("lexilearn_token"),
  isLoading: false,
  error: null,

  login: async (role, email, password) => {
    set({ isLoading: true, error: null });
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (result) => {
          const accessToken = result.getIdToken().getJwtToken();
          localStorage.setItem("lexilearn_token", accessToken);
          
          try {
            // After successful Cognito login, fetch the local DB user profile
            let user;
            try {
              user = await apiService.getMe();
            } catch (err) {
              // If we fail to get the user, it means they might not be synced to the local SQLite DB yet.
              // Let's attempt to sync them now!
              console.log("Local user not found. Attempting to sync from Cognito...");
              const payload = result.getIdToken().decodePayload();
              await apiService.syncCognitoUser({
                 full_name: payload.name || payload.email.split("@")[0],
                 role: role
              });
              
              // Now try to get the user again
              user = await apiService.getMe();
            }
            
            set({ user, isAuthenticated: true, isLoading: false });
            localStorage.setItem("lexilearn_user", JSON.stringify(user));
            resolve(user);
          } catch (err) {
            const isNetworkError =
              err instanceof TypeError && /Failed to fetch|NetworkError/i.test(err?.message || "");
            const message = isNetworkError
              ? "Cognito login worked, but the backend could not be reached. Make sure FastAPI is running on http://localhost:8000 and CORS includes your frontend port."
              : err?.message || "Failed to load or sync local user profile.";

            set({ error: message, isLoading: false });
            reject(new Error(message));
          }
        },
        onFailure: (err) => {
          set({ error: err.message || JSON.stringify(err), isLoading: false });
          reject(err);
        },
      });
    });
  },

  logout: () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    apiService.logout(); // Clears local storage
    set({ user: null, isAuthenticated: false });
  },

  register: async (role, data) => {
    set({ isLoading: true, error: null });
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: "email", Value: data.email }),
        new CognitoUserAttribute({ Name: "name", Value: data.full_name || data.name }),
        // We can store role as a custom attribute if configured in Cognito,
        // or just handle role via our SQLite DB sync map.
      ];

      userPool.signUp(data.email, data.password, attributeList, null, async (err, result) => {
        if (err) {
          set({ error: err.message || JSON.stringify(err), isLoading: false });
          reject(err);
          return;
        }
        
        // We don't auto login here because Cognito requires email confirmation first.
        // We resolve with a flag indicating confirmation is needed.
        set({ isLoading: false });
        resolve({ userConfirmed: result.userConfirmed, email: data.email, role: role, name: data.full_name || data.name });
      });
    });
  },

  confirmRegistration: async (email, code, role, name) => {
    set({ isLoading: true, error: null });
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

        cognitoUser.confirmRegistration(code, true, async (err, result) => {
          if (err) {
            set({ error: err.message || JSON.stringify(err), isLoading: false });
            reject(err);
            return;
          }
          // Confirmed successfully. The Login page will call login() next.
          set({ isLoading: false, error: null });
          resolve(result);
        });
    });
  },

  resendConfirmationCode: async (email) => {
    set({ isLoading: true, error: null });
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          set({ error: err.message || JSON.stringify(err), isLoading: false });
          reject(err);
          return;
        }
        // Use error state temporarily to show a success message to the user
        set({ error: "A new 6-digit code has been sent to your email.", isLoading: false });
        resolve(result);
      });
    });
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
    },

    // Demo login — bypasses Cognito for hackathon judges
    demoLogin: (role) => {
      const demoUsers = {
        student: { id: "demo-s1", full_name: "Aditi Sharma", email: "aditi@demo.com", role: "student" },
        teacher: { id: "demo-t1", full_name: "Mrs. Sharma", email: "sharma@demo.com", role: "teacher" },
        parent:  { id: "demo-p1", full_name: "Priya Sharma", email: "priya@demo.com", role: "parent" },
      };
      const user = demoUsers[role];
      localStorage.setItem("lexilearn_token", "demo-token-" + role);
      localStorage.setItem("lexilearn_user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return user;
    },
}));

export const useAccessibilityStore = create((set) => ({
  fontSize: 18,
  highContrast: false,
  readingPace: 1,
  audioEnabled: true,
  dyslexicFont: false,

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
  toggleDyslexicFont: () =>
    set((state) => {
      const next = !state.dyslexicFont;
      document.documentElement.setAttribute("data-font", next ? "dyslexic" : "");
      return { dyslexicFont: next };
    }),
}));
