/* ── Brand Palette ── */
export const brand = {
  growthGray: "#333333",
  pipelineRed: "#FF210F",
  creativePink: "#F725A2",
  inboundOrange: "#F46F0A",
  cloudBlue: "#0481A3",
  talentTeal: "#42BFBA",
  lightGray: "#EFEFEF",
  enterpriseMaroon: "#8C082B",
};

export const accent = brand.talentTeal;
export const accentAlt = brand.cloudBlue;

/* ── Theme tokens ── */
export function getTheme(mode) {
  if (mode === "dark") return {
    bg: "#111114", bgGrad: "linear-gradient(180deg, #111114 0%, #0d0d12 50%, #0f1015 100%)",
    cardBg: "rgba(255,255,255,0.035)", cardBorder: "rgba(255,255,255,0.07)",
    subtle: "rgba(239,239,239,0.55)", body: "rgba(239,239,239,0.72)",
    text: "#EFEFEF", inputBg: "rgba(255,255,255,0.025)",
    scrollThumb: "rgba(66,191,186,0.2)", scrollHover: "rgba(66,191,186,0.35)",
    hoverRow: "rgba(66,191,186,0.03)", logoFill: "#EFEFEF",
    toggleBg: "rgba(255,255,255,0.06)", toggleBorder: "rgba(255,255,255,0.1)",
    badgeBg: "rgba(66,191,186,0.08)", badgeBorder: "rgba(66,191,186,0.15)",
    ctaBtnColor: "#fff", statusDot: "#0a0a0a", badgeText: "#EFEFEF", badgeDot: "#EFEFEF",
  };
  return {
    bg: "#f5f5f7", bgGrad: "linear-gradient(180deg, #f5f5f7 0%, #eeeef0 50%, #e8e8ec 100%)",
    cardBg: "rgba(255,255,255,0.85)", cardBorder: "rgba(0,0,0,0.08)",
    subtle: "rgba(51,51,51,0.58)", body: "rgba(51,51,51,0.75)",
    text: "#1a1a1a", inputBg: "rgba(0,0,0,0.03)",
    scrollThumb: "rgba(66,191,186,0.3)", scrollHover: "rgba(66,191,186,0.5)",
    hoverRow: "rgba(66,191,186,0.05)", logoFill: "#333333",
    toggleBg: "rgba(0,0,0,0.04)", toggleBorder: "rgba(0,0,0,0.1)",
    badgeBg: "rgba(255,33,15,0.06)", badgeBorder: "rgba(255,33,15,0.12)",
    ctaBtnColor: "#fff", statusDot: "#fff", badgeText: brand.enterpriseMaroon, badgeDot: brand.enterpriseMaroon,
  };
}
