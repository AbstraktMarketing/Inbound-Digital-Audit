"use client";
import React, { useState, useEffect } from "react";

const brand = { talentTeal: "#42BFBA", cloudBlue: "#0481A3" };
const accent = brand.talentTeal;

const steps = [
  { label: "Connecting to website", icon: "🌐", duration: 2000 },
  { label: "Analyzing page speed & performance", icon: "⚡", duration: 3000 },
  { label: "Checking SEO signals", icon: "🔍", duration: 3000 },
  { label: "Scanning backlinks & authority", icon: "🔗", duration: 3000 },
  { label: "Evaluating local search presence", icon: "📍", duration: 2000 },
  { label: "Reviewing content quality", icon: "📝", duration: 2000 },
  { label: "Compiling your results", icon: "📊", duration: 2000 },
];

export default function AuditLoading({ url, companyName, theme: t }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIdx = 0;
    let elapsed = 0;
    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);

    const interval = setInterval(() => {
      elapsed += 100;
      const pct = Math.min(95, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);

      let acc = 0;
      for (let i = 0; i < steps.length; i++) {
        acc += steps[i].duration;
        if (elapsed < acc) { setCurrentStep(i); break; }
        if (i === steps.length - 1) setCurrentStep(i);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      {/* Spinning ring */}
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 32px" }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke={t.cardBorder} strokeWidth="6" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={accent} strokeWidth="6"
            strokeDasharray={`${progress * 3.27} 327`}
            strokeLinecap="round" transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 0.3s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          fontSize: 24, fontWeight: 700, color: t.text,
        }}>
          {progress}%
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif" }}>
        Analyzing {companyName || "your website"}
      </h2>
      <p style={{ fontSize: 13, color: t.subtle, marginBottom: 40 }}>
        {url}
      </p>

      {/* Steps */}
      <div style={{ textAlign: "left", maxWidth: 320, margin: "0 auto" }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
            opacity: i <= currentStep ? 1 : 0.3,
            transition: "opacity 0.4s ease",
          }}>
            <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>
              {i < currentStep ? "✅" : i === currentStep ? step.icon : "○"}
            </span>
            <span style={{
              fontSize: 13, color: i === currentStep ? t.text : i < currentStep ? accent : t.subtle,
              fontWeight: i === currentStep ? 600 : 400,
            }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
