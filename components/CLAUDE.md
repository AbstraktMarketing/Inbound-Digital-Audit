# Components — Claude Context

All components are client-side React (`"use client"`) and use inline styles with a shared brand palette.

## Component Files

### AuditForm.jsx
- **Export:** `AuditForm({ onSubmit, theme })`
- **What it does:** Intake form for starting an audit. Fields: company name, URL, contact name, email, phone, optional SEMrush project ID. Handles validation and submit state.

### AuditLoading.jsx
- **Export:** `AuditLoading({ url, companyName, theme })`
- **What it does:** Animated loading screen shown while the audit runs. Steps through progress stages with a progress bar.

### DigitalHealthAssessment.jsx
- **Export:** `DigitalHealthAssessment` (default)
- **What it does:** The main results display component. Renders the full audit report with scored metric cards across categories: Web Performance, SEO, Keywords, Content, Social/Local, AI SEO, and Entity/Brand.
- **Note:** This is the largest file in the project. It consumes the metric object built by the audit orchestrator.

## Patterns
- Brand colors and theme tokens are imported from `constants/brand.js`.
- Mock/demo data is imported from `constants/mockData.js`.
- Theme support (light/dark) is passed via a `theme` prop.
- No CSS modules or Tailwind — all styling is inline.
