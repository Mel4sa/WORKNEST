import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../lib/axios";

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/auth/check");
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Yükleniyor...</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <Outlet />;
}