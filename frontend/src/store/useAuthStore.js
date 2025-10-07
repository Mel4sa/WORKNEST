import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const res = await axiosInstance.get("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data, isLoading: false });
      return res.data; // User datasını return et
    } catch (error) {
      console.error("Fetch user error:", error.response?.data || error.message);
      set({ user: null, token: null, isLoading: false });
      localStorage.removeItem("token");
    }
  },

  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("auth/login", { email, password });

      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
        error: null,
      });

      // token'ı localStorage'a kaydet → sayfa yenilenince oturum bozulmasın
      localStorage.setItem("token", response.data.token);

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

      return true; // kayıt başarılı
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

  // Sayfa yüklendiğinde otomatik olarak user bilgisini getir
  initialize: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Token varsa user bilgisini getir
      await useAuthStore.getState().fetchUser();
    } else {
      // Token yoksa loading'i false yap
      set({ isLoading: false });
    }
  },
}));



export default useAuthStore;