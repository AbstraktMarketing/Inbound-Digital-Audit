"use client";
import { useState } from "react";
import { brand, accent, accentAlt, getTheme } from "../constants/brand.js";

const tabs = [
  "Technical Foundation",
  "Authority & Search",
  "Content & Topical Depth",
  "Entity & Brand Authority",
  "Revenue & Attribution",
];

/* -- Helpers -- */
function statusColor(s) {
  if (s === "good") return brand.talentTeal;
  if (s === "warning") return brand.inboundOrange;
  return brand.pipelineRed;
}
function statusIcon(s) {
  if (s === "good") return "\u2713";
  if (s === "warning") return "!";
  return "\u2717";
}
function getRevenueVerdict(score) {
  if (score < 40) return "Your business is nearly invisible to buyers actively searching for your services. Revenue is being lost every day.";
  if (score < 60) return "Your business is capturing approximately " + score + "% of its potential digital demand. Competitors are capturing the remaining market share.";
  if (score < 75) return "Buyers searching for your services today are finding competitors first. You are capturing roughly " + score + "% of available demand.";
  return "Strong position \u2014 targeted improvements can accelerate pipeline growth significantly.";
}
function calcGrowth(arr) {
  if (!arr || arr.length < 2) return 0;
  return Math.round(((arr[arr.length - 1] - arr[0]) / Math.max(arr[0], 1)) * 100);
}

/* -- Abstrakt Logo SVG Component -- */
function AbstraktLogo({ fill = "#EFEFEF", height = 28 }) {
  const aspect = 190.42 / 60.65;
  const w = height * aspect;
  return (
    <svg viewBox="0 0 190.42 60.65" width={w} height={height} xmlns="http://www.w3.org/2000/svg">
      <g fill={fill}>
        <path d="M44.96,37.65c-.64-1.09-1.55-1.95-2.72-2.59-1.17-.64-2.5-.96-3.97-.96-1.81,0-3.43.47-4.85,1.4-1.42.93-2.53,2.25-3.32,3.95-.79,1.7-1.19,3.64-1.19,5.82s.4,4.09,1.19,5.75c.79,1.66,1.9,2.94,3.3,3.83,1.41.89,3.03,1.34,4.87,1.34,1.48,0,2.8-.31,3.97-.92,1.17-.61,2.08-1.46,2.72-2.55v3.14h6.23v-21.21h-6.23v3.01ZM43.71,49.78c-.84,1.06-2.03,1.59-3.6,1.59s-2.81-.52-3.66-1.57c-.85-1.05-1.28-2.56-1.28-4.54s.43-3.53,1.3-4.64c.86-1.11,2.08-1.67,3.64-1.67s2.76.54,3.6,1.61c.84,1.07,1.26,2.61,1.26,4.62s-.42,3.54-1.26,4.6Z"/>
        <path d="M72.31,35.46c-1.42-.91-3.05-1.36-4.89-1.36-1.45,0-2.77.31-3.95.94-1.19.63-2.09,1.49-2.7,2.57v-12.55h-6.32v30.79h6.28v-3.18c.61,1.09,1.51,1.95,2.7,2.57,1.18.63,2.52.94,3.99.94,1.81,0,3.43-.47,4.85-1.4,1.42-.93,2.53-2.24,3.33-3.93.79-1.69,1.19-3.62,1.19-5.79s-.39-4.09-1.17-5.75c-.78-1.66-1.88-2.94-3.3-3.85ZM69.21,49.74c-.84,1.09-2.04,1.63-3.6,1.63s-2.77-.54-3.62-1.61c-.85-1.07-1.28-2.61-1.28-4.62s.42-3.51,1.28-4.58c.85-1.07,2.06-1.61,3.62-1.61s2.76.53,3.6,1.59c.84,1.06,1.25,2.57,1.25,4.52s-.42,3.6-1.25,4.68Z"/>
        <path d="M90.33,43.38l-3.56-.79c-.89-.2-1.51-.44-1.86-.73-.35-.29-.52-.68-.52-1.15,0-.64.29-1.14.88-1.51.59-.36,1.39-.54,2.43-.54s2.15.2,3.28.59c1.13.39,2.24.96,3.33,1.71l1.76-4.22c-1.14-.84-2.44-1.48-3.89-1.95-1.45-.46-2.93-.69-4.43-.69-1.78,0-3.36.29-4.73.86-1.37.57-2.43,1.37-3.2,2.41-.77,1.03-1.15,2.2-1.15,3.51,0,1.62.48,2.91,1.44,3.89.96.98,2.46,1.69,4.5,2.13l3.47.79c1.06.22,1.8.49,2.22.79.42.31.63.73.63,1.25,0,.64-.29,1.13-.88,1.47-.59.33-1.42.5-2.51.5-1.42,0-2.82-.22-4.18-.65-1.37-.43-2.61-1.05-3.72-1.86l-1.67,4.39c2.31,1.73,5.48,2.59,9.5,2.59,2.82,0,5.03-.59,6.65-1.76,1.62-1.17,2.43-2.76,2.43-4.77,0-1.67-.49-3.01-1.46-4.02-.98-1-2.55-1.76-4.73-2.26Z"/>
        <path d="M122.67,35.21c-1.13.71-1.96,1.74-2.49,3.07l-.42-3.64h-5.94c.22,1.78.33,3.81.33,6.07v15.14h6.32v-11.09c0-1.62.44-2.88,1.32-3.79.88-.91,2.16-1.36,3.83-1.36,1.03,0,2.06.24,3.1.71l.04-5.77c-.61-.28-1.37-.42-2.26-.42-1.42,0-2.7.36-3.83,1.07Z"/>
        <path d="M145.68,37.65c-.64-1.09-1.55-1.95-2.72-2.59-1.17-.64-2.49-.96-3.97-.96-1.81,0-3.43.47-4.85,1.4-1.42.93-2.53,2.25-3.33,3.95-.79,1.7-1.19,3.64-1.19,5.82s.4,4.09,1.19,5.75c.8,1.66,1.9,2.94,3.3,3.83,1.41.89,3.03,1.34,4.87,1.34,1.48,0,2.8-.31,3.97-.92,1.17-.61,2.08-1.46,2.72-2.55v3.14h6.23v-21.21h-6.23v3.01ZM144.43,49.78c-.84,1.06-2.04,1.59-3.6,1.59s-2.81-.52-3.66-1.57c-.85-1.05-1.28-2.56-1.28-4.54s.43-3.53,1.3-4.64,2.08-1.67,3.64-1.67,2.76.54,3.6,1.61c.84,1.07,1.26,2.61,1.26,4.62s-.42,3.54-1.26,4.6Z"/>
        <polygon points="176.96 34.68 169.38 34.68 161.44 43.76 161.44 25.06 155.12 25.06 155.12 55.85 161.44 55.85 161.44 46.35 169.76 55.85 177.5 55.85 167.96 44.85 176.96 34.68"/>
        <path d="M54.29,19.5s-.07-.35-.16-.68c.14-13.18-20.39-7.24-36.37-17.1,0,0,.26,3.12,2.92,5,.67.47,1.48.87,2.48,1.11,0,0-.81-.09-2.15-.28C16.27,6.87,4.97,4.77,0,0c0,0,.3,6.49,7.29,15.81,0,0-1.13-.58-1.52-1.03,0,0,.76,11.77,4.76,18.34-3.8,1.13,1.04,10.59,3.27,10.24-.53.08,2.35,7.1,2.67,7.67,1.39,2.51,3.25,4.79,5.55,6.53,3.1,2.34,6.64,3.26,10.2,3.07,0,0,0,0,.01,0,.68.04,1.37.03,2.06-.02-.28-.02-.55-.05-.82-.09-1.05-.15-2.09-.43-3.1-.84-1.01-.42-1.98-.97-2.91-1.67-1.47-1.11-2.73-2.49-3.77-4.01-.35-.51-.67-1.03-.97-1.57-.07-.12-.27-.59-.53-1.22-.13-.32-.28-.67-.42-1.05-.08-.19-.15-.38-.23-.57-.53-1.36-1.05-2.83-1.14-3.43-.02-.17-.01-.27.04-.28-.24.04-.51-.06-.8-.25-.36-.24-.75-.64-1.12-1.14-.07-.1-.15-.2-.22-.31-.37-.53-.72-1.16-1.01-1.8-.06-.13-.12-.26-.17-.39-.11-.26-.21-.53-.29-.79-.09-.27-.16-.53-.22-.78-.09-.39-.14-.76-.16-1.11,0-.12,0-.23,0-.34,0-.11.01-.22.03-.32.1-.73.46-1.28,1.17-1.5-.53-.88-1-1.86-1.41-2.9-.24-.62-.47-1.27-.67-1.91-.14-.43-.26-.87-.38-1.31-1.3-4.8-1.61-9.55-1.61-9.55.34.39,1.3.88,1.3.88-5.97-7.96-6.23-13.51-6.23-13.51,2.2,1.2,5.7,2.85,10.24,3.91,3.93.92,5.49.65,14.86,1.27.45.03.88.06,1.31.09,2.56.18,4.79.38,6.77.68.66.1,1.29.21,1.9.33,1.82.37,3.42.85,4.87,1.53.24.11.48.23.72.35,3.37,1.78,4.7,4.06,5.13,5.09.06-.96,0-1.82-.15-2.58Z"/>
        <path d="M190.42,39.37v-4.73h-5.4v-7.03l-6.32,2.05v4.98h-.01v4.73h.01v8.37c0,2.68.69,4.75,2.07,6.23,1.38,1.48,3.38,2.22,6,2.22,1.42,0,2.64-.2,3.64-.58v-4.9c-.78.2-1.48.29-2.09.29-.98,0-1.77-.27-2.39-.82-.61-.54-.92-1.4-.92-2.57v-8.24h5.4Z"/>
        <path d="M105.54,27.61l-6.32,2.05v4.98h-.01v4.73h.01v8.37c0,2.68.69,4.75,2.07,6.23,1.38,1.48,3.38,2.22,6,2.22,1.42,0,2.63-.2,3.64-.58v-4.9c-.78.2-1.48.29-2.09.29-.98,0-1.77-.27-2.39-.82-.61-.54-.92-1.4-.92-2.57v-8.24h5.4v-4.73h-5.4v-7.03Z"/>
      </g>
    </svg>
  );
}

