import { Link, useNavigate } from "react-router-dom";
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
  Gauge,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    audioEnabled,
    toggleAudio,
  } = useAccessibilityStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={isAuthenticated ? dashboardPath : "/"}
          className="flex items-center gap-2 text-primary font-bold text-xl"
        >
          <img
            src="/transparent bg logo (2).png"
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
                  className="px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
                >
                  Settings
                </Link>
                  <span className="text-sm text-text-secondary">
                    Hi, {user?.full_name?.split(" ")[0]}
                  </span>
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
              <Link
                to="/#features"
                className="px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
              >
                Features
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-text-secondary hover:bg-cream transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors text-sm font-semibold"
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
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-6 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-cream transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-cream transition-colors font-medium"
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
                className="block px-3 py-2 rounded-lg hover:bg-cream transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2 rounded-full bg-primary text-white text-center font-semibold"
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
