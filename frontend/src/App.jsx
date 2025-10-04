import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Invites from "./pages/Invites";
import SignIn from "./pages/SignIn";
import Login from "./pages/Login";
import AIAnalyzer from "./pages/AIAnalyzer";
import ResetPassword from "./pages/ResetPassword"; // ✅ EKLENDİ
import useAuthStore from "./store/useAuthStore";

function ProtectedRoute() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

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
  const shouldHideNavbar =
    hideNavbarPaths.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Korunan sayfalar */}
        <Route element={<ProtectedRoute />}>
  <Route path="/home" element={<Home />} /> {/* ← Home route eklendi */}
  <Route path="/profile" element={<Profile />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/invites" element={<Invites />} />
  <Route path="/ai-analyzer" element={<AIAnalyzer />} />
</Route>

        {/* Public sayfalar */}
        <Route element={<PublicRoute />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* ✅ BURAYA TAŞINDI */}
        </Route>

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