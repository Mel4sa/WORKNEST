import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import CreateProject from "./pages/CreateProject";
import ProjectDetail from "./pages/ProjectDetail"; 
import Invites from "./pages/Invites";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";
import AIAnalyzer from "./pages/AIAnalyzer";
import ResetPassword from "./pages/ResetPassword";
import useAuthStore from "./store/useAuthStore";

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function PublicRoute() {
  const token = useAuthStore((state) => state.token);
  if (token) {
    return <Navigate to="/profile" replace />;
  }
  return <Outlet />;
}

function AppRoutes() {
  const location = useLocation();

  const hideNavbarPaths = ["/login", "/signin"];
  const shouldHideNavbar =
    hideNavbarPaths.includes(location.pathname.toLowerCase()) ||
    location.pathname.toLowerCase().startsWith("/reset-password");

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Korunan sayfalar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/create" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectDetail />} /> 
          <Route path="/invites" element={<Invites />} />
          <Route path="/ai-analyzer" element={<AIAnalyzer />} />
        </Route>

        {/* Public sayfalar */}
        <Route element={<PublicRoute />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Şifre sıfırlama route’u */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Geliştirme aşamasında localStorage temizle (bir kere)
    const hasCleared = localStorage.getItem("dev_cleared");
    if (!hasCleared) {
      localStorage.clear();
      localStorage.setItem("dev_cleared", "true");
      console.log("Development: localStorage cleared");
    }
    
    initialize();
  }, [initialize]);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;