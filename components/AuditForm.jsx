"use client";
import React from "react";

const brand = {
  pipelineRed: "#FF210F",
  talentTeal: "#42BFBA",
  cloudBlue: "#0481A3",
};
const accent = brand.talentTeal;
const accentAlt = brand.cloudBlue;

export default function AuditForm({ onSubmit, theme: t }) {
  const [form, setForm] = React.useState({
    companyName: "", url: "", contactName: "", email: "", phone: "", semrushProjectId: "",
  });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  function validate() {
    const e = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.url.trim()) e.url = "Website URL is required";
    else if (!/^(https?:\/\/)?[\w.-]+\.\w{2,}/.test(form.url.trim())) e.url = "Enter a valid URL";
    if (!form.contactName.trim()) e.contactName = "Contact name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    const cleaned = { ...form };
    onSubmit(cleaned);
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  const inputStyle = (field) => ({
    width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 14,
    border: `1px solid ${errors[field] ? brand.pipelineRed + "60" : t.cardBorder}`,
    background: t.inputBg, color: t.text, outline: "none",
    fontFamily: "'DM Sans', sans-serif", transition: "border 0.2s",
  });

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 600, color: t.subtle,
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
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
          margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif",
        }}>
          How Visible Is Your Business Online?
        </h1>
        <p style={{ fontSize: 15, color: t.body, lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          Get a comprehensive audit of your website performance, search visibility, and digital presence — in under 60 seconds.
        </p>
      </div>

      {/* Form */}
      <div style={{
        background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16,
        padding: "36px 32px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 140, height: 140,
          background: `radial-gradient(circle, ${accent}10 0%, transparent 70%)`, borderRadius: "50%",
        }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Company Name *</label>
            <input
              type="text" value={form.companyName} placeholder="Acme Corp"
              onChange={e => update("companyName", e.target.value)}
              style={inputStyle("companyName")}
            />
            {errors.companyName && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.companyName}</div>}
          </div>

          <div>
            <label style={labelStyle}>Website URL *</label>
            <input
              type="text" value={form.url} placeholder="https://example.com"
              onChange={e => update("url", e.target.value)}
              style={inputStyle("url")}
            />
            {errors.url && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.url}</div>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Contact Name *</label>
              <input
                type="text" value={form.contactName} placeholder="Jane Smith"
                onChange={e => update("contactName", e.target.value)}
                style={inputStyle("contactName")}
              />
              {errors.contactName && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.contactName}</div>}
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel" value={form.phone} placeholder="(555) 123-4567"
                onChange={e => update("phone", e.target.value)}
                style={inputStyle("phone")}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email *</label>
            <input
              type="email" value={form.email} placeholder="jane@acmecorp.com"
              onChange={e => update("email", e.target.value)}
              style={inputStyle("email")}
            />
            {errors.email && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.email}</div>}
          </div>

          <div>
            <label style={labelStyle}>SEMrush Project ID <span style={{ opacity: 0.5, textTransform: "none", fontWeight: 400 }}>(optional — for Site Health)</span></label>
            <input
              type="text" value={form.semrushProjectId} placeholder="e.g. 4594705336925861"
              onChange={e => update("semrushProjectId", e.target.value)}
              style={inputStyle("semrushProjectId")}
            />
          </div>

          <button
            type="submit" disabled={submitting}
            style={{
              padding: "16px 32px", borderRadius: 12, border: "none",
              background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
              color: "#fff", fontSize: 16, fontWeight: 700, cursor: submitting ? "wait" : "pointer",
              letterSpacing: 0.5, marginTop: 8, transition: "transform 0.15s, box-shadow 0.15s",
              boxShadow: "0 4px 20px rgba(66,191,186,0.3)",
              opacity: submitting ? 0.7 : 1,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {submitting ? "Starting Audit..." : "Run My Free Audit →"}
          </button>

          <p style={{ fontSize: 11, color: t.subtle, textAlign: "center", marginTop: 4 }}>
            No credit card required. Results delivered instantly.
          </p>
        </form>
      </div>
    </div>
  );
}
