import { create } from "zustand";
import axiosInstance from "../lib/axios";

const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: false,
  token: null,
  error: null,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
  try {
    const response = await axiosInstance.post("auth/login", { email, password });

    set({
      user: response.data.user || { email },
      isLoggedIn: true,
      token: response.data.token, 
      error: null,
    });

    return true;
  } catch (err) {
    console.error(err.response?.data || err.message);
    set({
      user: null,
      isLoggedIn: false,
      token: null, 
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

 logout: async () => {
  try {
    await axiosInstance.post('/auth/logout'); 
    set({ 
      user: null,
      authUser: null,
      isLoggedIn: false,
      error: null,
    }); 
  } catch (error) {
    console.log('Logout error:', error);
    throw error;
  }
},
}));

export default useAuthStore;