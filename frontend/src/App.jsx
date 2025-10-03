import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Invites from "./pages/Invites";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";
import AIAnalyzer from "./pages/AIAnalyzer"; 
import useAuthStore from "./store/useAuthStore";

// Giriş yapılmamış kullanıcılar için koruma
function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// Giriş yapılmış kullanıcılar için public sayfaları engelleme
function PublicRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  if (isLoggedIn) {
    return <Navigate to="/profile" replace />;
  }
  return <Outlet />;
}

function AppRoutes() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signin"];

  return (
    <>
      {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Korunan sayfalar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/invites" element={<Invites />} />
          <Route path="/ai-analyzer" element={<AIAnalyzer />} />
        </Route>

        {/* Public sayfalar */}
        <Route element={<PublicRoute />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Bilinmeyen tüm yollar login sayfasına yönlendirilsin */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;