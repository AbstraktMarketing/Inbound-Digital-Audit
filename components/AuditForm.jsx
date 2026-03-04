"use client";
import React from "react";

const brand = {
  pipelineRed: "#FF210F",
  talentTeal: "#42BFBA",
  cloudBlue: "#0481A3",
};
const accent = brand.talentTeal;
const accentAlt = brand.cloudBlue;

const steps = [
  { label: "About You", fields: ["contactName", "email"] },
  { label: "Your Business", fields: ["companyName", "address"] },
  { label: "Your Website", fields: ["url", "competitorUrl"] },
  { label: "Final Details", fields: ["industry", "semrushProjectId"] },
];

export default function AuditForm({ onSubmit, theme: t }) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    contactName: "", email: "", companyName: "", address: "", url: "", competitorUrl: "", industry: "", semrushProjectId: "",
  });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const fieldConfig = {
    contactName: { label: "Full Name", placeholder: "Jane Smith", type: "text", required: true },
    email: { label: "Email Address", placeholder: "jane@company.com", type: "email", required: true },
    companyName: { label: "Business Name", placeholder: "Abstrakt Marketing Group", type: "text", required: true },
    address: { label: "Business Address", placeholder: "701 N 1st St, St. Louis, MO 63102", type: "text" },
    url: { label: "Company Website URL", placeholder: "https://abstraktmg.com", type: "text", required: true },
    competitorUrl: { label: "Competitor URL", placeholder: "https://competitor.com", type: "text" },
    industry: { label: "Industry", placeholder: "e.g. B2B Services, SaaS, Healthcare", type: "text" },
    semrushProjectId: { label: "SEMrush Project ID", placeholder: "e.g. 4594705336925861", type: "text", optional: true },
  };

  function validateStep(stepIndex) {
    const e = {};
    const fields = steps[stepIndex].fields;
    fields.forEach(f => {
      const cfg = fieldConfig[f];
      if (cfg.required && !form[f].trim()) {
        e[f] = `${cfg.label} is required`;
      }
      if (f === "email" && form[f].trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form[f].trim())) {
        e[f] = "Enter a valid email";
      }
      if ((f === "url" || f === "competitorUrl") && form[f].trim() && !/^(https?:\/\/)?[\w.-]+\.\w{2,}/.test(form[f].trim())) {
        e[f] = "Enter a valid URL";
      }
    });
    return e;
  }

  function handleNext() {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      onSubmit({ ...form });
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  const inputStyle = (field) => ({
    width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 14,
    border: `1px solid ${errors[field] ? brand.pipelineRed + "60" : t.cardBorder}`,
    background: t.inputBg, color: t.text, outline: "none",
    fontFamily: "'Barlow', 'DM Sans', sans-serif", transition: "border 0.2s",
  });

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 600, color: t.subtle,
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6,
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{
          display: "inline-block", padding: "6px 16px", borderRadius: 20,
          background: `${accent}10`, border: `1px solid ${accent}20`,
          fontSize: 11, fontWeight: 600, color: accent, textTransform: "uppercase",
          letterSpacing: 2, marginBottom: 20,
        }}>
          Free Digital Audit
        </div>
        <h1 style={{
          fontSize: 32, fontWeight: 700, color: t.text, lineHeight: 1.3,
          margin: "0 0 12px", fontFamily: "'Barlow', 'DM Sans', sans-serif",
        }}>
          How Visible Is Your Business Online?
        </h1>
        <p style={{ fontSize: 15, color: t.body, lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          Get a comprehensive audit of your website performance, search visibility, and digital presence.
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
            Step {step + 1} of {steps.length}: {steps[step].label}
          </span>
          <span style={{ fontSize: 11, color: t.subtle }}>
            {"\u23F1"} Takes about 90 seconds
          </span>
        </div>
        <div style={{ width: "100%", height: 6, borderRadius: 3, background: t.cardBorder, overflow: "hidden" }}>
          <div style={{
            width: `${progress}%`, height: "100%", borderRadius: 3,
            background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
            transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {steps.map((s, i) => (
            <span key={i} style={{
              fontSize: 9, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
              color: i <= step ? accent : t.subtle,
              transition: "color 0.3s",
            }}>{s.label}</span>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div style={{
        background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16,
        padding: "36px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 140, height: 140,
          background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`, borderRadius: "50%",
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {steps[step].fields.map(field => {
            const cfg = fieldConfig[field];
            return (
              <div key={field}>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
                  {cfg.label} {cfg.required && "*"}
                  {cfg.optional && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, color: t.subtle,
                      background: t.toggleBg || "rgba(128,128,128,0.1)",
                      border: `1px solid ${t.cardBorder}`,
                      padding: "1px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8,
                    }}>Optional</span>
                  )}
                </label>
                <input
                  type={cfg.type} value={form[field]} placeholder={cfg.placeholder}
                  onChange={e => update(field, e.target.value)}
                  style={inputStyle(field)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
                />
                {errors[field] && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors[field]}</div>}
                {field === "semrushProjectId" && (
                  <div style={{ fontSize: 10, color: t.subtle, marginTop: 5, lineHeight: 1.4 }}>
                    Enables detailed site health audit data. Find this in SEMrush under Projects {"\u2192"} Site Audit {"\u2192"} Project ID in the URL.
                  </div>
                )}
              </div>
            );
          })}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {step > 0 && (
              <button onClick={handleBack} style={{
                padding: "14px 24px", borderRadius: 12, border: `1px solid ${t.cardBorder}`,
                background: "transparent", color: t.text, fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Barlow', 'DM Sans', sans-serif",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.cardBorder}
              >
                {"\u2190"} Back
              </button>
            )}
            <button
              onClick={handleNext} disabled={submitting}
              style={{
                flex: 1, padding: "14px 32px", borderRadius: 12, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: submitting ? "wait" : "pointer",
                letterSpacing: 0.5, transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: "0 4px 20px rgba(66,191,186,0.3)",
                opacity: submitting ? 0.7 : 1,
                fontFamily: "'Barlow', 'DM Sans', sans-serif",
              }}
            >
              {submitting ? "Starting Audit..." : step < steps.length - 1 ? "Continue \u2192" : "Run My Free Audit \u2192"}
            </button>
          </div>

          {step === 0 && (
            <p style={{ fontSize: 11, color: t.subtle, textAlign: "center", marginTop: 0 }}>
              No credit card required. Results delivered instantly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
