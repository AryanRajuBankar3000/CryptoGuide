"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Shield, Clock, Cpu, AlertCircle, CheckCircle, Download,
  ChevronDown, Layers, Fingerprint, Radio, Key, HardDrive, Lock,
  Hash, Shuffle, Settings, Factory,
} from "lucide-react";

const USE_CASES = [
  { id: "SecureBoot", label: "Secure Boot", icon: Shield },
  { id: "Integrity", label: "Integrity", icon: Hash },
  { id: "Communication", label: "V2X Comms", icon: Radio },
  { id: "KeyExchange", label: "Key Exchange", icon: Key },
  { id: "DataEncryption", label: "Data Encryption", icon: Lock },
  { id: "MAC_SecOC", label: "MAC / SecOC", icon: Fingerprint },
  { id: "Signatures", label: "Signatures", icon: Layers },
  { id: "RNG", label: "RNG", icon: Shuffle },
  { id: "KeyManagement", label: "Key Mgmt", icon: Settings },
  { id: "HSMProvisioning", label: "HSM Provision", icon: Factory },
];

const THREAT_OPTIONS = ["Low", "Medium", "High", "Critical"];
const LIFETIME_OPTIONS = [5, 10, 15, 20, 25];
const HARDWARE_OPTIONS = ["Unspecified", "Constrained", "Accelerated"];
const REGULATORY_OPTIONS = ["ISO 21434", "UNECE R155", "UNECE R156", "NIST FIPS 140-2", "ENISA"];

