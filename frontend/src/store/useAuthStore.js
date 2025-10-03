import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  error: null,

  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("login", { email, password });

      // Backend'den user bilgisi veya token döndüğünü varsayalım
      set({
        user: response.data.user || null,
        isLoggedIn: true,
        error: null,
      });

      return true; // login başarılı
    } catch (err) {
      console.error(err.response?.data || err.message);
      set({
        user: null,
        isLoggedIn: false,
        error: err.response?.data?.message || "Giriş başarısız!",
      });
      return false; // login başarısız
    }
  },

  logout: () => {
    set({
      user: null,
      isLoggedIn: false,
      error: null,
    });
    // istersen burada backend logout endpoint de çağrılabilir
  },
}));

export default useAuthStore;