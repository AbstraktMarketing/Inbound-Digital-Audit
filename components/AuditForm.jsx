"use client";
import React from "react";

const brand = {
  pipelineRed: "#FF210F",
  talentTeal: "#42BFBA",
  cloudBlue: "#0481A3",
};
const accent = brand.talentTeal;
const accentAlt = brand.cloudBlue;

const stepDefs = [
  { label: "Website Info", title: "Tell us about your website" },
  { label: "Traffic & Marketing", title: "How are you driving traffic?" },
  { label: "Conversions", title: "How do you capture leads?" },
  { label: "Contact Info", title: "Where should we send your audit?" },
];

const goalOptions = [
  { value: "leads", label: "Generate leads", icon: "\uD83C\uDFAF" },
  { value: "appointments", label: "Book appointments", icon: "\uD83D\uDCC5" },
  { value: "ecommerce", label: "Sell products", icon: "\uD83D\uDED2" },
  { value: "awareness", label: "Build brand awareness", icon: "\uD83D\uDCE3" },
];

const adOptions = [
  { value: "google", label: "Google Ads", icon: "\uD83D\uDD0D" },
  { value: "meta", label: "Facebook / Instagram", icon: "\uD83D\uDCF1" },
  { value: "linkedin", label: "LinkedIn", icon: "\uD83D\uDCBC" },
  { value: "none", label: "No paid ads", icon: "\u2014" },
];

const trafficOptions = [
  { value: "under1k", label: "Under 1,000" },
  { value: "1k5k", label: "1,000 \u2013 5,000" },
  { value: "5k20k", label: "5,000 \u2013 20,000" },
  { value: "20kplus", label: "20,000+" },
  { value: "unsure", label: "Not sure" },
];

const contactOptions = [
  { value: "form", label: "Contact form", icon: "\uD83D\uDCDD" },
  { value: "phone", label: "Phone calls", icon: "\uD83D\uDCDE" },
  { value: "calendar", label: "Booking calendar", icon: "\uD83D\uDCC6" },
  { value: "checkout", label: "Ecommerce checkout", icon: "\uD83D\uDCB3" },
];

const challengeOptions = [
  { value: "traffic", label: "Not enough website traffic" },
  { value: "leads", label: "Traffic but no leads" },
  { value: "attribution", label: "Can\u2019t tell what\u2019s working" },
  { value: "competition", label: "Competitors outrank us" },
  { value: "content", label: "Don\u2019t know what to publish" },
];

