import { useState } from "react";

/* ── Brand Palette ── */
const brand = {
  growthGray: "#333333",
  pipelineRed: "#FF210F",
  creativePink: "#F725A2",
  inboundOrange: "#F46F0A",
  cloudBlue: "#0481A3",
  talentTeal: "#42BFBA",
  lightGray: "#EFEFEF",
  enterpriseMaroon: "#8C082B",
};

const accent = brand.talentTeal;
const accentAlt = brand.cloudBlue;

/* ── Theme: now provided via props from app/page.js ── */

/* ── Growth-Narrative Tabs ── */
const tabs = [
  "Technical Foundation",
  "Authority & Search",
  "Competitors",
  "Content & Topical Depth",
  "Entity & Brand Authority",
  "Revenue & Attribution",
];


/* ── Revenue Scenarios Config ── */
const revenueScenarios = {
  conservative: {
    label: "Conservative",
    color: brand.cloudBlue,
    monthlyVisitors: 1200,
    conversionRate: 0.015,
    closeRate: 0.15,
    avgDealSize: 2800,
  },
  expected: {
    label: "Expected",
    color: brand.inboundOrange,
    monthlyVisitors: 1200,
    conversionRate: 0.028,
    closeRate: 0.22,
    avgDealSize: 3200,
  },
  aggressive: {
    label: "Aggressive",
    color: brand.talentTeal,
    monthlyVisitors: 1200,
    conversionRate: 0.045,
    closeRate: 0.32,
    avgDealSize: 4100,
  },
};

function calcScenario(s) {
  const leads = Math.round(s.monthlyVisitors * s.conversionRate);
  const closedDeals = Math.round(leads * s.closeRate);
  const monthlyRevenue = closedDeals * s.avgDealSize;
  return { leads, closedDeals, monthlyRevenue };
}

/* ── Revenue Visibility Index Weights (B2B) ── */
const rviWeights = {
  searchAuthority: 0.30,
  content: 0.20,
  infrastructure: 0.20,
  technical: 0.15,
  entity: 0.15,
};



const competitiveVelocity = [
  { month: "Mar", you: 28, comp: 41 },
  { month: "Apr", you: 31, comp: 44 },
  { month: "May", you: 30, comp: 48 },
  { month: "Jun", you: 33, comp: 51 },
  { month: "Jul", you: 32, comp: 55 },
  { month: "Aug", you: 35, comp: 58 },
  { month: "Sep", you: 34, comp: 62 },
  { month: "Oct", you: 36, comp: 65 },
  { month: "Nov", you: 37, comp: 68 },
  { month: "Dec", you: 38, comp: 71 },
  { month: "Jan", you: 36, comp: 73 },
  { month: "Feb", you: 32, comp: 75 },
];



/* ── Mock Data: Revenue Infrastructure (8 pass/fail) ── */
const attributionChecks = [
  { label: "Google Analytics 4 Installed", pass: true,  source: "measured",  impact: "high",   detail: "GA4 property detected and firing on key pages" },
  { label: "Conversion Goals Configured",  pass: false, source: "measured",  impact: "high",   detail: "No conversion events detected in GA4" },
  { label: "Google Search Console Connected", pass: true, source: "measured", impact: "medium", detail: "GSC verified and data flowing" },
  { label: "Call Tracking Active",         pass: false, source: "measured",  impact: "high",   detail: "No dynamic number insertion detected" },
  { label: "CRM / Form Lead Capture",      pass: true,  source: "measured",  impact: "high",   detail: "Contact form detected — CRM sync unconfirmed" },
  { label: "UTM Parameter Usage",          pass: false, source: "estimated", impact: "medium", detail: "Paid and email links not consistently tagged" },
  { label: "Remarketing Pixel Active",     pass: false, source: "measured",  impact: "medium", detail: "No Meta or Google remarketing pixel found" },
  { label: "Thank-You Page Tracking",      pass: false, source: "measured",  impact: "high",   detail: "Form submissions not tracked as conversions" },
];

/* ── Status Helpers ── */
function statusColor(s) {
  if (s === "good") return brand.talentTeal;
  if (s === "warning") return brand.inboundOrange;
  return brand.pipelineRed;
}
function statusIcon(s) {
  if (s === "good") return "✓";
  if (s === "warning") return "!";
  return "✗";
}

/* ── Source Badge ── */
function SourceBadge({ source }) {
  const config = {
    measured: { label: "Measured", color: brand.talentTeal },
    estimated: { label: "Estimated", color: brand.inboundOrange },
    assumed: { label: "Assumed", color: brand.cloudBlue },
  };
  const c = config[source] || config.assumed;
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, color: c.color,
      background: `${c.color}18`, border: `1px solid ${c.color}33`,
      padding: "2px 6px", borderRadius: 4,
      textTransform: "uppercase", letterSpacing: 0.8, flexShrink: 0,
    }}>{c.label}</span>
  );
}

/* ── Weight Badge ── */
function WeightBadge({ impact }) {
  if (!impact || impact === "medium") return null;
  const isHigh = impact === "high";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700,
      color: isHigh ? brand.cloudBlue : brand.growthGray,
      background: isHigh ? "rgba(4,129,163,0.1)" : "rgba(51,51,51,0.08)",
      border: `1px solid ${isHigh ? "rgba(4,129,163,0.2)" : "rgba(51,51,51,0.15)"}`,
      padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
    }}>{isHigh ? "High Impact" : "Low Impact"}</span>
  );
}

/* ── Abstrakt Logo SVG ── */
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

/* ── Shared Components ── */
function ScoreRing({ score, size = 130, t }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? brand.talentTeal : score >= 45 ? brand.inboundOrange : brand.pipelineRed;
  const glowColor = score >= 70 ? "rgba(66,191,186,0.25)" : score >= 45 ? "rgba(244,111,10,0.25)" : "rgba(255,33,15,0.25)";
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto 14px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 12px ${glowColor})` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="9" />
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

function MetricRow({ label, value, status, detail, impact, source, estimated, t }) {
  // API metrics carry `estimated: true` on unmeasurable signals; old mock
  // constants used `source: "measured"|"estimated"`. Translate either into
  // a single effective badge so both data sources render correctly.
  const effectiveSource = source || (estimated ? "estimated" : null);
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`,
      transition: "background 0.2s", cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: detail ? 3 : 0 }}>
          <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{label}</span>
          {impact && <WeightBadge impact={impact} />}
          {effectiveSource && <SourceBadge source={effectiveSource} />}
        </div>
        {detail && <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{detail}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 12 }}>
        <span style={{ fontSize: 13, color: t.body, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
        <span style={{
          width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#fff", background: statusColor(status),
        }}>{statusIcon(status)}</span>
      </div>
    </div>
  );
}

/* ── Provider Notice ── Inline notice shown inside a tab when a data source is missing/failed */
function ProviderNotice({ message, t }) {
  if (!message) return null;
  return (
    <div style={{
      padding: "12px 16px",
      marginBottom: 16,
      borderRadius: 10,
      background: "rgba(244,111,10,0.06)",
      border: `1px solid rgba(244,111,10,0.20)`,
      fontSize: 12,
      lineHeight: 1.5,
      color: t.body,
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: -1 }}>ⓘ</span>
      <span>{message}</span>
    </div>
  );
}

/* ── Pending Providers Banner ── Shown at top of results when some providers are still processing or failed */
function PendingBanner({ pendingProviders, t }) {
  if (!pendingProviders || pendingProviders.length === 0) return null;
  const labels = {
    pageSpeed: "Page Speed", crawl: "Site Crawl", semrush: "SEMrush", places: "Google Business",
  };
  const names = pendingProviders.map(p => labels[p] || p).join(", ");
  return (
    <div style={{
      padding: "10px 16px",
      marginBottom: 20,
      borderRadius: 10,
      background: "rgba(4,129,163,0.06)",
      border: `1px solid rgba(4,129,163,0.20)`,
      fontSize: 12,
      lineHeight: 1.5,
      color: t.body,
      textAlign: "center",
    }}>
      <strong style={{ color: t.text }}>Partial data:</strong> {names} unavailable for this audit — scores reflect only measured signals.
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

function CollapsibleCard({ title, children, t, defaultOpen = true, style: s }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14,
      overflow: "hidden", backdropFilter: "blur(8px)", ...s,
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "14px 18px", borderBottom: open ? `1px solid ${t.cardBorder}` : "none",
          fontSize: 12, fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", userSelect: "none",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 3, height: 14, background: accent, borderRadius: 2, display: "inline-block" }} />
          {title}
        </div>
        <span style={{ fontSize: 14, color: t.subtle, transition: "transform 0.25s", display: "inline-block", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
      </div>
      {open && children}
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

/* ── Critical Fixes Block (3-item, bottom of every tab) ── */
function CriticalFixes({ items, t }) {
  // items: [{ title, reason }] — exactly 3
  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(255,33,15,0.05) 0%, rgba(244,111,10,0.03) 100%)`,
      border: `1px solid rgba(255,33,15,0.18)`, borderRadius: 14, overflow: "hidden",
    }}>
      <div style={{
        padding: "13px 18px", borderBottom: `1px solid rgba(255,33,15,0.12)`,
        fontSize: 12, fontWeight: 700, color: brand.pipelineRed,
        textTransform: "uppercase", letterSpacing: 2,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 3, height: 14, background: brand.pipelineRed, borderRadius: 2, display: "inline-block" }} />
        Critical Fixes — Start Here
      </div>
      {items.slice(0, 3).map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px",
          borderBottom: i < 2 ? `1px solid rgba(255,33,15,0.08)` : "none",
          transition: "background 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,33,15,0.03)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{
            width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            background: brand.pipelineRed,
          }}>{i + 1}</span>
          <div>
            <div style={{ fontSize: 14, color: t.text, fontWeight: 600, marginBottom: 3 }}>{item.title}</div>
            <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.5 }}>{item.reason}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Lead Capture Card ── */
function LeadCaptureCard({ t, compAvgTraffic, yourTraffic, gapMultiple }) {
  const monthlyLeadsLost = Math.round((compAvgTraffic - yourTraffic) * 0.038);
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden",
    }}>
      <div style={{
        padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`,
        fontSize: 12, fontWeight: 600, color: accent,
        textTransform: "uppercase", letterSpacing: 2,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 3, height: 14, background: accent, borderRadius: 2, display: "inline-block" }} />
        Leads Going to Competitors
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        {[
          { label: "Competitor Avg Traffic", value: compAvgTraffic.toLocaleString(), sub: "visits/mo", color: brand.pipelineRed },
          { label: "Your Traffic",           value: yourTraffic.toLocaleString(),    sub: "visits/mo", color: brand.inboundOrange },
          { label: "Leads You're Missing",   value: `~${monthlyLeadsLost}`,          sub: "per month",  color: brand.talentTeal },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: "22px 18px", textAlign: "center",
            borderRight: i < 2 ? `1px solid ${t.cardBorder}` : "none",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: stat.color, marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: t.subtle, marginTop: 4 }}>{stat.sub}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "12px 18px", borderTop: `1px solid ${t.cardBorder}`,
        background: `rgba(66,191,186,0.03)`, fontSize: 11, color: t.subtle,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 13, color: brand.inboundOrange }}>⚠</span>
        Your competitors are {gapMultiple}x more visible — every day without action is leads going to them.
      </div>
    </div>
  );
}

