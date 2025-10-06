import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  token: localStorage.getItem("token") || null,
  error: null,

  setUser: (user) => set({ user }),

  // ✅ Giriş
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      set({
        user,
        isLoggedIn: true,
        token,
        error: null,
      });

      return true;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      set({
        user: null,
        isLoggedIn: false,
        token: null,
        error: err.response?.data?.message || "Giriş başarısız!",
      });
      localStorage.removeItem("token");
      return false;
    }
  },

  // ✅ Sayfa yenilenince token'dan kullanıcıyı çek
  fetchUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axiosInstance.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        user: res.data.user,
        isLoggedIn: true,
        token,
        error: null,
      });
    } catch (err) {
      console.error("Fetch user error:", err.response?.data || err.message);
      localStorage.removeItem("token");
      set({ user: null, isLoggedIn: false, token: null });
    }
  },

  // ✅ Kayıt
  register: async (fullname, email, password) => {
    try {
      await axiosInstance.post("/auth/register", { fullname, email, password });
      set({ error: null });
      return true;
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      set({ error: err.response?.data?.message || "Kayıt başarısız!" });
      return false;
    }
  },

  // ✅ Çıkış
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isLoggedIn: false, token: null });
  },
}));

export default useAuthStore;
