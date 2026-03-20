"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { databaseApi } from "@/lib/api";
import {
  Database,
  ArrowLeft,
  HardDrive,
  Users,
  Activity,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Terminal,
  Shield,
  Globe,
  Hash,
  Key,
  User,
  Link as LinkIcon,
  LayoutGrid,
  Table2,
  ChevronRight,
  KeySquare,
  AlertCircle,
} from "lucide-react";

const C = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceDeep: "#0A1120",
  surfaceHover: "#253347",
  border: "#334155",
  borderHover: "#475569",
  text: "#F1F5F9",
  textSub: "#94A3B8",
  textMuted: "#64748B",
  accent: "#3B82F6",
  green: "#22C55E",
  amber: "#F59E0B",
  red: "#EF4444",
  cyan: "#06B6D4",
  purple: "#818CF8",
};

interface DatabaseDetail {
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
}

interface Metrics {
  database_size: string;
  active_connections: number;
  container_status: string;
  container_running: boolean;
  started_at: string;
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default_value: string | null;
  is_primary: boolean;
}

interface IndexInfo {
  name: string;
  definition: string;
}

interface TableSchema {
  name: string;
  row_count: number;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
}

interface DatabaseSchema {
  tables: TableSchema[];
}

export default function DatabaseDetailPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [db, setDb] = useState<DatabaseDetail | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<"overview" | "schema">("overview");
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const fetchDb = useCallback(async () => {
    if (!token) return;
    try {
      const res = await databaseApi.get(token, id);
      setDb(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  }, [token, id]);

  const fetchMetrics = useCallback(async () => {
    if (!token) return;
    setMetricsLoading(true);
    try {
      const res = await databaseApi.metrics(token, id);
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMetricsLoading(false);
    }
  }, [token, id]);

  const fetchSchema = useCallback(async () => {
    if (!token) return;
    setSchemaLoading(true);
    setSchemaError("");
    try {
      const res = await databaseApi.schema(token, id);
      setSchema(res.data);
      if (res.data.tables.length > 0) setExpandedTable(res.data.tables[0].name);
    } catch (err: any) {
      setSchemaError(err.message || "Failed to load schema");
    } finally {
      setSchemaLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    if (!isLoading && !token) { router.replace("/login"); return; }
    if (token) { fetchDb(); fetchMetrics(); }
  }, [token, isLoading, router, fetchDb, fetchMetrics]);

  // Load schema when tab changes to schema for the first time
  useEffect(() => {
    if (tab === "schema" && !schema && !schemaLoading) fetchSchema();
  }, [tab, schema, schemaLoading, fetchSchema]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    if (!token || !confirm("Delete this database? This action is irreversible.")) return;
    setDeleting(true);
    try {
      await databaseApi.delete(token, id);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  const envStyle = (env: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      dev:     { bg: "rgba(59,130,246,0.12)", color: "#60A5FA" },
      staging: { bg: "rgba(245,158,11,0.12)", color: "#FCD34D" },
      test:    { bg: "rgba(6,182,212,0.12)",  color: "#67E8F9" },
    };
    return map[env] || map.dev;
  };

  if (isLoading || pageLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!db) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <Database size={40} color={C.textMuted} style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Database Not Found</h2>
          <button onClick={() => router.push("/dashboard")} style={{ color: C.accent, fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const ev = envStyle(db.environment);
  const connectionFields = [
    { label: "Connection String", value: db.connection_string, key: "conn", Icon: LinkIcon, mono: true },
    { label: "Host", value: db.connection_string.split("@")[1]?.split("/")[0] || `localhost:${db.port}`, key: "host", Icon: Globe, mono: false },
    { label: "Database", value: db.name, key: "dbname", Icon: Database, mono: false },
    { label: "Username", value: db.username, key: "user", Icon: User, mono: false },
    { label: "Password", value: db.password, key: "pass", Icon: Key, mono: true },
    { label: "Port", value: String(db.port), key: "port", Icon: Hash, mono: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, sans-serif", color: C.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
        .conn-row:hover { background: ${C.surfaceHover} !important; }
        .conn-row:hover .copy-btn { opacity: 1 !important; }
        .tab-btn { cursor: pointer; transition: all 0.2s; }
        .col-row:nth-child(even) { background: rgba(255,255,255,0.015); }
      `}</style>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,23,42,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => router.push("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 8, color: C.textSub, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => { fetchDb(); fetchMetrics(); if (tab === "schema") fetchSchema(); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.textSub, cursor: "pointer", fontSize: 13, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={handleDelete} disabled={deleting}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: C.red, cursor: deleting ? "not-allowed" : "pointer", fontSize: 13, opacity: deleting ? 0.5 : 1, transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}>
              {deleting ? <div style={{ width: 14, height: 14, border: `2px solid ${C.red}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Trash2 size={14} />}
              Delete
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "36px 24px" }}>

        {/* Hero card */}
        <div className="fade-up" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "26px 28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Database size={24} color={C.accent} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em" }}>{db.name}</h1>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: ev.bg, color: ev.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{db.environment}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: C.textMuted }}>
                  <span>Project: <span style={{ color: C.textSub }}>{db.project_name}</span></span>
                  <span>Created: <span style={{ color: C.textSub }}>{new Date(db.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: db.container_running ? C.green : C.amber, boxShadow: db.container_running ? `0 0 8px ${C.green}` : "none" }} />
              <span style={{ fontSize: 13, color: C.textSub, textTransform: "capitalize" }}>{db.container_status}</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 5, width: "fit-content" }}>
          {([
            { key: "overview", label: "Overview", Icon: LayoutGrid },
            { key: "schema",   label: "Schema",   Icon: Table2 },
          ] as const).map(({ key, label, Icon }) => (
            <button
              key={key}
              className="tab-btn"
              onClick={() => setTab(key)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 18px", borderRadius: 8, border: "none",
                fontSize: 13, fontWeight: 600,
                background: tab === key ? C.accent : "transparent",
                color: tab === key ? "#fff" : C.textMuted,
                boxShadow: tab === key ? "0 2px 10px rgba(59,130,246,0.3)" : "none",
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <>
            {/* Connection details */}
            <div className="fade-up" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Terminal size={14} color={C.accent} />
                <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: C.textSub }}>Connection Details</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {connectionFields.map(({ label, value, key, Icon, mono }) => (
                  <div key={key} className="conn-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: C.surfaceDeep, border: `1px solid ${C.border}`, transition: "background 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={13} color={C.textMuted} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 3 }}>{label}</span>
                        <p style={{ fontSize: 13, wordBreak: "break-all", fontFamily: mono ? "Roboto Mono, monospace" : "Inter, sans-serif", color: mono ? C.cyan : C.text }}>{value}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(value, key)}
                      className="copy-btn"
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, background: "transparent", border: `1px solid ${C.border}`, color: copiedField === key ? C.green : C.textMuted, cursor: "pointer", fontSize: 11, marginLeft: 12, flexShrink: 0, opacity: 0, transition: "opacity 0.2s, color 0.2s" }}>
                      {copiedField === key ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="fade-up" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px", animationDelay: "80ms" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={14} color={C.accent} />
                  <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: C.textSub }}>Metrics</h2>
                </div>
                <button onClick={fetchMetrics} disabled={metricsLoading} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.accent)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
                  <RefreshCw size={12} style={{ animation: metricsLoading ? "spin 0.8s linear infinite" : "none" }} /> Refresh
                </button>
              </div>
              {metrics ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {[
                    { label: "Database Size", value: metrics.database_size, Icon: HardDrive, iconBg: "rgba(6,182,212,0.12)", iconColor: C.cyan },
                    { label: "Active Connections", value: String(metrics.active_connections), Icon: Users, iconBg: "rgba(59,130,246,0.12)", iconColor: C.accent },
                    { label: "Uptime Since", value: metrics.started_at ? new Date(metrics.started_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A", Icon: Clock, iconBg: "rgba(34,197,94,0.12)", iconColor: C.green },
                  ].map(({ label, value, Icon, iconBg, iconColor }) => (
                    <div key={label} style={{ padding: "18px", borderRadius: 12, background: C.surfaceDeep, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={14} color={iconColor} />
                        </div>
                        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>{label}</span>
                      </div>
                      <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: C.text }}>{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <Shield size={26} color={C.textMuted} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, color: C.textMuted }}>Unable to load metrics. Container may not be running.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Schema Tab ── */}
        {tab === "schema" && (
          <div className="fade-up">
            {schemaLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 56, borderRadius: 12, background: C.surface, border: `1px solid ${C.border}` }} />
                ))}
              </div>
            ) : schemaError ? (
              <div style={{ display: "flex", gap: 12, padding: "20px 24px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#FCA5A5", alignItems: "center" }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Could not load schema</p>
                  <p style={{ fontSize: 13, color: "#F87171" }}>{schemaError}</p>
                  <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Make sure the database container is running before viewing the schema.</p>
                </div>
              </div>
            ) : !schema || schema.tables.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
                <Table2 size={36} color={C.textMuted} style={{ marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>No tables found</h3>
                <p style={{ fontSize: 13, color: C.textMuted, maxWidth: 340, margin: "0 auto" }}>
                  This database has no user-created tables yet. Connect using the connection string and run CREATE TABLE to get started.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Summary bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: C.textSub }}>
                    <span style={{ fontWeight: 700, color: C.text }}>{schema.tables.length}</span> {schema.tables.length === 1 ? "table" : "tables"}
                  </span>
                  <span style={{ fontSize: 13, color: C.textSub }}>
                    <span style={{ fontWeight: 700, color: C.text }}>{schema.tables.reduce((a, t) => a + t.columns.length, 0)}</span> total columns
                  </span>
                </div>

                {/* Table cards */}
                {schema.tables.map((table) => {
                  const isOpen = expandedTable === table.name;
                  return (
                    <div key={table.name} style={{ background: C.surface, border: `1px solid ${isOpen ? C.accent : C.border}`, borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s" }}>
                      {/* Table header */}
                      <button
                        onClick={() => setExpandedTable(isOpen ? null : table.name)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Table2 size={16} color={C.purple} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2, fontFamily: "Roboto Mono, monospace" }}>{table.name}</h3>
                            <div style={{ display: "flex", gap: 14 }}>
                              <span style={{ fontSize: 11, color: C.textMuted }}>{table.columns.length} columns</span>
                              <span style={{ fontSize: 11, color: C.textMuted }}>~{table.row_count.toLocaleString()} rows</span>
                              {table.indexes.length > 0 && (
                                <span style={{ fontSize: 11, color: C.textMuted }}>{table.indexes.length} {table.indexes.length === 1 ? "index" : "indexes"}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} color={C.textMuted} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                      </button>

                      {/* Columns table */}
                      {isOpen && (
                        <div style={{ borderTop: `1px solid ${C.border}` }}>
                          {/* Column header */}
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 80px 1fr", gap: 0, padding: "10px 20px", background: C.surfaceDeep }}>
                            {["Column", "Type", "Nullable", "Primary", "Default"].map((h) => (
                              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                            ))}
                          </div>
                          {/* Rows */}
                          {table.columns.map((col) => (
                            <div key={col.name} className="col-row" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 80px 80px 1fr", gap: 0, padding: "11px 20px", borderTop: `1px solid rgba(51,65,85,0.4)`, alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                {col.is_primary && <KeySquare size={12} color={C.amber} />}
                                <span style={{ fontSize: 13, fontFamily: "Roboto Mono, monospace", color: col.is_primary ? C.amber : C.text, fontWeight: col.is_primary ? 600 : 400 }}>{col.name}</span>
                              </div>
                              <span style={{ fontSize: 12, fontFamily: "Roboto Mono, monospace", color: C.cyan }}>{col.type}</span>
                              <span style={{ fontSize: 12, color: col.nullable ? C.textMuted : "#34D399" }}>{col.nullable ? "yes" : "no"}</span>
                              <span style={{ fontSize: 12, color: col.is_primary ? C.amber : C.textMuted }}>{col.is_primary ? "yes" : "—"}</span>
                              <span style={{ fontSize: 11, fontFamily: "Roboto Mono, monospace", color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.default_value || "—"}</span>
                            </div>
                          ))}

                          {/* Indexes section */}
                          {table.indexes.length > 0 && (
                            <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 20px 16px", background: C.surfaceDeep }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                                <Key size={12} color={C.textMuted} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Indexes</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {table.indexes.map((idx) => (
                                  <div key={idx.name} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <span style={{ fontSize: 12, fontFamily: "Roboto Mono, monospace", color: C.purple, flexShrink: 0, minWidth: 160 }}>{idx.name}</span>
                                    <span style={{ fontSize: 11, fontFamily: "Roboto Mono, monospace", color: C.textMuted, lineHeight: 1.5, wordBreak: "break-all" }}>{idx.definition}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