export default function AuditForm({ onSubmit, theme: t }) {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState({
    url: "", competitor1: "", competitor2: "", goal: [],
    paidAds: [], monthlyTraffic: "",
    contactMethods: [], challenge: "",
    contactName: "", email: "", companyName: "", phone: "",
    semrushProjectId: "",
  });
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  function toggleMulti(field, value) {
    setForm(prev => {
      const arr = prev[field] || [];
      if (field === "paidAds" && value === "none") return { ...prev, [field]: arr.includes("none") ? [] : ["none"] };
      if (field === "paidAds") {
        const filtered = arr.filter(v => v !== "none");
        return { ...prev, [field]: filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value] };
      }
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function setSingle(field, value) {
    setForm(prev => ({ ...prev, [field]: prev[field] === value ? "" : value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }

  function validateStep(s) {
    const e = {};
    if (s === 0) {
      if (!form.url.trim()) e.url = "Website URL is required";
      else if (!/^(https?:\/\/)?[\w.-]+\.\w{2,}/.test(form.url.trim())) e.url = "Enter a valid URL";
      if (form.goal.length === 0) e.goal = "Select at least one goal";
      if (form.competitor1.trim() && !/^(https?:\/\/)?[\w.-]+\.\w{2,}/.test(form.competitor1.trim())) e.competitor1 = "Enter a valid URL";
      if (form.competitor2.trim() && !/^(https?:\/\/)?[\w.-]+\.\w{2,}/.test(form.competitor2.trim())) e.competitor2 = "Enter a valid URL";
    }
    if (s === 1) {
      if (form.paidAds.length === 0) e.paidAds = "Select at least one option";
    }
    if (s === 3) {
      if (!form.contactName.trim()) e.contactName = "Name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
      if (!form.companyName.trim()) e.companyName = "Company name is required";
    }
    return e;
  }

  function handleNext() {
    const errs = validateStep(step);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (step < stepDefs.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      onSubmit({ ...form });
    }
  }

  function handleBack() { if (step > 0) setStep(step - 1); }

  const inputStyle = (field) => ({
    width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 14,
    border: `1px solid ${errors[field] ? brand.pipelineRed + "60" : t.cardBorder}`,
    background: t.inputBg, color: t.text, outline: "none",
    fontFamily: "'Barlow', 'DM Sans', sans-serif", transition: "border 0.2s",
  });

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 600, color: t.subtle,
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8,
  };

  const progress = ((step + 1) / stepDefs.length) * 100;

  function ChoiceButton({ selected, label, icon, onClick }) {
    return (
      <button type="button" onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
        borderRadius: 10, border: `1.5px solid ${selected ? accent : t.cardBorder}`,
        background: selected ? `${accent}12` : "transparent",
        color: selected ? t.text : t.body, fontSize: 13, fontWeight: selected ? 600 : 500,
        cursor: "pointer", transition: "all 0.2s", textAlign: "left", width: "100%",
        fontFamily: "'Barlow', 'DM Sans', sans-serif",
      }}>
        {icon && <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>}
        <span>{label}</span>
        {selected && <span style={{ marginLeft: "auto", fontSize: 14, color: accent }}>{"\u2713"}</span>}
      </button>
    );
  }

  function ChoiceGrid({ options, field, multi }) {
    const selected = multi ? (form[field] || []) : [form[field]];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(opt => (
          <ChoiceButton
            key={opt.value}
            selected={selected.includes(opt.value)}
            label={opt.label}
            icon={opt.icon}
            onClick={() => multi ? toggleMulti(field, opt.value) : setSingle(field, opt.value)}
          />
        ))}
        {errors[field] && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 2 }}>{errors[field]}</div>}
      </div>
    );
  }

  function renderStep() {
    if (step === 0) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <label style={labelStyle}>Website URL *</label>
<div style={{ fontSize: 10, color: t.subtle, marginTop: -4, marginBottom: 4, lineHeight: 1.4 }}>We’ll scan your site for performance, SEO, and visibility issues.</div>
          <input type="text" value={form.url} placeholder="https://abstraktmg.com"
            onChange={e => update("url", e.target.value)} style={inputStyle("url")}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
          />
          {errors.url && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.url}</div>}
        </div>
        <div>
          <label style={labelStyle}>Competitor URLs</label>
<div style={{ fontSize: 10, color: t.subtle, marginTop: -4, marginBottom: 4, lineHeight: 1.4 }}>We’ll benchmark your visibility against these competitors.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="text" value={form.competitor1} placeholder="https://competitor1.com"
              onChange={e => update("competitor1", e.target.value)} style={inputStyle("competitor1")}
            />
            <input type="text" value={form.competitor2} placeholder="https://competitor2.com (optional)"
              onChange={e => update("competitor2", e.target.value)} style={inputStyle("competitor2")}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Primary goal of your website *</label>
<div style={{ fontSize: 10, color: t.subtle, marginTop: -4, marginBottom: 4, lineHeight: 1.4 }}>Helps us tailor recommendations to what actually drives your revenue.</div>
          <ChoiceGrid options={goalOptions} field="goal" multi />
        </div>
      </div>
    );

    if (step === 1) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <label style={labelStyle}>Do you run paid ads? *</label>
<div style={{ fontSize: 10, color: t.subtle, marginTop: -4, marginBottom: 4, lineHeight: 1.4 }}>We’ll check if your attribution can tie ad spend to actual leads.</div>
          <ChoiceGrid options={adOptions} field="paidAds" multi />
        </div>
        <div>
          <label style={labelStyle}>Monthly website visitors (estimate)</label>
<div style={{ fontSize: 10, color: t.subtle, marginTop: -4, marginBottom: 4, lineHeight: 1.4 }}>This helps us estimate lost revenue opportunities.</div>
          <ChoiceGrid options={trafficOptions} field="monthlyTraffic" />
        </div>
      </div>
    );

    if (step === 2) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <label style={labelStyle}>How do customers contact you?</label>
<div style={{ fontSize: 10, color: t.subtle, marginTop: -4, marginBottom: 4, lineHeight: 1.4 }}>We’ll verify these conversion paths are being tracked properly.</div>
          <ChoiceGrid options={contactOptions} field="contactMethods" multi />
        </div>
        <div>
          <label style={labelStyle}>Biggest marketing challenge</label>
