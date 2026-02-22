"use client";
import React, { useState, useEffect } from "react";
import DigitalHealthAssessment from "../../../components/BeaconAudit";

function getTheme(mode) {
  if (mode === "dark") return {
    bg: "#111114", bgGrad: "linear-gradient(180deg, #111114 0%, #0d0d12 50%, #0f1015 100%)",
    text: "#EFEFEF", subtle: "rgba(239,239,239,0.55)", body: "rgba(239,239,239,0.72)",
  };
  return {
    bg: "#f5f5f7", bgGrad: "linear-gradient(180deg, #f5f5f7 0%, #eeeef0 50%, #e8e8ec 100%)",
    text: "#1a1a1a", subtle: "rgba(51,51,51,0.58)", body: "rgba(51,51,51,0.75)",
  };
}

export default function ResultsPage({ params }) {
  const { id } = params;
  const [auditData, setAuditData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const t = getTheme("light");

  useEffect(() => {
    fetch(`/api/audit/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? "Audit not found" : "Failed to load");
        return res.json();
      })
      .then(data => { setAuditData(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: t.bgGrad, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>Loading audit...</div>
          <div style={{ fontSize: 14, color: t.subtle }}>Retrieving results</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", background: t.bgGrad, display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
          <div style={{ fontSize: 18, color: t.text, fontWeight: 600, marginBottom: 8 }}>{error}</div>
          <div style={{ fontSize: 14, color: t.subtle, marginBottom: 24 }}>This audit may have been removed or the link is incorrect.</div>
          <a href="/" style={{
            padding: "12px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #42BFBA, #0481A3)",
            color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>Run a New Audit</a>
        </div>
      </div>
    );
  }

  return <DigitalHealthAssessment auditData={auditData} />;
}