/* -- Shared Components -- */
function ScoreRing({ score, size = 130, t }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? brand.talentTeal : score >= 70 ? brand.inboundOrange : brand.pipelineRed;
  const glowColor = score >= 90 ? "rgba(66,191,186,0.25)" : score >= 70 ? "rgba(244,111,10,0.25)" : "rgba(255,33,15,0.25)";
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto 14px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 12px ${glowColor})` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.cardBorder} strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{score}</span>
        <span style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 500 }}>/ 100</span>
      </div>
    </div>
  );
}

function SourceBadge({ confidence, t }) {
  if (!confidence) return null;
  const config = {
    measured: { label: "Measured", color: brand.talentTeal, bg: "rgba(66,191,186,0.1)", border: "rgba(66,191,186,0.2)" },
    estimated: { label: "Estimated", color: brand.inboundOrange, bg: "rgba(244,111,10,0.1)", border: "rgba(244,111,10,0.2)" },
    assumed: { label: "Assumed", color: t.subtle, bg: "rgba(128,128,128,0.1)", border: "rgba(128,128,128,0.2)" },
  };
  const c = config[confidence] || config.assumed;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, color: c.color,
      background: c.bg, border: "1px solid " + c.border,
      padding: "1px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8,
      whiteSpace: "nowrap",
    }}>{c.label}</span>
  );
}

function WeightBadge({ impact }) {
  if (!impact || impact === "medium") return null;
  const tier = impact === "high" ? { label: "High Impact", color: brand.pipelineRed, bg: "rgba(255,33,15,0.08)", border: "rgba(255,33,15,0.18)" }
    : impact === "low" ? { label: "Low Impact", color: brand.cloudBlue, bg: "rgba(4,129,163,0.08)", border: "rgba(4,129,163,0.18)" }
    : null;
  if (!tier) return null;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, color: tier.color,
      background: tier.bg, border: "1px solid " + tier.border,
      padding: "1px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8,
      whiteSpace: "nowrap",
    }}>{tier.label}</span>
  );
}

function MetricRow({ label, value, status, detail, confidence, impact, issues, findings, t }) {
  const [expanded, setExpanded] = useState(false);
  // Normalize: backend sends findings (string[]), main UI expects issues (object[])
  const displayItems = issues || (findings ? findings.map(f => typeof f === "string" ? { issue: f } : f) : null);
  const hasItems = displayItems && displayItems.length > 0;
  const sevColor = { high: brand.pipelineRed, medium: brand.inboundOrange, low: brand.cloudBlue };
  return (
    <div style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 18px", transition: "background 0.2s", cursor: hasItems ? "pointer" : "default",
      }}
        onClick={() => hasItems && setExpanded(!expanded)}
        onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: detail ? 3 : 0 }}>
            <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{label}</span>
            <SourceBadge confidence={confidence} t={t} />
            <WeightBadge impact={impact} />
            {hasItems && (
              <span style={{
                fontSize: 8, fontWeight: 700, color: brand.inboundOrange,
                background: "rgba(244,111,10,0.1)", border: "1px solid rgba(244,111,10,0.2)",
                padding: "1px 5px", borderRadius: 3, textTransform: "uppercase", letterSpacing: 0.8,
              }}>{displayItems.length} issues</span>
            )}
          </div>
          {detail && <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{detail}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
          <span style={{
            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: t.statusDot, background: statusColor(status),
          }}>{statusIcon(status)}</span>
          {hasItems && (
            <span style={{ fontSize: 10, color: t.subtle, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>{"\u25BC"}</span>
          )}
        </div>
      </div>
      {hasItems && expanded && (
        <div style={{ padding: "0 18px 14px", background: t.toggleBg }}>
          {displayItems.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderBottom: i < displayItems.length - 1 ? `1px solid ${t.cardBorder}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: sevColor[item.severity] || t.subtle, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: t.text }}>{item.issue}</span>
              </div>
              {item.count != null && (
                <span style={{
                  fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  color: sevColor[item.severity] || t.subtle,
                }}>{item.count}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Card({ title, children, t, style: s }) {
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14,
      overflow: "hidden", backdropFilter: "blur(8px)", ...s,
    }}>
      {title && (
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${t.cardBorder}`, fontSize: 12,
          fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 3, height: 14, background: accent, borderRadius: 2, display: "inline-block" }} />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function RecommendationList({ items, t }) {
  return (
    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
            flexShrink: 0, marginTop: 1,
          }}>{i + 1}</span>
          <span style={{ fontSize: 13, color: t.body, lineHeight: 1.6 }}>{r}</span>
        </div>
      ))}
    </div>
  );
}

/* Collapsible Foundational Section */
function FoundationalCollapsible({ items, t }) {
  const [open, setOpen] = useState(false);
  const count = items.length;
  if (count === 0) return null;
  return (
    <div style={{ borderBottom: "1px solid " + t.cardBorder }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 18px", cursor: "pointer", transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: t.statusDot, background: brand.talentTeal,
          }}>{"\u2713"}</span>
          <span style={{ fontSize: 14, color: t.subtle, fontWeight: 500 }}>
            {count} foundational checks passing
          </span>
        </div>
        <span style={{ fontSize: 12, color: t.subtle, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>
          {"\u25BC"}
        </span>
      </div>
      {open && items.map((m, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 18px 10px 50px", borderTop: "1px solid " + t.cardBorder,
          opacity: 0.7,
        }}>
          <span style={{ fontSize: 13, color: t.subtle }}>{m.label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: t.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</span>
            <span style={{
              width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: t.statusDot, background: brand.talentTeal,
            }}>{"\u2713"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -- Light/Dark Toggle -- */
function ModeToggle({ mode, setMode, t }) {
  return (
    <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20,
      border: `1px solid ${t.toggleBorder}`, background: t.toggleBg,
      color: t.subtle, fontSize: 12, fontWeight: 500, cursor: "pointer",
      transition: "all 0.25s", letterSpacing: 0.3,
    }}>
      <span style={{ fontSize: 15 }}>{mode === "dark" ? "\u2600" : "\u263E"}</span>
      {mode === "dark" ? "Light" : "Dark"}
    </button>
  );
}

/* -- Main Component -- */
export default function DigitalHealthAssessment({ auditData, auditId, onReset }) {
  const [activeTab, setActiveTab] = useState(0);
  const [mode, setMode] = useState("dark");
  const t = getTheme(mode);

  /* ── Derive all data from auditData prop ── */
  const webPerf = auditData?.webPerf || { score: 0, metrics: [] };
  const seo = auditData?.seo || { score: 0, metrics: [] };
  const contentPerf = auditData?.content || { score: 0, metrics: [] };
  const socialLocal = auditData?.socialLocal || { socialScore: 0, signals: [], platforms: [] };
  const entityData = auditData?.entity || { score: 0, metrics: [] };
  const aiSeoData = auditData?.aiSeo || { score: 0, metrics: [] };
  const places = auditData?.places || null;
  const keywordsData = auditData?.keywords || [];

  /* ── Pipeline Health: derived from tab scores ── */
  const pipelineHealth = {
    score: Math.round((webPerf.score * 0.3) + (seo.score * 0.3) + (contentPerf.score * 0.2) + (entityData.score * 0.2)),
    pillars: [
      { label: "Traffic Capture", score: seo.score, detail: `Based on your Authority & Search performance (${seo.score}/100)` },
      { label: "Lead Conversion", score: webPerf.score, detail: `Based on your Technical Foundation performance (${webPerf.score}/100)` },
      { label: "Attribution Integrity", score: 0, detail: "Revenue infrastructure tracking not yet connected" },
      { label: "Content Strategy", score: contentPerf.score, detail: `Based on your Content & Topical Depth performance (${contentPerf.score}/100)` },
      { label: "Brand Authority", score: entityData.score, detail: `Based on your Entity & Brand Authority performance (${entityData.score}/100)` },
    ],
  };

  /* ── Revenue Visibility Index ── */
  const revenueIndex = Math.round(
    (webPerf.score * 0.15) + (seo.score * 0.30) + (contentPerf.score * 0.20) +
    (entityData.score * 0.15) + (socialLocal.socialScore * 0.10) + (aiSeoData.score * 0.10)
  );

  /* ── Revenue Scenarios: based on real organic traffic ── */
  const orgTrafficMetric = seo.metrics?.find(m => m.label === "Organic Traffic" || m.label === "Organic Keywords");
  const traffic = parseInt(String(orgTrafficMetric?.value || "0").replace(/[^0-9]/g, '')) || 0;
  const avgDeal = 4200;
  const revenueScenarios = {
    traffic: traffic,
    avgDeal: avgDeal,
    conservative: { lift: 0.10, cvr: 0.015, label: "Conservative" },
    expected:     { lift: 0.30, cvr: 0.028, label: "Expected" },
    aggressive:   { lift: 0.50, cvr: 0.040, label: "Aggressive" },
  };
  function calcScenario(s) {
    const added = Math.round(revenueScenarios.traffic * s.lift);
    const leads = Math.round(added * s.cvr);
    const pipeline = leads * revenueScenarios.avgDeal;
    return { added, leads, pipeline };
  }

  /* ── Competitor data: from SEMrush rank history or not shown ── */
  const rankHistory = auditData?.seo?.rankHistory || [];
  const hasTrendData = rankHistory.length >= 2;

  /* ── Revenue Infrastructure: "Not Connected" since no backend data ── */
  const revenueInfraMetrics = [
    { label: "GA4 Installed & Firing", value: "Not Connected", status: "warning", detail: "Connect analytics to measure this metric" },
    { label: "Primary Conversion Events Configured", value: "Not Connected", status: "warning", detail: "Connect analytics to measure this metric" },
    { label: "Call Tracking Installed", value: "Not Connected", status: "warning", detail: "Connect call tracking to measure this metric" },
    { label: "CRM Integration / Lead Sync", value: "Not Connected", status: "warning", detail: "Connect CRM to measure this metric" },
    { label: "GTM Container Active", value: "Not Connected", status: "warning", detail: "Connect tag management to measure this metric" },
    { label: "UTM Capture on Forms", value: "Not Connected", status: "warning", detail: "Connect form tracking to measure this metric" },
    { label: "Enhanced Conversions / Offline Import", value: "Not Connected", status: "warning", detail: "Connect conversion tracking to measure this metric" },
    { label: "Consent Mode / Tracking Integrity", value: "Not Connected", status: "warning", detail: "Connect consent mode to measure this metric" },
  ];
  const revenueInfraScore = 0; // No backend data yet

  /* ── Reviews: from Google Places if available ── */
  const reviews = places?.reviews || [];

  /* ── Inbound Pipeline Health Banner ── */
  function InboundPipelineHealth() {
    const s = pipelineHealth;
    function barColor(score) {
      if (score >= 70) return brand.talentTeal;
      if (score >= 50) return brand.inboundOrange;
      return brand.pipelineRed;
    }
    return (
      <div style={{
        background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 16,
        padding: 0, marginBottom: 28, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "28px 28px 0", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginBottom: 8 }}>
            Inbound Pipeline Health
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
            <span style={{
              fontSize: 56, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
              color: barColor(s.score), lineHeight: 1,
            }}>{s.score}</span>
            <span style={{ fontSize: 18, color: t.subtle, fontWeight: 500 }}>/100</span>
          </div>
          <div style={{
            fontSize: 13, color: t.body, lineHeight: 1.5, maxWidth: 440, margin: "12px auto 0",
          }}>
            {s.score < 50
              ? "Your inbound pipeline has significant gaps. Leads are being lost between traffic, conversion, and follow-up."
              : s.score < 70
              ? "Your pipeline captures some demand but leaks at multiple stages. Optimization would recover meaningful revenue."
              : "Your pipeline infrastructure is solid. Fine-tuning will maximize conversion at every stage."}
          </div>
        </div>

        {/* Pillar Bars */}
        <div style={{ padding: "24px 28px 28px" }}>
          {s.pillars.map((p, i) => (
            <div key={i} style={{ marginBottom: i < s.pillars.length - 1 ? 18 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{p.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: barColor(p.score) }}>{p.score}</span>
              </div>
              <div style={{ width: "100%", height: 8, borderRadius: 4, background: t.cardBorder, overflow: "hidden", marginBottom: 4 }}>
                <div style={{
                  width: `${p.score}%`, height: "100%", borderRadius: 4,
                  background: barColor(p.score),
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Revenue Visibility Banner ── */
  function RevenueVisibilityBanner() {
    const score = revenueIndex;
    const verdict = getRevenueVerdict(score);
    const color = score >= 80 ? brand.talentTeal : score >= 60 ? brand.inboundOrange : brand.pipelineRed;
    const glowColor = score >= 80 ? "rgba(66,191,186,0.15)" : score >= 60 ? "rgba(244,111,10,0.15)" : "rgba(255,33,15,0.15)";
    const low = calcScenario(revenueScenarios.conservative);
    const mid = calcScenario(revenueScenarios.expected);
    const high = calcScenario(revenueScenarios.aggressive);
    return (
      <div style={{
        textAlign: "center", marginBottom: 32, padding: "32px 24px 28px",
        background: t.cardBg, border: "1px solid " + t.cardBorder, borderRadius: 14,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, " + color + ", " + brand.inboundOrange + ")",
        }} />
        <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 3, fontWeight: 600, marginBottom: 14 }}>
          Revenue Visibility Index
        </div>
        <div style={{
          fontSize: 72, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
          color: color, lineHeight: 1, marginBottom: 4,
          textShadow: "0 0 30px " + glowColor,
        }}>
          {score}
          <span style={{ fontSize: 24, color: t.subtle, fontWeight: 400 }}> / 100</span>
        </div>
        <div style={{
          fontSize: 15, color: t.body, fontWeight: 500, marginTop: 14,
          letterSpacing: 0.2, lineHeight: 1.5, maxWidth: 520, margin: "14px auto 0",
        }}>
          {verdict}
        </div>
        {/* Pipeline Range */}
        {traffic > 0 && (
          <div style={{
            marginTop: 24, paddingTop: 20, borderTop: "1px solid " + t.cardBorder,
          }}>
            <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginBottom: 14, textAlign: "center" }}>
              Monthly Pipeline You{"'"}re Leaving on the Table
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed }}>
                ${low.pipeline.toLocaleString()}
              </span>
              <span style={{ fontSize: 20, color: t.subtle, fontWeight: 500 }}>{"\u2013"}</span>
              <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed }}>
                ${high.pipeline.toLocaleString()}
              </span>
            </div>
            {/* Scenario breakdown */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 16, marginTop: 18, flexWrap: "wrap",
            }}>
              {[
                { ...low, ...revenueScenarios.conservative, color: t.subtle },
                { ...mid, ...revenueScenarios.expected, color: brand.inboundOrange },
                { ...high, ...revenueScenarios.aggressive, color: brand.talentTeal },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "10px 16px", borderRadius: 8,
                  background: i === 1 ? t.toggleBg : "transparent",
                  border: "1px solid " + (i === 1 ? t.cardBorder : "transparent"),
                  textAlign: "center", minWidth: 130,
                }}>
                  <div style={{ fontSize: 9, color: s.color, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.text }}>
                    ${s.pipeline.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: t.subtle, marginTop: 2 }}>
                    +{s.added} visits {"\u00B7"} {s.leads} leads
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: t.subtle, marginTop: 14, letterSpacing: 0.3, textAlign: "center" }}>
              Scenarios: {revenueScenarios.conservative.lift * 100}%/{revenueScenarios.expected.lift * 100}%/{revenueScenarios.aggressive.lift * 100}% visibility lift &nbsp;{"\u00B7"}&nbsp; {revenueScenarios.conservative.cvr * 100}%/{revenueScenarios.expected.cvr * 100}%/{revenueScenarios.aggressive.cvr * 100}% CVR &nbsp;{"\u00B7"}&nbsp; ${revenueScenarios.avgDeal.toLocaleString()} avg deal
            </div>
          </div>
        )}
        {traffic === 0 && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid " + t.cardBorder }}>
            <div style={{ fontSize: 12, color: t.subtle, fontStyle: "italic" }}>
              Revenue pipeline scenarios will appear when organic traffic data is available.
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Competitor Comparison Table ── */
  function CompetitorComparisonTable() {
    // Build competitor data from SEMrush metrics
    const findMetric = (label) => seo.metrics?.find(m => m.label === label);
    const kwMetric = findMetric("Organic Keywords");
    const daMetric = findMetric("Domain Authority");
    const blMetric = findMetric("Backlinks");
    const trafficMetric = findMetric("Organic Traffic");

    const competitorData = [];
    if (kwMetric) competitorData.push({ metric: "Organic Keywords", you: String(kwMetric.value), competitor: "Not Connected", youWins: false });
    if (daMetric) competitorData.push({ metric: "Domain Authority", you: String(daMetric.value), competitor: "Not Connected", youWins: false });
    if (blMetric) competitorData.push({ metric: "Backlinks", you: String(blMetric.value), competitor: "Not Connected", youWins: false });
    if (trafficMetric) competitorData.push({ metric: "Monthly Traffic (est.)", you: String(trafficMetric.value), competitor: "Not Connected", youWins: false });

    if (competitorData.length === 0) return null;

    return (
      <Card title="Competitive Gap Snapshot" t={t}>
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 100px 100px", padding: "10px 18px",
            borderBottom: "1px solid " + t.cardBorder, gap: 8,
          }}>
            {["Metric", "You", "Competitor"].map(h => (
              <span key={h} style={{
                fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
                textAlign: h === "Metric" ? "left" : "center",
              }}>{h}</span>
            ))}
          </div>
          {competitorData.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 100px 100px", alignItems: "center",
              padding: "13px 18px", borderBottom: "1px solid " + t.cardBorder, gap: 8,
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{row.metric}</span>
              <span style={{
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                textAlign: "center", color: t.text,
              }}>{row.you}</span>
              <span style={{
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                textAlign: "center", color: t.subtle,
              }}>{row.competitor}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  /* ── Competitive Velocity Card ── */
  function TrendVelocityCard() {
    if (!hasTrendData) return null;

    // Build trend arrays from rank history
    const kwArr = rankHistory.map(m => m.keywords || 0);
    const trafficArr = rankHistory.map(m => m.traffic || 0);
    const blArr = rankHistory.map(m => m.backlinks || 0);
    const labels = rankHistory.map(m => m.month || "");

    const youKwGrowth = calcGrowth(kwArr);
    const youTrafficGrowth = calcGrowth(trafficArr);
    const youBlGrowth = calcGrowth(blArr);

    const rows = [
      { metric: "Keyword Growth", you: youKwGrowth, data: kwArr },
      { metric: "Traffic Growth", you: youTrafficGrowth, data: trafficArr },
      { metric: "Backlink Growth", you: youBlGrowth, data: blArr },
    ];

    function Spark({ data, color }) {
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const w = 80, h = 24;
      const points = data.map((v, i) =>
        (i / (data.length - 1)) * w + "," + (h - ((v - min) / range) * h)
      ).join(" ");
      return (
        <svg width={w} height={h} style={{ display: "block" }}>
          <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    return (
      <Card title="Growth Velocity" t={t}>
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 100px 80px", padding: "10px 18px",
            borderBottom: "1px solid " + t.cardBorder, gap: 8,
          }}>
            {["Metric", "Growth", "Trend"].map((h, i) => (
              <span key={i} style={{
                fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
                textAlign: i === 0 ? "left" : "center",
              }}>{h}</span>
            ))}
          </div>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 100px 80px", alignItems: "center",
              padding: "13px 18px", borderBottom: "1px solid " + t.cardBorder, gap: 8,
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{row.metric}</span>
              <span style={{
                fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                textAlign: "center", color: row.you >= 0 ? brand.talentTeal : brand.pipelineRed,
              }}>{row.you >= 0 ? "+" : ""}{row.you}%</span>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Spark data={row.data} color={row.you >= 0 ? brand.talentTeal : brand.pipelineRed} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  /* ── Tab Renderers (inside component for closure access) ── */

  function WebPerformanceTab() {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <ScoreRing score={webPerf.score} size={140} t={t} />
          <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Technical Foundation Score</div>
        </div>
        <Card title="Performance Metrics" t={t}>
          {webPerf.metrics.filter(m => m.status !== "good").map((m, i) => (
            <MetricRow key={i} {...m} t={t} />
          ))}
          <FoundationalCollapsible items={webPerf.metrics.filter(m => m.status === "good")} t={t} />
        </Card>

        {auditData?.gtmetrixReportUrl && (
          <Card title="GTmetrix Report" t={t}>
            <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: t.subtle }}>Full Report:</span>
              <a href={auditData.gtmetrixReportUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: accent, textDecoration: "none", fontWeight: 500 }}>
                View on GTmetrix {"\u2192"}
              </a>
            </div>
          </Card>
        )}

        <Card title="Recommendations" t={t}>
          <RecommendationList t={t} items={buildRecommendations(webPerf.metrics, "webPerf")} />
        </Card>
      </div>
    );
  }

  function SEOTab() {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <ScoreRing score={seo.score} size={140} t={t} />
          <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Authority & Search Score</div>
        </div>

        {/* Competitor Comparison */}
        <CompetitorComparisonTable />

        {/* Competitive Velocity */}
        <TrendVelocityCard />

        <Card title="Search Authority Metrics" t={t}>
          {seo.metrics.filter(m => m.status !== "good").map((m, i) => <MetricRow key={i} {...m} t={t} />)}
          <FoundationalCollapsible items={seo.metrics.filter(m => m.status === "good")} t={t} />
        </Card>

        {/* Keywords Table */}
        {keywordsData.length > 0 && (
          <Card title="Top Performing Search Terms" t={t}>
            <div>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 80px", padding: "10px 18px",
                borderBottom: `1px solid ${t.cardBorder}`, gap: 8,
              }}>
                {["Keyword", "Position", "Volume", "Traffic", "Difficulty"].map(h => (
                  <span key={h} style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
                    textAlign: h === "Keyword" ? "left" : "center" }}>{h}</span>
                ))}
              </div>
              {keywordsData.map((kw, i) => {
                const posColor = kw.position <= 5 ? brand.talentTeal : kw.position <= 10 ? brand.inboundOrange : brand.pipelineRed;
                const diffColor = kw.difficulty <= 35 ? brand.talentTeal : kw.difficulty <= 60 ? brand.inboundOrange : brand.pipelineRed;
                return (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 80px", alignItems: "center",
                    padding: "12px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 8, transition: "background 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{kw.keyword}</span>
                    <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: posColor, fontWeight: 600 }}>#{kw.position}</span>
                    <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.body }}>{(kw.volume || 0).toLocaleString()}</span>
                    <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.body }}>{(kw.traffic || 0).toLocaleString()}</span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <div style={{ width: 36, height: 5, borderRadius: 3, background: t.cardBorder, overflow: "hidden" }}>
                        <div style={{ width: `${kw.difficulty || 0}%`, height: "100%", borderRadius: 3, background: diffColor }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: diffColor, fontWeight: 600 }}>{kw.difficulty || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Recommendations" t={t}>
          <RecommendationList t={t} items={buildRecommendations(seo.metrics, "seo")} />
        </Card>
      </div>
    );
  }

  function ContentPerformanceTab() {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <ScoreRing score={contentPerf.score} size={140} t={t} />
          <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Content & Topical Depth Score</div>
        </div>
        <Card title="Content Metrics" t={t}>
          {contentPerf.metrics.map((m, i) => (
            <MetricRow key={i} {...m} t={t} />
          ))}
        </Card>
        <Card title="Recommendations" t={t}>
          <RecommendationList t={t} items={buildRecommendations(contentPerf.metrics, "content")} />
        </Card>
      </div>
    );
  }

  function EntityBrandTab() {
    const combinedScore = Math.round(
      (entityData.score * 0.5) +
      ((socialLocal.socialScore || 0) * 0.3) +
      ((aiSeoData.score || 0) * 0.2)
    );
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <ScoreRing score={combinedScore} size={140} t={t} />
          <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Entity & Brand Authority Score</div>
        </div>

        <Card title="Entity & Schema Signals" t={t}>
          {entityData.metrics.length > 0
            ? entityData.metrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)
            : <div style={{ padding: "20px 18px", color: t.subtle, fontSize: 13 }}>Entity data not yet connected.</div>
          }
        </Card>

        {/* AI SEO Metrics */}
        {aiSeoData.metrics.length > 0 && (
          <Card title="AI Visibility Signals" t={t}>
            {aiSeoData.metrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
          </Card>
        )}

        {socialLocal.platforms.length > 0 && (
          <Card title="Platform Presence" t={t}>
            <div>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", padding: "10px 18px",
                borderBottom: `1px solid ${t.cardBorder}`, gap: 8,
              }}>
                {["Platform", "Status", "Followers", "Activity"].map(h => (
                  <span key={h} style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
                    textAlign: h === "Activity" ? "right" : h === "Status" || h === "Followers" ? "center" : "left" }}>{h}</span>
                ))}
              </div>
              {socialLocal.platforms.map((p, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", alignItems: "center",
                  padding: "12px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 8, transition: "background 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: statusColor(p.health), textAlign: "center", fontWeight: 600 }}>{p.status}</span>
                  <span style={{ fontSize: 12, color: t.body, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{p.followers || "\u2014"}</span>
                  <span style={{ fontSize: 11, color: t.subtle, textAlign: "right" }}>{p.activity || "\u2014"}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {socialLocal.signals.length > 0 && (
          <Card title="Social SEO Signals" t={t}>
            {socialLocal.signals.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
          </Card>
        )}

        <Card title="Recommendations" t={t}>
          <RecommendationList t={t} items={buildRecommendations([...entityData.metrics, ...aiSeoData.metrics], "entity")} />
        </Card>
      </div>
    );
  }

  function RevenueAttributionTab() {
    const currentTraffic = revenueScenarios.traffic;
    const low = calcScenario(revenueScenarios.conservative);
    const mid = calcScenario(revenueScenarios.expected);
    const high = calcScenario(revenueScenarios.aggressive);
    const currentLeads = Math.round(currentTraffic * revenueScenarios.expected.cvr);
    const currentPipeline = currentLeads * revenueScenarios.avgDeal;
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <ScoreRing score={revenueInfraScore} size={140} t={t} />
          <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Revenue Infrastructure Score</div>
          {(() => {
            const s = revenueInfraScore;
            const tier = s < 50
              ? { icon: "\uD83D\uDD34", label: "High Revenue Leakage Risk", detail: "Attribution gaps likely causing under-reported performance", color: brand.pipelineRed, bg: "rgba(255,33,15,0.08)", border: "rgba(255,33,15,0.18)" }
              : s < 75
              ? { icon: "\uD83D\uDFE0", label: "Moderate Visibility, Incomplete Attribution", detail: "Some tracking in place but significant gaps remain", color: brand.inboundOrange, bg: "rgba(244,111,10,0.08)", border: "rgba(244,111,10,0.18)" }
              : { icon: "\uD83D\uDFE2", label: "Strong Infrastructure, Ready to Scale", detail: "Attribution stack can support increased traffic investment", color: brand.talentTeal, bg: "rgba(66,191,186,0.08)", border: "rgba(66,191,186,0.18)" };
            return (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginTop: 12, padding: "8px 16px", borderRadius: 8,
                background: tier.bg, border: "1px solid " + tier.border,
              }}>
                <span style={{ fontSize: 14 }}>{tier.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.label}</div>
                  <div style={{ fontSize: 10, color: t.subtle, lineHeight: 1.3 }}>{tier.detail}</div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Attribution Infrastructure */}
        <div style={{ fontSize: 14, color: t.body, lineHeight: 1.6, padding: "0 4px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          Increasing traffic without reliable attribution creates invisible revenue. Before scaling visibility, your infrastructure must accurately capture, track, and attribute every lead.
        </div>

        <Card title="Revenue Infrastructure Health" t={t}>
          {revenueInfraMetrics.map((m, i) => (
            <MetricRow key={i} {...m} t={t} />
          ))}
        </Card>

        {/* Scenario Model */}
        {traffic > 0 && (
          <Card title="Revenue Impact Model" t={t}>
            <div>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 100px", padding: "10px 18px",
                borderBottom: `1px solid ${t.cardBorder}`, gap: 6,
              }}>
                {["Metric", "Current", "Conservative", "Expected", "Aggressive"].map(h => (
                  <span key={h} style={{
                    fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600,
                    textAlign: h === "Metric" ? "left" : "center",
                  }}>{h}</span>
                ))}
              </div>
              {[
                { metric: "Added Visits / mo", current: "\u2014", con: "+" + low.added, exp: "+" + mid.added, agg: "+" + high.added },
                { metric: "New Leads / mo", current: currentLeads.toString(), con: "+" + low.leads, exp: "+" + mid.leads, agg: "+" + high.leads },
                { metric: "Pipeline / mo", current: "$" + currentPipeline.toLocaleString(), con: "+$" + low.pipeline.toLocaleString(), exp: "+$" + mid.pipeline.toLocaleString(), agg: "+$" + high.pipeline.toLocaleString() },
                { metric: "Pipeline / yr", current: "$" + (currentPipeline * 12).toLocaleString(), con: "+$" + (low.pipeline * 12).toLocaleString(), exp: "+$" + (mid.pipeline * 12).toLocaleString(), agg: "+$" + (high.pipeline * 12).toLocaleString() },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 100px", alignItems: "center",
                  padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 6,
                }}>
                  <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{row.metric}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.subtle }}>{row.current}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.body }}>{row.con}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: brand.inboundOrange }}>{row.exp}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: brand.talentTeal }}>{row.agg}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div style={{
          padding: "12px 16px", background: t.toggleBg, borderRadius: 8, border: "1px solid " + t.cardBorder,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600, marginBottom: 2 }}>
            Assumptions
          </div>
          <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.6 }}>
            <span style={{ color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>30%</span> visibility improvement &nbsp;{"\u00B7"}&nbsp;
            <span style={{ color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>2.8%</span> site conversion rate &nbsp;{"\u00B7"}&nbsp;
            <span style={{ color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>$4,200</span> avg deal size
          </div>
        </div>

        {/* Review Sentiment */}
        {reviews.length > 0 && (
          <Card title="Review Sentiment" t={t}>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.map((review, i) => (
                <div key={i} style={{ borderBottom: i < reviews.length - 1 ? `1px solid ${t.cardBorder}` : "none", paddingBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{review.author || review.author_name || "Anonymous"}</span>
                    <span style={{ color: brand.inboundOrange, fontSize: 13 }}>
                      {"\u2605".repeat(review.rating || 0)}{"\u2606".repeat(5 - (review.rating || 0))}
                    </span>
                    <span style={{ fontSize: 11, color: t.subtle }}>{review.timeAgo || review.relative_time_description || ""}</span>
                  </div>
                  <p style={{ fontSize: 13, color: t.body, margin: 0, lineHeight: 1.5 }}>{review.text}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {places && !reviews.length && (
          <Card title="Review Sentiment" t={t}>
            <div style={{ padding: "20px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: t.text, fontWeight: 600, marginBottom: 6 }}>
                {places.name || "Business"} {"\u2014"} {places.rating || 0}{"\u2605"} ({places.reviewCount || 0} reviews)
              </div>
              <div style={{ fontSize: 12, color: t.subtle }}>Individual reviews not available from this data source.</div>
            </div>
          </Card>
        )}

        <Card title="Recommendations" t={t}>
          <RecommendationList t={t} items={[
            "Connect Google Analytics to verify tracking is installed and firing correctly",
            "Configure form submission and call events as conversions to measure lead generation",
            "Add UTM hidden fields to every form to attribute leads to their traffic source",
            "Connect a CRM (HubSpot, Salesforce, or webhook) to sync leads into your sales pipeline automatically",
          ]} />
        </Card>
      </div>
    );
  }

  /* ── Build dynamic recommendations from metric statuses ── */
  function buildRecommendations(metrics, category) {
    const poor = metrics.filter(m => m.status === "poor");
    const warning = metrics.filter(m => m.status === "warning");
    const recs = [];

    // Use the metric's own "fix" field if present, otherwise generate from label
    [...poor, ...warning].slice(0, 4).forEach(m => {
      if (m.fix) {
        recs.push(m.fix);
      } else if (m.why) {
        recs.push(`${m.label}: ${m.why}`);
      } else if (m.detail) {
        recs.push(`${m.label} \u2014 ${m.detail}`);
      } else {
        recs.push(`Improve ${m.label} (currently: ${m.value})`);
      }
    });

    // Fallback recommendations by category if no real ones
    if (recs.length === 0) {
      const defaults = {
        webPerf: ["Your technical foundation looks solid. Continue monitoring Core Web Vitals and page speed."],
        seo: ["Your search authority metrics are healthy. Focus on expanding keyword coverage."],
        content: ["Content performance is strong. Maintain your publishing cadence."],
        entity: ["Your entity and brand signals are established. Look for opportunities to strengthen schema and structured data."],
      };
      return defaults[category] || ["No issues detected in this category."];
    }
    return recs;
  }

  /* ── Tab Content Array ── */
  const tabContent = [
    <WebPerformanceTab key="wp" />,
    <SEOTab key="seo" />,
    <ContentPerformanceTab key="content" />,
    <EntityBrandTab key="entity" />,
    <RevenueAttributionTab key="revenue" />,
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bgGrad, color: t.text,
      fontFamily: "'Barlow', 'Helvetica Neue', sans-serif",
      transition: "background 0.4s, color 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.scrollHover}; }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 20px" }}>

        {/* -- Top Bar: Logo left, Mode toggle right -- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <AbstraktLogo fill={t.logoFill} height={26} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {onReset && (
              <button onClick={onReset} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${t.toggleBorder}`, background: t.toggleBg,
                color: t.subtle, fontSize: 12, fontWeight: 500, cursor: "pointer",
                transition: "all 0.25s", letterSpacing: 0.3,
              }}>
                {"\u2190"} New Audit
              </button>
            )}
            <ModeToggle mode={mode} setMode={setMode} t={t} />
          </div>
        </div>

        {/* -- Header -- */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 20,
            background: t.badgeBg, border: `1px solid ${t.badgeBorder}`,
            fontSize: 11, color: t.badgeText, textTransform: "uppercase", letterSpacing: 2.5, fontWeight: 600,
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.badgeDot, boxShadow: `0 0 8px rgba(239,239,239,0.3)` }} />
            Abstrakt Marketing Group
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 10,
            color: t.text,
          }}>
            Digital Visibility &<br />Performance Audit
          </h1>
          {auditData?.meta?.companyName && (
            <p style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 }}>
              {auditData.meta.companyName}
            </p>
          )}
          {auditData?.meta?.url && (
            <p style={{ fontSize: 12, color: accent, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
              {auditData.meta.url}
            </p>
          )}
          <p style={{ fontSize: 14, color: t.subtle, letterSpacing: 0.3 }}>How much revenue is your digital presence leaving on the table?</p>
        </div>

        {/* Inbound Pipeline Health */}
        <InboundPipelineHealth />

        {/* Revenue Visibility Score */}
        <RevenueVisibilityBanner />

        {/* Tab Bar */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 30, overflowX: "auto",
          padding: "5px", background: t.toggleBg, borderRadius: 12,
          border: `1px solid ${t.cardBorder}`,
        }}>
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{
              flex: "0 0 auto", padding: "10px 16px", borderRadius: 8, border: "none",
              background: i === activeTab ? `linear-gradient(135deg, ${accent}, ${accentAlt})` : "transparent",
              color: i === activeTab ? "#fff" : t.subtle,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.25s", letterSpacing: 0.3,
              boxShadow: i === activeTab ? "0 2px 10px rgba(66,191,186,0.2)" : "none",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {tabContent[activeTab]}

        {/* Export Actions */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 12, marginTop: 32,
          flexWrap: "wrap",
        }}>
          <button onClick={() => alert("PDF download will be available soon.")} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10,
            border: `1px solid ${t.cardBorder}`, background: t.cardBg,
            color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.25s", letterSpacing: 0.3,
            backdropFilter: "blur(8px)",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = t.hoverRow; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.background = t.cardBg; }}
          >
            <span style={{ fontSize: 16 }}>{"\u2193"}</span>
            Download PDF
          </button>
          <button onClick={() => alert("Email delivery will be available soon.")} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10,
            border: `1px solid ${t.cardBorder}`, background: t.cardBg,
            color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.25s", letterSpacing: 0.3,
            backdropFilter: "blur(8px)",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = t.hoverRow; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.background = t.cardBg; }}
          >
            <span style={{ fontSize: 16 }}>{"\u2709"}</span>
            Email Report
          </button>
        </div>

        {/* CTA */}
        {(() => {
          const ctaLow = calcScenario(revenueScenarios.conservative);
          const ctaHigh = calcScenario(revenueScenarios.aggressive);
          const ctaScore = revenueIndex;
          return (
            <div style={{
              textAlign: "center", marginTop: 40, padding: "44px 24px",
              background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -60, right: -60, width: 200, height: 200,
                background: "radial-gradient(circle, rgba(255,33,15,0.08) 0%, transparent 70%)", borderRadius: "50%",
              }} />
              <div style={{
                position: "absolute", bottom: -40, left: -40, width: 160, height: 160,
                background: "radial-gradient(circle, rgba(66,191,186,0.06) 0%, transparent 70%)", borderRadius: "50%",
              }} />
              <h3 style={{
                fontSize: 22, fontWeight: 700, marginBottom: 14, position: "relative",
                color: brand.pipelineRed, lineHeight: 1.3,
              }}>
                {traffic > 0
                  ? <>You{"'"}re Leaving ${ctaLow.pipeline.toLocaleString()}{"\u2013"}${ctaHigh.pipeline.toLocaleString()} in Monthly Pipeline Untapped</>
                  : <>Your Digital Visibility Needs Attention</>
                }
              </h3>
              <p style={{ fontSize: 15, color: t.body, marginBottom: 28, maxWidth: 520, margin: "0 auto 28px", position: "relative", lineHeight: 1.6 }}>
                Your Revenue Visibility Index is <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed }}>{ctaScore}/100</span>. {ctaScore < 70 ? "Competitors are capturing the demand you're missing." : "Targeted improvements can accelerate your pipeline growth."} Let{"'"}s capture it.
              </p>
              <button style={{
                padding: "15px 40px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                letterSpacing: 0.5, position: "relative",
                boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
              }}>
                Get Your Personalized Strategy {"\u2192"}
              </button>
            </div>
          );
        })()}

        <div style={{
          textAlign: "center", padding: "28px", color: t.subtle, fontSize: 10,
          textTransform: "uppercase", letterSpacing: 1.5, marginTop: 20,
        }}>
          Built by Abstrakt Marketing Group | Digital Visibility & Performance Audit
        </div>
      </div>
    </div>
  );
}
