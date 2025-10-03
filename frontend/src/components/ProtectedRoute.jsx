import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // Eğer giriş yapılmamışsa login sayfasına yönlendir
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Giriş yapılmışsa içeriği göster
  return <Outlet />;
}