export default function RecommendPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const messagesEndRef = useRef(null);

  const [filters, setFilters] = useState({
    useCases: [],
    lifetime: null,
    threat: null,
    pqc: false,
    hardware: "Unspecified",
    regulatory: [],
  });

  const toggleUseCase = (id) => {
    setFilters((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(id)
        ? prev.useCases.filter((u) => u !== id)
        : [...prev.useCases, id],
    }));
  };

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const toggleRegulatory = (reg) => {
    setFilters((prev) => ({
      ...prev,
      regulatory: prev.regulatory.includes(reg)
        ? prev.regulatory.filter((r) => r !== reg)
        : [...prev.regulatory, reg],
    }));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContextString = () => {
    const parts = [];
    if (filters.useCases.length > 0) {
      const labels = filters.useCases.map((id) => USE_CASES.find((u) => u.id === id)?.label || id);
      parts.push(`Use Cases: ${labels.join(", ")}`);
    }
    if (filters.lifetime) parts.push(`Vehicle Lifetime: ${filters.lifetime} years`);
    if (filters.threat) parts.push(`Threat Level: ${filters.threat}`);
    if (filters.pqc) parts.push(`Post-Quantum Required`);
    if (filters.hardware !== "Unspecified") parts.push(`Hardware: ${filters.hardware}`);
    if (filters.regulatory.length > 0) parts.push(`Regulatory: ${filters.regulatory.join(", ")}`);
    return parts.length > 0 ? `[${parts.join(" | ")}]` : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const context = buildContextString();
    if (!query.trim() && !context) return;

    let userMsg = query.trim();
    if (context) userMsg = userMsg ? `${userMsg}\n\n${context}` : context;

    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", data }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", error: "Failed to connect to the recommendation engine." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const exportMarkdown = () => {
    const botMessages = messages.filter((m) => m.role === "bot" && m.data && !m.data.error);
    if (botMessages.length === 0) return;
    const lines = [
      "# CryptoGuide — Recommendation Report",
      "",
      `Generated: ${new Date().toLocaleString()}`,
      "",
    ];
    botMessages.forEach((m, i) => {
      const d = m.data;
      if (d.isGeneralConversation) {
        lines.push(`## ${i + 1}. Conversational response`);
        lines.push(`${d.message || d.rationale}`);
      } else {
        lines.push(`## ${i + 1}. ${d.useCase || "Recommendation"}`);
        lines.push(`- **Algorithm**: ${d.algorithm}`);
        lines.push(`- **Key Length**: ${d.keyLength}`);
        lines.push(`- **Mode**: ${d.mode}`);
        lines.push(`- **Risk Level**: ${d.riskLevel}`);
        lines.push(`- **Analysis**: ${d.rationale}`);
        if (d.pqcMigrationPath) lines.push(`- **PQC Migration**: ${d.pqcMigrationPath}`);
        if (d.standardsRefs) lines.push(`- **Standards**: ${Array.isArray(d.standardsRefs) ? d.standardsRefs.join(", ") : d.standardsRefs}`);
      }
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cryptoguide-report.md";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const getRiskColor = (level) => {
    if (!level) return "bg-green-500/15 text-green-400 border-green-500/30";
    const l = level.toLowerCase();
    if (l.includes("high") || l === "🔴") return "bg-red-500/15 text-red-400 border-red-500/30";
    if (l.includes("medium") || l === "🟡") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    return "bg-green-500/15 text-green-400 border-green-500/30";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-2xl mx-auto fade-in">
            <div className="p-4 rounded-2xl bg-[rgba(56,189,248,0.08)] border border-[rgba(56,189,248,0.15)]">
              <Shield className="w-10 h-10 text-[var(--accent-blue)]" />
            </div>
            <h2 className="text-2xl font-semibold">Recommendation Engine</h2>
            <p className="text-[var(--text-secondary)] max-w-md">
              Select use cases below, set your constraints, and describe your scenario. The AI will recommend the best cryptographic algorithms.
            </p>
            {/* Starter prompts */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {[
                "OTA updates for a truck lasting 15 years",
                "V2X communication with high threat level",
                "SecOC for CAN-FD with constrained hardware",
              ].map((prompt) => (
                <button
                  key={prompt}
                  className="chip hover:border-[var(--accent-blue)]"
                  onClick={() => {
                    setQuery(prompt);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4 pb-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} fade-in`}>
                <div
                  className={`max-w-[88%] rounded-2xl p-4 ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                      : "glass-card"
                  }`}
                >
                  {m.role === "user" ? (
                    <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                  ) : m.error ? (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{m.error}</span>
                    </div>
                  ) : m.data?.error ? (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{m.data.error}</span>
                    </div>
                  ) : m.data ? (
                    m.data.isGeneralConversation ? (
                      <div className="whitespace-pre-wrap text-sm text-[var(--text-secondary)] leading-relaxed">
                        {m.data.message || m.data.rationale}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-glass)] pb-2">
                          <h3 className="text-base font-semibold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                            {m.data.useCase || "Recommendation"}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${getRiskColor(m.data.riskLevel)}`}>
                            {m.data.riskLevel || "Low"}
                          </span>
                        </div>
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Algorithm</span>
                            <p className="font-mono text-sm font-semibold text-[var(--accent-cyan)]">{m.data.algorithm}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Key / Mode</span>
                            <p className="font-mono text-xs">{m.data.keyLength} · {m.data.mode}</p>
                          </div>
                        </div>
                        {/* Analysis */}
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Analysis</span>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-0.5">{m.data.rationale}</p>
                        </div>
                        {/* Standards */}
                        {m.data.standardsRefs && (
                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(m.data.standardsRefs) ? m.data.standardsRefs : [m.data.standardsRefs]).map((s, si) => (
                              <span key={si} className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-glass)] text-[var(--text-muted)]">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* PQC */}
                        {m.data.pqcMigrationPath && (
                          <div className="p-2.5 rounded-lg bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.15)] text-sm">
                            <span className="text-[10px] uppercase tracking-wider text-[var(--accent-purple)] font-semibold">PQC Migration</span>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{m.data.pqcMigrationPath}</p>
                          </div>
                        )}
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start fade-in">
                <div className="glass-card p-4 flex items-center gap-2">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ═══ Input Panel ═══ */}
      <div className="shrink-0 border-t border-[var(--border-glass)] glass px-4 py-3 space-y-2.5">
        <div className="max-w-4xl mx-auto space-y-2.5">
          {/* Use Case Chips — All 10 */}
          <div className="flex flex-wrap gap-1.5">
            {USE_CASES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleUseCase(id)}
                className={`chip ${filters.useCases.includes(id) ? "active" : ""}`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Quick Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Lifetime */}
            <div className="flex items-center gap-1 bg-[rgba(15,15,35,0.6)] rounded-full p-0.5 border border-[var(--border-glass)]">
              <Clock className="w-3 h-3 ml-2 text-[var(--text-muted)]" />
              {LIFETIME_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => toggleFilter("lifetime", y)}
                  className={`text-[11px] px-2 py-0.5 rounded-full transition-all ${
                    filters.lifetime === y
                      ? "bg-[var(--accent-blue)] text-[#050510] font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {y}y
                </button>
              ))}
            </div>

            {/* Threat */}
            <div className="flex items-center gap-1 bg-[rgba(15,15,35,0.6)] rounded-full p-0.5 border border-[var(--border-glass)]">
              <Shield className="w-3 h-3 ml-2 text-[var(--text-muted)]" />
              {THREAT_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleFilter("threat", t)}
                  className={`text-[11px] px-2 py-0.5 rounded-full transition-all ${
                    filters.threat === t
                      ? "bg-[var(--accent-blue)] text-[#050510] font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* PQC Toggle */}
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, pqc: !p.pqc }))}
              className={`chip ${filters.pqc ? "active" : ""}`}
            >
              <Cpu className="w-3 h-3" /> PQC
            </button>

            {/* Advanced Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="chip"
            >
              Advanced <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {/* Export */}
            {messages.some((m) => m.role === "bot" && m.data && !m.data.error) && (
              <button type="button" onClick={exportMarkdown} className="chip hover:border-[var(--accent-green)]">
                <Download className="w-3 h-3" /> Export
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="flex flex-wrap items-center gap-2 fade-in">
              {/* Hardware */}
              <div className="flex items-center gap-1 bg-[rgba(15,15,35,0.6)] rounded-full p-0.5 border border-[var(--border-glass)]">
                <HardDrive className="w-3 h-3 ml-2 text-[var(--text-muted)]" />
                {HARDWARE_OPTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, hardware: h }))}
                    className={`text-[11px] px-2 py-0.5 rounded-full transition-all ${
                      filters.hardware === h
                        ? "bg-[var(--accent-purple)] text-[#050510] font-semibold"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>

              {/* Regulatory */}
              {REGULATORY_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggleRegulatory(r)}
                  className={`chip ${filters.regulatory.includes(r) ? "active" : ""}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Text Input */}
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your use case... e.g. 'OTA updates for a truck lasting 15 years'"
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-[var(--border-glass)] bg-[rgba(15,15,35,0.6)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] focus:shadow-[0_0_0_1px_var(--accent-blue)] transition-all text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || (!query.trim() && filters.useCases.length === 0 && !filters.lifetime && !filters.threat && !filters.pqc)}
              className="absolute right-2 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[var(--glow-cyan)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
