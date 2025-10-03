import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  error: null,

  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("auth/login", { email, password });

      set({
        user: response.data.user || { email }, // backend'den kullanıcı bilgisi gelirse kullan
        isLoggedIn: true,
        error: null,
      });

      return true;
    } catch (err) {
      console.error(err.response?.data || err.message);
      set({
        user: null,
        isLoggedIn: false,
        error: err.response?.data?.message || "Giriş başarısız!",
      });
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
    set({
      user: null,
      isLoggedIn: false,
      error: null,
    });
  },
}));

export default useAuthStore;