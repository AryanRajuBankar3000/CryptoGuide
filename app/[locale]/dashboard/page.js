"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const USE_CASES = [
  "Secure Boot", "Integrity", "V2X Comms", "Key Exchange", "Data Encryption",
  "MAC/SecOC", "Signatures", "RNG", "Key Mgmt", "HSM Provision",
];
const THREATS = ["Low", "Medium", "High", "Critical"];

// Risk matrix: [useCase][threat] → "low" | "medium" | "high"
const RISK_MATRIX = {
  "Secure Boot":      { Low: "low", Medium: "medium", High: "high", Critical: "high" },
  "Integrity":        { Low: "low", Medium: "low", High: "low", Critical: "medium" },
  "V2X Comms":        { Low: "low", Medium: "medium", High: "high", Critical: "high" },
  "Key Exchange":     { Low: "medium", Medium: "high", High: "high", Critical: "high" },
  "Data Encryption":  { Low: "low", Medium: "low", High: "low", Critical: "medium" },
  "MAC/SecOC":        { Low: "low", Medium: "low", High: "medium", Critical: "medium" },
  "Signatures":       { Low: "low", Medium: "medium", High: "high", Critical: "high" },
  "RNG":              { Low: "low", Medium: "low", High: "medium", Critical: "medium" },
  "Key Mgmt":         { Low: "low", Medium: "medium", High: "medium", Critical: "high" },
  "HSM Provision":    { Low: "low", Medium: "medium", High: "high", Critical: "high" },
};

const DEPRECATION_TIMELINE = [
  { algo: "AES-256-GCM", category: "Symmetric", end: 2045, pqcSafe: true },
  { algo: "SHA-256", category: "Hash", end: 2040, pqcSafe: true },
  { algo: "AES-CMAC (SecOC)", category: "MAC", end: 2038, pqcSafe: true },
  { algo: "CTR_DRBG (RNG)", category: "RNG", end: 2045, pqcSafe: true },
  { algo: "AES-256 Key Wrap", category: "Key Mgmt", end: 2040, pqcSafe: true },
  { algo: "RSA-3072", category: "Asymmetric", end: 2030, pqcSafe: false },
  { algo: "ECDSA P-256", category: "Asymmetric", end: 2030, pqcSafe: false },
  { algo: "ECDH P-256", category: "Asymmetric", end: 2028, pqcSafe: false },
  { algo: "Ed25519", category: "Asymmetric", end: 2030, pqcSafe: false },
  { algo: "ECC P-256 (Prov.)", category: "Asymmetric", end: 2030, pqcSafe: false },
];

const CURRENT_YEAR = 2026;
const TIMELINE_END = 2046;
const PQC_TOTAL = 10;
const PQC_SAFE_COUNT = 5; // Symmetric/hash algorithms that are already PQC-safe

