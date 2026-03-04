"use client";
import React from "react";
import { STATUS_BANNERS } from "../constants/statusConfig.js";

/**
 * Reusable status banner component.
 *
 * @param {string}  variant  - Key into STATUS_BANNERS ("pending", "refreshing", "complete", "error")
 * @param {number}  [count]  - Passed to message function (e.g., pending provider count)
 * @param {string}  [message] - Override the default message text
 * @param {string}  [color]  - Override the default color
 * @param {object}  t        - Theme object ({ cardBorder, ... } from getTheme)
 * @param {boolean} visible  - Renders nothing when false
 */
export default function StatusBanner({ variant = "pending", count, message, color, t, visible }) {
  if (!visible) return null;

  const config = STATUS_BANNERS[variant] || STATUS_BANNERS.pending;
  const bannerColor = color || config.color;
  const bannerMessage = message || config.message(count);
  const iconType = config.icon;

  return (
    <>
      <div style={{
        marginTop: 16, padding: "12px 20px", borderRadius: 10,
        background: `${bannerColor}08`, border: `1px solid ${bannerColor}20`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      }}>
        {iconType === "spin" && (
          <span style={{
            display: "inline-block", width: 14, height: 14,
            border: `2px solid ${bannerColor}40`, borderTopColor: bannerColor,
            borderRadius: "50%", animation: "auditSpin 0.8s linear infinite",
          }} />
        )}
        {iconType === "pulse" && (
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: bannerColor, animation: "auditPulse 2s ease-in-out infinite",
          }} />
        )}
        {iconType === "check" && (
          <span style={{ fontSize: 12, color: bannerColor }}>{String.fromCodePoint(0x2705)}</span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: bannerColor }}>
          {bannerMessage}
        </span>
      </div>
      <style>{`
        @keyframes auditSpin { to { transform: rotate(360deg); } }
        @keyframes auditPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  );
}
