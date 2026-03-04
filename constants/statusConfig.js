import { brand } from "./brand.js";

/* ── Polling / Retry Config ── */
export const POLL_INTERVAL_MS = 30000;    // 30 seconds between refresh polls
export const MAX_POLL_ATTEMPTS = 6;       // 6 × 30s = 3 minutes max

/* ── Status Banner Variants ──
 *  Edit these to change banner text, color, or icon across the app.
 *  message() receives `count` (for pending) or `detail` (for error).
 *  icon: "pulse" = pulsing dot, "spin" = spinning circle, "check" = ✅
 */
export const STATUS_BANNERS = {
  pending: {
    message: (count) => `${count} data source${count > 1 ? "s" : ""} still processing — auto-refreshing`,
    color: brand.inboundOrange,
    icon: "pulse",
  },
  refreshing: {
    message: () => "Updating metrics...",
    color: brand.inboundOrange,
    icon: "spin",
  },
  complete: {
    message: () => "Audit complete — all data sources loaded",
    color: brand.talentTeal,
    icon: "check",
  },
  error: {
    message: (detail) => detail || "Something went wrong — please try again",
    color: brand.pipelineRed,
    icon: "pulse",
  },
};