export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const [selectedCell, setSelectedCell] = useState(null);

  const cellColor = (risk) => {
    if (risk === "high") return "bg-red-500/30 border-red-500/40 text-red-300";
    if (risk === "medium") return "bg-yellow-500/20 border-yellow-500/30 text-yellow-300";
    return "bg-green-500/15 border-green-500/25 text-green-300";
  };

  const pqcPercent = Math.round((PQC_SAFE_COUNT / PQC_TOTAL) * 100);
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference - (pqcPercent / 100) * circumference;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 fade-in">
          <h1 className="text-3xl font-bold mb-3">
            <span className="gradient-text">{t("title")}</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Top Row: Heatmap + PQC Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Heatmap */}
          <div className="lg:col-span-2 glass-card p-6 fade-in-up">
            <h2 className="text-lg font-semibold mb-4">{t("heatmap")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left text-[var(--text-muted)] pb-3 pr-3 font-medium">{t("useCase")}</th>
                    {THREATS.map((th) => (
                      <th key={th} className="text-center text-[var(--text-muted)] pb-3 px-1 font-medium">{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {USE_CASES.map((uc) => (
                    <tr key={uc}>
                      <td className="pr-3 py-1.5 text-[var(--text-secondary)] font-medium whitespace-nowrap">{uc}</td>
                      {THREATS.map((th) => {
                        const risk = RISK_MATRIX[uc]?.[th] || "low";
                        const isSelected = selectedCell?.uc === uc && selectedCell?.t === th;
                        return (
                          <td key={th} className="px-1 py-1.5">
                            <button
                              onClick={() => setSelectedCell(isSelected ? null : { uc, t: th, risk })}
                              className={`heatmap-cell w-full py-2 rounded-lg border text-[10px] font-semibold uppercase ${cellColor(risk)} ${
                                isSelected ? "ring-2 ring-white/30" : ""
                              }`}
                            >
                              {risk}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedCell && (
              <div className="mt-4 p-3 rounded-lg border border-[var(--border-glass)] bg-[rgba(15,15,35,0.5)] text-sm fade-in">
                <strong>{selectedCell.uc}</strong> {t("at")} <strong>{selectedCell.t}</strong> {t("threat")} → <span className={`font-semibold ${
                  selectedCell.risk === "high" ? "text-red-400" : selectedCell.risk === "medium" ? "text-yellow-400" : "text-green-400"
                }`}>{selectedCell.risk.toUpperCase()}</span> {t("risk")}.
                {selectedCell.risk === "high" && " " + t("immediatePqc")}
                {selectedCell.risk === "medium" && " " + t("monitorDeprecation")}
                {selectedCell.risk === "low" && " " + t("adequate")}
              </div>
            )}
          </div>

          {/* PQC Readiness Gauge */}
          <div className="glass-card p-6 flex flex-col items-center justify-center fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-lg font-semibold mb-4">{t("pqcReadiness")}</h2>
            <div className="relative w-44 h-44">
              <svg width="176" height="176" viewBox="0 0 176 176">
                {/* Background ring */}
                <circle cx="88" cy="88" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                {/* Progress ring */}
                <circle
                  cx="88" cy="88" r="70"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="gauge-ring"
                  transform="rotate(-90 88 88)"
                />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent-blue)" />
                    <stop offset="100%" stopColor="var(--accent-cyan)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold gradient-text">{pqcPercent}%</span>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{t("ready")}</span>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-[var(--text-secondary)] space-y-1">
              <p><span className="text-green-400 font-semibold">{PQC_SAFE_COUNT}</span> of {PQC_TOTAL} {t("categoriesSafe")}</p>
              <p><span className="text-yellow-400 font-semibold">{PQC_TOTAL - PQC_SAFE_COUNT}</span> {t("requireMigration")}</p>
            </div>
          </div>
        </div>

        {/* Algorithm Deprecation Timeline */}
        <div className="glass-card p-6 fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-lg font-semibold mb-6">{t("timeline")}</h2>
          <div className="space-y-2.5">
            {/* Year markers */}
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] mb-1">
              <div className="w-36 shrink-0" />
              <div className="flex-1 flex justify-between">
                {[2026, 2028, 2030, 2032, 2034, 2036, 2038, 2040, 2042, 2044, 2046].map((y) => (
                  <span key={y}>{y}</span>
                ))}
              </div>
            </div>

            {DEPRECATION_TIMELINE.sort((a, b) => a.end - b.end).map((item) => {
              const barPercent = Math.min(((item.end - CURRENT_YEAR) / (TIMELINE_END - CURRENT_YEAR)) * 100, 100);
              return (
                <div key={item.algo} className="flex items-center gap-2">
                  <div className="w-36 shrink-0 text-xs text-[var(--text-secondary)] truncate font-mono">{item.algo}</div>
                  <div className="flex-1 h-6 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--border-glass)] relative overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all ${
                        item.pqcSafe
                          ? "bg-gradient-to-r from-green-500/40 to-green-500/20"
                          : item.end <= 2030
                          ? "bg-gradient-to-r from-red-500/40 to-red-500/20"
                          : "bg-gradient-to-r from-yellow-500/40 to-yellow-500/20"
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-[10px] font-medium text-white/70">
                        ~{item.end} {item.pqcSafe ? "✓" : "⚠"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/40" /> {t("quantumSafe")}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/40" /> {t("monitor")}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/40" /> {t("migrationNeeded")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
