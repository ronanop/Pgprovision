"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import {
  Database,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Lock,
  CheckCircle2,
  Shield,
  Zap,
  CircleDot,
} from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      await authApi.register(email, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(124, 58, 237, 0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(124, 58, 237, 0.1)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden" style={{ background: "#050810" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[25%] w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] left-[15%] w-[400px] h-[400px] rounded-full opacity-[0.025]" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: "rgba(124, 58, 237, 0.12)", border: "1px solid rgba(124, 58, 237, 0.2)" }}
          >
            <Database className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-[22px] font-bold text-white tracking-tight mb-1.5">Create your account</h1>
          <p className="text-sm" style={{ color: "#6b7a8d" }}>First user automatically becomes the platform admin.</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 animate-fade-up"
          style={{
            animationDelay: "100ms",
            background: "rgba(12, 16, 28, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 80px rgba(124, 58, 237, 0.03)",
          }}
        >
          {success && (
            <div
              className="mb-6 flex items-center gap-3 p-4 rounded-xl text-sm"
              style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.12)", color: "#34d399" }}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Account created! Redirecting to login...
            </div>
          )}

          {error && (
            <div
              className="mb-6 flex items-center gap-3 p-4 rounded-xl text-sm"
              style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.12)", color: "#fb7185" }}
            >
              <div className="w-2 h-2 rounded-full bg-rose flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] mb-2.5" style={{ color: "#5a6578" }}>
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white transition-all duration-200"
                style={inputStyle}
                placeholder="you@company.com"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] mb-2.5" style={{ color: "#5a6578" }}>
                <Lock className="w-3 h-3" />
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm text-white transition-all duration-200"
                  style={inputStyle}
                  placeholder="Min. 8 characters"
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#4a5568" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8896ab")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="reg-confirm" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] mb-2.5" style={{ color: "#5a6578" }}>
                <Lock className="w-3 h-3" />
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white transition-all duration-200"
                style={inputStyle}
                placeholder="Repeat your password"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
                boxShadow: loading ? "none" : "0 4px 15px rgba(124, 58, 237, 0.3), 0 0 40px rgba(124, 58, 237, 0.08)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 6px 25px rgba(124, 58, 237, 0.45), 0 0 60px rgba(124, 58, 237, 0.12)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(124, 58, 237, 0.3), 0 0 40px rgba(124, 58, 237, 0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
            <span className="text-[11px] font-medium" style={{ color: "#3d4a5c" }}>OR</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
          </div>

          <div className="text-center">
            <p className="text-sm" style={{ color: "#5a6578" }}>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold transition-colors"
                style={{ color: "#a78bfa" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c4b5fd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
          {[
            { icon: Shield, label: "Encrypted" },
            { icon: Database, label: "Isolated" },
            { icon: Zap, label: "Instant" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-1.5" style={{ color: "#3d4a5c" }}>
              <Icon className="w-3 h-3" />
              <span className="text-[11px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
