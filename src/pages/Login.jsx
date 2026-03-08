import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  BookOpen,
  GraduationCap,
  Users,
  Heart,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const roles = [
  {
    key: "student",
    label: "Student",
    icon: GraduationCap,
    color: "primary",
    bg: "bg-lavender",
    desc: "I want to read and learn",
    redirect: "/student",
  },
  {
    key: "teacher",
    label: "Teacher",
    icon: Users,
    color: "success",
    bg: "bg-mint",
    desc: "I manage student progress",
    redirect: "/teacher",
  },
  {
    key: "parent",
    label: "Parent",
    icon: Heart,
    color: "secondary",
    bg: "bg-peach",
    desc: "I track my child's growth",
    redirect: "/parent",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", code: "" });
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredRole, setRegisteredRole] = useState("");
  const [registeredName, setRegisteredName] = useState("");
  const [registeredPassword, setRegisteredPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please select your role first.");
      return;
    }

    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isRegister && !form.name) {
      setError("Please enter your name.");
      return;
    }

    try {
      const roleInfo = roles.find((r) => r.key === selectedRole);
      
      if (needsConfirmation) {
         await useAuthStore.getState().confirmRegistration(registeredEmail, form.code, registeredRole, registeredName);
         // Log in using the password saved during registration
         await login(registeredRole, registeredEmail, registeredPassword);
         navigate(roleInfo.redirect);
         return;
      }

      if (isRegister) {
        const result = await register(selectedRole, {
          full_name: form.name,
          email: form.email,
          password: form.password,
        });
        
        if (result && !result.userConfirmed) {
            setNeedsConfirmation(true);
            setRegisteredEmail(result.email);
            setRegisteredRole(result.role);
            setRegisteredName(result.name);
            setRegisteredPassword(form.password); // Store for auto-login after confirm
            setError(""); // clear errors
            return;
        }

        // If auto-confirmed somehow, just login
        await login(selectedRole, form.email, form.password);
      } else {
        await login(selectedRole, form.email, form.password);
      }
      navigate(roleInfo.redirect);
    } catch (err) {
      setError(err.message || "Action failed. Please try again.");
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-mint flex flex-col">
      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary font-bold text-2xl"
            >
              <img
                src="/transparent bg logo (2).png"
                alt="LexiLearn Logo"
                className="w-10 h-10 object-contain"
              />
              LexiLearn
            </Link>
            <h1 className="text-2xl font-bold text-text mt-4">
              {needsConfirmation ? "Verify Your Email" : (isRegister ? "Create Your Account" : "Welcome Back")}
            </h1>
            <p className="text-text-secondary mt-1">
              {needsConfirmation
                ? "We sent a code to your email."
                : (isRegister
                ? "Join the LexiLearn community"
                : "Choose your role and sign in")}
            </p>
          </div>

          {/* Role Selection (Hide if confirming) */}
          {!needsConfirmation && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => setSelectedRole(r.key)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedRole === r.key
                    ? `border-${r.color} ${r.bg} shadow-card`
                    : "border-border bg-surface hover:border-border-light hover:shadow-card"
                }`}
              >
                <r.icon
                  className={`w-6 h-6 mx-auto mb-2 ${
                    selectedRole === r.key
                      ? `text-${r.color}`
                      : "text-text-muted"
                  }`}
                />
                <p
                  className={`font-semibold text-sm ${
                    selectedRole === r.key ? "text-text" : "text-text-secondary"
                  }`}
                >
                  {r.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-surface rounded-2xl shadow-card p-6 space-y-4"
          >
            {error && (
              <div className="bg-error-light text-error px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {needsConfirmation ? (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors tracking-widest text-center text-lg"
                />
              </div>
            ) : (
             <>
                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-surface-dim text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading
                ? "Please wait..."
                : needsConfirmation 
                ? "Verify & Sign In"
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </button>

            {needsConfirmation && (
               <div className="text-center mt-2">
                 <button
                   type="button"
                   onClick={() => useAuthStore.getState().resendConfirmationCode(registeredEmail)}
                   className="text-sm text-primary font-medium hover:underline"
                   disabled={isLoading}
                 >
                   Didn't get the code? Resend it.
                 </button>
               </div>
            )}

            {!needsConfirmation && (
            <p className="text-center text-sm text-text-secondary">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-primary font-medium hover:underline"
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </p>
            )}
          </form>

          {/* Demo hint */}
          <p className="text-center text-xs text-text-muted mt-4">
            Demo: Use any email/password. Select a role and click Sign In.
          </p>
        </div>
      </div>
    </div>
  );
}
