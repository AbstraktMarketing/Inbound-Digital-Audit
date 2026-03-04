"use client";
import React, { useState, useEffect } from "react";
import { brand, accent } from "../constants/brand.js";

const steps = [
  { label: "Connecting to website", icon: "🌐", duration: 2000 },
  { label: "Analyzing page speed & performance", icon: "⚡", duration: 3000 },
  { label: "Checking SEO signals", icon: "🔍", duration: 3000 },
  { label: "Scanning backlinks & authority", icon: "🔗", duration: 3000 },
  { label: "Evaluating local search presence", icon: "📍", duration: 2000 },
  { label: "Reviewing content quality", icon: "📝", duration: 2000 },
  { label: "Compiling your results", icon: "📊", duration: 2000 },
];

const funPhrases = [
  "Convincing the servers to cooperate...",
  "Checking if your meta tags spark joy...",
  "Reticulating splines...",
  "Asking Google where it ranks your site... awkward...",
  "Counting every pixel, twice...",
  "Your h1 tag is having an identity crisis...",
  "Teaching robots to read your website...",
  "Googling how to improve your Google ranking...",
  "Bribing the internet for faster results...",
  "Whispering sweet nothings to the algorithm...",
  "Almost there... probably...",
  "Your sitemap is a treasure map... with no X...",
  "Making sure all the 1s and 0s are in order...",
  "Trying to rank for 'best website ever'...",
  "Consulting the digital oracle...",
  "Your bounce rate just bounced...",
  "Running diagnostics on the hamster wheel...",
  "Alt text: 'a picture is worth 1,000 keywords'...",
  "Asking Google nicely for your data...",
  "Schema markup? More like schema mark-up-your-score...",
  "Converting caffeine into insights...",
  "Canonical URLs are just URLs with trust issues...",
  "Double-checking the math... carry the one...",
  "404: patience not found...",
  "Herding digital cats...",
  "Your backlinks are talking behind your back...",
  "Negotiating with third-party APIs...",
  "Stuffing keywords into this loading screen...",
  "Your audit is worth the wait, promise...",
  "Robots.txt said 'no comment'...",
];

export default function AuditLoading({ url, companyName, theme: t }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPhrases, setShowPhrases] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

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

      if (pct >= 90 && !showPhrases) setShowPhrases(true);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Rotate phrases every 3s once triggered
  useEffect(() => {
    if (!showPhrases) return;
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % funPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [showPhrases]);

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

      {/* Overlay popup — appears at 90% */}
      {showPhrases && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "auditOverlayFadeIn 0.4s ease",
        }}>
          <div style={{
            background: t.cardBg, border: `1px solid ${t.cardBorder}`,
            borderRadius: 16, maxWidth: 420, width: "90%", padding: "40px 32px",
            textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            {/* Progress ring */}
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 24px" }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke={t.cardBorder} strokeWidth="5" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={accent} strokeWidth="5"
                  strokeDasharray={`${progress * 2.64} 264`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition: "stroke-dasharray 0.3s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                fontSize: 20, fontWeight: 700, color: t.text,
              }}>
                {progress}%
              </div>
            </div>

            <h3 style={{
              fontSize: 18, fontWeight: 700, color: t.text, margin: "0 0 8px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Still working...
            </h3>
            <p style={{
              fontSize: 14, color: t.subtle, margin: "0 0 4px",
              minHeight: 22, transition: "opacity 0.3s ease",
            }}>
              {funPhrases[phraseIndex]}
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes auditOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
