"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { databaseApi, authApi } from "@/lib/api";
import {
  Database,
  Plus,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  LogOut,
  Clock,
  Activity,
  ChevronRight,
  Search,
  Layers,
  Terminal,
  AlertCircle,
  X,
  Users as UsersIcon,
  User,
  Shield,
  Mail,
  Lock,
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────
const C = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHover: "#253347",
  border: "#334155",
  borderHover: "#475569",
  text: "#F1F5F9",
  textSub: "#94A3B8",
  textMuted: "#64748B",
  accent: "#3B82F6",
  accentHover: "#2563EB",
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
  purple: "#818CF8",
  cyan: "#06B6D4",
};

interface DatabaseRecord {
  id: string;
  name: string;
  project_name: string;
  environment: string;
  port: number;
  username: string;
  password: string;
  created_at: string;
  container_status: string;
  container_running: boolean;
  connection_string: string;
  owner_email?: string;
}

interface UserRecord {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  
  const [tab, setTab] = useState<"databases" | "users">("databases");
  
  const [databases, setDatabases] = useState<DatabaseRecord[]>([]);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  
  const [showCreateDbModal, setShowCreateDbModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const fetchDatabases = useCallback(async () => {
    if (!token) return;
    try {
      const res = await databaseApi.list(token);
      setDatabases(res.data);
    } catch (err) {
      console.error("Failed to fetch databases:", err);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    if (!token || user?.role !== "admin") return;
    try {
      const res = await authApi.getUsers(token);
      setUsersList(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, [token, user?.role]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDatabases(), fetchUsers()]);
    setLoading(false);
  }, [fetchDatabases, fetchUsers]);

  useEffect(() => {
    if (!isLoading && !token) { router.replace("/login"); return; }
    if (token) loadAllData();
  }, [token, isLoading, router, loadAllData]);

  const handleDeleteDb = async (id: string) => {
    if (!token || !confirm("Delete this database? This is irreversible.")) return;
    setDeleting(id);
    try {
      await databaseApi.delete(token, id);
      setDatabases(databases.filter((db) => db.id !== id));
    } catch (err: any) { alert(err.message); }
    finally { setDeleting(null); }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDatabases = databases.filter(
    (db) =>
      db.name.toLowerCase().includes(search.toLowerCase()) ||
      db.project_name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = usersList.filter(
    (u) => u.email.toLowerCase().includes(search.toLowerCase())
  );

  const runningCount = databases.filter((db) => db.container_running).length;
  const stoppedCount = databases.length - runningCount;

  const envStyle = (env: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      dev:     { bg: "rgba(59,130,246,0.12)", color: "#60A5FA" },
      staging: { bg: "rgba(245,158,11,0.12)", color: "#FCD34D" },
      test:    { bg: "rgba(6,182,212,0.12)",  color: "#67E8F9" },
    };
    return map[env] || map.dev;
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif", color: C.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .db-card:hover { border-color: ${C.borderHover} !important; background: ${C.surfaceHover} !important; }
        .icon-btn:hover { opacity: 1 !important; }
        input::placeholder { color: ${C.textMuted}; }
        .tab-btn { padding: 8px 18px; border-radius: 8px; border: none; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(15,23,42,0.85)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59,130,246,0.15)", border: `1px solid rgba(59,130,246,0.25)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={18} color={C.accent} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", fontFamily: "Roboto Mono, monospace" }}>PgProvision</span>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}` }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: C.accent }}>
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: C.textSub }}>{user?.email}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: user?.role === "admin" ? "rgba(129,140,248,0.15)" : "rgba(59,130,246,0.15)", color: user?.role === "admin" ? C.purple : "#60A5FA", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              title="Sign out"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.textSub, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSub; }}
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>

        {/* Tabs or Title */}
        {user?.role === "admin" ? (
          <div className="fade-up" style={{ display: "flex", gap: 4, marginBottom: 28, background: C.surface, padding: 5, borderRadius: 12, width: "fit-content", border: `1px solid ${C.border}` }}>
            <button
              className="tab-btn"
              onClick={() => setTab("databases")}
              style={{ background: tab === "databases" ? C.accent : "transparent", color: tab === "databases" ? "#fff" : C.textMuted, boxShadow: tab === "databases" ? "0 2px 10px rgba(59,130,246,0.3)" : "none" }}
            >
              <Layers size={14} /> Databases
            </button>
            <button
              className="tab-btn"
              onClick={() => setTab("users")}
              style={{ background: tab === "users" ? C.accent : "transparent", color: tab === "users" ? "#fff" : C.textMuted, boxShadow: tab === "users" ? "0 2px 10px rgba(59,130,246,0.3)" : "none" }}
            >
              <UsersIcon size={14} /> Users Management
            </button>
          </div>
        ) : (
          <h1 className="fade-up" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 28 }}>
            Your Databases
          </h1>
        )}

        {tab === "databases" && (
          <>
            {/* ── Stats ── */}
            <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total", value: databases.length, Icon: Layers, iconBg: "rgba(59,130,246,0.12)", iconColor: C.accent },
                { label: "Running", value: runningCount, Icon: Activity, iconBg: "rgba(34,197,94,0.12)", iconColor: C.green },
                { label: "Stopped", value: stoppedCount, Icon: AlertCircle, iconBg: "rgba(245,158,11,0.12)", iconColor: C.amber },
                {
                  label: "Latest Created",
                  value: databases.length > 0 ? new Date(databases[databases.length - 1].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
                  Icon: Clock, iconBg: "rgba(6,182,212,0.12)", iconColor: C.cyan,
                },
              ].map(({ label, value, Icon, iconBg, iconColor }, i) => (
                <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px", transition: "border-color 0.2s", animationDelay: `${i * 60}ms` }} className="fade-up">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={iconColor} />
                    </div>
                    <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── Toolbar ── */}
            <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, animationDelay: "180ms" }}>
              <div style={{ position: "relative", flex: "0 0 280px" }}>
                <Search size={15} color={C.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type="text" placeholder="Search databases..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 2px rgba(59,130,246,0.15)`; }}
                  onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={fetchDatabases} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = C.textSub; e.currentTarget.style.borderColor = C.border; }}>
                  <RefreshCw size={14} /> Refresh
                </button>
                <button onClick={() => setShowCreateDbModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 14px rgba(59,130,246,0.3)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <Plus size={15} /> New Database
                </button>
              </div>
            </div>

            {/* ── Database Grid ── */}
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                {[1, 2, 3].map((i) => <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, height: 220 }} />)}
              </div>
            ) : filteredDatabases.length === 0 ? (
              <div className="fade-up" style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: C.surface, border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Database size={28} color={C.textMuted} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{databases.length === 0 ? "No databases yet" : "No results"}</h3>
                <p style={{ color: C.textSub, fontSize: 14, marginBottom: 24, maxWidth: 340, margin: "0 auto 24px" }}>
                  {databases.length === 0 ? "Create your first isolated PostgreSQL database to get started." : "Try adjusting your search."}
                </p>
                {databases.length === 0 && (
                  <button onClick={() => setShowCreateDbModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                    <Plus size={16} /> Create Database
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
                {filteredDatabases.map((db, index) => {
                  const ev = envStyle(db.environment);
                  return (
                    <div key={db.id} className="db-card fade-up" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px 18px", cursor: "pointer", transition: "all 0.2s", animationDelay: `${200 + index * 50}ms`, display: "flex", flexDirection: "column", gap: 0 }} onClick={() => router.push(`/dashboard/${db.id}`)}>
                      {/* Card header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Database size={20} color={C.accent} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{db.name}</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <p style={{ fontSize: 12, color: C.textMuted }}>{db.project_name}</p>
                              {user?.role === "admin" && db.owner_email && (
                                <>
                                  <span style={{ fontSize: 10, color: C.border }}>|</span>
                                  <span style={{ fontSize: 11, color: C.textSub, display: "flex", alignItems: "center", gap: 3 }}>
                                    <User size={10} /> {db.owner_email.split('@')[0]}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: ev.bg, color: ev.color, textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {db.environment}
                        </span>
                      </div>

                      {/* Connection string */}
                      <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, background: "#0A1120", border: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Terminal size={12} color={C.textMuted} />
                            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted, fontWeight: 600 }}>Connection String</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); copyToClipboard(db.connection_string, db.id); }} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: copiedId === db.id ? C.green : C.textMuted, background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 5, transition: "color 0.2s" }}>
                            {copiedId === db.id ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                          </button>
                        </div>
                        <code style={{ fontSize: 11, fontFamily: "Roboto Mono, monospace", color: C.cyan, lineHeight: 1.6, wordBreak: "break-all", display: "block" }}>
                          {db.connection_string}
                        </code>
                      </div>

                      {/* Footer */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: db.container_running ? C.green : C.amber, boxShadow: db.container_running ? `0 0 6px ${C.green}` : "none" }} />
                            <span style={{ fontSize: 12, color: C.textSub }}>{db.container_running ? "Running" : db.container_status}</span>
                          </div>
                          <span style={{ fontSize: 12, color: C.textMuted }}>Port {db.port}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => router.push(`/dashboard/${db.id}`)} title="View details" style={{ display: "flex", padding: 7, borderRadius: 8, border: "none", background: "transparent", color: C.textMuted, cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.color = C.accent; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; }}>
                            <ChevronRight size={16} />
                          </button>
                          <button onClick={() => handleDeleteDb(db.id)} disabled={deleting === db.id} title="Delete database" style={{ display: "flex", padding: 7, borderRadius: 8, border: "none", background: "transparent", color: C.textMuted, cursor: "pointer", transition: "all 0.2s", opacity: deleting === db.id ? 0.5 : 1 }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = C.red; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; }}>
                            {deleting === db.id ? <div style={{ width: 16, height: 16, border: `2px solid ${C.red}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "users" && user?.role === "admin" && (
          <div className="fade-up">
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12 }}>
              <div style={{ position: "relative", flex: "0 0 280px" }}>
                <Search size={15} color={C.textMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input type="text" placeholder="Search users by email..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 2px rgba(59,130,246,0.15)`; }}
                  onBlur={(e) => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={fetchUsers} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, color: C.textSub, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = C.textSub; e.currentTarget.style.borderColor = C.border; }}>
                  <RefreshCw size={14} /> Refresh
                </button>
                <button onClick={() => setShowCreateUserModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 10, border: "none", background: C.accent, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 14px rgba(59,130,246,0.3)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <Plus size={15} /> Add User
                </button>
              </div>
            </div>

            {/* Users List */}
            {loading ? (
              <div style={{ height: 300, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }} />
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14 }}>
                <UsersIcon size={40} color={C.textMuted} style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No users found</h3>
                <p style={{ color: C.textSub, fontSize: 13 }}>Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, background: "#0A1120" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>User</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Created</span>
                </div>
                {filteredUsers.map((u, i) => (
                  <div key={u.id} style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr", gap: 16, padding: "16px 20px", borderBottom: i === filteredUsers.length - 1 ? "none" : `1px solid ${C.border}`, alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13, border: `1px solid ${C.border}` }}>
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{u.email}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "Roboto Mono, monospace" }}>{u.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                        background: u.role === "admin" ? "rgba(129,140,248,0.12)" : "rgba(59,130,246,0.12)",
                        color: u.role === "admin" ? C.purple : "#60A5FA",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {u.role === "admin" ? <Shield size={10} /> : <User size={10} />}
                        {u.role}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>
                      {new Date(u.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modals */}
      {showCreateDbModal && (
        <CreateDatabaseModal
          token={token!}
          onClose={() => setShowCreateDbModal(false)}
          onCreated={() => { setShowCreateDbModal(false); fetchDatabases(); }}
        />
      )}

      {showCreateUserModal && (
        <CreateUserModal
          token={token!}
          onClose={() => setShowCreateUserModal(false)}
          onCreated={() => { setShowCreateUserModal(false); if (fetchUsers) fetchUsers(); }}
        />
      )}
    </div>
  );
}

// ── Create Database Modal ───────────────────────────────
function CreateDatabaseModal({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [projectName, setProjectName] = useState("");
  const [environment, setEnvironment] = useState("dev");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!projectName.trim()) { setError("Project name is required"); return; }
    setLoading(true);
    try {
      await databaseApi.create(token, projectName.trim(), environment);
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const previewName = projectName ? `${projectName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${environment}` : "";

  const envOptions = [
    { value: "dev", label: "Development", color: "#60A5FA", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
    { value: "staging", label: "Staging", color: "#FCD34D", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
    { value: "test", label: "Testing", color: "#67E8F9", bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="fade-up" style={{
        position: "relative", background: "#1E293B", borderRadius: 18, border: "1px solid #334155",
        padding: 32, width: "100%", maxWidth: 480,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        fontFamily: "Inter, sans-serif", animationDuration: "0.2s"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={20} color="#3B82F6" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>New Database</h2>
              <p style={{ fontSize: 12, color: "#64748B" }}>Provision an isolated PostgreSQL instance</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#64748B", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#F1F5F9"; e.currentTarget.style.background = "#253347"; }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Project name */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Project Name</label>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} required placeholder="e.g. auth-service"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "#0F172A", border: "1px solid #334155", color: "#F1F5F9", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.borderColor = "#3B82F6"; e.target.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#334155"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Environment */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Environment</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {envOptions.map(({ value, label, color, bg, border }) => (
                <button key={value} type="button" onClick={() => setEnvironment(value)}
                  style={{ padding: "12px 0", borderRadius: 10, border: `1px solid ${environment === value ? border : "#334155"}`, background: environment === value ? bg : "transparent", color: environment === value ? color : "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewName && (
            <div style={{ padding: "12px 14px", borderRadius: 10, background: "#0F172A", border: "1px solid #334155" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Database size={12} color="#64748B" />
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748B", fontWeight: 600 }}>Database Name Preview</span>
              </div>
              <code style={{ fontSize: 13, fontFamily: "Roboto Mono, monospace", color: "#06B6D4" }}>{previewName}</code>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#253347"; e.currentTarget.style.color = "#F1F5F9"; }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", background: "#3B82F6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(59,130,246,0.3)", opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}>
              {loading ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <><Plus size={16} /> Create Database</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Create User Modal ──────────────────────────────────
function CreateUserModal({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("developer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || password.length < 8) { setError("Valid email and min 8 char password required"); return; }
    
    setLoading(true);
    try {
      await authApi.adminCreateUser(token, email.trim(), password, role);
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <div className="fade-up" style={{
        position: "relative", background: "#1E293B", borderRadius: 18, border: "1px solid #334155",
        padding: 32, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        fontFamily: "Inter, sans-serif", animationDuration: "0.2s"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={20} color="#818CF8" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>Provision User</h2>
              <p style={{ fontSize: 12, color: "#64748B" }}>Add a new team member</p>
            </div>
          </div>
          <button onClick={onClose} style={{ padding: 8, borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#64748B", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#F1F5F9"; e.currentTarget.style.background = "#253347"; }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 13 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              <Mail size={12} /> Email Address
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="user@company.com"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "#0F172A", border: "1px solid #334155", color: "#F1F5F9", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.borderColor = "#818CF8"; e.target.style.boxShadow = "0 0 0 2px rgba(129,140,248,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#334155"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              <Lock size={12} /> Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 8 characters"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, background: "#0F172A", border: "1px solid #334155", color: "#F1F5F9", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.borderColor = "#818CF8"; e.target.style.boxShadow = "0 0 0 2px rgba(129,140,248,0.15)"; }}
              onBlur={(e) => { e.target.style.borderColor = "#334155"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { value: "developer", label: "Developer", color: "#60A5FA", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
                { value: "admin", label: "Admin", color: "#818CF8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)" },
              ].map(({ value, label, color, bg, border }) => (
                <button key={value} type="button" onClick={() => setRole(value)}
                  style={{ padding: "12px 0", borderRadius: 10, border: `1px solid ${role === value ? border : "#334155"}`, background: role === value ? bg : "transparent", color: role === value ? color : "#64748B", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {value === "admin" ? <Shield size={14} /> : <User size={14} />} {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1px solid #334155", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#253347"; e.currentTarget.style.color = "#F1F5F9"; }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "none", background: "#818CF8", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(129,140,248,0.3)", opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}>
              {loading ? <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <><Plus size={16} /> Provision User</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
