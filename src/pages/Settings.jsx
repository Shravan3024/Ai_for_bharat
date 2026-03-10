import { useAuthStore, useAccessibilityStore } from "../stores/authStore";
import Navbar from "../components/Navbar";
import {
  Type,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Gauge,
  User,
  Mail,
  GraduationCap,
  Shield,
  BookOpen,
} from "lucide-react";

export default function Settings() {
  const { user } = useAuthStore();
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    readingPace,
    setReadingPace,
    audioEnabled,
    toggleAudio,
    dyslexicFont,
    toggleDyslexicFont,
  } = useAccessibilityStore();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-text mb-2">Settings</h1>
        <p className="text-text-secondary mb-8">
          Customize your LexiLearn experience
        </p>

        {/* Profile Section */}
        <section className="bg-surface rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-lg font-semibold text-text">
                  {user?.full_name || user?.email?.split("@")[0] || "Guest"}
                </p>
                <p className="text-sm text-text-secondary flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email || "Not signed in"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                icon={Shield}
                label="Role"
                value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A"}
              />
              <InfoItem
                icon={GraduationCap}
                label="School"
                value={user?.school || "N/A"}
              />
            </div>
          </div>
        </section>

        {/* Accessibility Section */}
        <section className="bg-surface rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Accessibility
          </h2>

          <div className="space-y-6">
            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Font Size: {fontSize}px
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="w-10 h-10 rounded-xl bg-surface-dim border border-border flex items-center justify-center hover:bg-primary/10 transition-colors font-bold text-text"
                >
                  A-
                </button>
                <input
                  type="range"
                  min={14}
                  max={28}
                  step={2}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <button
                  onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                  className="w-10 h-10 rounded-xl bg-surface-dim border border-border flex items-center justify-center hover:bg-primary/10 transition-colors font-bold text-text"
                >
                  A+
                </button>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Adjustable from 14px to 28px. Default is 18px.
              </p>
            </div>

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text">High Contrast Mode</p>
                <p className="text-sm text-text-muted">
                  Increases contrast for better readability
                </p>
              </div>
              <button
                onClick={toggleHighContrast}
                className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                  highContrast ? "bg-primary" : "bg-border"
                }`}
                role="switch"
                aria-checked={highContrast}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    highContrast ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

              {/* Audio */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text">Audio (Text-to-Speech)</p>
                  <p className="text-sm text-text-muted">
                    Enable listen mode for reading texts aloud
                  </p>
                </div>
                <button
                  onClick={toggleAudio}
                  className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                    audioEnabled ? "bg-success" : "bg-border"
                  }`}
                  role="switch"
                  aria-checked={audioEnabled}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      audioEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* OpenDyslexic Font */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    OpenDyslexic Font
                  </p>
                  <p className="text-sm text-text-muted">
                    Switches all text to the OpenDyslexic typeface, designed to reduce reading errors
                  </p>
                </div>
                <button
                  onClick={toggleDyslexicFont}
                  className={`relative w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                    dyslexicFont ? "bg-secondary" : "bg-border"
                  }`}
                  role="switch"
                  aria-checked={dyslexicFont}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      dyslexicFont ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

            {/* Reading Pace */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Reading Pace:{" "}
                {readingPace <= 0.5
                  ? "Very Slow"
                  : readingPace <= 0.7
                  ? "Slow"
                  : readingPace <= 1
                  ? "Normal"
                  : "Fast"}
              </label>
              <div className="flex items-center gap-3">
                <Gauge className="w-5 h-5 text-text-muted" />
                <input
                  type="range"
                  min={0.3}
                  max={1.5}
                  step={0.1}
                  value={readingPace}
                  onChange={(e) => setReadingPace(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">
                Controls the speed of text-to-speech playback
              </p>
            </div>
          </div>
        </section>

        {/* Preview */}
        <section className="bg-surface rounded-2xl shadow-card p-6">
          <h2 className="text-xl font-semibold text-text mb-4">Preview</h2>
          <div className="bg-cream rounded-xl p-5">
            <p className="reading-text" style={{ fontSize: `${fontSize}px` }}>
              Water moves around in a circle. The sun makes water warm. Warm
              water goes up into the sky as gas. The gas makes clouds. Clouds
              drop rain and snow. Rain goes back to the lakes.
            </p>
          </div>
          <p className="text-xs text-text-muted mt-3">
            This preview uses your current font size and accessibility settings.
          </p>
        </section>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-dim">
      <Icon className="w-4 h-4 text-text-muted" />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text">{value}</p>
      </div>
    </div>
  );
}