<div style={{ fontSize: 10, color: t.subtle, marginTop: -4, marginBottom: 4, lineHeight: 1.4 }}>Your audit will prioritize recommendations around this.</div>
          <ChoiceGrid options={challengeOptions} field="challenge" />
        </div>
      </div>
    );

    if (step === 3) return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input type="text" value={form.contactName} placeholder="Jane Smith"
            onChange={e => update("contactName", e.target.value)} style={inputStyle("contactName")}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
          />
          {errors.contactName && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.contactName}</div>}
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input type="email" value={form.email} placeholder="jane@company.com"
            onChange={e => update("email", e.target.value)} style={inputStyle("email")}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
          />
          {errors.email && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.email}</div>}
        </div>
        <div>
          <label style={labelStyle}>Company Name *</label>
          <input type="text" value={form.companyName} placeholder="Abstrakt Marketing Group"
            onChange={e => update("companyName", e.target.value)} style={inputStyle("companyName")}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
          />
          {errors.companyName && <div style={{ fontSize: 11, color: brand.pipelineRed, marginTop: 4 }}>{errors.companyName}</div>}
        </div>
        <div>
          <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
            Phone
            <span style={{ fontSize: 9, fontWeight: 600, color: t.subtle, background: t.toggleBg || "rgba(128,128,128,0.1)", border: `1px solid ${t.cardBorder}`, padding: "1px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8 }}>Optional</span>
          </label>
          <input type="tel" value={form.phone} placeholder="(555) 123-4567"
            onChange={e => update("phone", e.target.value)} style={inputStyle("phone")}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
          />
        </div>
        <div>
          <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 6 }}>
            SEMrush Project ID
            <span style={{ fontSize: 9, fontWeight: 600, color: t.subtle, background: t.toggleBg || "rgba(128,128,128,0.1)", border: `1px solid ${t.cardBorder}`, padding: "1px 6px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8 }}>Optional</span>
          </label>
          <input type="text" value={form.semrushProjectId} placeholder="e.g. 4594705336925861"
            onChange={e => update("semrushProjectId", e.target.value)} style={inputStyle("semrushProjectId")}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleNext(); } }}
          />
          <div style={{ fontSize: 10, color: t.subtle, marginTop: 5, lineHeight: 1.4 }}>
            Enables detailed site health data. Find in SEMrush under Projects {"\u2192"} Site Audit {"\u2192"} Project ID in the URL.
          </div>
        </div>
      </div>
    );
  }

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
          Digital Growth Audit
        </div>
        <h1 style={{
          fontSize: 32, fontWeight: 700, color: t.text, lineHeight: 1.3,
          margin: "0 0 12px", fontFamily: "'Barlow', 'DM Sans', sans-serif",
        }}>
          How Visible Is Your Business Online?
        </h1>
        <p style={{ fontSize: 15, color: t.body, lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          Answer a few quick questions and we'll audit your digital presence in under 90 seconds.
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
            Step {step + 1} of {stepDefs.length}
          </span>
          <span style={{ fontSize: 11, color: t.subtle }}>
            {"\u23F1"} About 90 seconds total
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
          {stepDefs.map((s, i) => (
            <span key={i} style={{
              fontSize: 9, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase",
              color: i <= step ? accent : t.subtle, transition: "color 0.3s",
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

        {/* Step Title */}
        <div style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 24, fontFamily: "'Barlow', 'DM Sans', sans-serif" }}>
          {stepDefs[step].title}
        </div>

        {renderStep()}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          {step > 0 && (
            <button onClick={handleBack} style={{
              padding: "14px 24px", borderRadius: 12, border: `1px solid ${t.cardBorder}`,
              background: "transparent", color: t.text, fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Barlow', 'DM Sans', sans-serif", transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = t.cardBorder}
            >
              {"\u2190"} Back
            </button>
          )}
          <button onClick={handleNext} disabled={submitting} style={{
            flex: 1, padding: "14px 32px", borderRadius: 12, border: "none",
            background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
            color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: submitting ? "wait" : "pointer",
            letterSpacing: 0.5, transition: "transform 0.15s, box-shadow 0.15s",
            boxShadow: "0 4px 20px rgba(66,191,186,0.3)",
            opacity: submitting ? 0.7 : 1,
            fontFamily: "'Barlow', 'DM Sans', sans-serif",
          }}>
            {submitting ? "Starting Audit..." : step < stepDefs.length - 1 ? "Continue \u2192" : "Run My Free Audit \u2192"}
          </button>
        </div>

        {step === 0 && (
          <p style={{ fontSize: 11, color: t.subtle, textAlign: "center", marginTop: 16 }}>
            No credit card required. Results delivered instantly.
          </p>
        )}
      </div>
    </div>
  );
}
