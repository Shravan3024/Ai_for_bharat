import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuthStore, useAccessibilityStore } from "../stores/authStore";
import {
  BookOpen,
  LogIn,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Type,
  Volume2,
  VolumeX,
  Bot,
  User,
} from "lucide-react";

const ROLE_BADGE = {
  student: { label: "Student", cls: "bg-primary/10 text-primary" },
  teacher: { label: "Teacher", cls: "bg-secondary/10 text-secondary" },
  parent: { label: "Parent", cls: "bg-success/10 text-success" },
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    audioEnabled,
    toggleAudio,
    dyslexicFont,
    toggleDyslexicFont,
  } = useAccessibilityStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToFeatures = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      // wait for the landing page to mount, then scroll
      setTimeout(() => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardPath =
    user?.role === "teacher"
      ? "/teacher"
      : user?.role === "parent"
      ? "/parent"
      : "/student";

  const badge = user?.role ? ROLE_BADGE[user.role] : null;

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={isAuthenticated ? dashboardPath : "/"}
            className="nav-link flex items-center gap-2 text-primary font-bold text-xl"
          >
            <img
              src="/logo.png"
              alt="LexiLearn Logo"
              className="w-10 h-10 object-contain"
            />
            <span>LexiLearn</span>
          </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          {/* Accessibility Toolbar Toggle */}
          <button
            onClick={() => setA11yOpen(!a11yOpen)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
            aria-label="Accessibility settings"
          >
            <Type className="w-4 h-4" />
            Aa
          </button>

          {isAuthenticated ? (
            <>
                <Link
                  to={dashboardPath}
                  className="nav-link px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
              {user?.role === "student" && (
                <Link
                  to="/chat"
                  className="nav-link flex items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
                >
                  <Bot className="w-4 h-4" />
                  LexiBot
                </Link>
              )}
              <Link
                  to="/settings"
                  className="nav-link px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
                >
                Settings
              </Link>
              {/* User info + role badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-dim border border-border">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <span className="text-sm font-medium text-text">
                  {user?.full_name?.split(" ")[0] || user?.email?.split("@")[0]}
                </span>
                {badge && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
                  <a
                    href="#features"
                    onClick={scrollToFeatures}
                    className="nav-link px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium cursor-pointer"
                  >
                    Features
                  </a>
                <Link
                  to="/login"
                  className="nav-link flex items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/login"
                  className="nav-link px-5 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors text-sm font-semibold"
                >
                  Get Started
                </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-cream"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Accessibility Toolbar Dropdown */}
      {a11yOpen && (
        <div className="border-t border-border bg-cream/50 px-6 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-6 text-sm">
            {/* Font Size */}
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-text-secondary" />
              <span className="text-text-secondary font-medium">Size:</span>
              <button
                onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center hover:bg-primary/10 transition-colors font-bold"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <span className="w-8 text-center font-medium">{fontSize}</span>
              <button
                onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center hover:bg-primary/10 transition-colors font-bold"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Contrast */}
            <button
              onClick={toggleHighContrast}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                highContrast
                  ? "bg-text text-surface border-text"
                  : "bg-surface border-border hover:bg-primary/10"
              }`}
            >
              {highContrast ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
              {highContrast ? "High Contrast" : "Normal"}
            </button>

            {/* Audio */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                audioEnabled
                  ? "bg-success/10 border-success/30 text-success"
                  : "bg-surface border-border text-text-secondary"
              }`}
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              Audio {audioEnabled ? "On" : "Off"}
            </button>

            {/* OpenDyslexic */}
            <button
              onClick={toggleDyslexicFont}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                dyslexicFont
                  ? "bg-secondary/10 border-secondary/30 text-secondary"
                  : "bg-surface border-border text-text-secondary"
              }`}
              title="Toggle OpenDyslexic font"
            >
              <Type className="w-4 h-4" />
              {dyslexicFont ? "OpenDyslexic" : "Default Font"}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-6 py-4 space-y-3">
          {isAuthenticated ? (
            <>
              {user && (
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{user?.full_name?.split(" ")[0]}</p>
                    {badge && <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>}
                  </div>
                </div>
              )}
              <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="nav-link block px-3 py-2 rounded-lg hover:bg-cream transition-colors font-medium"
                >
                  Dashboard
                </Link>
                {user?.role === "student" && (
                  <Link
                    to="/chat"
                    onClick={() => setMobileOpen(false)}
                    className="nav-link flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cream transition-colors font-medium"
                  >
                    <Bot className="w-4 h-4" />
                    LexiBot
                  </Link>
                )}
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="nav-link block px-3 py-2 rounded-lg hover:bg-cream transition-colors font-medium"
                >
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-error hover:bg-error/10 transition-colors font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="nav-link block px-3 py-2 rounded-lg hover:bg-cream transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="nav-link block px-4 py-2 rounded-full bg-primary text-white text-center font-semibold"
                >
                  Get Started
                </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
