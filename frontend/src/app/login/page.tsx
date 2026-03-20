"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", backgroundColor: "#0F172A", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-node { 0%,100% { opacity: 0.2; } 50% { opacity: 0.5; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease both; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #1E293B inset !important; -webkit-text-fill-color: #F1F5F9 !important; caret-color: #F1F5F9; }
        .login-input { width: 100%; padding: 13px 16px; border-radius: 10px; background: #1E293B; border: 1px solid #334155; color: #F1F5F9; font-size: 14px; font-family: Inter, sans-serif; outline: none; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; }
        .login-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .login-input::placeholder { color: #475569; }
        .node { animation: pulse-node 6s ease-in-out infinite; }
      `}</style>

      {/* ── Left Panel: Branding ── */}
      <section style={{
        display: "none",
        width: "50%",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "52px 56px",
        position: "relative",
        overflow: "hidden",
        background: "#020617",
        borderRight: "1px solid #1E293B",
        ...(typeof window !== "undefined" && window.innerWidth >= 1024 ? { display: "flex" } : {}),
      }}
        className="left-panel"
      >
        <style>{`.left-panel { display: none; } @media (min-width: 1024px) { .left-panel { display: flex !important; } }`}</style>

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(#1E3A5F 0.8px, transparent 0.8px)",
          backgroundSize: "28px 28px",
          opacity: 0.35,
        }} />

        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "8%", left: "15%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Animated nodes */}
        <div className="node" style={{ position: "absolute", top: "28%", left: "30%", width: 7, height: 7, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 12px #3B82F6" }} />
        <div className="node" style={{ position: "absolute", top: "65%", left: "55%", width: 10, height: 10, borderRadius: "50%", background: "#818CF8", boxShadow: "0 0 12px #818CF8", animationDelay: "1.5s" }} />
        <div className="node" style={{ position: "absolute", top: "45%", right: "25%", width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 10px #3B82F6", animationDelay: "3s" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.02em", fontFamily: "Roboto Mono, monospace" }}>PgProvision</span>
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 46, fontWeight: 900, color: "#F1F5F9", lineHeight: 1.12, marginBottom: 20, letterSpacing: "-0.03em" }}>
            Instant PostgreSQL<br />
            for <span style={{ color: "#3B82F6" }}>every project.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#64748B", lineHeight: 1.7, maxWidth: 380, marginBottom: 48 }}>
            Deploy managed databases in seconds with full isolation and developer-first workflows.
          </p>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              { title: "Lightning Fast", desc: "Sub-second provisioning in 12 global regions." },
              { title: "Fully Isolated", desc: "Dedicated resources with built-in encryption." },
              { title: "One-Click Lifecycle", desc: "Snapshot, fork, and scale with ease." },
            ].map(({ title, desc }) => (
              <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <svg width="15" height="15" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 3 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ position: "relative", zIndex: 1, fontSize: 11, color: "#1E3A5F", fontFamily: "Roboto Mono, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          © {new Date().getFullYear()} PgProvision Systems Inc.
        </p>
      </section>

      {/* ── Right Panel: Login Form ── */}
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "#0F172A" }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }} className="mobile-logo">
            <style>{`.mobile-logo { } @media (min-width: 1024px) { .mobile-logo { display: none !important; } }`}</style>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9", fontFamily: "Roboto Mono, monospace" }}>PgProvision</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.03em", marginBottom: 8 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: "#64748B" }}>Enter your credentials to manage your clusters.</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 8 }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="name@company.com"
                className="login-input"
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>
                  Password
                </label>
                <span style={{ fontSize: 13, color: "#3B82F6", cursor: "default" }}>Forgot password?</span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="login-input"
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 4, display: "flex", alignItems: "center" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                >
                  {showPassword ? (
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /><circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="remember-me"
                type="checkbox"
                style={{ width: 16, height: 16, accentColor: "#3B82F6", cursor: "pointer" }}
              />
              <label htmlFor="remember-me" style={{ fontSize: 13, color: "#64748B", cursor: "pointer" }}>
                Remember this device
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 10, border: "none",
                background: "#3B82F6", color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)", opacity: loading ? 0.7 : 1,
                transition: "all 0.2s", fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(59,130,246,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#3B82F6"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,130,246,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading
                ? <div style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : "Sign In"
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#1E293B" }} />
            <span style={{ fontSize: 11, color: "#334155", fontWeight: 600, letterSpacing: "0.06em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#1E293B" }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: 14, color: "#475569" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "#3B82F6", fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Create an account
            </Link>
          </p>

          {/* Trust badges */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 36 }}>
            {["🔒 Encrypted", "🐳 Isolated", "⚡ Instant"].map((label) => (
              <span key={label} style={{ fontSize: 11, color: "#334155", fontWeight: 500 }}>{label}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
