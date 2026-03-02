"use client";
import React, { useState } from "react";
import AuditForm from "../components/AuditForm";
import AuditLoading from "../components/AuditLoading";
import DigitalHealthAssessment from "../components/DigitalHealthAssessment";
import { getTheme } from "../constants/brand.js";

export default function Home() {
  const [view, setView] = useState("form"); // "form" | "loading" | "results"
  const [formData, setFormData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("dark");
  const t = getTheme(mode);

  async function handleFormSubmit(data) {
    setFormData(data);
    setView("loading");
    setError(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Audit failed (${res.status})`);
      }

      const result = await res.json();
      setAuditData(result);
      if (result.id) {
        setAuditId(result.id);
        window.history.replaceState(null, "", `/results/${result.id}`);
      }

      // Small delay so loading animation finishes smoothly
      setTimeout(() => setView("results"), 1500);
    } catch (err) {
      setError(err.message);
      setView("form");
    }
  }

  function handleReset() {
    setView("form");
    setAuditData(null);
    setFormData(null);
    setAuditId(null);
    setError(null);
    window.history.replaceState(null, "", "/");
  }

  return (
    <div style={{
      minHeight: "100vh", background: t.bgGrad,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {view === "form" && (
        <>
          <AuditForm onSubmit={handleFormSubmit} theme={t} />
          {error && (
            <div style={{
              maxWidth: 560, margin: "-20px auto 40px", padding: "16px 20px",
              background: "rgba(255,33,15,0.08)", border: "1px solid rgba(255,33,15,0.2)",
              borderRadius: 10, textAlign: "center",
            }}>
              <p style={{ fontSize: 13, color: "#FF210F", margin: 0 }}>
                ⚠️ {error}. Please try again.
              </p>
            </div>
          )}
        </>
      )}

      {view === "loading" && (
        <AuditLoading
          url={formData?.url}
          companyName={formData?.companyName}
          theme={t}
        />
      )}

      {view === "results" && auditData && (
        <DigitalHealthAssessment
          auditData={auditData}
          auditId={auditId}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
