import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem("token", token);
        set({ token });
      },

      fetchUser: async () => {
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            set({ isLoading: false });
            return;
          }

          const res = await axiosInstance.get("/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: res.data, isLoading: false });
          return res.data;
        } catch (error) {
          console.error("Fetch user error:", error.response?.data || error.message);
          set({ user: null, token: null, isLoading: false });
          localStorage.removeItem("token");
        }
      },

      login: async (email, password) => {
        try {
          const response = await axiosInstance.post("auth/login", { email, password });

          const { user, token } = response.data;

          set({
            user,
            token,
            isLoading: false,
            error: null,
          });

          localStorage.setItem("token", token);
          return true;
        } catch (err) {
          console.error(err.response?.data || err.message);
          set({
            user: null,
            token: null,
            error: err.response?.data?.message || "Giriş başarısız!",
          });
          localStorage.removeItem("token");
          return false;
        }
      },

      register: async (fullname, email, password) => {
        try {
          await axiosInstance.post("auth/register", { fullname, email, password });
          set({ error: null });
          return true;
        } catch (err) {
          console.error(err.response?.data || err.message);
          set({
            error: err.response?.data?.message || "Kayıt başarısız!",
          });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isLoading: false });
      },

      initialize: async () => {
        const token = get().token || localStorage.getItem("token");
        if (token) {
          try {
            // Token'ı set et ve kullanıcıyı fetch et
            set({ token });
            await get().fetchUser();
          } catch {
            // Token geçersizse logout yap
            console.log("Token geçersiz, logout yapılıyor...");
            get().logout();
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;