"use client";

import React from "react";
import AuditForm from "../components/AuditForm";
import AuditLoading from "../components/AuditLoading";
import BeaconAudit from "../components/BeaconAudit";

// ─── Theme ──────────────────────────────────────────────────────────────────
// Master theme objects. These are a SUPERSET — BeaconAudit consumes every key,
// AuditForm + AuditLoading consume a subset (and ignore the rest cleanly).
// Values copied verbatim from BeaconAudit's original getTheme() so downstream
// components render identically to how they did pre-refactor.
const brand = { enterpriseMaroon: "#8C082B" };

const lightTheme = {
  bg: "#f5f5f7",
  bgGrad: "linear-gradient(180deg, #f5f5f7 0%, #eeeef0 50%, #e8e8ec 100%)",
  cardBg: "rgba(255,255,255,0.85)",
  cardBorder: "rgba(0,0,0,0.08)",
  subtle: "rgba(51,51,51,0.5)",
  body: "rgba(51,51,51,0.75)",
  text: "#1a1a1a",
  inputBg: "rgba(0,0,0,0.03)",
  scrollThumb: "rgba(66,191,186,0.3)",
  scrollHover: "rgba(66,191,186,0.5)",
  hoverRow: "rgba(66,191,186,0.05)",
  logoFill: "#333333",
  toggleBg: "rgba(0,0,0,0.04)",
  toggleBorder: "rgba(0,0,0,0.1)",
  badgeBg: "rgba(255,33,15,0.06)",
  badgeBorder: "rgba(255,33,15,0.12)",
  ctaBtnColor: "#fff",
  statusDot: "#fff",
  badgeText: brand.enterpriseMaroon,
  badgeDot: brand.enterpriseMaroon,
};

const darkTheme = {
  bg: "#111114",
  bgGrad: "linear-gradient(180deg, #111114 0%, #0d0d12 50%, #0f1015 100%)",
  cardBg: "rgba(255,255,255,0.035)",
  cardBorder: "rgba(255,255,255,0.07)",
  subtle: "rgba(239,239,239,0.45)",
  body: "rgba(239,239,239,0.72)",
  text: "#EFEFEF",
  inputBg: "rgba(255,255,255,0.025)",
  scrollThumb: "rgba(66,191,186,0.2)",
  scrollHover: "rgba(66,191,186,0.35)",
  hoverRow: "rgba(66,191,186,0.03)",
  logoFill: "#EFEFEF",
  toggleBg: "rgba(255,255,255,0.06)",
  toggleBorder: "rgba(255,255,255,0.1)",
  badgeBg: "rgba(66,191,186,0.08)",
  badgeBorder: "rgba(66,191,186,0.15)",
  ctaBtnColor: "#fff",
  statusDot: "#0a0a0a",
  badgeText: "#EFEFEF",
  badgeDot: "#EFEFEF",
};

// ─── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  // View state: "form" → "loading" → "results" (and back to "form" on reset/error)
  const [view, setView] = React.useState("form");
  const [auditData, setAuditData] = React.useState(null);
  const [submittedForm, setSubmittedForm] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Theme state — controlled here so all three children render consistently.
  const [isDark, setIsDark] = React.useState(true); // BeaconAudit's original default
  const theme = isDark ? darkTheme : lightTheme;

  // Called by AuditForm when the user completes step 4 and submits.
  // formData shape (from AuditForm internal state):
  //   { url, competitor1, competitor2, goal, paidAds, monthlyTraffic,
  //     contactMethods, challenge, contactName, email, companyName,
  //     phone, semrushProjectId }
  //
  // The backend (/api/audit) only reads: url, companyName, contactName,
  // email, phone, semrushProjectId. The rest is captured in Sheets for
  // sales context — still sent for completeness.
  async function handleFormSubmit(formData) {
    setSubmittedForm(formData);
    setError(null);
    setView("loading");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // The API returns { error: "..." } with 4xx/5xx on failure.
        const errBody = await response.json().catch(() => ({}));
        throw new Error(
          errBody.error || `Audit request failed (${response.status})`
        );
      }

      const data = await response.json();
      setAuditData(data);
      setView("results");
    } catch (err) {
      console.error("Audit error:", err);
      setError(err.message || "Something went wrong running the audit.");
      setView("form");
    }
  }

  function handleReset() {
    setAuditData(null);
    setSubmittedForm(null);
    setError(null);
    setView("form");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.bgGrad,
        color: theme.text,
        fontFamily: "'Barlow', 'DM Sans', sans-serif",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* Theme toggle — visible on every view, top-right corner */}
      <ThemeToggle isDark={isDark} setIsDark={setIsDark} theme={theme} />

      {view === "form" && (
        <>
          {error && <ErrorBanner message={error} theme={theme} />}
          <AuditForm onSubmit={handleFormSubmit} theme={theme} />
        </>
      )}

      {view === "loading" && (
        <AuditLoading
          url={submittedForm?.url || ""}
          companyName={submittedForm?.companyName || ""}
          theme={theme}
        />
      )}

      {view === "results" && auditData && (
        <BeaconAudit data={auditData} theme={theme} onReset={handleReset} />
      )}
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function ThemeToggle({ isDark, setIsDark, theme }) {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle light/dark mode"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 50,
        width: 40,
        height: 40,
        borderRadius: 20,
        border: `1px solid ${theme.toggleBorder}`,
        background: theme.toggleBg,
        color: theme.text,
        cursor: "pointer",
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {isDark ? "\u2600" : "\u263E"}
    </button>
  );
}

function ErrorBanner({ message, theme }) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "24px auto 0",
        padding: "12px 16px",
        borderRadius: 10,
        background: "rgba(255, 33, 15, 0.08)",
        border: "1px solid rgba(255, 33, 15, 0.25)",
        color: theme.text,
        fontSize: 13,
        lineHeight: 1.5,
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}
