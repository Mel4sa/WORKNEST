import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api/",
  withCredentials: true,
});

// Her request öncesi token ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    console.log("🔄 Axios interceptor - Token:", token ? "Var" : "Yok");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header eklendi");
    }
    console.log("📤 Request URL:", config.url);
    console.log("📤 Request method:", config.method);
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