/* ── Dual-Line Sparkline (inline SVG) ── */
function DualSparkline({ data, width = 540, height = 80 }) {
  const allVals = data.flatMap(d => [d.you, d.comp]);
  const min = Math.min(...allVals) - 2;
  const max = Math.max(...allVals) + 2;
  const range = max - min || 1;
  const n = data.length;

  function toPoints(key) {
    return data.map((d, i) => {
      const x = (i / (n - 1)) * width;
      const y = height - ((d[key] - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  }

  const youPts = toPoints("you");
  const compPts = toPoints("comp");
  const lastYou = data[n - 1];
  const lastComp = data[n - 1];
  const lyx = width;
  const lyy = height - ((lastYou.you - min) / range) * height;
  const lcx = width;
  const lcy = height - ((lastComp.comp - min) / range) * height;

  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      <polyline points={compPts} fill="none" stroke={brand.pipelineRed} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" />
      <polyline points={youPts} fill="none" stroke={brand.talentTeal} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lyx} cy={lyy} r="4" fill={brand.talentTeal} />
      <circle cx={lcx} cy={lcy} r="4" fill={brand.pipelineRed} />
    </svg>
  );
}

/* ── Light/Dark Toggle: now handled by app/page.js ── */

/* ----------------------------------------
   TAB 1 — Technical Foundation
---------------------------------------- */
function TechnicalFoundationTab({ t, metrics = [] }) {
  const semrushIssues = [
    { issue: "Broken Internal Links", count: 23, severity: "high", detail: "Pages returning 4xx errors hurt crawlability and user experience" },
    { issue: "Slow Page Load (>3s)", count: 18, severity: "high", detail: "18 pages exceed the 3-second threshold — primarily image-heavy landing pages" },
    { issue: "Images Without Alt Text", count: 31, severity: "high", detail: "Missing alt attributes hurt accessibility and image search rankings" },
    { issue: "Missing Meta Descriptions", count: 14, severity: "medium", detail: "Pages without meta descriptions lose click-through potential in SERPs" },
    { issue: "Redirect Chains", count: 11, severity: "medium", detail: "Multiple sequential redirects (3+ hops) slowing crawl efficiency" },
    { issue: "Duplicate Title Tags", count: 9, severity: "medium", detail: "Identical titles across service pages reduce search differentiation" },
    { issue: "Mixed Content (HTTP/HTTPS)", count: 6, severity: "low", detail: "Some resources still loading over HTTP on secure pages" },
    { issue: "Orphan Pages", count: 4, severity: "low", detail: "Pages with no internal links — invisible to crawlers" },
  ];

  const quickFixes = [
    { issue: "Broken Navigation Link",    time: "2 minutes",  detail: "A nav link is returning a 404 — visitors and crawlers hit a dead end" },
    { issue: "Missing XML Sitemap",       time: "5 minutes",  detail: "No sitemap found — Google can't efficiently discover all your pages" },
    { issue: "Missing Meta Descriptions", time: "10 minutes", detail: "14 pages have no meta description — losing click-throughs in search results" },
    { issue: "Uncompressed Images",       time: "15 minutes", detail: "17 images not optimized — easy PageSpeed win with WebP conversion" },
    { issue: "Missing Alt Tags",          time: "20 minutes", detail: "31 images lack alt text — quick accessibility and SEO fix" },
  ];

  // Mock sr.competitors data — mirrors buildSEOMetrics() competitorSummary shape
  const competitorSummary = [
    { domain: "ridgemontconstruction.com",  traffic: 3200, keywords: 230 },
    { domain: "abccommercialbuilders.com",  traffic: 2700, keywords: 180 },
    { domain: "summitbuildgroup.com",       traffic: 1900, keywords: 140 },
    { domain: "pinnaclecontractors.com",    traffic: 1100, keywords: 95  },
    { domain: "yourwebsite.com",            traffic: 90,   keywords: 10, isYou: true },
  ];
  const maxTraffic = Math.max(...competitorSummary.map(c => c.traffic));

  return (
    <div style={{ display: "grid", gap: 24 }}>

      <Card title="Core Technical Metrics" t={t}>
        {metrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
      </Card>

      <Card title="SEMrush Site Health — Top Issues" t={t}>
        {semrushIssues.map((item, i) => {
          const sevColor = item.severity === "high" ? brand.pipelineRed : item.severity === "medium" ? brand.inboundOrange : brand.talentTeal;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`,
              transition: "background 0.2s", cursor: "default",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{item.issue}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                    padding: "2px 7px", borderRadius: 4,
                    color: sevColor, background: `${sevColor}18`, border: `1px solid ${sevColor}33`,
                  }}>{item.severity}</span>
                </div>
                <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4, marginTop: 3 }}>{item.detail}</div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: sevColor, minWidth: 36, textAlign: "right",
              }}>{item.count}</div>
            </div>
          );
        })}
      </Card>

      {/* Competitor Technical Benchmark */}
      <Card title="Competitor Technical Benchmark" t={t}>
        <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${t.cardBorder}`, background: "rgba(66,191,186,0.03)" }}>
          <p style={{ fontSize: 13, color: t.body, lineHeight: 1.6 }}>
            How your technical performance stacks up against competitors in your market.
            Data sourced from <strong style={{ color: t.text }}>SEMrush sr.competitors</strong>.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 100px", padding: "10px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 8 }}>
          {["Domain", "Est. Traffic/mo", "Keywords", "Share"].map(h => (
            <span key={h} style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{h}</span>
          ))}
        </div>
        {competitorSummary.map((c, i) => {
          const sharePct = Math.round((c.traffic / maxTraffic) * 100);
          const isYou = c.isYou;
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 110px 110px 100px",
              alignItems: "center", padding: "13px 18px", gap: 8,
              borderBottom: i < competitorSummary.length - 1 ? `1px solid ${t.cardBorder}` : "none",
              background: isYou ? "rgba(255,33,15,0.03)" : "transparent",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => !isYou && (e.currentTarget.style.background = t.hoverRow)}
              onMouseLeave={e => !isYou && (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: isYou ? brand.pipelineRed : brand.talentTeal,
                }} />
                <span style={{ fontSize: 13, fontWeight: isYou ? 700 : 400, color: isYou ? brand.pipelineRed : t.text, fontFamily: "'JetBrains Mono', monospace" }}>
                  {c.domain}{isYou ? " ←" : ""}
                </span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: isYou ? brand.pipelineRed : t.text, fontFamily: "'JetBrains Mono', monospace" }}>{c.traffic.toLocaleString()}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: isYou ? brand.pipelineRed : t.text, fontFamily: "'JetBrains Mono', monospace" }}>{c.keywords}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 5, borderRadius: 3, background: t.toggleBg, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${sharePct}%`, borderRadius: 3, background: isYou ? brand.pipelineRed : brand.talentTeal }} />
                </div>
                <span style={{ fontSize: 10, color: t.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{sharePct}%</span>
              </div>
            </div>
          );
        })}
        <div style={{ padding: "10px 18px", background: "rgba(66,191,186,0.03)", borderTop: `1px solid ${t.cardBorder}`, fontSize: 11, color: t.subtle }}>
          ★ Source: SEMrush competitor discovery · audit.competitors · organic traffic and keyword data
        </div>
      </Card>

      {/* Quick Fixes */}
      <Card title="Quick Fixes — We Can Start Today" t={t}>
        <div style={{
          padding: "14px 20px 12px", borderBottom: `1px solid ${t.cardBorder}`,
          background: `rgba(66,191,186,0.04)`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <p style={{ fontSize: 13, color: t.body, lineHeight: 1.5 }}>
            These issues take minutes to fix — and show immediate impact. We can start on these <strong style={{ color: t.text }}>today.</strong>
          </p>
        </div>
        {quickFixes.map((fix, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: i < quickFixes.length - 1 ? `1px solid ${t.cardBorder}` : "none",
            gap: 16, transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: t.text, fontWeight: 600, marginBottom: 3 }}>{fix.issue}</div>
              <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{fix.detail}</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              padding: "5px 12px", borderRadius: 20,
              background: `rgba(66,191,186,0.08)`, border: `1px solid rgba(66,191,186,0.2)`,
            }}>
              <span style={{ fontSize: 11, color: brand.talentTeal, fontWeight: 700 }}>⏱</span>
              <span style={{ fontSize: 12, color: brand.talentTeal, fontWeight: 600, whiteSpace: "nowrap" }}>Fix time: {fix.time}</span>
            </div>
          </div>
        ))}
      </Card>

      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Fix all broken internal links — crawl errors directly suppress page rankings",
          "Compress and convert images to WebP to pass Core Web Vitals LCP threshold",
          "Set explicit width/height on all images and embeds to eliminate CLS issues",
          "Implement server-side caching to bring TTFB below 200ms",
          "Defer non-critical JavaScript to improve First Input Delay and INP scores",
        ]} />
      </Card>

      <CriticalFixes t={t} items={[
        { title: "23 broken internal links killing crawlability", reason: "Every broken link signals site neglect to Google — crawlers stop indexing deeper pages when they hit 404s." },
        { title: "LCP at 3.8s — failing Core Web Vitals", reason: "Google uses CWV as a direct ranking factor. Failing LCP hurts both rankings and conversion rate." },
        { title: "58% of images missing alt text", reason: "Alt tags are required for accessibility compliance and signal image content to search engines. Missing them costs rankings." },
      ]} />
    </div>
  );
}
/* ----------------------------------------
   TAB 2 — Authority & Search
---------------------------------------- */
function AuthoritySearchTab({ t, ind, loc, metrics = [], providerError = null }) {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {providerError && (
        <ProviderNotice message={`SEMrush data unavailable for this domain — keyword, backlink, and competitor metrics are shown as estimates. (${providerError})`} t={t} />
      )}
      <Card title="Search Authority Metrics" t={t}>
        {metrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
      </Card>

      <SearchDemandCard ind={ind} loc={loc} t={t} />

      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Launch a digital PR campaign to earn 20+ referring domains in the next 90 days",
          "Target 10–15 long-tail keywords with clear commercial intent — these convert 3x better",
          "Optimize meta descriptions on all top-traffic pages with CTAs that drive clicks",
          "Improve mobile PSI score by eliminating render-blocking resources",
          "Build internal links from high-authority pages to underperforming service pages",
        ]} />
      </Card>

      <CriticalFixes t={t} items={[
        { title: "Only 14 keywords in top-3 positions", reason: "Top-3 organic positions capture 60%+ of clicks. 14 keywords means you're nearly invisible for your highest-value terms." },
        { title: "Domain Authority 32 — below competitive threshold", reason: "B2B competitors average DA 40+. Low DA means Google doesn't trust your domain enough to rank it for competitive queries." },
        { title: "Mobile PSI at 54/100 — failing Google's benchmark", reason: "Google's mobile-first index penalizes slow mobile scores. A 54 puts you at risk on the ranking factor that matters most." },
      ]} />
    </div>
  );
}

/* ── Mock Data: Industry Expansion Opportunities ── */
const industryExpansionOpportunities = [
  {
    keyword: "Healthcare Construction",
    volume: 110,
    difficulty: "Low",
    intent: "Commercial",
    opportunity: "high",
    detail: "High-value niche with low competition — ideal first mover advantage",
  },
  {
    keyword: "Commercial Renovation",
    volume: 170,
    difficulty: "Medium",
    intent: "Commercial",
    opportunity: "medium",
    detail: "Strong search demand — competitive but winnable with dedicated landing page",
  },
  {
    keyword: "Medical Office Buildouts",
    volume: 90,
    difficulty: "Low",
    intent: "Commercial",
    opportunity: "high",
    detail: "Niche vertical with low KD and high buyer intent — low effort, high return",
  },
  {
    keyword: "Dental Office Construction",
    volume: 70,
    difficulty: "Low",
    intent: "Commercial",
    opportunity: "high",
    detail: "Adjacent to healthcare construction — quick topical authority win",
  },
  {
    keyword: "Tenant Improvement Contractor",
    volume: 140,
    difficulty: "Medium",
    intent: "Commercial",
    opportunity: "medium",
    detail: "Broad commercial intent — pair with case studies to convert",
  },
];

const recommendedNewPages = [
  "Healthcare Construction",
  "Medical Office Buildouts",
  "Commercial Renovation",
  "Dental Office Construction",
  "Tenant Improvement Contractor",
];

/* ----------------------------------------
   TAB 3 — Content & Topical Depth
---------------------------------------- */
function ContentTopicalDepthTab({ t, ind, loc, targetIndustries = [], metrics = [] }) {
  const city = (loc || "Dallas, TX").split(",")[0].trim();

  const base = ind || "Commercial Construction";

  // Industry-aware expansion opps — pull from targetIndustries if available
  const oppPool = {
    Healthcare:    { keyword: `Healthcare ${base}`,      volume: 110, difficulty: "Easy",   opportunity: "high",   detail: "High buyer intent, low competition — first mover advantage" },
    Retail:        { keyword: `Retail ${base}`,          volume: 140, difficulty: "Medium", opportunity: "medium", detail: "Adjacent vertical — broadens your addressable market" },
    Industrial:    { keyword: `Industrial ${base}`,      volume: 160, difficulty: "Medium", opportunity: "medium", detail: "Strong commercial intent — dedicated page converts well" },
    Office:        { keyword: `Office Buildouts`,        volume: 120, difficulty: "Easy",   opportunity: "high",   detail: "High-intent niche with low KD — fast ranking win" },
    Education:     { keyword: `Education ${base}`,       volume: 90,  difficulty: "Easy",   opportunity: "high",   detail: "Underserved vertical with growing public spend" },
    Government:    { keyword: `Government ${base}`,      volume: 80,  difficulty: "Easy",   opportunity: "high",   detail: "Long contract cycles but high deal values" },
    Hospitality:   { keyword: `Hospitality ${base}`,     volume: 100, difficulty: "Medium", opportunity: "medium", detail: "Renovation-heavy sector — strong recurring pipeline" },
  };
  const defaults = [
    { keyword: `Commercial Renovation`,   volume: 170, difficulty: "Medium", opportunity: "medium", detail: "Strong demand — winnable with a dedicated landing page" },
    { keyword: `Dental Office ${base}`,   volume: 90,  difficulty: "Easy",   opportunity: "high",   detail: "Niche vertical with low KD and high buyer intent" },
    { keyword: `Renovation Specialization`, volume: 80, difficulty: "Easy",  opportunity: "high",   detail: "Upsell opportunity — specialists convert faster" },
  ];
  const selectedOpps = targetIndustries.length > 0
    ? targetIndustries.map(key => oppPool[key]).filter(Boolean)
    : Object.values(oppPool).slice(0, 5);
  const expansionOpps = [...selectedOpps, ...defaults.filter(d => !selectedOpps.find(s => s.keyword === d.keyword))].slice(0, 5);
  const recommendedPages = expansionOpps.map(o => o.keyword);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* ── Service Expansion Opportunity ── */}
      <Card title="Service Expansion Opportunity" t={t}>
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${t.cardBorder}` }}>
          <p style={{ fontSize: 13, color: t.body, lineHeight: 1.6 }}>
            Buyers are searching for these adjacent services in your market — and your site has
            <strong style={{ color: brand.pipelineRed }}> zero pages</strong> targeting them.
            Each row below is a ranking opportunity your competitors may not have claimed yet.
          </p>
        </div>

        {/* Opportunity rows */}
        {expansionOpps.map((opp, i) => {
          const diffColor = opp.difficulty === "Easy" ? brand.talentTeal : opp.difficulty === "Medium" ? brand.inboundOrange : brand.pipelineRed;
          const oppColor = opp.opportunity === "high" ? brand.talentTeal : brand.inboundOrange;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 18px", borderBottom: `1px solid ${t.cardBorder}`,
              transition: "background 0.2s", cursor: "default", gap: 16,
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, color: t.text, fontWeight: 600, marginBottom: 4 }}>{opp.keyword}</div>
                <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{opp.detail}</div>
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "center", flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.text, lineHeight: 1 }}>{opp.volume}</div>
                  <div style={{ fontSize: 9, color: t.subtle, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>searches/mo</div>
                </div>
                <div style={{ textAlign: "center", minWidth: 64 }}>
                  <span style={{
                    display: "block", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 6,
                    color: diffColor, background: `${diffColor}18`, border: `1px solid ${diffColor}33`,
                    textTransform: "uppercase", letterSpacing: 0.8,
                  }}>{opp.difficulty}</span>
                  <div style={{ fontSize: 9, color: t.subtle, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 3 }}>Difficulty</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Recommended New Pages */}
        <div style={{ padding: "20px 18px" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: accent,
            textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ width: 3, height: 12, background: accent, borderRadius: 2, display: "inline-block" }} />
            Recommended New Pages — 30-Page Site Expansion
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {recommendedPages.map((page, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 8,
                background: `${accent}10`, border: `1px solid ${accent}25`,
              }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: accent,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>+</span>
                <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{page}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: t.subtle, marginTop: 14, lineHeight: 1.6 }}>
            Each page targets a high-intent keyword cluster — building topical authority and capturing buyers your competitors miss.
            This is the foundation of a <strong style={{ color: t.text }}>30-page inbound site</strong> designed to dominate your market.
          </p>
        </div>
      </Card>

      {/* ── Website Structure Gap ── */}
      <Card title="Website Structure Gap" t={t}>
        {/* Current structure */}
        <div style={{ padding: "18px 18px 16px", borderBottom: `1px solid ${t.cardBorder}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>
            Current Site Structure
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Pages Detected", value: "5",  color: t.text },
              { label: "Service Pages",  value: "0",  color: brand.pipelineRed },
              { label: "Industry Pages", value: "0",  color: brand.pipelineRed },
              { label: "Portfolio Pages",value: "2",  color: brand.inboundOrange },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: "14px 12px", borderRadius: 10, textAlign: "center",
                background: t.cardBg, border: `1px solid ${t.cardBorder}`,
              }}>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 6, lineHeight: 1.3 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended structure */}
        <div style={{ padding: "18px 18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>
            Recommended Structure
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              {
                group: "Services",
                color: brand.talentTeal,
                pages: ["Commercial Renovation", "Design Build", "Office Buildouts"],
              },
              {
                group: "Industries",
                color: brand.cloudBlue,
                pages: targetIndustries.length > 0 ? targetIndustries.slice(0, 4) : ["Healthcare", "Retail", "Industrial"],
              },
              {
                group: "Markets",
                color: brand.inboundOrange,
                pages: [`${city} Construction`, `${base} Construction`],
              },
            ].map((group, gi) => (
              <div key={gi} style={{
                padding: "14px 16px", borderRadius: 10,
                background: `${group.color}08`, border: `1px solid ${group.color}22`,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: 1.5, color: group.color, marginBottom: 12,
                }}>{group.group}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {group.pages.map((page, pi) => (
                    <div key={pi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{page}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: t.subtle, marginTop: 14, lineHeight: 1.6 }}>
            This structure forms the backbone of a <strong style={{ color: t.text }}>30-page inbound site</strong> — built to rank for every service, industry, and market your buyers are searching for.
          </p>
        </div>

      {/* ── Recommended Website Map ── */}
      {(() => {
        // Mirrors: const servicePages = (sr?.topKeywords || []).filter(...).map(k => k.keyword)
        const servicePages = [
          `${base} Services`,
          `Commercial Renovation`,
          `Design Build`,
          `Office Buildouts`,
          `Tenant Improvement`,
        ];
        const industryPages = (targetIndustries.length > 0 ? targetIndustries : ["Healthcare", "Retail", "Industrial"])
          .map(i => `${i} ${base}`);
        const city2 = (loc || "Dallas, TX").split("/")[0].trim().split(",")[0].trim();
        const city3 = (loc || "Dallas, TX").includes("/") ? loc.split("/")[1].trim().split(",")[0].trim() : `${city2} Metro`;
        const marketPages = [
          `${city2} ${base}`,
          `${city3} ${base}`,
          `${city2} General Contractor`,
        ];
        const contentPages = [
          `${base} Cost Guide`,
          `How to Hire a ${base} Contractor`,
          ...industryPages.slice(0,2).map(p => `${p} Requirements`),
          `Commercial Renovation Guide`,
        ];

        const siteMap = [
          { group: "Services",   color: brand.talentTeal,      pages: servicePages },
          { group: "Industries", color: brand.cloudBlue,       pages: industryPages },
          { group: "Markets",    color: brand.inboundOrange,   pages: marketPages },
          { group: "Content",    color: brand.creativePink,    pages: contentPages },
        ];

        const currentPages = ["Home", "Projects", "About", "Contact", "Services"];
        const totalRecommended = siteMap.reduce((s, g) => s + g.pages.length, 0);
        const totalWithCurrent = currentPages.length + totalRecommended;

        return (
          <Card title="Recommended Website Map — 30-Page Strategy" t={t}>
            {/* Hero comparison */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              borderBottom: `1px solid ${t.cardBorder}`,
            }}>
              {/* Current */}
              <div style={{ padding: "20px 22px", borderRight: `1px solid ${t.cardBorder}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: brand.pipelineRed, marginBottom: 14 }}>
                  Current Site Map
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed, lineHeight: 1 }}>
                    {currentPages.length}
                  </span>
                  <span style={{ fontSize: 13, color: t.subtle }}>pages detected</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {currentPages.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: brand.pipelineRed, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: t.subtle }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Recommended total */}
              <div style={{ padding: "20px 22px", background: "rgba(66,191,186,0.03)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: brand.talentTeal, marginBottom: 14 }}>
                  Recommended Structure
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.talentTeal, lineHeight: 1 }}>
                    {totalWithCurrent}
                  </span>
                  <span style={{ fontSize: 13, color: t.subtle }}>total pages</span>
                </div>
                <div style={{ fontSize: 12, color: t.subtle, lineHeight: 1.5 }}>
                  +{totalRecommended} new pages targeting high-intent keywords across services, industries, and markets
                </div>
                <div style={{
                  marginTop: 14, display: "inline-block",
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                  color: brand.talentTeal, background: "rgba(66,191,186,0.1)",
                  border: "1px solid rgba(66,191,186,0.25)", borderRadius: 20, padding: "4px 14px",
                }}>30-Page Site Strategy</div>
              </div>
            </div>

            {/* Grouped page map */}
            <div style={{ padding: "18px 20px 8px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 3, height: 12, background: accent, borderRadius: 2, display: "inline-block" }} />
                New Pages to Build — auto-generated from keyword data
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {siteMap.map((group, gi) => (
                  <div key={gi} style={{
                    padding: "14px 16px", borderRadius: 10,
                    background: `${group.color}08`, border: `1px solid ${group.color}22`,
                  }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: 1.5, color: group.color, marginBottom: 10,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span>{group.group}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{group.pages.length} pages</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {group.pages.map((page, pi) => (
                        <div key={pi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: group.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: t.text, fontWeight: 400 }}>{page}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer pitch */}
            <div style={{
              margin: "8px 20px 20px", padding: "14px 18px", borderRadius: 10,
              background: `linear-gradient(135deg, rgba(255,33,15,0.05) 0%, rgba(66,191,186,0.04) 100%)`,
              border: `1px solid ${t.cardBorder}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 3 }}>
                  {"You have "}{currentPages.length}{" pages — you need "}{totalWithCurrent}{"."}
                
                </div>
                <div style={{ fontSize: 12, color: t.subtle }}>
                  Each new page targets a keyword your buyers are searching for right now.
                  Auto-generated from <strong style={{ color: t.text }}>sr.topKeywords</strong> + industry + market data.
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: brand.pipelineRed, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>+{totalRecommended}</div>
                <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>New Pages</div>
              </div>
            </div>
          </Card>
        );
      })()}

      </Card>

      <Card title="Content Performance Metrics" t={t}>
        {metrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
      </Card>

      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Publish new content immediately — no posts in 30+ days signals inactivity to Google",
          "Build dedicated landing pages for each industry expansion opportunity above",
          "Develop 3 content clusters around your core service topics to build topical authority",
          "Increase average word count to 1,200+ words on key landing pages — depth wins rankings",
          "Add 5–10 internal links per page to improve crawlability and time on site",
          "Add FAQ sections with schema markup to target featured snippets and AI Overviews",
        ]} />
      </Card>

      <CriticalFixes t={t} items={[
        { title: "Zero content published in 30+ days", reason: "Content freshness is a ranking signal. A month of inactivity tells Google this site isn't a live, authoritative resource." },
        { title: "Average word count 620 — less than half of top competitors", reason: "Thin content can't compete for high-intent queries. Competitors averaging 1,400+ words are winning the rankings you're missing." },
        { title: "No dedicated service or industry pages", reason: "Without pages for each service and industry, you can't rank for the specific searches your best buyers use." },
      ]} />
    </div>
  );
}

/* ----------------------------------------
   TAB 4 — Entity & Brand Authority
---------------------------------------- */
function EntityBrandAuthorityTab({ t, metrics = [], gbpFound = true }) {

  // AI Search signals — derived from existing site data
  const aiSignals = [
    {
      label: "Structured Data",
      status: "partial",
      value: "Partial",
      detail: "Org schema found — missing Service and LocalBusiness types",
      weight: "high",
    },
    {
      label: "FAQ Schema",
      status: "missing",
      value: "Missing",
      detail: "No FAQ schema detected — high-value signal for AI citation",
      weight: "high",
    },
    {
      label: "Entity Signals",
      status: "weak",
      value: "Weak",
      detail: "4 NAP mismatches, no knowledge graph presence, limited co-citations",
      weight: "high",
    },
    {
      label: "Content Depth",
      status: "moderate",
      value: "Moderate",
      detail: "Avg 620 words/page — LLMs prefer 1,200+ for citation likelihood",
      weight: "medium",
    },
    {
      label: "Topic Clusters",
      status: "missing",
      value: "Missing",
      detail: "No pillar-cluster content structure found — limits topical authority signals",
      weight: "medium",
    },
    {
      label: "Author / E-E-A-T Signals",
      status: "weak",
      value: "Weak",
      detail: "No author bios, credentials, or expertise signals detected on pages",
      weight: "medium",
    },
  ];

  const signalScore = Math.round(
    aiSignals.reduce((sum, s) => {
      const val = s.status === "strong" ? 100 : s.status === "partial" || s.status === "moderate" ? 50 : 0;
      const w = s.weight === "high" ? 1.5 : 1;
      return sum + val * w;
    }, 0) /
    aiSignals.reduce((sum, s) => sum + (s.weight === "high" ? 1.5 : 1), 0)
  );
  const citationLevel = signalScore >= 70 ? "MODERATE" : signalScore >= 40 ? "LOW" : "VERY LOW";
  const citationColor = signalScore >= 70 ? brand.inboundOrange : signalScore >= 40 ? brand.pipelineRed : brand.pipelineRed;

  const statusConfig = {
    strong:   { color: brand.talentTeal,    label: "Strong" },
    partial:  { color: brand.inboundOrange, label: "Partial" },
    moderate: { color: brand.inboundOrange, label: "Moderate" },
    weak:     { color: brand.pipelineRed,   label: "Weak" },
    missing:  { color: brand.pipelineRed,   label: "Missing" },
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {!gbpFound && (
        <ProviderNotice message="No Google Business Profile found for this business — local search metrics below are estimates only. Claim and verify your GBP to unlock measurement." t={t} />
      )}

      {/* AI Search Visibility */}
      <Card title="AI Search Visibility Analysis" t={t}>
        {/* Callout banner */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${t.cardBorder}`,
          background: "rgba(66,191,186,0.04)",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>🤖</span>
          <div>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 600, marginBottom: 4 }}>
              ChatGPT, Perplexity, and Google AI Overviews are becoming primary search surfaces.
            </div>
            <div style={{ fontSize: 12, color: t.subtle, lineHeight: 1.5 }}>
              LLMs cite pages with strong structured data, deep content, and clear entity signals.
              This site currently has <strong style={{ color: brand.pipelineRed }}>low citation likelihood</strong>.
            </div>
          </div>
        </div>

        {/* Signal rows */}
        {aiSignals.map((sig, i) => {
          const cfg = statusConfig[sig.status];
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: i < aiSignals.length - 1 ? `1px solid ${t.cardBorder}` : "none",
              gap: 16, transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{sig.label}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
                    padding: "2px 7px", borderRadius: 4,
                    color: sig.weight === "high" ? brand.pipelineRed : t.subtle,
                    background: sig.weight === "high" ? "rgba(255,33,15,0.08)" : t.toggleBg,
                    border: `1px solid ${sig.weight === "high" ? "rgba(255,33,15,0.2)" : t.cardBorder}`,
                  }}>{sig.weight === "high" ? "High Impact" : "Medium Impact"}</span>
                </div>
                <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{sig.detail}</div>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, flexShrink: 0,
                color: cfg.color, background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`,
                textTransform: "uppercase", letterSpacing: 0.8,
              }}>{cfg.label}</span>
            </div>
          );
        })}

        {/* Citation likelihood footer */}
        <div style={{
          padding: "18px 20px",
          background: `linear-gradient(90deg, rgba(255,33,15,0.05) 0%, rgba(66,191,186,0.03) 100%)`,
          borderTop: `1px solid ${t.cardBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>
              AI Citation Likelihood
            </div>
            <div style={{ fontSize: 13, color: t.body }}>
              Based on structured data, content depth, and entity signal analysis
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{
              fontSize: 14, fontWeight: 700, padding: "6px 20px", borderRadius: 20,
              color: citationColor, background: `${citationColor}14`,
              border: `1px solid ${citationColor}30`,
              textTransform: "uppercase", letterSpacing: 1.5,
            }}>{citationLevel}</span>
            <div style={{ fontSize: 10, color: t.subtle, marginTop: 4 }}>AI Readiness Score: {signalScore}/100</div>
          </div>
        </div>
      </Card>

      {/* Actions to appear in AI answers */}
      <Card title="Actions to Appear in AI Answers" t={t}>
        <div style={{ padding: "14px 20px 10px", borderBottom: `1px solid ${t.cardBorder}` }}>
          <p style={{ fontSize: 13, color: t.body, lineHeight: 1.5 }}>
            These changes directly increase the likelihood that ChatGPT, Perplexity, and Google AI Overviews cite your site.
          </p>
        </div>
        <RecommendationList t={t} items={[
          "Add FAQ schema to every service page — directly increases AI answer citation rate",
          "Expand key pages to 1,200+ words with clear headers, definitions, and expert commentary",
          "Build topic clusters: 1 pillar page + 4–6 supporting posts per core service",
          "Strengthen entity signals: consistent NAP, Wikipedia/Wikidata entry, Crunchbase profile",
          "Add author bios with credentials and industry expertise to all content pages",
          "Implement structured data for Service, LocalBusiness, FAQPage, and BreadcrumbList",
        ]} />
      </Card>

      <Card title="Entity & Brand Signals" t={t}>
        {metrics.map((m, i) => <MetricRow key={i} {...m} t={t} />)}
      </Card>

      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Expand schema markup to include LocalBusiness, Service, and FAQ types",
          "Audit and fix all NAP inconsistencies across directories — use a citation management tool",
          "Actively solicit Google reviews — respond to all reviews within 48 hours",
          "Build out Crunchbase and LinkedIn company profiles with consistent brand info",
          "Claim and optimize Bing Places listing for additional local visibility",
          "Create a brand journalism strategy to generate co-citations from industry publications",
        ]} />
      </Card>

      <CriticalFixes t={t} items={[
        { title: "No Knowledge Graph presence for brand searches", reason: "Without a Knowledge Panel, your brand doesn't look established to Google or AI engines — competitors with one win branded comparisons." },
        { title: "4 NAP mismatches across directories", reason: "Inconsistent Name/Address/Phone confuses Google's local algorithm and actively suppresses local pack rankings." },
        { title: "Missing FAQ and Service schema — low AI citation likelihood", reason: "LLMs and AI Overviews cite structured data first. Without it, your content won't appear in AI-generated answers." },
      ]} />
    </div>
  );
}

/* ----------------------------------------
   TAB 5 — Revenue & Attribution
---------------------------------------- */
function RevenueAttributionTab({ t, ind, loc, projectSize = "", scores = {} }) {
  const passCount = attributionChecks.filter(c => c.pass).length;
  const infraScore = Math.round((passCount / attributionChecks.length) * 100);
  const riskLevel = infraScore >= 70 ? "low" : infraScore >= 40 ? "medium" : "high";
  const riskConfig = {
    low: { label: "✅ Low Risk", color: brand.talentTeal },
    medium: { label: "👀 Medium Risk", color: brand.inboundOrange },
    high: { label: "👋 High Revenue Risk", color: brand.pipelineRed },
  };
  const risk = riskConfig[riskLevel];

  // Module scores for RVI — provided by parent (computed server-side by /api/audit)
  const techScore = scores.tech ?? 0;
  const searchScore = scores.search ?? 0;
  const contentScore = scores.content ?? 0;
  const entityScore = scores.entity ?? 0;

  const rvi = Math.round(
    searchScore * rviWeights.searchAuthority +
    contentScore * rviWeights.content +
    infraScore * rviWeights.infrastructure +
    techScore * rviWeights.technical +
    entityScore * rviWeights.entity
  );

  const scenarioKeys = ["conservative", "expected", "aggressive"];
  const scenarios = scenarioKeys.map(k => ({
    ...revenueScenarios[k],
    ...calcScenario(revenueScenarios[k]),
  }));

  // ── Revenue Opportunity — audit.revenueOpportunity ──
  // Mirrors live app: const searches = kwCount || 0;
  const kwCount = 1720; // in live app: sr.topKeywords?.length * avg monthly volume
  const searches = kwCount || 0;
  const estimatedVisitors = searches * 0.05;
  const estimatedLeads = estimatedVisitors * 0.05;

  // Parse project size from form selection (overrides default $250k)
  const sizeMap = {
    "Under $50k":    { value: 35000,   label: "~$35k" },
    "$50k–$150k":    { value: 100000,  label: "~$100k" },
    "$150k–$500k":   { value: 300000,  label: "~$300k" },
    "$500k–$1M":     { value: 750000,  label: "~$750k" },
    "$1M+":          { value: 1250000, label: "$1M+" },
  };
  const sizeEntry = sizeMap[projectSize] || { value: 250000, label: "$250k+" };
  const avgDeal = sizeEntry.value;
  const avgProjectLabel = sizeEntry.label;
  const annualRevenue = estimatedLeads * avgDeal * 12;

  // audit.revenueOpportunity shape (attach to audit object in live app)
  const revenueOpportunity = {
    searches,
    estimatedVisitors: Math.round(estimatedVisitors),
    estimatedLeads: Math.round(estimatedLeads),
    avgDeal,
    annualRevenue: Math.round(annualRevenue),
  };

  const totalSearchVolume = searches;
  const formatRev = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${Math.round(n/1000)}k`;
  const revLow = Math.round(annualRevenue * 0.75);
  const revHigh = Math.round(annualRevenue * 1.25);
  const projectsLow = Math.max(2, Math.round(estimatedLeads * 0.6 * 12));
  const projectsHigh = Math.max(4, Math.round(estimatedLeads * 0.8 * 12));
  const avgProjectValue = avgDeal;

  const rviPillars = [
    { label: "Search Authority", score: searchScore, weight: "30%", color: brand.cloudBlue },
    { label: "Content & Topical Depth", score: contentScore, weight: "20%", color: brand.talentTeal },
    { label: "Revenue Infrastructure", score: infraScore, weight: "20%", color: brand.inboundOrange },
    { label: "Technical Foundation", score: techScore, weight: "15%", color: brand.creativePink },
    { label: "Entity & Brand Authority", score: entityScore, weight: "15%", color: brand.enterpriseMaroon },
  ];

  return (
    <div style={{ display: "grid", gap: 24 }}>

      {/* Revenue Opportunity Calculator */}
      <Card title="Inbound Revenue Opportunity Calculator" t={t}>
        {/* Austin quote */}
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${t.cardBorder}`,
          background: "rgba(255,33,15,0.04)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 16, color: brand.pipelineRed, flexShrink: 0 }}>"</span>
          <p style={{ fontSize: 13, color: t.body, lineHeight: 1.5, fontStyle: "italic" }}>
            If we got 3 projects a year from inbound, it would pay for itself.
          </p>
          <span style={{ fontSize: 16, color: brand.pipelineRed, flexShrink: 0, alignSelf: "flex-end" }}>"</span>
        </div>

        {/* Step-by-step funnel */}
        {[
          {
            step: "01", label: "Local Searches / Month",
            value: totalSearchVolume.toLocaleString(),
            sub: `for ${ind || "your industry"} services in ${loc || "your market"} · kwCount from sr.topKeywords`,
            color: t.text, arrow: true,
          },
          {
            step: "02", label: "Estimated Click Rate",
            value: "5%",
            sub: "avg organic CTR for local service keywords",
            color: brand.cloudBlue, arrow: true,
          },
          {
            step: "03", label: "Visitors / Month",
            value: `~${revenueOpportunity.estimatedVisitors}`,
            sub: "estimated monthly organic visitors",
            color: brand.cloudBlue, arrow: true,
          },
          {
            step: "04", label: "Lead Conversion Rate",
            value: "5%",
            sub: "visitors who become inbound leads",
            color: brand.inboundOrange, arrow: true,
          },
          {
            step: "05", label: "Leads / Month",
            value: `~${revenueOpportunity.estimatedLeads}`,
            sub: "estimated qualified inbound leads per month",
            color: brand.inboundOrange, arrow: true,
          },
          {
            step: "06", label: "Average Project Value",
            value: avgProjectLabel,
            sub: projectSize ? `selected: ${projectSize}` : "typical commercial project",
            color: brand.talentTeal, arrow: true,
          },
          {
            step: "07", label: "Annual Opportunity",
            value: `${formatRev(revLow)}–${formatRev(revHigh)}+`,
            sub: "estimated annual revenue from inbound alone",
            color: brand.pipelineRed, arrow: false, highlight: true,
          },
        ].map((row, i) => (
          <div key={i}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: row.highlight ? "20px 20px" : "14px 20px",
              background: row.highlight
                ? `linear-gradient(135deg, rgba(255,33,15,0.07) 0%, rgba(66,191,186,0.04) 100%)`
                : "transparent",
              borderTop: row.highlight ? `1px solid ${t.cardBorder}` : "none",
              gap: 16, transition: "background 0.2s",
            }}
              onMouseEnter={e => !row.highlight && (e.currentTarget.style.background = t.hoverRow)}
              onMouseLeave={e => !row.highlight && (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: row.highlight ? brand.pipelineRed : t.subtle,
                  fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, minWidth: 20,
                }}>{row.step}</span>
                <div>
                  <div style={{ fontSize: row.highlight ? 15 : 14, color: t.text, fontWeight: row.highlight ? 700 : 500, marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontSize: 11, color: t.subtle }}>{row.sub}</div>
                </div>
              </div>
              <div style={{
                fontSize: row.highlight ? 26 : 18,
                fontWeight: 700, color: row.color,
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0, textAlign: "right",
              }}>{row.value}</div>
            </div>
            {row.arrow && (
              <div style={{ textAlign: "center", padding: "2px 0", color: t.cardBorder, fontSize: 14, lineHeight: 1 }}>↓</div>
            )}
          </div>
        ))}

        {/* Closer */}
        <div style={{
          padding: "16px 20px", borderTop: `1px solid ${t.cardBorder}`,
          background: "rgba(66,191,186,0.03)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 3 }}>3 projects pays for the program.</div>
            <div style={{ fontSize: 12, color: t.subtle }}>Abstrakt's inbound program is designed to deliver exactly this within 12 months.</div>
          </div>
          <div style={{
            padding: "8px 20px", borderRadius: 20, flexShrink: 0,
            background: "rgba(255,33,15,0.08)", border: "1px solid rgba(255,33,15,0.2)",
            fontSize: 13, fontWeight: 700, color: brand.pipelineRed,
          }}>ROI in Year 1</div>
        </div>
      </Card>

      {/* RVI Score Ring */}
      <div style={{ textAlign: "center" }}>
        <ScoreRing score={rvi} size={140} t={t} />
        <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>Revenue Visibility Index</div>
        <div style={{ fontSize: 11, color: t.subtle, marginTop: 6 }}>
          B2B Weighted: Search 30% · Content 20% · Infrastructure 20% · Technical 15% · Entity 15%
        </div>
      </div>

      {/* RVI Pillar Breakdown */}
      <Card title="Revenue Visibility Index — Pillar Breakdown" t={t}>
        <div style={{ padding: 18 }}>
          {rviPillars.map((row, i) => (
            <div key={i} style={{ marginBottom: i < rviPillars.length - 1 ? 16 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{row.label}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: t.subtle, fontFamily: "'JetBrains Mono', monospace" }}>weight {row.weight}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{row.score}</span>
                </div>
              </div>
              <div style={{ height: 6, background: t.cardBorder, borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${row.score}%`, background: row.color,
                  borderRadius: 3, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue Infrastructure Health */}
      <Card title="Revenue Infrastructure Health" t={t}>
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${t.cardBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{passCount} of {attributionChecks.length} checks passing</div>
            <div style={{ fontSize: 11, color: t.subtle, marginTop: 2 }}>Attribution and conversion infrastructure audit</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
            color: risk.color, background: `${risk.color}18`, border: `1px solid ${risk.color}33`,
            textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap",
          }}>{risk.label}</span>
        </div>
        {attributionChecks.map((c, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 18px", borderBottom: `1px solid ${t.cardBorder}`,
            transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{c.label}</span>
                {c.impact && <WeightBadge impact={c.impact} />}
                <SourceBadge source={c.source} />
              </div>
              <div style={{ fontSize: 11, color: t.subtle }}>{c.detail}</div>
            </div>
            <span style={{
              width: 24, height: 24, borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 12,
              color: "#fff", background: c.pass ? brand.talentTeal : brand.pipelineRed,
            }}>{c.pass ? "✓" : "✗"}</span>
          </div>
        ))}
      </Card>

      {/* 3-Scenario Revenue Model */}
      <Card title="Pipeline Opportunity — 3-Scenario Revenue Model" t={t}>
        <div style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: t.subtle, marginBottom: 16, lineHeight: 1.5 }}>
            Based on current site traffic (est. 1,200 visitors/mo) with optimized conversion infrastructure. Scenarios reflect what Abstrakt's inbound program can achieve at different performance levels.
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {scenarios.map((s, i) => (
              <div key={i} style={{
                padding: "18px 20px", borderRadius: 10,
                border: `1px solid ${s.color}33`, background: `${s.color}08`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: t.subtle }}>
                      Conv. {(s.conversionRate * 100).toFixed(1)}% · Close {(s.closeRate * 100).toFixed(0)}% · Avg deal ${s.avgDealSize.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                      ${s.monthlyRevenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>/month</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Leads/Mo", value: s.leads },
                    { label: "Closed Deals", value: s.closedDeals },
                    { label: "Annual Pipeline", value: `$${(s.monthlyRevenue * 12).toLocaleString()}` },
                  ].map((stat, j) => (
                    <div key={j} style={{
                      padding: "8px 10px", background: t.cardBg,
                      borderRadius: 6, border: `1px solid ${t.cardBorder}`, textAlign: "center",
                    }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                      <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card title="Recommendations" t={t}>
        <RecommendationList t={t} items={[
          "Configure GA4 conversion events now — you cannot optimize what you cannot measure",
          "Set up call tracking with dynamic number insertion to attribute phone leads to channels",
          "Add UTM parameters to all paid, email, and social campaigns consistently",
          "Configure a Thank You page to track form submission conversions in GA4",
          "Launch Google and Meta remarketing campaigns to re-engage the 97% who don't convert on first visit",
        ]} />
      </Card>

      <CriticalFixes t={t} items={[
        { title: "No conversion events in GA4 — leads are invisible", reason: "If you can't measure inbound leads, you can't optimize for them. Every untracked form submission is lost attribution data." },
        { title: "Call tracking not installed — phone leads are unattributed", reason: "B2B buyers call before they fill out forms. Without DNI, your best leads have no source and can't be tied to marketing spend." },
        { title: "UTM parameters not used — paid spend is untracked", reason: "Without UTMs, Google Ads and paid campaigns show zero lead attribution. You're spending with no ability to prove ROI." },
      ]} />
    </div>
  );
}

/* ----------------------------------------
   COMPETITOR VISIBILITY GAP
---------------------------------------- */
function CompetitorVisibilityGap({ t }) {
  const youKeywords = 10;
  const compKeywords = 140;
  const maxR = 110;
  const minR = 28;
  const compR = maxR;
  const youR = minR;
  const svgW = 420;
  const svgH = 260;
  const compCx = 195;
  const compCy = 130;
  // Place "you" circle outside and to the right of the comp circle
  const youCx = compCx + compR + youR + 28;
  const youCy = compCy + 30;

  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBorder}`,
      borderRadius: 14, overflow: "hidden", marginBottom: 30,
    }}>
      {/* Card header */}
      <div style={{
        padding: "14px 18px", borderBottom: `1px solid ${t.cardBorder}`,
        fontSize: 12, fontWeight: 600, color: accent,
        textTransform: "uppercase", letterSpacing: 2,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ width: 3, height: 14, background: accent, borderRadius: 2, display: "inline-block" }} />
        Competitor Visibility Gap
      </div>

      <div style={{ padding: "24px 28px" }}>
        <p style={{ fontSize: 13, color: t.body, marginBottom: 24, lineHeight: 1.6 }}>
          Your competitors dominate search results for your services.
          You're effectively <strong style={{ color: brand.pipelineRed }}>invisible</strong> in this market.
        </p>

        {/* Bubble visualization */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: svgW, maxWidth: "100%" }}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ overflow: "visible" }}>
              <defs>
                <radialGradient id="compGrad" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor={brand.pipelineRed} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={brand.pipelineRed} stopOpacity="0.06" />
                </radialGradient>
                <radialGradient id="youGrad" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor={brand.talentTeal} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={brand.talentTeal} stopOpacity="0.08" />
                </radialGradient>
              </defs>

              {/* Competitor circle */}
              <circle cx={compCx} cy={compCy} r={compR}
                fill="url(#compGrad)"
                stroke={brand.pipelineRed} strokeWidth="1.5" strokeOpacity="0.35" />

              {/* Competitor label inside */}
              <text x={compCx} y={compCy - 14} textAnchor="middle"
                fontSize="11" fontWeight="600" fill={brand.pipelineRed} opacity="0.9"
                fontFamily="'Barlow', sans-serif">
                Competitor Avg
              </text>
              <text x={compCx} y={compCy + 14} textAnchor="middle"
                fontSize="34" fontWeight="700" fill={brand.pipelineRed}
                fontFamily="'JetBrains Mono', monospace">
                {compKeywords}
              </text>
              <text x={compCx} y={compCy + 34} textAnchor="middle"
                fontSize="10" fill={brand.pipelineRed} opacity="0.7"
                fontFamily="'Barlow', sans-serif">
                ranking keywords
              </text>

              {/* Dashed "outside" connector line */}
              <line
                x1={compCx + compR} y1={compCy}
                x2={youCx - youR} y2={youCy}
                stroke={brand.talentTeal} strokeWidth="1.2"
                strokeDasharray="5,4" strokeOpacity="0.4" />

              {/* "You" circle — small, outside */}
              <circle cx={youCx} cy={youCy} r={youR}
                fill="url(#youGrad)"
                stroke={brand.talentTeal} strokeWidth="1.5" strokeOpacity="0.5" />

              <text x={youCx} y={youCy - 6} textAnchor="middle"
                fontSize="10" fontWeight="600" fill={brand.talentTeal}
                fontFamily="'Barlow', sans-serif">
                You
              </text>
              <text x={youCx} y={youCy + 12} textAnchor="middle"
                fontSize="18" fontWeight="700" fill={brand.talentTeal}
                fontFamily="'JetBrains Mono', monospace">
                {youKeywords}
              </text>
            </svg>
          </div>

          {/* Stat callouts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 180 }}>
            <div style={{
              padding: "16px 20px", borderRadius: 10,
              background: "rgba(255,33,15,0.06)", border: "1px solid rgba(255,33,15,0.18)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: brand.pipelineRed, marginBottom: 6 }}>
                Competitor Average
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: brand.pipelineRed, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {compKeywords}
              </div>
              <div style={{ fontSize: 11, color: t.subtle, marginTop: 4 }}>ranking keywords</div>
            </div>
            <div style={{
              padding: "16px 20px", borderRadius: 10,
              background: "rgba(66,191,186,0.06)", border: "1px solid rgba(66,191,186,0.18)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: brand.talentTeal, marginBottom: 6 }}>
                Your Domain
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: brand.talentTeal, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {youKeywords}
              </div>
              <div style={{ fontSize: 11, color: t.subtle, marginTop: 4 }}>ranking keywords</div>
            </div>
            <div style={{
              padding: "12px 20px", borderRadius: 10,
              background: t.cardBg, border: `1px solid ${t.cardBorder}`,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 11, color: t.subtle, marginBottom: 4 }}>Visibility Gap</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: brand.inboundOrange, fontFamily: "'JetBrains Mono', monospace" }}>
                {compKeywords - youKeywords}x
              </div>
              <div style={{ fontSize: 10, color: t.subtle }}>behind competitors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   COMPETITORS TAB
---------------------------------------- */
function CompetitorsTab({ t, loc, ind, competitors: competitorsProp = [] }) {
  const city = (loc || "Dallas, TX").split(",")[0].trim();

  // Mock SEMrush sr.competitors data — used as fallback when prop is empty
  const mockCompetitors = [
    { name: "Ridgemont Construction",   keywords: 230, traffic: 3200, trend: "up",   da: 38 },
    { name: "ABC Commercial Builders",  keywords: 180, traffic: 2700, trend: "up",   da: 34 },
    { name: "Summit Build Group",       keywords: 140, traffic: 1900, trend: "flat", da: 29 },
    { name: "Pinnacle Contractors",     keywords: 95,  traffic: 1100, trend: "down", da: 26 },
  ];

  // Real API shape: { domain, commonKeywords, organicKeywords, organicTraffic, organicCost }
  // Normalize to the internal shape this component renders.
  const competitors = competitorsProp.length > 0
    ? competitorsProp.slice(0, 4).map(c => ({
        name: c.name || c.domain || "Unknown",
        keywords: c.keywords ?? c.organicKeywords ?? 0,
        traffic: c.traffic ?? c.organicTraffic ?? 0,
        trend: c.trend || null,
        da: c.da ?? "—",
      }))
    : mockCompetitors;

  const yourSite = { name: "Your Website", keywords: 10, traffic: 90, da: 18, isYou: true };
  const allRows = [...competitors, yourSite];

  const compAvgKeywords = Math.round(competitors.reduce((s, c) => s + c.keywords, 0) / (competitors.length || 1));
  const compAvgTraffic  = Math.round(competitors.reduce((s, c) => s + c.traffic, 0) / (competitors.length || 1));
  const gapMultiple     = Math.round(compAvgKeywords / (yourSite.keywords || 1));
  const maxKeywords     = Math.max(...allRows.map(r => r.keywords));

  return (
    <div style={{ display: "grid", gap: 24 }}>

      {/* ── Digital Competitors Discovery ── */}
      <Card title={`Digital Competitors in ${city}`} t={t}>
        <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${t.cardBorder}`, background: "rgba(66,191,186,0.03)" }}>
          <p style={{ fontSize: 13, color: t.body, lineHeight: 1.6 }}>
            These companies are actively capturing inbound leads in your market.
            Pulled from <strong style={{ color: t.text }}>SEMrush competitor discovery</strong> — ranked by organic keyword footprint.
          </p>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 120px 140px 80px 100px",
          padding: "10px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 8,
        }}>
          {["Company", "Keywords", "Est. Traffic/mo", "DA", "Visibility"].map(h => (
            <span key={h} style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600 }}>{h}</span>
          ))}
        </div>

        {/* Competitor rows */}
        {allRows.map((row, i) => {
          const barPct = Math.round((row.keywords / maxKeywords) * 100);
          const isYou = row.isYou;
          const trendColor = !isYou && row.trend === "up" ? brand.talentTeal : row.trend === "down" ? brand.pipelineRed : t.subtle;
          const trendIcon = !isYou ? (row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→") : null;
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 120px 140px 80px 100px",
              alignItems: "center", padding: "15px 18px",
              borderBottom: i < allRows.length - 1 ? `1px solid ${t.cardBorder}` : "none",
              gap: 8, transition: "background 0.2s",
              background: isYou ? `rgba(255,33,15,0.03)` : "transparent",
            }}
              onMouseEnter={e => !isYou && (e.currentTarget.style.background = t.hoverRow)}
              onMouseLeave={e => !isYou && (e.currentTarget.style.background = "transparent")}
            >
              {/* Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: isYou ? brand.pipelineRed : brand.talentTeal,
                  boxShadow: isYou ? "0 0 6px rgba(255,33,15,0.4)" : "0 0 6px rgba(66,191,186,0.3)",
                }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: isYou ? 700 : 500, color: isYou ? brand.pipelineRed : t.text }}>{row.name}</div>
                  {isYou && <div style={{ fontSize: 10, color: brand.pipelineRed, fontWeight: 600, marginTop: 1 }}>← That's you</div>}
                </div>
              </div>
              {/* Keywords */}
              <div style={{ fontSize: 15, fontWeight: 700, color: isYou ? brand.pipelineRed : t.text, fontFamily: "'JetBrains Mono', monospace" }}>
                {row.keywords.toLocaleString()}
                {trendIcon && <span style={{ fontSize: 11, color: trendColor, marginLeft: 4 }}>{trendIcon}</span>}
              </div>
              {/* Traffic */}
              <div style={{ fontSize: 14, fontWeight: 600, color: isYou ? brand.pipelineRed : t.text, fontFamily: "'JetBrains Mono', monospace" }}>
                {row.traffic.toLocaleString()}
              </div>
              {/* DA */}
              <div style={{ fontSize: 13, color: t.subtle, fontFamily: "'JetBrains Mono', monospace" }}>{row.da}</div>
              {/* Visibility bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: t.toggleBg, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${barPct}%`, borderRadius: 3,
                    background: isYou ? brand.pipelineRed : brand.talentTeal,
                    transition: "width 0.6s ease",
                  }} />
                </div>
                <span style={{ fontSize: 10, color: t.subtle, fontFamily: "'JetBrains Mono', monospace", minWidth: 24 }}>{barPct}%</span>
              </div>
            </div>
          );
        })}

        <div style={{
          padding: "10px 18px", background: `rgba(66,191,186,0.03)`,
          borderTop: `1px solid ${t.cardBorder}`, fontSize: 11, color: t.subtle,
        }}>
          ★ Source: SEMrush competitor discovery · sr.competitors · organic keyword and traffic data
        </div>
      </Card>

      {/* ── Inbound Visibility Gap ── */}
      <Card title="Inbound Visibility Gap" t={t}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Competitor Avg Keywords", value: compAvgKeywords, color: brand.inboundOrange, sub: "avg across top 4 competitors" },
            { label: "Your Keywords",           value: yourSite.keywords, color: brand.pipelineRed, sub: "currently indexed by Google" },
            { label: "Visibility Gap",          value: `${gapMultiple}x`, color: brand.talentTeal, sub: "opportunity multiplier", big: true },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: "28px 24px", textAlign: "center",
              borderRight: i < 2 ? `1px solid ${t.cardBorder}` : "none",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: stat.color, marginBottom: 12 }}>{stat.label}</div>
              <div style={{
                fontSize: stat.big ? 40 : 44, fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace", color: stat.color, lineHeight: 1, marginBottom: 8,
              }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${t.cardBorder}`,
          background: `linear-gradient(90deg, rgba(255,33,15,0.04) 0%, rgba(66,191,186,0.03) 100%)`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5,
              color: brand.pipelineRed, background: "rgba(255,33,15,0.08)",
              border: "1px solid rgba(255,33,15,0.2)", borderRadius: 20, padding: "3px 12px",
              marginRight: 12,
            }}>Opportunity Score: HIGH</span>
            <span style={{ fontSize: 13, color: t.body }}>
              Your competitors are capturing <strong style={{ color: t.text }}>{compAvgTraffic.toLocaleString()} visits/mo</strong> you're not seeing.
            </span>
          </div>
          <div style={{ fontSize: 12, color: t.subtle }}>
            Avg competitor traffic: {compAvgTraffic.toLocaleString()}/mo vs your {yourSite.traffic}/mo
          </div>
        </div>
      </Card>

      <RankingGapCard t={t} />

      {/* Competitive Velocity */}
      {(() => {
        const daGap = competitiveVelocity[competitiveVelocity.length - 1].comp - competitiveVelocity[competitiveVelocity.length - 1].you;
        return (
          <Card title="Competitive Velocity — 12-Month Domain Authority Trend" t={t}>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, color: t.body, marginBottom: 8, lineHeight: 1.5 }}>
                    Your domain authority is growing slowly while competitors accelerate.
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 20, height: 2.5, background: brand.talentTeal, borderRadius: 1 }} />
                      <span style={{ fontSize: 11, color: t.subtle }}>Your Domain</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 20, height: 2, background: brand.pipelineRed, borderRadius: 1, opacity: 0.8 }} />
                      <span style={{ fontSize: 11, color: t.subtle }}>Avg. Competitor (dashed)</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed, lineHeight: 1 }}>
                    -{daGap}
                  </div>
                  <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>DA Gap</div>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <DualSparkline data={competitiveVelocity} width={540} height={80} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {competitiveVelocity.map((d, i) => (
                  <span key={i} style={{ fontSize: 9, color: t.subtle, textTransform: "uppercase", letterSpacing: 0.5 }}>{d.month}</span>
                ))}
              </div>
            </div>
          </Card>
        );
      })()}

      <CompetitorVisibilityGap t={t} />

      <LeadCaptureCard t={t} compAvgTraffic={compAvgTraffic} yourTraffic={yourSite.traffic} gapMultiple={gapMultiple} />

      <CriticalFixes t={t} items={[
        { title: `Competitors averaging ${compAvgKeywords} keywords — you have ${yourSite.keywords}`, reason: "Keyword footprint is the clearest proxy for search visibility. A 14x gap means competitors appear for nearly every relevant search you're missing." },
        { title: "Domain authority trending flat while competitors accelerate", reason: "The DA gap is widening every month. The longer this continues, the harder it becomes to close — compounding disadvantage." },
        { title: "Competitor average traffic is 35x yours", reason: "Every visit going to a competitor is a buyer who found them before you. At 3,200 vs 90 visits/mo, the pipeline impact is severe." },
      ]} />
    </div>
  );
}

/* ----------------------------------------
   RANKING GAP CARD (top of report)
---------------------------------------- */
function RankingGapCard({ t }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 30 }}>
      {[
        {
          label: "You Rank For",
          value: "0",
          sub: "of these keywords",
          color: brand.pipelineRed,
          bg: "rgba(255,33,15,0.06)",
          border: "rgba(255,33,15,0.18)",
        },
        {
          label: "Competitors Ranking",
          value: "6",
          sub: "capturing your leads",
          color: brand.inboundOrange,
          bg: "rgba(244,111,10,0.06)",
          border: "rgba(244,111,10,0.18)",
        },
        {
          label: "Opportunity",
          value: "HIGH",
          sub: "demand with no competition from you",
          color: brand.talentTeal,
          bg: "rgba(66,191,186,0.06)",
          border: "rgba(66,191,186,0.18)",
        },
      ].map((stat, i) => (
        <div key={i} style={{
          padding: "20px 22px", borderRadius: 12, textAlign: "center",
          background: stat.bg, border: `1px solid ${stat.border}`,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.8,
            color: stat.color, marginBottom: 10,
          }}>{stat.label}</div>
          <div style={{
            fontSize: stat.value === "HIGH" ? 28 : 40, fontWeight: 700,
            color: stat.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
            marginBottom: 8,
          }}>{stat.value}</div>
          <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------
   SEARCH DEMAND CARD (middle of report)
---------------------------------------- */
function SearchDemandCard({ ind, loc, t }) {
  const city = loc.split(",")[0].trim();
  const keywords = [
    { term: `${ind} services ${city}`,       volume: 390, trend: "up"   },
    { term: `${ind} companies near me`,       volume: 720, trend: "up"   },
    { term: `best ${ind} contractor ${city}`, volume: 210, trend: "up"   },
    { term: `${ind} ${city} reviews`,         volume: 170, trend: "flat" },
    { term: `${ind} cost estimate ${city}`,   volume: 140, trend: "up"   },
    { term: `hire ${ind} company ${city}`,    volume: 90,  trend: "up"   },
  ];
  const totalVolume = keywords.reduce((s, k) => s + k.volume, 0);
  const estimatedLeads = Math.round(totalVolume * 0.038);

  function TrendArrow({ trend }) {
    return (
      <span style={{ fontSize: 12, color: trend === "up" ? brand.talentTeal : brand.inboundOrange, fontWeight: 700 }}>
        {trend === "up" ? "↑" : "→"}
      </span>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Hero stat banner */}
      <div style={{
        padding: "28px 32px", borderRadius: 14, marginBottom: 12,
        background: `linear-gradient(135deg, rgba(255,33,15,0.06) 0%, rgba(66,191,186,0.04) 100%)`,
        border: `1px solid rgba(255,33,15,0.15)`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
      }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2,
            color: brand.pipelineRed, marginBottom: 10,
          }}>Market Demand — {loc}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{
              fontSize: 52, fontWeight: 700, color: t.text,
              fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
            }}>{totalVolume.toLocaleString()}</span>
            <span style={{ fontSize: 16, color: t.subtle, fontWeight: 500 }}>searches / month</span>
          </div>
          <div style={{ fontSize: 13, color: t.body, marginTop: 8 }}>
            for <strong style={{ color: t.text }}>{ind}</strong> services in your market
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ padding: "16px 22px", borderRadius: 10, textAlign: "center", background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: brand.talentTeal, fontFamily: "'JetBrains Mono', monospace" }}>~{estimatedLeads}</div>
            <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Est. Leads / Mo</div>
            <div style={{ fontSize: 10, color: t.subtle, marginTop: 2 }}>if you ranked #1</div>
          </div>
          <div style={{ padding: "16px 22px", borderRadius: 10, textAlign: "center", background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: brand.inboundOrange, fontFamily: "'JetBrains Mono', monospace" }}>{keywords.length}</div>
            <div style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginTop: 4 }}>Keyword Gaps</div>
            <div style={{ fontSize: 10, color: t.subtle, marginTop: 2 }}>uncaptured demand</div>
          </div>
        </div>
      </div>

      {/* Keyword rows */}
      <div style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{
          padding: "12px 18px", borderBottom: `1px solid ${t.cardBorder}`,
          display: "grid", gridTemplateColumns: "1fr 100px 60px 80px", gap: 8,
        }}>
          {["Search Term", "Monthly Volume", "Trend", "Opportunity"].map(h => (
            <span key={h} style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{h}</span>
          ))}
        </div>
        {keywords.map((kw, i) => {
          const oppColor = kw.volume >= 300 ? brand.pipelineRed : kw.volume >= 150 ? brand.inboundOrange : brand.talentTeal;
          const oppLabel = kw.volume >= 300 ? "High" : kw.volume >= 150 ? "Medium" : "Low";
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 100px 60px 80px",
              alignItems: "center", padding: "13px 18px",
              borderBottom: i < keywords.length - 1 ? `1px solid ${t.cardBorder}` : "none",
              gap: 8, transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 13, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{kw.term}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{kw.volume.toLocaleString()}</span>
              <TrendArrow trend={kw.trend} />
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                color: oppColor, background: `${oppColor}18`, border: `1px solid ${oppColor}33`,
                padding: "3px 8px", borderRadius: 4, textAlign: "center",
              }}>{oppLabel}</span>
            </div>
          );
        })}
        <div style={{
          padding: "12px 18px", background: `rgba(66,191,186,0.04)`,
          borderTop: `1px solid ${t.cardBorder}`, fontSize: 11, color: t.subtle,
        }}>
          ★ Source: Estimated via SEMrush keyword data · volumes reflect avg monthly searches in target geo
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------
   SDR MODE — Condensed 4-section view
---------------------------------------- */
function SDRModeView({ t, ind, loc, projectSize, domain, scores = {} }) {
  const techScore = scores.tech ?? 0;
  const searchScore = scores.search ?? 0;
  const entityScore = scores.entity ?? 0;
  const passCount = attributionChecks.filter(c => c.pass).length;
  const infraScore = Math.round((passCount / attributionChecks.length) * 100);

  const city = (loc || "Dallas, TX").split(",")[0].trim();
  const base = ind || "Commercial Construction";

  const keywords = [
    { term: `${base} services ${city}`,       volume: 390 },
    { term: `${base} companies near me`,       volume: 720 },
    { term: `best ${base} contractor ${city}`, volume: 210 },
    { term: `${base} cost estimate ${city}`,   volume: 140 },
  ];
  const totalVolume = keywords.reduce((s, k) => s + k.volume, 0);
  const estimatedLeads = Math.round(totalVolume * 0.038);

  const sizeMap = {
    "Under $50k":    { value: 35000,   label: "~$35k" },
    "$50k–$150k":    { value: 100000,  label: "~$100k" },
    "$150k–$500k":   { value: 300000,  label: "~$300k" },
    "$500k–$1M":     { value: 750000,  label: "~$750k" },
    "$1M+":          { value: 1250000, label: "$1M+" },
  };
  const sizeEntry = sizeMap[projectSize] || { value: 250000, label: "$250k+" };
  const monthlyRevOpp = Math.round(estimatedLeads * sizeEntry.value);
  const formatRev = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${Math.round(n / 1000)}k`;

  const criticalIssues = [
    { title: "No conversion tracking installed", reason: "Leads are invisible. You cannot optimize what you cannot measure." },
    { title: "Below-threshold page speed on mobile", reason: "54/100 PSI score — Google's ranking algorithm penalizes slow mobile sites directly." },
    { title: "Zero content published in 30+ days", reason: "Without new content, you're invisible at the moment of intent." },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Market demand */}
      <Card title="Market Demand" t={t}>
        <div style={{ padding: "20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{base} searches in {city}</div>
            <div style={{ fontSize: 44, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.text, lineHeight: 1 }}>{totalVolume.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: t.subtle, marginTop: 4 }}>searches / month — buyers actively looking for services like yours</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Est. Leads if Ranked #1</div>
            <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.talentTeal, lineHeight: 1 }}>~{estimatedLeads}</div>
            <div style={{ fontSize: 12, color: t.subtle, marginTop: 4 }}>per month</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {keywords.map((kw, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "11px 20px",
              borderTop: `1px solid ${t.cardBorder}`, transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 13, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{kw.term}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: brand.inboundOrange, fontFamily: "'JetBrains Mono', monospace" }}>{kw.volume.toLocaleString()}/mo</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Visibility gap */}
      <Card title="Visibility Gap" t={t}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { label: "Your Score", value: Math.round((searchScore + techScore + entityScore) / 3), suffix: "/100", color: brand.pipelineRed },
            { label: "Competitor Avg", value: "71", suffix: "/100", color: brand.inboundOrange },
            { label: "Gap", value: `${71 - Math.round((searchScore + techScore + entityScore) / 3)}`, suffix: " pts", color: brand.talentTeal },
          ].map((stat, i) => (
            <div key={i} style={{ padding: "24px 20px", textAlign: "center", borderRight: i < 2 ? `1px solid ${t.cardBorder}` : "none" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: stat.color, marginBottom: 10 }}>{stat.label}</div>
              <div style={{ fontSize: 38, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: stat.color, lineHeight: 1 }}>{stat.value}<span style={{ fontSize: 14, color: t.subtle }}>{stat.suffix}</span></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Revenue opportunity */}
      <Card title="Revenue Opportunity" t={t}>
        <div style={{ padding: "24px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Monthly Pipeline Opportunity</div>
            <div style={{ fontSize: 42, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: brand.pipelineRed, lineHeight: 1 }}>
              {formatRev(monthlyRevOpp * 0.9)}–{formatRev(monthlyRevOpp * 1.1)}
            </div>
            <div style={{ fontSize: 12, color: t.subtle, marginTop: 6 }}>
              {estimatedLeads} leads × {sizeEntry.label} avg deal · Conservative estimate
            </div>
          </div>
          <div style={{
            padding: "10px 18px", borderRadius: 20,
            background: "rgba(255,33,15,0.08)", border: "1px solid rgba(255,33,15,0.2)",
            fontSize: 13, fontWeight: 700, color: brand.pipelineRed,
          }}>
            3 projects pays for the program
          </div>
        </div>
      </Card>

      {/* Critical issues */}
      <CriticalFixes t={t} items={criticalIssues} />
    </div>
  );
}

/* ----------------------------------------
   MAIN COMPONENT
---------------------------------------- */
export default function DigitalHealthAssessment({ data, theme, onReset }) {
  const [activeTab, setActiveTab] = useState(0);
  const [reportMode, setReportMode] = useState("sdr");

  const t = theme;

  // Industry/market/projectSize: used for prose interpolation in tabs.
  // Phase 3 will derive these from data.places where available; for now
  // we keep the original component's defaults so tab rendering is unchanged.
  const industryLabel = "buyers";
  const ind = "Commercial Construction";
  const loc = "Dallas, TX";
  const projectSize = "$250,000";
  const targetIndustries = [];

  // Dynamic CTA — Expected → Aggressive
  const expResult = calcScenario(revenueScenarios.expected);
  const aggResult = calcScenario(revenueScenarios.aggressive);
  const ctaLow = expResult.monthlyRevenue.toLocaleString();
  const ctaHigh = aggResult.monthlyRevenue.toLocaleString();

  // Module scores now come from the API (computed server-side by /api/audit).
  // These replace the old calculateModuleScore(xxxMetrics) calls that ran
  // against hardcoded mock data.
  const techScore2 = data?.webPerf?.score ?? 0;
  const searchScore2 = data?.seo?.score ?? 0;
  const contentScore2 = data?.content?.score ?? 0;
  const entityScore2 = data?.entity?.score ?? 0;

  // Packaged scores object passed to SDRModeView and RevenueAttributionTab
  const scores = {
    tech: techScore2,
    search: searchScore2,
    content: contentScore2,
    entity: entityScore2,
  };

  const inboundOppScore = Math.round((searchScore2 * 0.5) + (techScore2 * 0.3) + (entityScore2 * 0.2));
  const localVisScore = Math.round((entityScore2 * 0.6) + (searchScore2 * 0.4));

  const scorecards = [
    {
      label: "Inbound Opportunity Score",
      score: inboundOppScore,
      color: brand.pipelineRed,
      sub: "Search + Technical + Entity",
      icon: "🎯",
    },
    {
      label: "Technical Health Score",
      score: techScore2,
      color: brand.cloudBlue,
      sub: "Site speed, crawlability, core web vitals",
      icon: "⚙️",
    },
    {
      label: "Local Visibility Score",
      score: localVisScore,
      color: brand.talentTeal,
      sub: "GBP, NAP, entity signals",
      icon: "📍",
    },
  ];

  const tabScores = [
    { score: techScore2, label: "Technical Foundation Score" },
    { score: searchScore2, label: "Authority & Search Score" },
    { score: null, label: "Competitor Analysis" },
    { score: contentScore2, label: "Content & Topical Depth Score" },
    { score: entityScore2, label: "Entity & Brand Authority Score" },
    { score: null, label: "Revenue & Attribution" },
  ];

  const tabContent = [
    <TechnicalFoundationTab t={t} metrics={data?.webPerf?.metrics || []} />,
    <AuthoritySearchTab t={t} ind={ind} loc={loc} metrics={data?.seo?.metrics || []} providerError={data?.errors?.semrush || null} />,
    <CompetitorsTab t={t} loc={loc} ind={ind} competitors={data?.competitors || []} />,
    <ContentTopicalDepthTab t={t} ind={ind} loc={loc} targetIndustries={targetIndustries} metrics={data?.content?.metrics || []} />,
    <EntityBrandAuthorityTab t={t} metrics={data?.entity?.metrics || []} gbpFound={!!data?.places} />,
    <RevenueAttributionTab t={t} ind={ind} loc={loc} projectSize={projectSize} scores={scores} />,
  ];



  return (
    <div style={{
      minHeight: "100vh", background: t.bgGrad, color: t.text,
      fontFamily: "'Barlow', 'Helvetica Neue', sans-serif",
      transition: "background 0.4s, color 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.scrollHover}; }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 20px" }}>

        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <AbstraktLogo fill={t.logoFill} height={26} />
          {onReset && (
            <button onClick={onReset} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20,
              border: `1px solid ${t.toggleBorder}`, background: t.toggleBg,
              color: t.subtle, fontSize: 12, fontWeight: 500, cursor: "pointer",
              transition: "all 0.25s", letterSpacing: 0.3, fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 13 }}>{"\u2190"}</span>
              New Audit
            </button>
          )}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 20,
            background: t.badgeBg, border: `1px solid ${t.badgeBorder}`,
            fontSize: 11, color: t.badgeText, textTransform: "uppercase", letterSpacing: 2.5, fontWeight: 600,
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.badgeDot, boxShadow: "0 0 8px rgba(239,239,239,0.3)" }} />
            Abstrakt Marketing Group
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 10,
            color: brand.pipelineRed,
          }}>
            Inbound Opportunity Audit
          </h1>
          <p style={{ fontSize: 16, color: t.body, letterSpacing: 0.1, marginBottom: 10, fontWeight: 500 }}>
            See how many {industryLabel} are searching for your services online.
          </p>
          <p style={{ fontSize: 14, color: t.subtle, letterSpacing: 0.2, maxWidth: 520, margin: "0 auto" }}>
            We analyze search demand, competitors, and your website's ability to capture inbound leads.
          </p>
        </div>

        {/* View toggle removed — view state managed by app/page.js */}

            {/* Pending providers banner (shown when some data sources failed or are still processing) */}
            <PendingBanner pendingProviders={data?.pendingProviders || []} t={t} />

            {/* SDR / Deep Dive Mode Toggle */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 28, padding: 4, background: t.toggleBg, borderRadius: 10, border: `1px solid ${t.cardBorder}` }}>
              {[
                { id: "sdr",      label: "⚡  SDR Mode",      sub: "Quick call view" },
                { id: "deepdive", label: "🔍  Deep Dive",     sub: "Full audit detail" },
              ].map(m => (
                <button key={m.id} onClick={() => setReportMode(m.id)} style={{
                  flex: 1, padding: "10px 16px", borderRadius: 7, border: "none",
                  background: reportMode === m.id ? `linear-gradient(135deg, ${brand.pipelineRed}, ${brand.inboundOrange})` : "transparent",
                  color: reportMode === m.id ? "#fff" : t.subtle,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                  letterSpacing: 0.3,
                }}>{m.label}</button>
              ))}
            </div>

            {reportMode === "sdr" ? (
              <SDRModeView t={t} ind={ind} loc={loc} projectSize={projectSize} domain={data?.meta?.url || ""} scores={scores} />
            ) : (
              <>
            {/* Scorecard Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
              {scorecards.map((card, i) => {
                const pct = card.score;
                const status = pct >= 70 ? "Healthy" : pct >= 45 ? "Opportunity" : "Needs Attention";
                const statusColor = pct >= 70 ? brand.talentTeal : pct >= 45 ? brand.inboundOrange : brand.pipelineRed;
                return (
                  <div key={i} style={{
                    padding: "20px", borderRadius: 14,
                    background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                    display: "flex", flexDirection: "column", gap: 10,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 18 }}>{card.icon}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                        color: statusColor, background: `${statusColor}15`,
                        border: `1px solid ${statusColor}30`, borderRadius: 20, padding: "2px 10px",
                      }}>{status}</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 5, borderRadius: 3, background: t.toggleBg, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: card.color, transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: card.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{pct}</span>
                      <span style={{ fontSize: 13, color: t.subtle }}>/100</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: t.text, fontWeight: 600, marginBottom: 2 }}>{card.label}</div>
                      <div style={{ fontSize: 11, color: t.subtle }}>{card.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>

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

            {/* Shared Tab Score */}
            {tabScores[activeTab].score !== null && (
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <ScoreRing score={tabScores[activeTab].score} size={140} t={t} />
                <div style={{ fontSize: 12, color: t.subtle, textTransform: "uppercase", letterSpacing: 2, fontWeight: 500 }}>
                  {tabScores[activeTab].label}
                </div>
              </div>
            )}

            {tabContent[activeTab]}


            {/* Dynamic CTA Banner */}
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
              <div style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2,
                color: brand.pipelineRed, background: "rgba(255,33,15,0.08)", border: "1px solid rgba(255,33,15,0.15)",
                padding: "5px 14px", borderRadius: 20, marginBottom: 16, position: "relative",
              }}>Pipeline Opportunity</div>
              <h3 style={{
                fontSize: 24, fontWeight: 700, marginBottom: 14, position: "relative",
                color: t.text, lineHeight: 1.3,
              }}>
                You're Leaving{" "}
                <span style={{ color: brand.pipelineRed }}>${ctaLow}–${ctaHigh}</span>
                <br />in Monthly Pipeline Untapped
              </h3>
              <p style={{
                fontSize: 15, color: t.body, maxWidth: 520,
                margin: "0 auto 28px", position: "relative", lineHeight: 1.6,
              }}>
                Fix your digital visibility gaps and Abstrakt can help you capture this pipeline within 90 days.
              </p>
              <button style={{
                padding: "15px 40px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                letterSpacing: 0.5, position: "relative",
                boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
              }}>
                Get Your Personalized Strategy →
              </button>
            </div>
              </>
            )}

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
