<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inbound Dashboard - March 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Barlow, sans-serif; }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Barlow', sans-serif; background: #f8fafc; color: #1e293b; font-size: 14px; }
    .container { min-height: 100vh; padding: 24px 32px; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .header h1 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
    .date-badge { display: flex; align-items: center; gap: 8px; background: #fff; border-radius: 8px; padding: 8px 12px; border: 1px solid #e2e8f0; cursor: pointer; }
    .date-badge svg { color: #8C082B; }
    .date-badge span { font-weight: 600; color: #1e293b; }
    .date-badge .arrow { margin-left: 4px; color: #64748b; }
    
    /* Tabs */
    .tabs { display: flex; gap: 0; margin-bottom: 16px; align-items: center; }
    .tab { padding: 10px 24px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; background: transparent; color: #64748b; transition: all 0.2s; }
    .tab:hover { color: #1e293b; }
    .tab.active { background: #8C082B; color: #fff; border-radius: 6px; }
    
    /* Insights Banner */
    .insights-banner { background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 0.875rem; color: #475569; }
    .insights-banner strong { color: #1e293b; }
    
    /* Cards - Standardized */
    .card { 
      background: #fff; 
      border-radius: 12px; 
      padding: 16px; 
      border: 1px solid #cbd5e1; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); 
    }
    
    /* Primary KPI Cards */
    .kpi-primary { padding: 16px 20px !important; display: flex; flex-direction: column; height: 100%; }
    .kpi-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .kpi-icon { display: flex; align-items: center; opacity: 0.8; color: #1e293b; }
    .kpi-label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
    .kpi-hero { font-size: 2.5rem; font-weight: 800; line-height: 1; margin-bottom: 4px; letter-spacing: -0.02em; color: #1e293b; }
    .kpi-meta { font-size: 0.8rem; color: #64748b; font-weight: 500; margin-bottom: 8px; }
    .kpi-trend { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; padding-top: 8px; margin-top: auto; border-top: 1px solid #e2e8f0; }
    .kpi-trend.up { color: #16a34a; }
    .kpi-trend.down { color: #dc2626; }
    .kpi-trend.neutral { color: #1e293b; }
    .trend-icon { font-size: 0.85rem; }
    
    /* Stacked KPI Cards (for February/January columns) */
    .kpi-stacked { padding: 14px 18px !important; display: flex; flex-direction: column; flex: 1; }
    .kpi-stacked .kpi-header { margin-bottom: 2px; }
    .kpi-stacked .kpi-meta { margin-bottom: 0; }
    .kpi-hero-stacked { font-size: 2rem; font-weight: 800; line-height: 1; margin-bottom: 2px; letter-spacing: -0.02em; color: #1e293b; }
    .kpi-muted { background: #f8fafc !important; border-color: #e2e8f0 !important; }
    .kpi-muted .kpi-label { color: #94a3b8; }
    .kpi-muted .kpi-meta { color: #94a3b8; }
    
    /* KPI Recap Section */
    .kpi-recap { padding-top: 8px; margin-top: auto; border-top: 1px solid #e2e8f0; }
    .kpi-recap-header { font-size: 0.6rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px; }
    .kpi-recap-value { font-size: 0.8rem; font-weight: 700; color: #1e293b; }
    
    /* Highlighted KPI (Total Revenue) - Premium Hero Card */
    .kpi-highlight { 
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%) !important; 
      border: none !important; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04) !important;
      padding: 20px 24px !important;
    }
    .kpi-highlight .kpi-header { margin-bottom: 8px; }
    .kpi-highlight .kpi-icon { color: rgba(255,255,255,0.6); }
    .kpi-highlight .kpi-label { color: rgba(255,255,255,0.6); font-size: 0.7rem; letter-spacing: 0.1em; }
    .kpi-highlight .kpi-hero { color: #fff !important; font-size: 2.5rem; margin-bottom: 4px; }
    .kpi-highlight .kpi-meta { color: rgba(255,255,255,0.5); margin-bottom: 8px; }
    .kpi-highlight .kpi-recap { border-top-color: rgba(255,255,255,0.15); }
    .kpi-highlight .kpi-recap-header { color: rgba(255,255,255,0.5); }
    .kpi-highlight .kpi-recap-value { color: #fff; }
    .kpi-highlight .kpi-trend { border-top-color: rgba(255,255,255,0.15); padding-top: 8px; }
    .kpi-highlight .kpi-trend.up { color: #6ee7b7; }
    .kpi-highlight .kpi-trend.down { color: #fca5a5; }
    
    /* Secondary KPI Cards */
    .kpi-secondary { padding: 14px 16px !important; display: flex; flex-direction: column; height: 100%; }
    .kpi-header-sm { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .kpi-icon-sm { display: flex; align-items: center; opacity: 0.7; color: #1e293b; }
    .kpi-icon-sm svg { width: 14px; height: 14px; }
    .kpi-label-sm { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
    .kpi-value-sm { font-size: 1.75rem; font-weight: 800; line-height: 1.1; margin-bottom: 2px; color: #1e293b; }
    .kpi-meta-sm { font-size: 0.7rem; color: #94a3b8; margin-bottom: 6px; }
    .kpi-trend-sm { font-size: 0.7rem; font-weight: 600; padding-top: 6px; margin-top: auto; border-top: 1px solid #e2e8f0; }
    .kpi-trend-sm.up { color: #16a34a; }
    .kpi-trend-sm.down { color: #dc2626; }
    
    /* Pitches Card */
    .pitches-card { padding: 14px 16px !important; display: flex; flex-direction: column; height: 100%; }
    .pitches-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .pitches-title { font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
    .pitches-subtitle { font-size: 0.65rem; color: #94a3b8; font-weight: 500; }
    .pitches-table { flex: 1; }
    
    /* Pitch Rows - Clean product-like list */
    .pitch-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 6px; margin-bottom: 2px; }
    .pitch-row:nth-child(odd) { background: rgba(248,250,252,0.8); }
    .pitch-row:nth-child(even) { background: transparent; }
    .pitch-row.current { background: linear-gradient(90deg, rgba(100,116,139,0.12) 0%, rgba(100,116,139,0.04) 100%); border-left: 3px solid #64748b; margin-left: -3px; padding-left: 13px; }
    .pitch-row.current .pitch-month { color: #475569; font-weight: 700; }
    .pitch-row.current .pitch-count { color: #475569; }
    .pitch-row.avg { border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 10px; background: transparent !important; }
    .pitch-row.avg .pitch-month { color: #64748b; font-weight: 700; font-size: 0.7rem; text-transform: uppercase; }
    .pitch-row.avg .pitch-count { color: #64748b; font-weight: 700; }
    .pitch-month { font-weight: 600; color: #334155; font-size: 0.8rem; flex: 1; }
    .pitch-count { font-weight: 800; color: #1e293b; font-size: 0.95rem; min-width: 32px; text-align: center; margin-right: 8px; }
    
    /* Pitch Badges - Pill style */
    .pitch-badge { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.65rem; padding: 4px 10px; border-radius: 20px; min-width: 56px; }
    .pitch-badge.up { color: #16a34a; background: rgba(22,163,74,0.1); }
    .pitch-badge.down { color: #dc2626; background: rgba(220,38,38,0.1); }
    .pitch-badge.pending { color: #64748b; background: #f1f5f9; font-size: 0.6rem; }
    .pitch-badge.neutral { color: #94a3b8; background: transparent; }
    
    /* Section Title */
    .section-title { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section-title .dot { width: 8px; height: 8px; border-radius: 50%; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    
    /* Revenue Mix */
    .revenue-legend { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
    .legend-label { color: #64748b; }
    .legend-value { font-weight: 700; }
    .legend-target { color: #94a3b8; font-weight: 400; }
    .progress-label { font-size: 0.75rem; color: #94a3b8; margin-bottom: 6px; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
    .progress-fill { height: 100%; border-radius: 4px; }
    .progress-text { font-size: 0.875rem; }
    .progress-text .value { font-weight: 700; }
    .progress-text .target { color: #94a3b8; }
    .progress-gap { font-size: 0.8rem; color: #64748b; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
    .progress-gap .gap-value { font-weight: 700; color: #ca8a04; }
    .progress-gap .gap-separator { margin: 0 8px; color: #cbd5e1; }
    .progress-gap .gap-note { color: #94a3b8; margin-left: 4px; }
    
    /* Close Rate by Source */
    .close-rate-list { display: flex; flex-direction: column; gap: 14px; }
    .close-rate-row { display: flex; align-items: center; gap: 12px; }
    .close-rate-name { font-size: 0.85rem; font-weight: 500; color: #334155; }
    .close-rate-bar-container { flex: 1; height: 20px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .close-rate-bar { height: 100%; background: #8C082B; border-radius: 4px; transition: width 0.5s; }
    .close-rate-value { width: 50px; font-size: 0.85rem; font-weight: 700; color: #334155; text-align: right; flex-shrink: 0; }
    
    /* Deal List */
    .deal-item { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; }
    .deal-item:last-child { margin-bottom: 0; }
    .deal-num { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; margin-right: 12px; flex-shrink: 0; }
    .deal-info { flex: 1; }
    .deal-name { font-weight: 600; color: #1e293b; font-size: 0.875rem; margin-bottom: 2px; }
    .deal-source { font-size: 0.75rem; color: #64748b; }
    .deal-meta { font-size: 0.7rem; color: #94a3b8; margin-top: 2px; }
    .deal-amount { font-weight: 700; font-size: 0.95rem; flex-shrink: 0; }
    
    /* Grid layouts */
    .row { display: grid; gap: 16px; margin-bottom: 20px; align-items: stretch; }
    .row-4-1 { grid-template-columns: 1fr 1fr 1fr 280px; }
    .row-3 { grid-template-columns: 1fr 1fr 1fr; }
    .row-2 { grid-template-columns: 1fr 1fr; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 32px; align-items: stretch; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; align-items: stretch; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
    .space-y-8 > * + * { margin-top: 32px; }
    .col-span-2 { grid-column: span 2; }
    
    /* Horizontal Bars */
    .h-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .h-bar-label { width: 128px; font-size: 0.875rem; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .h-bar-track { flex: 1; height: 24px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
    .h-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
    .h-bar-value { width: 48px; text-align: right; font-size: 0.875rem; font-weight: 700; }
    
    /* Vertical Chart */
    .v-chart { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; height: 256px; padding: 0 16px; }
    .v-bar-container { display: flex; flex-direction: column; align-items: center; flex: 1; }
    .v-bar-value { font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; }
    .v-bar-track { width: 100%; height: 200px; background: #f1f5f9; border-radius: 4px 4px 0 0; position: relative; }
    .v-bar-fill { position: absolute; bottom: 0; width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s; }
    .v-bar-label { font-size: 0.75rem; color: #64748b; margin-top: 8px; }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 16px; font-size: 0.875rem; font-weight: 500; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    th.center { text-align: center; }
    th.right { text-align: right; }
    td { padding: 16px; font-size: 0.875rem; border-bottom: 1px solid #f1f5f9; }
    td.center { text-align: center; }
    td.right { text-align: right; }
    tr:hover { background: #f8fafc; }
    tr.alt { background: rgba(248,250,252,0.5); }
    .badge { padding: 4px 8px; border-radius: 6px; font-size: 0.875rem; font-weight: 500; }
    
    /* Insights */
    .insight-card { padding: 12px; border-radius: 10px; margin-bottom: 12px; }
    .insight-card:last-child { margin-bottom: 0; }
    .insight-title { font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 0.85rem; }
    .insight-text { font-size: 0.8rem; color: #64748b; line-height: 1.4; }
    .insight-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
    .insight-metric { font-weight: 700; font-size: 0.85rem; }
    
    /* Initiatives */
    .initiative { padding: 14px; border-radius: 10px; border: 1px solid; display: flex; flex-direction: column; }
    .initiative-num { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-bottom: 8px; font-size: 0.85rem; }
    .initiative h4 { font-size: 0.8rem; font-weight: 600; color: #1e293b; margin-bottom: 6px; line-height: 1.3; }
    .initiative p { font-size: 0.7rem; color: #64748b; line-height: 1.4; margin-bottom: 8px; }
    .initiative .outcome { font-size: 0.65rem; font-weight: 600; color: #475569; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.06); margin-top: auto; }
    .initiative .outcome span { color: #1e293b; }
    .initiative .kpi-target { font-size: 0.75rem; font-weight: 600; color: #1e293b; margin-top: auto; }
    .initiative .kpi-target span { color: #64748b; font-weight: 500; }
    .exec-subtitle { font-size: 0.8rem; color: #64748b; margin-bottom: 12px; line-height: 1.4; }
    .deals-needed-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 0.8rem; color: #475569; background: #f8fafc; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
    .deals-needed-label { font-weight: 600; color: #64748b; }
    .deals-needed-item { background: #fff; padding: 4px 10px; border-radius: 4px; border: 1px solid #e2e8f0; }
    .deals-needed-item strong { color: #0d9488; font-weight: 800; }
    .deals-needed-warn strong { color: #dc2626; }
    .deals-needed-sep { color: #94a3b8; font-size: 0.75rem; }
    .exec-takeaway { background: linear-gradient(135deg, rgba(13,148,136,0.08) 0%, rgba(140,8,43,0.08) 100%); border: 1px solid rgba(13,148,136,0.25); border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
    .exec-takeaway-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0d9488; margin-bottom: 8px; }
    .exec-takeaway-list { list-style: none; display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 0; padding: 0; }
    .exec-takeaway-list li { font-size: 0.85rem; color: #334155; font-weight: 500; position: relative; padding-left: 16px; }
    .exec-takeaway-list li::before { content: '•'; position: absolute; left: 0; color: #0d9488; font-weight: 700; }
    .pace-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; display: flex; flex-direction: column; justify-content: center; gap: 8px; }
    .pace-row { display: flex; justify-content: space-between; align-items: center; }
    .pace-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .pace-value { font-size: 1.1rem; font-weight: 800; color: #1e293b; }
    .pace-goal { color: #dc2626; }
    .toggle-btn { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 12px; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .toggle-btn:hover { background: #e2e8f0; color: #1e293b; }
    .toggle-btn.active { background: #0d9488; color: #fff; border-color: #0d9488; }
    .trend-chart { display: flex; align-items: flex-end; justify-content: space-between; height: 120px; padding: 10px 0; gap: 16px; }
    .trend-bar-group { display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; }
    .trend-bar { background: linear-gradient(180deg, #f97316 0%, #fb923c 100%); border-radius: 4px 4px 0 0; width: 100%; max-width: 60px; display: flex; align-items: flex-start; justify-content: center; padding-top: 6px; transition: height 0.3s ease; }
    .trend-bar-current { background: linear-gradient(180deg, #0d9488 0%, #14b8a6 100%); }
    .trend-bar-value { font-size: 0.8rem; font-weight: 700; color: #fff; }
    .trend-bar-label { font-size: 0.75rem; font-weight: 600; color: #64748b; margin-top: 6px; }
    .trend-note { font-size: 0.7rem; color: #94a3b8; text-align: center; margin-top: 8px; font-style: italic; }
    .outlook-section { margin-bottom: 20px; }
    .outlook-header { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #1e293b; margin-bottom: 12px; }
    .outlook-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: stretch; }
    .outlook-block { border-radius: 8px; padding: 16px; height: 100%; box-sizing: border-box; }
    .outlook-blue { background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.25); }
    .outlook-orange { background: rgba(244,111,10,0.06); border: 1px solid rgba(244,111,10,0.25); }
    .outlook-red { background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.25); }
    .outlook-teal { background: rgba(13,148,136,0.06); border: 1px solid rgba(13,148,136,0.25); }
    .outlook-teal .outlook-block-title { color: #0d9488; }
    .outlook-block-split { border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; }
    .outlook-split-section { padding: 12px 16px; flex: 1; }
    .outlook-split-section.outlook-teal { background: rgba(13,148,136,0.06); border: 1px solid rgba(13,148,136,0.25); border-bottom: none; border-radius: 8px 8px 0 0; }
    .outlook-split-section.outlook-gray { background: #f1f5f9; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
    .outlook-split-section.outlook-gray .outlook-block-title { color: #64748b; }
    .outlook-split-divider { height: 1px; background: linear-gradient(to right, rgba(13,148,136,0.3), #e2e8f0); }
    .outlook-block-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .final-badge { font-size: 0.65rem; font-weight: 600; background: #16a34a; color: white; padding: 2px 8px; border-radius: 10px; text-transform: none; letter-spacing: 0; }
    .outlook-blue .outlook-block-title { color: #3b82f6; }
    .outlook-orange .outlook-block-title { color: #f46f0a; }
    .outlook-red .outlook-block-title { color: #dc2626; }
    .outlook-maroon { background: rgba(140,8,43,0.06); border: 1px solid rgba(140,8,43,0.25); }
    .outlook-maroon .outlook-block-title { color: #8c082b; }
    .outlook-note.strategic { font-style: normal; font-weight: 600; color: #1e293b; background: rgba(13,148,136,0.1); padding: 8px 10px; border-radius: 4px; margin-top: 10px; border-top: none; }
    .outlook-metrics { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
    .outlook-metric { display: flex; align-items: baseline; gap: 8px; }
    .outlook-label { font-size: 0.8rem; color: #64748b; min-width: 100px; }
    .outlook-value { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
    .outlook-value.negative { color: #dc2626; }
    .outlook-value.positive { color: #16a34a; }
    .outlook-value.bold { font-weight: 800; }
    .outlook-change { font-size: 0.7rem; font-weight: 600; }
    .outlook-change.positive { color: #16a34a; }
    .outlook-subtext { font-size: 0.7rem; color: #94a3b8; }
    .outlook-gap-title { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin: 8px 0 6px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.08); }
    .outlook-note { font-size: 0.75rem; color: #64748b; font-style: italic; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.08); line-height: 1.4; }
    .outlook-forecast { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.08); }
    .outlook-forecast-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; padding: 4px 0; }
    .outlook-forecast-row.alert { background: rgba(220,38,38,0.08); margin: 4px -8px; padding: 6px 8px; border-radius: 4px; }
    .outlook-forecast-value { font-weight: 700; color: #1e293b; }
    .pace-tracker-section { margin-bottom: 20px; }
    .pace-tracker-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .pace-tracker-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .pace-tracker-title { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #1e293b; }
    .risk-badge { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
    .risk-badge.risk-low { background: rgba(22,163,74,0.12); color: #16a34a; }
    .risk-badge.risk-moderate { background: rgba(202,138,4,0.12); color: #ca8a04; }
    .risk-badge.risk-high { background: rgba(220,38,38,0.12); color: #dc2626; }
    .pace-tracker-rows { display: flex; flex-direction: column; gap: 12px; }
    .pace-tracker-row { display: flex; align-items: center; gap: 16px; padding: 10px 12px; background: #f8fafc; border-radius: 6px; }
    .pace-tracker-month { font-size: 0.8rem; font-weight: 700; color: #1e293b; min-width: 90px; }
    .pace-tracker-data { display: flex; gap: 20px; font-size: 0.8rem; color: #64748b; }
    .pace-tracker-data strong { color: #1e293b; }
    .pace-gap { color: #dc2626; }
    .pace-gap strong { color: #dc2626; }
    .pace-tracker-row.risk-lever { background: linear-gradient(135deg, rgba(13,148,136,0.1), rgba(13,148,136,0.05)); border: 1px solid rgba(13,148,136,0.2); }
    .pace-tracker-lever-text { font-size: 0.85rem; font-weight: 600; color: #0d9488; }
    .pace-tracker-complete { background: rgba(22,163,74,0.08); border: 1px solid rgba(22,163,74,0.2); }
    .pace-tracker-mixed { background: rgba(202,138,4,0.08); border: 1px solid rgba(202,138,4,0.2); flex-wrap: wrap; }
    .pace-tracker-note { font-size: 0.75rem; color: #64748b; font-style: italic; width: 100%; margin-top: 6px; }
    .churn-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
    .churn-month { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
    .churn-value { font-size: 1.25rem; font-weight: 800; }
    .churn-value.negative { color: #dc2626; }
    .retention-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .retention-team-avg { font-size: 0.9rem; color: #64748b; }
    .retention-team-avg strong { color: #1e293b; font-size: 1.1rem; }
    .retention-list { display: flex; flex-direction: column; gap: 8px; }
    .retention-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #f8fafc; border-radius: 6px; flex-wrap: wrap; }
    .retention-row.inactive { opacity: 0.6; }
    .retention-name { font-weight: 600; color: #1e293b; min-width: 140px; }
    .retention-rate { font-weight: 700; font-size: 1.1rem; min-width: 70px; }
    .retention-rate.excellent { color: #16a34a; }
    .retention-rate.good { color: #65a30d; }
    .retention-rate.warning { color: #ca8a04; }
    .retention-rate.alert { color: #dc2626; }
    .retention-rate.na { color: #94a3b8; }
    .retention-note { font-size: 0.75rem; color: #94a3b8; font-style: italic; }
    .retention-breakdown { font-size: 0.8rem; color: #64748b; }
    .mrm-completion { display: flex; align-items: center; gap: 16px; }
    .mrm-label { font-size: 1rem; font-weight: 600; color: #1e293b; }
    .mrm-value { font-size: 1.5rem; font-weight: 800; color: #F97316; }
    .pace-positive { color: #16a34a; font-weight: 600; }
    .pace-positive strong { color: #16a34a; }
    .exec-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
    .exec-item { display: flex; gap: 12px; padding: 14px; background: #f8fafc; border-radius: 10px; }
    .exec-num { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .exec-content { flex: 1; }
    .exec-content h4 { font-size: 0.85rem; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
    .exec-content ul { margin: 0 0 8px 0; padding-left: 16px; }
    .exec-content li { font-size: 0.75rem; color: #64748b; line-height: 1.5; margin-bottom: 2px; }
    .exec-kpi { font-size: 0.75rem; font-weight: 600; color: #1e293b; padding-top: 6px; border-top: 1px solid #e2e8f0; }
    .exec-kpi span { color: #64748b; font-weight: 500; }
    .exec-outcomes { background: linear-gradient(135deg, rgba(13,148,136,0.08), rgba(140,8,43,0.08)); border-radius: 8px; padding: 20px 28px; text-align: center; border: 1px solid rgba(13,148,136,0.2); }
    .exec-outcomes h4 { font-size: 1rem; font-weight: 700; color: #0d9488; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .exec-outcomes ul { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px; }
    .exec-outcomes li { font-size: 0.95rem; color: #1e293b; font-weight: 600; display: flex; align-items: center; justify-content: center; }
    .plan-table { width: 100%; border-collapse: collapse; }
    .plan-table th { text-align: left; padding: 12px 16px; font-size: 0.8rem; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0; }
    .plan-table th:last-child { padding-left: 48px; }
    .plan-table td { padding: 14px 16px; font-size: 0.85rem; color: #475569; border-bottom: 1px solid #f1f5f9; }
    .plan-table td:first-child { font-weight: 500; color: #1e293b; }
    .plan-table td:last-child { padding-left: 48px; }
    .plan-table tr:last-child td { border-bottom: none; }
    
    /* Deal List (History tab) */
    .deal-list { display: flex; flex-direction: column; gap: 12px; }
    .deal-info { display: flex; align-items: center; gap: 12px; }
    .deal-details p { margin: 0; }
    .total-row { padding-top: 12px; border-top: 1px solid #e2e8f0; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .total-label { font-weight: 500; color: #64748b; }
    .total-value { font-size: 1.25rem; font-weight: 700; }
    
    /* Colors */
    .text-teal { color: #0d9488; }
    .text-maroon { color: #8C082B; }
    .text-green { color: #16a34a; }
    .text-red { color: #dc2626; }
    .text-yellow { color: #ca8a04; }
    .kpi-days-left { font-size: 0.7rem; font-weight: 600; color: #ca8a04; background: rgba(202,138,4,0.12); padding: 4px 8px; border-radius: 4px; margin-top: 6px; display: inline-block; }
    .bg-teal { background-color: #0d9488; }
    .bg-maroon { background-color: #8C082B; }
    .bg-teal-light { background-color: rgba(13, 148, 136, 0.15); }
    .bg-maroon-light { background-color: rgba(140, 8, 43, 0.15); }
    
    /* Footer */
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 0.8rem; color: #94a3b8; }
  
</style>
</head>
<body>
<div id="root"></div>
<script>
const {
  useState
} = React;
const maroon = '#8C082B';
const teal = '#0d9488';
const orange = '#F97316';
const green = '#16a34a';
const red = '#dc2626';

// ── DATA ──────────────────────────────────────────────

const serviceSummary = [{
  service: 'Website & SEO Content',
  total: 441048.75
}, {
  service: 'PPC Management',
  total: 35677.00
}, {
  service: 'Social Media Management',
  total: 16175.00
}, {
  service: 'Website Hosting',
  total: 7980.00
}, {
  service: 'SEO - Local Lift',
  total: 4700.00
}];
const grandTotal = 509756;
const dsmSummary = [{
  name: 'Jacob Yarbrough',
  revenue: 92688
}, {
  name: 'Brian Hoffman',
  revenue: 88518
}, {
  name: 'John Halcomb',
  revenue: 85852
}, {
  name: 'Henry Pfeil',
  revenue: 62825
}, {
  name: 'Matt Gilmore',
  revenue: 39750
}, {
  name: 'Aaron Graue',
  revenue: 38250
}, {
  name: 'Unassigned',
  revenue: 27100
}, {
  name: 'Shelby Edsell',
  revenue: 4550
}, {
  name: 'James Nash',
  revenue: 2875
}];
const implementingPipeline = [{
  client: 'Ozara',
  value: 13500,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: null
}, {
  client: 'Canadian Global (E3)',
  value: 6750,
  dsm: 'Mariah Lindsey',
  cancel: null,
  kickoff: null
}, {
  client: 'Access Elevator',
  value: 5500,
  dsm: 'Henry Pfeil',
  cancel: null,
  kickoff: '01/19/26'
}, {
  client: 'Dupree Security Group',
  value: 3250,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: null
}, {
  client: 'UnCommon Farms',
  value: 3000,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: '01/26/26'
}, {
  client: 'HatLaunch',
  value: 3000,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: null
}, {
  client: 'Area Access',
  value: 2900,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: '10/27/25'
}, {
  client: 'National Delivery Solutions',
  value: 2750,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: null
}, {
  client: 'LionHeart Critical Power',
  value: 2500,
  dsm: 'Mariah Lindsey',
  cancel: null,
  kickoff: null
}, {
  client: 'Semper Fi Construction',
  value: 2500,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: null
}, {
  client: 'Elevator Service Co',
  value: 2500,
  dsm: 'Henry Pfeil',
  cancel: null,
  kickoff: '01/15/26'
}, {
  client: 'American Elevator',
  value: 2500,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: '01/05/26'
}, {
  client: 'Embassy Landscape Group',
  value: 2250,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: '01/19/26'
}, {
  client: 'Cibes Symmetry',
  value: 2000,
  dsm: 'Henry Pfeil',
  cancel: null,
  kickoff: null
}, {
  client: 'Atlas Restoration',
  value: 2000,
  dsm: 'Mariah Lindsey',
  cancel: null,
  kickoff: null
}, {
  client: 'Tower Digital',
  value: 2000,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: '03/09/26'
}, {
  client: 'Campbell Security',
  value: 2000,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: '02/26/26'
}, {
  client: 'Orange Energizing',
  value: 1500,
  dsm: 'Mariah Lindsey',
  cancel: null,
  kickoff: null
}, {
  client: 'GreenGuard Cleaning',
  value: 1000,
  dsm: 'Mariah Lindsey',
  cancel: null,
  kickoff: null
}, {
  client: 'Poseidon Sales',
  value: 1000,
  dsm: 'Kellianne Elliott',
  cancel: null,
  kickoff: null
}, {
  client: 'Caltron Security',
  value: 350,
  dsm: 'Nicholas Chrismer',
  cancel: null,
  kickoff: null
}, {
  client: 'Waste Consultants',
  value: 1000,
  dsm: 'Kellianne Elliott',
  cancel: '3/31/2026',
  kickoff: null
}];
const pipelineTotal = implementingPipeline.reduce((s, r) => s + r.value, 0);
const pipelineAtRisk = implementingPipeline.filter(r => r.cancel);
const recentLaunches = [{
  client: 'SkyView Partners',
  owner: 'Merideth Neff',
  kickoff: '10/08/25',
  launch: '02/23/26',
  days: 138,
  target: 60,
  hrsS: 113.1,
  hrsC: 70.7
}, {
  client: 'Invidasys',
  owner: 'Nicholas Chrismer',
  kickoff: '01/08/24',
  launch: '02/23/26',
  days: 777,
  target: 90,
  hrsS: 146.8,
  hrsC: 0
}, {
  client: 'Pflug Packaging',
  owner: 'Nicholas Chrismer',
  kickoff: '11/24/25',
  launch: '02/18/26',
  days: 86,
  target: 90,
  hrsS: 173.9,
  hrsC: 149.0
}, {
  client: 'Altourage',
  owner: 'Nicholas Chrismer',
  kickoff: '11/10/25',
  launch: '02/02/26',
  days: 84,
  target: 60,
  hrsS: 161.3,
  hrsC: 144.4
}, {
  client: 'Morning Star Elevator',
  owner: 'Nicholas Chrismer',
  kickoff: '10/24/25',
  launch: '01/21/26',
  days: 89,
  target: 90,
  hrsS: 202.2,
  hrsC: 195.5
}, {
  client: '4C Cabinets',
  owner: 'Nicholas Chrismer',
  kickoff: '11/06/25',
  launch: '01/20/26',
  days: 75,
  target: 75,
  hrsS: 149.9,
  hrsC: 122.7
}, {
  client: 'Skyline Express',
  owner: 'Nicholas Chrismer',
  kickoff: '09/12/25',
  launch: '01/14/26',
  days: 124,
  target: 90,
  hrsS: 179.3,
  hrsC: 141.4
}, {
  client: 'Black Wolf Solar',
  owner: 'Nicholas Chrismer',
  kickoff: '10/20/25',
  launch: '01/07/26',
  days: 79,
  target: 90,
  hrsS: 194.1,
  hrsC: 164.2
}];
// ── HELPERS ──────────────────────────────────────────

const fmt = n => '$' + n.toLocaleString('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
const fmtDec = n => '$' + n.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const fmtNum = n => n.toLocaleString('en-US');
const fmtPct = n => n.toFixed(2) + '%';
function Dashboard() {
  const [activeTab, setActiveTab] = useState('fulfill');
  const e = React.createElement;
  const [showDealDetail, setShowDealDetail] = useState(false);

  // ── Sales & Retention Data (from index_6.html) ──

  // MRR Goal Calculations
  const mrrGoal = 30000;
  const currentMrr = 22091;
  const sellingDaysLeft = 4;
  const gapToGoal = mrrGoal - currentMrr;
  const dailyPaceNeeded = Math.ceil(gapToGoal / sellingDaysLeft);
  const sellingDaysElapsed = 15; // days sold so far in February
  const currentMrrPace = Math.round(currentMrr / sellingDaysElapsed);

  // Deal Size Averages & Deals Needed
  const avgReferralDealSize = 2500;
  const avgAuditDealSize = 2500;
  const avgTransferDealSize = 3500;
  const referralDealsNeeded = Math.ceil(gapToGoal / avgReferralDealSize);
  const auditDealsNeeded = Math.ceil(gapToGoal / avgAuditDealSize);
  const transferDealsNeeded = Math.ceil(gapToGoal / avgTransferDealSize);

  // Close Rate Calculation - March MTD
  const totalPitches = 10; // March pitches
  const totalWon = 7; // March deals won
  const overallCloseRate = (totalWon / totalPitches * 100).toFixed(1);

  // Data
  const sourceData = [{
    name: 'Digital Audit',
    pitches: 53,
    won: 1,
    amount: 350,
    closeRate: 1.9
  }, {
    name: 'Employee Referral',
    pitches: 9,
    won: 3,
    amount: 8500,
    closeRate: 33.3
  }, {
    name: 'Client Referral',
    pitches: 3,
    won: 2,
    amount: 4500,
    closeRate: 66.7
  }, {
    name: 'Web Lead',
    pitches: 5,
    won: 1,
    amount: 0,
    closeRate: 20
  }, {
    name: 'Upsell',
    pitches: 4,
    won: 1,
    amount: 1500,
    closeRate: 25.0
  }, {
    name: 'Self-Sourced',
    pitches: 6,
    won: 1,
    amount: 1200,
    closeRate: 16.7
  }, {
    name: 'Email',
    pitches: 1,
    won: 0,
    amount: 0,
    closeRate: 0
  }, {
    name: 'LinkedIn',
    pitches: 1,
    won: 0,
    amount: 0,
    closeRate: 0
  }];
  const pitchData = [{
    month: 'Mar',
    count: 10,
    change: null,
    current: true
  }, {
    month: 'Feb',
    count: 63,
    change: -23
  }, {
    month: 'Jan',
    count: 82,
    change: 11
  }, {
    month: 'Dec',
    count: 74,
    change: 28
  }, {
    month: 'Nov',
    count: 58,
    change: 26
  }, {
    month: 'Oct',
    count: 46,
    change: null
  }];

  // Pitches Trend Data (last 120 days)
  const pitchesTrendData = [{
    month: 'Oct',
    pitches: 46
  }, {
    month: 'Nov',
    pitches: 58
  }, {
    month: 'Dec',
    pitches: 74
  }, {
    month: 'Jan',
    pitches: 82
  }, {
    month: 'Feb',
    pitches: 63
  }, {
    month: 'Mar',
    pitches: 10
  }];

  // Close Rate by Source - 2026 YTD
  const closeRate120Days = [{
    name: 'Revenue Transfer',
    rate: 50.0,
    pitches: 4,
    won: 2
  }, {
    name: 'Customer Referral',
    rate: 28.6,
    pitches: 7,
    won: 2
  }, {
    name: 'Employee Referral',
    rate: 18.2,
    pitches: 11,
    won: 2
  }, {
    name: 'Self-Sourced',
    rate: 16.7,
    pitches: 6,
    won: 1
  }, {
    name: 'Upsell',
    rate: 23.1,
    pitches: 13,
    won: 3
  }, {
    name: 'Web Lead',
    rate: 21.4,
    pitches: 14,
    won: 3
  }, {
    name: 'AMG 90 Day Client',
    rate: 3.0,
    pitches: 99,
    won: 3
  }, {
    name: 'Cold Calling',
    rate: 0,
    pitches: 1,
    won: 0
  }, {
    name: 'Email',
    rate: 0,
    pitches: 1,
    won: 0
  }, {
    name: 'LinkedIn',
    rate: 0,
    pitches: 1,
    won: 0
  }];

  // KPI Icons (Lucide-style line icons)
  const DollarIcon = e('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, e('line', {
    x1: 12,
    y1: 1,
    x2: 12,
    y2: 23
  }), e('path', {
    d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
  }));
  const ReceiptIcon = e('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, e('path', {
    d: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z'
  }), e('path', {
    d: 'M14 8H8'
  }), e('path', {
    d: 'M16 12H8'
  }), e('path', {
    d: 'M13 16H8'
  }));
  const ChartIcon = e('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, e('path', {
    d: 'M3 3v18h18'
  }), e('path', {
    d: 'M18 17V9'
  }), e('path', {
    d: 'M13 17V5'
  }), e('path', {
    d: 'M8 17v-3'
  }));
  const TargetIconSm = e('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, e('circle', {
    cx: 12,
    cy: 12,
    r: 10
  }), e('circle', {
    cx: 12,
    cy: 12,
    r: 6
  }), e('circle', {
    cx: 12,
    cy: 12,
    r: 2
  }));
  const SendIcon = e('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }, e('path', {
    d: 'M22 2L11 13'
  }), e('path', {
    d: 'M22 2L15 22l-4-9-9-4 20-7Z'
  }));

  // Close Rate by Source - February Sales
  const closeRateData = [{
    name: 'Customer Referral',
    rate: 100,
    pitches: 2,
    won: 2
  }, {
    name: 'Employee Referral',
    rate: 40,
    pitches: 5,
    won: 2
  }, {
    name: 'Upsell',
    rate: 12.5,
    pitches: 8,
    won: 1
  }, {
    name: 'Web Lead',
    rate: 20,
    pitches: 5,
    won: 1
  }, {
    name: 'Self-Sourced',
    rate: 33.3,
    pitches: 3,
    won: 1
  }, {
    name: 'Revenue Transfer',
    rate: 33.3,
    pitches: 3,
    won: 1
  }, {
    name: 'Cold Calling',
    rate: 0,
    pitches: 1,
    won: 0
  }, {
    name: 'AMG 90 Day Client',
    rate: 0,
    pitches: 31,
    won: 0
  }];
  const mrrDeals = [{
    name: 'HatLaunch',
    amount: 12000,
    source: 'Web Lead',
    psm: 'Doug Yocco / Adam Weber',
    category: 'web'
  }, {
    name: 'Dupree Security',
    amount: 3250,
    source: 'Revenue Transfer',
    psm: 'Doug Yocco / Kayla Musante',
    category: 'transfer'
  }, {
    name: 'Breaching Technologies',
    amount: 3112,
    source: 'Web Lead',
    psm: 'Doug Yocco',
    category: 'web'
  }, {
    name: "Hamm's Construction",
    amount: 2500,
    source: 'Digital Audit',
    psm: 'Doug Yocco',
    category: 'audit'
  }, {
    name: 'Tower Digital',
    amount: 2000,
    source: 'Digital Audit',
    psm: 'Doug Yocco',
    category: 'audit'
  }, {
    name: 'Allied Construction',
    amount: 1500,
    source: 'Upsell',
    psm: 'Doug Yocco / Adam Weber',
    category: 'upsell'
  }, {
    name: 'Perfectly Placed',
    amount: 350,
    source: 'Employee Referral (Stephanie Bodine)',
    psm: 'Doug Yocco',
    category: 'referral'
  }];
  const projectDeals = [{
    name: 'VanRan Communications',
    amount: 10000,
    source: 'Digital Audit',
    psm: 'Doug Yocco'
  }, {
    name: 'Exude HC',
    amount: 4000,
    source: 'Revenue Transfer',
    psm: 'Doug Yocco'
  }];
  const januaryDeals = [{
    name: 'UnCommon Farms',
    amount: 5541,
    source: 'Employee Referral',
    psm: 'Doug Yocco / Zak Beible'
  }, {
    name: 'Ace Paving & Maintenance',
    amount: 3750,
    source: 'Web Lead',
    psm: 'Doug Yocco'
  }, {
    name: 'Embassy Landscape Group',
    amount: 2250,
    source: 'Upsell / Digital Audit',
    psm: 'Kaitlyn Robertson',
    vp: 'Eric Watkins'
  }, {
    name: 'Atlas Restoration',
    amount: 2000,
    source: 'Upsell / Digital Audit',
    psm: 'Andrew Beck',
    vp: 'Ian Suire'
  }, {
    name: 'Harris United',
    amount: 1500,
    source: 'Upsell / Digital Audit',
    psm: 'Justin Grab',
    vp: 'Ian Suire'
  }, {
    name: 'Sierra Technology',
    amount: 1000,
    source: 'OB Sales',
    psm: 'Jacob Bliss'
  }, {
    name: 'New Kent Coatings - Web + SEO',
    amount: 0,
    source: 'Inbound Upsell',
    psm: 'Adam Weber'
  }];
  const historicalData = [{
    month: 'Sep',
    fullMonth: 'September 2025',
    mrr: 18250,
    deals: 5,
    pitches: 64
  }, {
    month: 'Oct',
    fullMonth: 'October 2025',
    mrr: 19100,
    deals: 6,
    pitches: 73
  }, {
    month: 'Nov',
    fullMonth: 'November 2025',
    mrr: 20500,
    deals: 9,
    pitches: 58
  }, {
    month: 'Dec',
    fullMonth: 'December 2025',
    mrr: 21400,
    deals: 10,
    pitches: 74
  }, {
    month: 'Jan',
    fullMonth: 'January 2026',
    mrr: 17291,
    deals: 7,
    pitches: 82
  }, {
    month: 'Feb',
    fullMonth: 'February 2026',
    mrr: 25300,
    deals: 8,
    pitches: 17
  }];
  const pitchHistory = [{
    month: 'Jan',
    year: '2025',
    pitches: 41
  }, {
    month: 'Feb',
    year: '2025',
    pitches: 49
  }, {
    month: 'Mar',
    year: '2025',
    pitches: 42
  }, {
    month: 'Apr',
    year: '2025',
    pitches: 51
  }, {
    month: 'May',
    year: '2025',
    pitches: 72
  }, {
    month: 'Jun',
    year: '2025',
    pitches: 63
  }, {
    month: 'Jul',
    year: '2025',
    pitches: 77
  }, {
    month: 'Aug',
    year: '2025',
    pitches: 63
  }, {
    month: 'Sep',
    year: '2025',
    pitches: 64
  }, {
    month: 'Oct',
    year: '2025',
    pitches: 73
  }, {
    month: 'Nov',
    year: '2025',
    pitches: 58
  }, {
    month: 'Dec',
    year: '2025',
    pitches: 74
  }, {
    month: 'Jan',
    year: '2026',
    pitches: 82
  }, {
    month: 'Feb',
    year: '2026',
    pitches: 17
  }];
  const dsmPortfolioData = [{
    name: 'John Halcomb',
    clients: 33,
    avgYears: 3.0
  }, {
    name: 'Henry Pfeil',
    clients: 33,
    avgYears: 2.16
  }, {
    name: 'Jacob Yarbrough',
    clients: 35,
    avgYears: 2.15
  }, {
    name: 'Brian Hoffman',
    clients: 37,
    avgYears: 1.67
  }, {
    name: 'Aaron Graue',
    clients: 18,
    avgYears: 4.34
  }, {
    name: 'Matt Gilmore',
    clients: 19,
    avgYears: 1.06
  }, {
    name: 'Nicholas Chrismer',
    clients: 14,
    avgYears: 0.23
  }, {
    name: 'Mariah Lindsey',
    clients: 6,
    avgYears: 0.30
  }];
  const dpmData = [{
    name: 'Nicholas Chrismer',
    activeBuilds: 14,
    avgLaunchDays: 62,
    onTimeRate: 92
  }, {
    name: 'Mariah Lindsey',
    activeBuilds: 6,
    avgLaunchDays: 55,
    onTimeRate: 95
  }];
  const cancelByDsmData = [{
    name: 'John Halcomb',
    clients: 33,
    avgYears: 3.0,
    cancels: 4,
    avgMonths: 40.8,
    medianMonths: 36.5,
    ytd2026: 95.89
  }, {
    name: 'Jacob Yarbrough',
    clients: 35,
    avgYears: 2.15,
    cancels: 8,
    avgMonths: 17.0,
    medianMonths: 18.9,
    ytd2026: 95.96
  }, {
    name: 'Brian Hoffman',
    clients: 37,
    avgYears: 1.67,
    cancels: 1,
    avgMonths: 13.0,
    medianMonths: 13.0,
    ytd2026: 94.05
  }, {
    name: 'Henry Pfeil',
    clients: 33,
    avgYears: 2.16,
    cancels: 0,
    avgMonths: null,
    medianMonths: null,
    ytd2026: 102.3
  }, {
    name: 'Aaron Graue',
    clients: 18,
    avgYears: 4.34,
    cancels: 0,
    avgMonths: null,
    medianMonths: null,
    ytd2026: null
  }, {
    name: 'Matt Gilmore',
    clients: 19,
    avgYears: 1.06,
    cancels: 2,
    avgMonths: 11.0,
    medianMonths: 11.0,
    ytd2026: null
  }, {
    name: 'Anna Walschleger',
    clients: null,
    avgYears: null,
    cancels: 1,
    avgMonths: 14.8,
    medianMonths: 14.8,
    ytd2026: null
  }, {
    name: 'Dajah Ray',
    clients: null,
    avgYears: null,
    cancels: 1,
    avgMonths: 15.0,
    medianMonths: 15.0,
    ytd2026: null
  }];
  const launchVelocityData = [{
    month: 'Mar 2025',
    sites: 6,
    avgDays: 85.2
  }, {
    month: 'Apr 2025',
    sites: 5,
    avgDays: 85.2
  }, {
    month: 'May 2025',
    sites: 6,
    avgDays: 82.0
  }, {
    month: 'Jun 2025',
    sites: 5,
    avgDays: 128.2,
    flag: 'worst'
  }, {
    month: 'Jul 2025',
    sites: 3,
    avgDays: 109.0
  }, {
    month: 'Aug 2025',
    sites: 7,
    avgDays: 65.0,
    flag: 'best'
  }, {
    month: 'Sep 2025',
    sites: 4,
    avgDays: 87.0
  }, {
    month: 'Oct 2025',
    sites: 9,
    avgDays: 79.6
  }, {
    month: 'Nov 2025',
    sites: 2,
    avgDays: 78.5
  }, {
    month: 'Dec 2025',
    sites: 4,
    avgDays: 85.0
  }, {
    month: 'Jan 2026',
    sites: 6,
    avgDays: 85.3
  }, {
    month: 'Feb 2026',
    sites: 6,
    avgDays: 91.0
  }];

  // Icons
  const CalendarIcon = e('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: maroon,
    strokeWidth: 2
  }, e('rect', {
    x: 3,
    y: 4,
    width: 18,
    height: 18,
    rx: 2
  }), e('line', {
    x1: 16,
    y1: 2,
    x2: 16,
    y2: 6
  }), e('line', {
    x1: 8,
    y1: 2,
    x2: 8,
    y2: 6
  }), e('line', {
    x1: 3,
    y1: 10,
    x2: 21,
    y2: 10
  }));
  const ArrowUp = e('svg', {
    width: 12,
    height: 12,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3
  }, e('polyline', {
    points: '18 15 12 9 6 15'
  }));
  const ArrowDown = e('svg', {
    width: 12,
    height: 12,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3
  }, e('polyline', {
    points: '6 9 12 15 18 9'
  }));
  const TrendUp = color => e('svg', {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2
  }, e('polyline', {
    points: '22 7 13.5 15.5 8.5 10.5 2 17'
  }), e('polyline', {
    points: '16 7 22 7 22 13'
  }));
  const TrendDown = color => e('svg', {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2
  }, e('polyline', {
    points: '22 17 13.5 8.5 8.5 13.5 2 7'
  }), e('polyline', {
    points: '16 17 22 17 22 11'
  }));
  const CheckIcon = e('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: teal,
    strokeWidth: 2
  }, e('path', {
    d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14'
  }), e('polyline', {
    points: '22 4 12 14.01 9 11.01'
  }));
  const AlertIcon = e('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: orange,
    strokeWidth: 2
  }, e('circle', {
    cx: 12,
    cy: 12,
    r: 10
  }), e('line', {
    x1: 12,
    y1: 8,
    x2: 12,
    y2: 12
  }), e('line', {
    x1: 12,
    y1: 16,
    x2: 12.01,
    y2: 16
  }));
  const TargetIcon = color => e('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2
  }, e('circle', {
    cx: 12,
    cy: 12,
    r: 10
  }), e('circle', {
    cx: 12,
    cy: 12,
    r: 6
  }), e('circle', {
    cx: 12,
    cy: 12,
    r: 2
  }));

  // Components
  function HorizontalBar({
    data,
    dataKey,
    maxValue,
    color,
    showPercent,
    showDollar
  }) {
    return e('div', null, data.map((item, idx) => e('div', {
      key: idx,
      className: 'h-bar'
    }, e('div', {
      className: 'h-bar-label'
    }, item.name), e('div', {
      className: 'h-bar-track'
    }, e('div', {
      className: 'h-bar-fill',
      style: {
        width: item[dataKey] / maxValue * 100 + '%',
        backgroundColor: color
      }
    })), e('div', {
      className: 'h-bar-value',
      style: {
        color
      }
    }, showPercent ? item[dataKey] + '%' : showDollar ? '$' + item[dataKey].toLocaleString() : item[dataKey]))));
  }
  function VerticalChart({
    data,
    color
  }) {
    const max = Math.max(...data.map(d => d.mrr));
    return e('div', {
      className: 'v-chart'
    }, data.map((item, idx) => e('div', {
      key: idx,
      className: 'v-bar-container'
    }, e('div', {
      className: 'v-bar-value',
      style: {
        color
      }
    }, '$' + (item.mrr / 1000).toFixed(1) + 'k'), e('div', {
      className: 'v-bar-track'
    }, e('div', {
      className: 'v-bar-fill',
      style: {
        height: item.mrr / max * 100 + '%',
        backgroundColor: color
      }
    })), e('div', {
      className: 'v-bar-label'
    }, item.month))));
  }
  function PitchChart({
    data,
    color
  }) {
    const max = Math.max(...data.map(d => d.pitches));
    return e('div', {
      className: 'v-chart'
    }, data.map((item, idx) => e('div', {
      key: idx,
      className: 'v-bar-container',
      style: {
        flex: '1',
        minWidth: '40px'
      }
    }, e('div', {
      className: 'v-bar-value',
      style: {
        color,
        fontSize: '10px'
      }
    }, item.pitches), e('div', {
      className: 'v-bar-track'
    }, e('div', {
      className: 'v-bar-fill',
      style: {
        height: item.pitches / max * 100 + '%',
        backgroundColor: color
      }
    })), e('div', {
      className: 'v-bar-label',
      style: {
        fontSize: '9px'
      }
    }, item.month), e('div', {
      style: {
        fontSize: '8px',
        color: '#94a3b8'
      }
    }, item.year.slice(2)))));
  }
  const [foSub, setFoSub] = useState('overview');
  const cs = {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #cbd5e1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
  };
  const kpiCard = (label, value, sub, trend, trendDir) => /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '4px'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '2rem',
      fontWeight: 800,
      lineHeight: 1,
      marginBottom: '4px',
      letterSpacing: '-0.02em',
      color: '#1e293b'
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      color: '#64748b',
      fontWeight: 500,
      marginBottom: '8px'
    }
  }, sub), trend && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '0.75rem',
      fontWeight: 600,
      paddingTop: '8px',
      marginTop: 'auto',
      borderTop: '1px solid #e2e8f0',
      color: trendDir === 'up' ? '#16a34a' : trendDir === 'down' ? '#dc2626' : '#1e293b'
    }
  }, trendDir === 'up' ? '\u25B2' : trendDir === 'down' ? '\u25BC' : '\u25CF', " ", trend));
  const heroKpi = (label, value, sub) => /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: 'rgba(255,255,255,0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '8px'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1,
      marginBottom: '4px',
      color: '#fff'
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      color: 'rgba(255,255,255,0.5)'
    }
  }, sub));
  const SB = ({
    name
  }) => {
    const colors = {
      'Google Ads': '#3b82f6',
      'Meta Ads': '#6366f1',
      'LI Ads': '#0ea5e9',
      'PMB Ads': '#a855f7',
      'TikTok': '#ec4899',
      'Mantis': '#ea580c'
    };
    const c = colors[name] || '#64748b';
    return /*#__PURE__*/React.createElement("span", {
      style: {
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 600,
        background: c + '1a',
        color: c,
        marginRight: '4px'
      }
    }, name);
  };
  const thS = align => ({
    textAlign: align || 'left',
    padding: '12px 14px',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  });
  const tdS = {
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9'
  };
  const rowBg = i => ({
    background: i % 2 === 0 ? 'rgba(248,250,252,0.5)' : 'transparent'
  });
  const SubNav = ({
    items,
    active,
    onSelect
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    }
  }, items.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.key,
    onClick: () => onSelect(s.key),
    style: {
      padding: '6px 14px',
      fontSize: '0.75rem',
      fontWeight: 600,
      cursor: 'pointer',
      border: active === s.key ? '1px solid ' + teal : '1px solid #e2e8f0',
      borderRadius: '6px',
      background: active === s.key ? teal : '#f1f5f9',
      color: active === s.key ? '#fff' : '#64748b'
    }
  }, s.label)));
  const topTabs = [{
    key: 'so',
    label: 'Sales Overview'
  }, {
    key: 'ss',
    label: 'Sales Summary'
  }, {
    key: 'rr',
    label: 'Revenue & Retention'
  }, {
    key: 'ra',
    label: 'Retention by AM'
  }, {
    key: 'fulfill',
    label: 'Fulfillment Overview'
  }];
  const foNav = [{
    key: 'overview',
    label: 'Overview'
  }, {
    key: 'websites',
    label: 'Website Creation'
  }, {
    key: 'seo',
    label: 'SEO Content'
  }, {
    key: 'ppc',
    label: 'PPC Management'
  }, {
    key: 'social',
    label: 'Social Media'
  }, {
    key: 'other',
    label: 'Other Services'
  }, {
    key: 'insights',
    label: 'Insights'
  }];

  // ── RENDER ──────────────────────────────────────────

  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Barlow', 'Inter', sans-serif",
      background: '#f8fafc',
      minHeight: '100vh',
      padding: '24px 32px',
      color: '#1e293b',
      fontSize: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 700,
      margin: 0
    }
  }, "Inbound Dashboard"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: '8px',
      padding: '8px 12px',
      border: '1px solid #e2e8f0',
      fontWeight: 600
    }
  }, "March 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 0,
      marginBottom: '20px',
      flexWrap: 'wrap'
    }
  }, topTabs.map(t => {
    const active = activeTab === t.key;
    const clickable = true;
    return /*#__PURE__*/React.createElement("button", {
      key: t.key,
      onClick: () => setActiveTab(t.key),
      style: {
        padding: '10px 24px',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
        border: 'none',
        background: active ? maroon : 'transparent',
        color: active ? '#fff' : '#64748b',
        borderRadius: active ? '6px' : 0
      }
    }, t.label);
  })), activeTab === 'so' && e('div', null,
  // Executive Takeaway
  e('div', {
    className: 'exec-takeaway',
    style: {
      marginBottom: '20px'
    }
  }, e('div', {
    className: 'exec-takeaway-title'
  }, 'Executive Takeaway'), e('ul', {
    className: 'exec-takeaway-list'
  }, e('li', null, 'Revenue mix: March production is healthy, but the composition matters. Referral-driven opportunities are producing the strongest returns, while audit-based volume is creating activity without enough revenue yield.'), e('li', null, 'Pipeline efficiency: Show rates are healthy, but conversion performance is uneven by source. That suggests the issue is not top-of-funnel activity alone. It is lead quality and source mix.'), e('li', null, 'Near-term outlook: 2 deals left to hit goal with continued emphasis on higher-converting channels.'))),
  // Row 1: Primary KPIs (large) + Pitches Table
  e('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr 280px',
      gap: '16px',
      marginBottom: '16px',
      alignItems: 'stretch'
    }
  },
  // March Column - MRR + Project stacked (current month)
  e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  },
  // March MRR
  e('div', {
    className: 'card kpi-stacked'
  }, e('div', {
    className: 'kpi-header'
  }, e('span', {
    className: 'kpi-icon'
  }, DollarIcon), e('span', {
    className: 'kpi-label'
  }, 'March MRR')), e('div', {
    className: 'kpi-hero-stacked text-teal'
  }, '$24,712'), e('div', {
    className: 'kpi-meta'
  }, 'MTD'), e('div', {
    className: 'kpi-days-left'
  }, sellingDaysLeft + ' selling days left')),
  // March Project
  e('div', {
    className: 'card kpi-stacked'
  }, e('div', {
    className: 'kpi-header'
  }, e('span', {
    className: 'kpi-icon'
  }, ReceiptIcon), e('span', {
    className: 'kpi-label'
  }, 'March Project')), e('div', {
    className: 'kpi-hero-stacked'
  }, '$14,000'), e('div', {
    className: 'kpi-meta'
  }, ''))),
  // February Column - MRR + Project stacked
  e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  },
  // February MRR
  e('div', {
    className: 'card kpi-stacked kpi-muted'
  }, e('div', {
    className: 'kpi-header'
  }, e('span', {
    className: 'kpi-icon'
  }, DollarIcon), e('span', {
    className: 'kpi-label'
  }, 'February MRR')), e('div', {
    className: 'kpi-hero-stacked',
    style: { color: '#eab308' }
  }, '$' + currentMrr.toLocaleString()), e('div', {
    className: 'kpi-meta'
  }, '8 accounts')),
  // February Project
  e('div', {
    className: 'card kpi-stacked kpi-muted'
  }, e('div', {
    className: 'kpi-header'
  }, e('span', {
    className: 'kpi-icon'
  }, ReceiptIcon), e('span', {
    className: 'kpi-label'
  }, 'February Project')), e('div', {
    className: 'kpi-hero-stacked'
  }, '$11,600'), e('div', {
    className: 'kpi-meta'
  }, '8 projects'))),
  // January Column - MRR + Project stacked
  e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }
  },
  // January MRR
  e('div', {
    className: 'card kpi-stacked kpi-muted'
  }, e('div', {
    className: 'kpi-header'
  }, e('span', {
    className: 'kpi-icon'
  }, DollarIcon), e('span', {
    className: 'kpi-label'
  }, 'January MRR')), e('div', {
    className: 'kpi-hero-stacked text-red'
  }, '$16,041'), e('div', {
    className: 'kpi-meta'
  }, '7 accounts')),
  // January Project
  e('div', {
    className: 'card kpi-stacked kpi-muted'
  }, e('div', {
    className: 'kpi-header'
  }, e('span', {
    className: 'kpi-icon'
  }, ReceiptIcon), e('span', {
    className: 'kpi-label'
  }, 'January Project')), e('div', {
    className: 'kpi-hero-stacked'
  }, '$22,675'), e('div', {
    className: 'kpi-meta'
  }, '9 projects'))),
  // Total Revenue Card - Primary (highlighted)
  e('div', {
    className: 'card kpi-primary kpi-highlight'
  }, e('div', {
    className: 'kpi-header'
  }, e('span', {
    className: 'kpi-icon'
  }, ChartIcon), e('span', {
    className: 'kpi-label'
  }, 'March New Revenue')), e('div', {
    className: 'kpi-hero'
  }, '$38,712'), e('div', {
    className: 'kpi-meta'
  }, 'MRR + Project'), e('div', {
    className: 'kpi-recap kpi-recap-dark'
  }, e('div', {
    className: 'kpi-recap-header'
  }, 'Recap'), e('div', {
    className: 'kpi-recap-value'
  }, 'February Total: ', e('span', {
    style: {
      color: '#6ee7b7'
    }
  }, '$33,691')))),
  // Pitches Table
  e('div', {
    className: 'card pitches-card'
  }, e('div', {
    className: 'pitches-header'
  }, e('div', null, e('div', {
    className: 'pitches-title'
  }, 'Pitches by Month'), e('div', {
    className: 'pitches-subtitle'
  }, 'Last 6 months'))), e('div', {
    className: 'pitches-table'
  }, pitchData.map((p, i) => e('div', {
    key: i,
    className: 'pitch-row' + (p.current ? ' current' : '')
  }, e('span', {
    className: 'pitch-month'
  }, p.month), e('span', {
    className: 'pitch-count'
  }, p.count), p.change !== null ? e('span', {
    className: 'pitch-badge ' + (p.change >= 0 ? 'up' : 'down')
  }, (p.change >= 0 ? '+' : '') + p.change + '%') : e('span', {
    className: 'pitch-badge neutral'
  }, '—'))),
  // Average row
  e('div', {
    className: 'pitch-row avg'
  }, e('span', {
    className: 'pitch-month'
  }, 'Avg'), e('span', {
    className: 'pitch-count'
  }, '70'), e('span', null, ''))))),
  // Row 2: Secondary KPIs + YTD Revenue by Source
  e('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px',
      alignItems: 'stretch'
    }
  },
  // February Source Breakdown
  e('div', {
    className: 'card',
    style: {}
  }, e('div', {
    className: 'section-title'
  }, e('span', {
    className: 'dot',
    style: { backgroundColor: '#eab308' }
  }), 'February 2026 Pitches by Source'),
  e('table', {
    style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }
  }, e('thead', null, e('tr', null,
    e('th', { style: { textAlign: 'left', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Source'),
    e('th', { style: { textAlign: 'center', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Pitches'),
    e('th', { style: { textAlign: 'center', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Props'),
    e('th', { style: { textAlign: 'center', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Won'),
    e('th', { style: { textAlign: 'right', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Close Rate')
  )),
  e('tbody', null,
    ...[
      { source: 'Web Lead',          pitches: 5,  props: 2, won: 2 },
      { source: 'Employee Referral', pitches: 5,  props: 1, won: 0 },
      { source: 'Upsell',            pitches: 8,  props: 4, won: 1 },
      { source: 'Revenue Transfer',  pitches: 3,  props: 3, won: 3 },
      { source: 'Digital Audit',     pitches: 31, props: 6, won: 3 },
      { source: 'Customer Referral', pitches: 2,  props: 0, won: 0 },
      { source: 'OB Sales',          pitches: 0,  props: 0, won: 0 },
    ].map((row, i) => {
      const closeRate = row.pitches > 0 ? (row.won / row.pitches * 100).toFixed(1) : null;
      const crColor = closeRate >= 20 ? '#16a34a' : closeRate >= 10 ? '#ca8a04' : '#dc2626';
      return e('tr', { key: i, style: { background: i % 2 === 0 ? 'rgba(248,250,252,0.6)' : 'transparent' } },
        e('td', { style: { padding: '9px 12px', fontWeight: 500, color: '#1e293b' } }, row.source),
        e('td', { style: { padding: '9px 12px', textAlign: 'center', color: '#64748b', fontWeight: 500 } }, row.pitches || '—'),
        e('td', { style: { padding: '9px 12px', textAlign: 'center', color: '#64748b', fontWeight: 500 } }, row.props || '—'),
        e('td', { style: { padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#1e293b' } }, row.won || '—'),
        e('td', { style: { padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: closeRate ? crColor : '#94a3b8' } }, closeRate ? closeRate + '%' : '—')
      );
    }),
    e('tr', { style: { borderTop: '2px solid #e2e8f0', background: 'rgba(15,118,110,0.04)' } },
      e('td', { style: { padding: '9px 12px', fontWeight: 700, color: '#1e293b' } }, 'Total'),
      e('td', { style: { padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#1e293b' } }, '63'),
      e('td', { style: { padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#1e293b' } }, '17'),
      e('td', { style: { padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#1e293b' } }, '9'),
      e('td', { style: { padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#ca8a04' } }, '14.3%')
    )
  ))),
  e('div', {
    className: 'card',
    style: {}
  }, e('div', {
    className: 'section-title'
  }, e('span', {
    className: 'dot',
    style: { backgroundColor: teal }
  }), '2026 YTD New Revenue by Source'),
  e('table', {
    style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }
  }, e('thead', null, e('tr', null,
    e('th', { style: { textAlign: 'left', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Source'),
    e('th', { style: { textAlign: 'center', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Pitches'),
    e('th', { style: { textAlign: 'center', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Deals'),
    e('th', { style: { textAlign: 'right', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Revenue'),
    e('th', { style: { textAlign: 'right', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Close Rate'),
    e('th', { style: { textAlign: 'right', padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', borderBottom: '2px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.06em' } }, '% of Total')
  )),
  e('tbody', null,
    ...[
      { source: 'Web Lead',          deals: 5, revenue: 24112, pitches: 14 },
      { source: 'Employee Referral', deals: 4, revenue: 9382,  pitches: 11 },
      { source: 'Upsell',            deals: 5, revenue: 8750,  pitches: 13 },
      { source: 'Revenue Transfer',  deals: 2, revenue: 6750,  pitches: 4  },
      { source: 'Digital Audit',     deals: 3, revenue: 4850,  pitches: 99 },
      { source: 'Customer Referral', deals: 1, revenue: 2000,  pitches: 7  },
      { source: 'OB Sales',          deals: 1, revenue: 1000,  pitches: 0  },
    ].map((row, i) => {
      const total = 56844;
      const pct = (row.revenue / total * 100).toFixed(1);
      const closeRate = row.pitches > 0 ? (row.deals / row.pitches * 100).toFixed(1) : '—';
      return e('tr', { key: i, style: { background: i % 2 === 0 ? 'rgba(248,250,252,0.6)' : 'transparent' } },
        e('td', { style: { padding: '9px 12px', fontWeight: 500, color: '#1e293b' } }, row.source),
        e('td', { style: { padding: '9px 12px', textAlign: 'center', color: '#64748b', fontWeight: 500 } }, row.pitches),
        e('td', { style: { padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#1e293b' } }, row.deals),
        e('td', { style: { padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: teal } }, '$' + row.revenue.toLocaleString()),
        e('td', { style: { padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: closeRate >= 20 ? '#16a34a' : closeRate >= 10 ? '#ca8a04' : '#dc2626' } }, closeRate + '%'),
        e('td', { style: { padding: '9px 12px', textAlign: 'right', color: '#64748b', fontWeight: 500 } }, pct + '%')
      );
    })
  ),
  e('tfoot', null, e('tr', { style: { borderTop: '2px solid #e2e8f0' } },
    e('td', { style: { padding: '9px 12px', fontWeight: 700, color: '#1e293b' } }, 'Total'),
    e('td', { style: { padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#64748b' } }, '149'),
    e('td', { style: { padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#1e293b' } }, '21'),
    e('td', { style: { padding: '9px 12px', textAlign: 'right', fontWeight: 800, color: teal } }, '$56,844'),
    e('td', { style: { padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#1e293b' } }, '14.1%'),
    e('td', { style: { padding: '9px 12px', textAlign: 'right', color: '#64748b' } }, '100%')
  ))))),
  // Row 4: Deal Detail Toggle + Deal Lists
  e('div', {
    style: {
      marginBottom: '16px'
    }
  }, e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    }
  }, e('span', {
    style: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#1e293b'
    }
  }, 'Deal Detail'), e('button', {
    className: 'toggle-btn' + (showDealDetail ? ' active' : ''),
    onClick: () => setShowDealDetail(!showDealDetail)
  }, showDealDetail ? 'Hide Deal Detail' : 'Show Deal Detail')), showDealDetail && e('div', {
    className: 'row row-2'
  },
  // MRR Sales
  e('div', {
    className: 'card'
  }, e('div', {
    className: 'section-title'
  }, e('span', {
    className: 'dot',
    style: {
      backgroundColor: teal
    }
  }), 'March MRR Sales'), mrrDeals.map((deal, i) => e('div', {
    key: i,
    className: 'deal-item'
  }, e('div', {
    style: {
      display: 'flex',
      alignItems: 'flex-start'
    }
  }, e('div', {
    className: 'deal-num bg-teal-light text-teal'
  }, i + 1), e('div', {
    className: 'deal-info'
  }, e('div', {
    className: 'deal-name'
  }, deal.name), e('div', {
    className: 'deal-source'
  }, deal.source), deal.psm && e('div', {
    className: 'deal-meta'
  }, '📋 ', deal.psm))), e('div', {
    className: 'deal-amount text-teal'
  }, '$' + deal.amount.toLocaleString()))),
  // Total row
  e('div', {
    className: 'total-row'
  }, e('span', {
    className: 'total-label'
  }, 'Total MRR'), e('span', {
    className: 'total-value text-teal'
  }, '$24,712'))),
  // Project Sales
  e('div', {
    className: 'card'
  }, e('div', {
    className: 'section-title'
  }, e('span', {
    className: 'dot',
    style: {
      backgroundColor: maroon
    }
  }), 'March Project Sales'), projectDeals.map((deal, i) => e('div', {
    key: i,
    className: 'deal-item'
  }, e('div', {
    style: {
      display: 'flex',
      alignItems: 'flex-start'
    }
  }, e('div', {
    className: 'deal-num bg-maroon-light text-maroon'
  }, i + 1), e('div', {
    className: 'deal-info'
  }, e('div', {
    className: 'deal-name'
  }, deal.name), e('div', {
    className: 'deal-source'
  }, deal.source), deal.psm && e('div', {
    className: 'deal-meta'
  }, '📋 ', deal.psm, deal.vp ? '  ' + deal.vp : ''))), e('div', {
    className: 'deal-amount text-maroon'
  }, '$' + deal.amount.toLocaleString()))),
  // Total row
  e('div', {
    className: 'total-row'
  }, e('span', {
    className: 'total-label'
  }, 'Total Project'), e('span', {
    className: 'total-value text-maroon'
  }, '$14,000')))))), activeTab === 'ss' && e('div', null,
  e('div', { className: 'grid-2', style: { marginBottom: '16px' } },
    e('div', { className: 'card' },
      e('h3', { className: 'section-title' },
        e('span', { className: 'dot', style: { backgroundColor: teal } }),
        'What Went Right'
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', marginBottom: '10px' } },
        e('h4', { className: 'insight-title' }, '14.3% Close Rate on Pitches (9 Won / 63 Held)'),
        e('p', { className: 'insight-text' }, 'Closed 9 of 63 pitches. The correct measure of close rate is Won divided by Total Pitches Held. Strong deal quality across a diversified source mix.')
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', marginBottom: '10px' } },
        e('h4', { className: 'insight-title' }, 'MRR Jumped 54% MoM'),
        e('p', { className: 'insight-text' }, '$24,712 in new MRR is our strongest month in 4 months, with the selling week still open through EOD March 13.')
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', marginBottom: '10px' } },
        e('h4', { className: 'insight-title' }, 'Adam Now Focused on Selling Support'),
        e('p', { className: 'insight-text' }, 'With a Sr. Paid resource now in place, Adam can dedicate more time to selling support -- a structural upgrade that should directly increase deal velocity and revenue.')
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', marginBottom: '10px' } },
        e('h4', { className: 'insight-title' }, 'IPMs Identified the Right Digital Audit Opps'),
        e('p', { className: 'insight-text' }, 'Overall Digital Audit volume was down, but the IPMs did a great job identifying key opportunities and allowing Doug to be effective on those calls -- 3 closed deals came directly from Digital Audits.')
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)', marginBottom: '10px' } },
        e('h4', { className: 'insight-title' }, 'Diversified Source Mix'),
        e('p', { className: 'insight-text' }, 'Closed revenue came from Web Leads, Employee Referrals, Digital Audits, and Upsell -- no single source dependency.')
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.15)' } },
        e('h4', { className: 'insight-title' }, 'HatLaunch -- $12,000 MRR via Web Lead'),
        e('p', { className: 'insight-text' }, "Our largest single deal this month came through an inbound web lead, proving high-value opps don't require outbound-only sourcing.")
      )
    ),
    e('div', { className: 'card' },
      e('h3', { className: 'section-title' },
        e('span', { className: 'dot', style: { backgroundColor: orange } }),
        'What Went Wrong'
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(244,111,10,0.05)', border: '1px solid rgba(244,111,10,0.15)', marginBottom: '10px' } },
        e('h4', { className: 'insight-title' }, 'Digital Audit Pitch Volume Down'),
        e('p', { className: 'insight-text', style: { fontWeight: 600, marginBottom: '4px' } }, 'RealClean / Software Advice / Stratus'),
        e('p', { className: 'insight-text' }, 'These three account types are driving the most declines and exemptions. ~30 YTD accounts marked "Declined" -- early read is some may be duplicate pages incorrectly flagged. Tyler is investigating. This ties directly to the IPM comp plan and SDR initiative -- fixing classification and pipeline quality here is a priority.')
      ),
      e('div', { className: 'insight-card', style: { backgroundColor: 'rgba(244,111,10,0.05)', border: '1px solid rgba(244,111,10,0.15)' } },
        e('h4', { className: 'insight-title' }, 'Upsell Opportunities Undertapped'),
        e('p', { className: 'insight-text', style: { fontWeight: 600, marginBottom: '4px' } }, 'OB Team / Sapper'),
        e('p', { className: 'insight-text' }, 'As a division, we need a more systematic approach to identifying upsell-eligible accounts. Currently working with the OB team to surface opps and continuing to work through the pipeline with Sapper.')
      )
    )
  ),
  e('div', { className: 'card' },
    e('h3', { className: 'section-title' },
      e('span', { className: 'dot', style: { backgroundColor: maroon } }),
      'Execution Plan to Hit $30k MRR Consistently'
    ),
    e('p', { style: { fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' } }, 'Strategic initiatives to sustain and grow monthly recurring revenue'),
    e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' } },
      e('div', { style: { background: '#f8fafc', borderRadius: '8px', padding: '14px', border: '1px solid #e2e8f0' } },
        e('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
          e('span', { style: { width: '24px', height: '24px', borderRadius: '50%', background: teal, color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, '1'),
          e('span', { style: { fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' } }, 'Adam -- Selling Support Focus')
        ),
        e('p', { style: { fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 } }, "With a Sr. Paid resource now in place, Adam shifts focus toward selling support. This directly increases Doug's capacity to close and expands the team's ability to move deals through the pipeline faster.")
      ),
      e('div', { style: { background: '#f8fafc', borderRadius: '8px', padding: '14px', border: '1px solid #e2e8f0' } },
        e('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
          e('span', { style: { width: '24px', height: '24px', borderRadius: '50%', background: teal, color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, '2'),
          e('span', { style: { fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' } }, 'IPM Comp Plan -- Build the SDR Engine')
        ),
        e('p', { style: { fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 } }, 'The new comp plan Tyler is rolling out positions IPMs as inbound SDRs targeting our current client base. The potential here is MAJOR -- a properly incentivized IPM team is the highest-leverage move we have for sustained $30k+ months.')
      ),
      e('div', { style: { background: '#f8fafc', borderRadius: '8px', padding: '14px', border: '1px solid #e2e8f0' } },
        e('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
          e('span', { style: { width: '24px', height: '24px', borderRadius: '50%', background: teal, color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, '3'),
          e('span', { style: { fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' } }, 'Fix the Digital Audit Decline')
        ),
        e('p', { style: { fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 } }, 'Goes hand-in-hand with the IPM initiative. Diagnose why RealClean, Software Advice, and Stratus are declining at a high rate, clean up the "Declined" classification issue, and restore audit pipeline volume.')
      ),
      e('div', { style: { background: '#f8fafc', borderRadius: '8px', padding: '14px', border: '1px solid #e2e8f0' } },
        e('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
          e('span', { style: { width: '24px', height: '24px', borderRadius: '50%', background: teal, color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, '4'),
          e('span', { style: { fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' } }, 'Close the Final Week Strong')
        ),
        e('p', { style: { fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 } }, 'Push the 8 open proposals through by EOD March 13. Prioritize any deal that can be structured before week-end to hit or exceed $30k MRR for March.')
      ),
      e('div', { style: { background: '#f8fafc', borderRadius: '8px', padding: '14px', border: '1px solid #e2e8f0' } },
        e('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
          e('span', { style: { width: '24px', height: '24px', borderRadius: '50%', background: teal, color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, '5'),
          e('span', { style: { fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' } }, 'Activate the Upsell Channel')
        ),
        e('p', { style: { fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 } }, 'Partner with the OB team and Sapper to systematically identify upsell-eligible accounts. Build a recurring process -- not a one-off effort -- so Upsell becomes a reliable MRR source every month.')
      ),
      e('div', { style: { background: '#f8fafc', borderRadius: '8px', padding: '14px', border: '1px solid #e2e8f0' } },
        e('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' } },
          e('span', { style: { width: '24px', height: '24px', borderRadius: '50%', background: teal, color: '#fff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, '6'),
          e('span', { style: { fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' } }, 'Protect the Web Lead Channel')
        ),
        e('p', { style: { fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 } }, 'HatLaunch proved that web leads can produce high-value, diversified deals. Continue investing in and responding quickly to inbound web leads as a high-ROI source that complements outbound efforts.')
      )
    )
  )), activeTab === 'rr' && e('div', null,
  // Executive Retention Header
  function () {
    var rollingAvg = 97.7;
    var target = 97.5;
    var variance = rollingAvg - target;
    var aboveTarget = '#0d9488';
    var atRisk = '#d97706';
    var belowTarget = '#dc2626';
    var statusLabel = rollingAvg >= target ? 'Above Target \u2013 Stable' : rollingAvg >= target - 0.5 ? 'At Risk \u2013 Monitor' : 'Below Target \u2013 Action Required';
    var statusColor = rollingAvg >= target ? aboveTarget : rollingAvg >= target - 0.5 ? atRisk : belowTarget;
    var varianceLabel = (variance >= 0 ? '+' : '') + variance.toFixed(1) + '% ' + (variance >= 0 ? 'above' : 'below') + ' target';
    var varianceColor = variance >= 0 ? aboveTarget : variance >= -0.5 ? atRisk : belowTarget;
    return e('div', {
      style: {
        background: '#0f172a',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
      }
    },
    // Top accent line
    e('div', {
      style: {
        height: '3px',
        background: 'linear-gradient(90deg, ' + statusColor + ', ' + statusColor + '88, transparent)'
      }
    }),
    // Content
    e('div', {
      style: {
        padding: '22px 28px'
      }
    },
    // Row 1: Title + verdict badge
    e('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
        flexWrap: 'wrap',
        gap: '8px'
      }
    }, e('div', {
      style: {
        fontSize: '0.65rem',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.18em'
      }
    }, 'Retention Status \u2013 February 2026'), e('div', {
      style: {
        fontSize: '0.7rem',
        fontWeight: 600,
        color: statusColor,
        backgroundColor: statusColor + '18',
        padding: '5px 16px',
        borderRadius: '4px',
        letterSpacing: '0.04em'
      }
    }, statusLabel)),
    // Row 2: Overall Position
    e('div', {
      style: {
        fontSize: '1.05rem',
        fontWeight: 500,
        color: '#cbd5e1',
        marginBottom: '20px'
      }
    }, 'Overall Position: ', e('span', {
      style: {
        color: '#e2e8f0',
        fontWeight: 700
      }
    }, 'Stable'), e('span', {
      style: {
        color: '#94a3b8',
        fontWeight: 400
      }
    }, ' with '), e('span', {
      style: {
        color: atRisk,
        fontWeight: 600
      }
    }, 'moderate volatility')),
    // Divider
    e('div', {
      style: {
        height: '1px',
        backgroundColor: '#1e293b',
        marginBottom: '18px'
      }
    }),
    // Metrics row
    e('div', {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0',
        flexWrap: 'wrap'
      }
    },
    // Rolling Avg
    e('div', {
      style: {
        flex: '1 1 auto',
        minWidth: '100px'
      }
    }, e('div', {
      style: {
        fontSize: '0.58rem',
        fontWeight: 600,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '6px'
      }
    }, 'Rolling 3-Mo Avg'), e('div', {
      style: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: statusColor,
        letterSpacing: '-0.02em'
      }
    }, rollingAvg.toFixed(1) + '%')),
    // Target
    e('div', {
      style: {
        flex: '1 1 auto',
        minWidth: '80px',
        borderLeft: '1px solid #1e293b',
        paddingLeft: '20px'
      }
    }, e('div', {
      style: {
        fontSize: '0.58rem',
        fontWeight: 600,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '6px'
      }
    }, 'Target'), e('div', {
      style: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: '#cbd5e1',
        letterSpacing: '-0.02em'
      }
    }, target.toFixed(1) + '%')),
    // Variance
    e('div', {
      style: {
        flex: '1.5 1 auto',
        minWidth: '140px',
        borderLeft: '1px solid #1e293b',
        paddingLeft: '20px'
      }
    }, e('div', {
      style: {
        fontSize: '0.58rem',
        fontWeight: 600,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '6px'
      }
    }, 'Variance'), e('div', {
      style: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: varianceColor,
        letterSpacing: '-0.02em'
      }
    }, varianceLabel)),
    // Churn Pressure
    e('div', {
      style: {
        flex: '1 1 auto',
        minWidth: '100px',
        borderLeft: '1px solid #1e293b',
        paddingLeft: '20px'
      }
    }, e('div', {
      style: {
        fontSize: '0.58rem',
        fontWeight: 600,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '6px'
      }
    }, 'Churn Pressure'), e('div', {
      style: {
        fontSize: '1rem',
        fontWeight: 700,
        color: atRisk
      }
    }, 'Moderate')),
    // Peak Churn Window
    e('div', {
      style: {
        flex: '1 1 auto',
        minWidth: '110px',
        borderLeft: '1px solid #1e293b',
        paddingLeft: '20px'
      }
    }, e('div', {
      style: {
        fontSize: '0.58rem',
        fontWeight: 600,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '6px'
      }
    }, 'Peak Churn Window'), e('div', {
      style: {
        fontSize: '1rem',
        fontWeight: 700,
        color: '#94a3b8'
      }
    }, '12\u201318 Months')),
    // Early Churn
    e('div', {
      style: {
        flex: '1 1 auto',
        minWidth: '80px',
        borderLeft: '1px solid #1e293b',
        paddingLeft: '20px'
      }
    }, e('div', {
      style: {
        fontSize: '0.58rem',
        fontWeight: 600,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '6px'
      }
    }, 'Early Churn (<6mo)'), e('div', {
      style: {
        fontSize: '1rem',
        fontWeight: 700,
        color: aboveTarget
      }
    }, '1 Case')))));
  }(), e('div', null,
  // Row 1: Churn Pressure + Trend Sparkline
  e('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, e('div', {
    className: 'card',
    style: {
      padding: '20px'
    }
  }, e('div', {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '12px'
    }
  }, 'Churn Pressure Index'), e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, e('span', {
    style: {
      fontSize: '0.8rem',
      color: '#475569'
    }
  }, 'Retention Health'), e('span', {
    style: {
      fontSize: '0.8rem',
      fontWeight: 700,
      color: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.1)',
      padding: '2px 10px',
      borderRadius: '10px'
    }
  }, '\u{1F7E2} Stable')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, e('span', {
    style: {
      fontSize: '0.8rem',
      color: '#475569'
    }
  }, 'Churn Pressure'), e('span', {
    style: {
      fontSize: '0.8rem',
      fontWeight: 700,
      color: '#ca8a04',
      backgroundColor: 'rgba(202,138,4,0.1)',
      padding: '2px 10px',
      borderRadius: '10px'
    }
  }, '\u{1F7E1} Moderate')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, e('span', {
    style: {
      fontSize: '0.8rem',
      color: '#475569'
    }
  }, 'Lifecycle Risk'), e('span', {
    style: {
      fontSize: '0.8rem',
      fontWeight: 700,
      color: '#ca8a04',
      backgroundColor: 'rgba(202,138,4,0.1)',
      padding: '2px 10px',
      borderRadius: '10px'
    }
  }, '12\u201318 mo cohort')))), e('div', {
    className: 'card',
    style: {
      padding: '20px'
    }
  }, e('div', {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '12px'
    }
  }, 'Retention Trend'), e('div', {
    style: {
      position: 'relative',
      height: '140px'
    }
  }, e('svg', {
    viewBox: '0 0 300 80',
    style: {
      width: '100%',
      height: '100%'
    }
  }, e('line', {
    x1: 0,
    y1: 23,
    x2: 300,
    y2: 23,
    stroke: '#e2e8f0',
    strokeWidth: 1,
    strokeDasharray: '4,4'
  }), e('defs', null, e('linearGradient', {
    id: 'retGrad',
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 1
  }, e('stop', {
    offset: '0%',
    stopColor: '#ca8a04',
    stopOpacity: 0.15
  }), e('stop', {
    offset: '100%',
    stopColor: '#ca8a04',
    stopOpacity: 0.02
  }))), e('path', {
    d: 'M 37 36.8 L 112 54.4 L 187 17.6 L 262 43.2 L 262 80 L 37 80 Z',
    fill: 'url(#retGrad)'
  }), e('polyline', {
    points: '37,36.8 112,54.4 187,17.6 262,43.2',
    fill: 'none',
    stroke: '#ca8a04',
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  }), e('circle', {
    cx: 37,
    cy: 36.8,
    r: 4,
    fill: '#fff',
    stroke: '#ca8a04',
    strokeWidth: 2
  }), e('circle', {
    cx: 112,
    cy: 54.4,
    r: 4,
    fill: '#fff',
    stroke: '#dc2626',
    strokeWidth: 2
  }), e('circle', {
    cx: 187,
    cy: 17.6,
    r: 4,
    fill: '#fff',
    stroke: '#16a34a',
    strokeWidth: 2
  }), e('circle', {
    cx: 262,
    cy: 43.2,
    r: 4,
    fill: '#fff',
    stroke: '#ca8a04',
    strokeWidth: 2
  }), e('text', {
    x: 37,
    y: 75,
    fill: '#94a3b8',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 500
  }, 'Jan'), e('text', {
    x: 112,
    y: 75,
    fill: '#94a3b8',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 500
  }, 'Feb'), e('text', {
    x: 187,
    y: 75,
    fill: '#94a3b8',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 500
  }, 'Mar'), e('text', {
    x: 262,
    y: 75,
    fill: '#94a3b8',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 500
  }, 'Apr'), e('text', {
    x: 37,
    y: 28,
    fill: '#475569',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 700
  }, '97.7%'), e('text', {
    x: 112,
    y: 48,
    fill: '#dc2626',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 700
  }, '96.6%'), e('text', {
    x: 187,
    y: 11,
    fill: '#16a34a',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 700
  }, '98.9%'), e('text', {
    x: 262,
    y: 37,
    fill: '#475569',
    fontSize: '9',
    textAnchor: 'middle',
    fontWeight: 700
  }, '97.3%'))), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '4px'
    }
  }, e('span', {
    style: {
      fontSize: '0.65rem',
      color: '#94a3b8'
    }
  }, 'Dashed line = 97.7% target'), e('span', {
    style: {
      fontSize: '0.65rem',
      color: '#ca8a04',
      fontWeight: 600
    }
  }, '\u{1F7E1} Volatile \u2014 no clear direction')))),
  // Monthly Retention Cards (Retention-first hierarchy)
  e('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, e('div', {
    className: 'card',
    style: {
      padding: '16px',
      borderTop: '3px solid ' + teal
    }
  }, e('div', {
    style: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#64748b',
      marginBottom: '4px'
    }
  }, 'January 2026'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#1e293b',
      marginBottom: '8px'
    }
  }, '97.7%'), e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '0.75rem'
    }
  }, e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Net Impact'), e('span', {
    style: {
      color: '#dc2626',
      fontWeight: 600
    }
  }, '-$12,321')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Starting MRR'), e('span', {
    style: {
      color: '#475569',
      fontWeight: 600
    }
  }, '$496,180')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'New Sales'), e('span', {
    style: {
      color: '#16a34a',
      fontWeight: 600
    }
  }, '+$16,041')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Ending MRR'), e('span', {
    style: {
      color: '#475569',
      fontWeight: 600
    }
  }, '$499,800')))), e('div', {
    className: 'card',
    style: {
      padding: '16px',
      borderTop: '3px solid #dc2626'
    }
  }, e('div', {
    style: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#64748b',
      marginBottom: '4px'
    }
  }, 'February 2026'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#dc2626',
      marginBottom: '8px'
    }
  }, '96.6%'), e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '0.75rem'
    }
  }, e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Net Impact'), e('span', {
    style: {
      color: '#dc2626',
      fontWeight: 600
    }
  }, '-$18,694')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Starting MRR'), e('span', {
    style: {
      color: '#475569',
      fontWeight: 600
    }
  }, '$499,800')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'New Sales'), e('span', {
    style: {
      color: '#16a34a',
      fontWeight: 600
    }
  }, '+$22,091')), e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Ending MRR'), e('span', {
    style: {
      color: '#475569',
      fontWeight: 600
    }
  }, '$490,881')))), e('div', {
    className: 'card',
    style: {
      padding: '16px',
      borderTop: '3px solid #16a34a'
    }
  }, e('div', {
    style: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#64748b',
      marginBottom: '4px'
    }
  }, 'March 2026'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#16a34a',
      marginBottom: '8px'
    }
  }, '98.9%'), e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '0.75rem'
    }
  }, e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Net Impact'), e('span', {
    style: {
      color: '#dc2626',
      fontWeight: 600
    }
  }, '-$5,975')))), e('div', {
    className: 'card',
    style: {
      padding: '16px',
      borderTop: '3px solid #ca8a04'
    }
  }, e('div', {
    style: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: '#64748b',
      marginBottom: '4px'
    }
  }, 'April 2026'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#ca8a04',
      marginBottom: '8px'
    }
  }, '97.3%'), e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '0.75rem'
    }
  }, e('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, e('span', {
    style: {
      color: '#94a3b8'
    }
  }, 'Net Impact'), e('span', {
    style: {
      color: '#dc2626',
      fontWeight: 600
    }
  }, '-$14,025'))))),
  // Lifecycle Context - Row 1
  e('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '12px'
    }
  }, e('div', {
    className: 'card',
    style: {
      padding: '16px',
      textAlign: 'center',
      borderTop: '3px solid ' + maroon
    }
  }, e('div', {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '4px'
    }
  }, 'Active Accounts'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#1e293b'
    }
  }, '211'), e('div', {
    style: {
      fontSize: '0.7rem',
      color: '#64748b'
    }
  }, 'Total inbound portfolio')), e('div', {
    className: 'card',
    style: {
      padding: '16px',
      textAlign: 'center',
      borderTop: '3px solid ' + teal
    }
  }, e('div', {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '4px'
    }
  }, 'Avg Client Tenure'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#1e293b'
    }
  }, '2.1 yrs'), e('div', {
    style: {
      fontSize: '0.7rem',
      color: '#64748b'
    }
  }, 'Weighted avg across all DSMs')), e('div', {
    className: 'card',
    style: {
      padding: '16px',
      textAlign: 'center',
      borderTop: '3px solid ' + teal
    }
  }, e('div', {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '4px'
    }
  }, 'Avg Months to Cancel'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#1e293b'
    }
  }, '21.8'), e('div', {
    style: {
      fontSize: '0.7rem',
      color: '#64748b'
    }
  }, 'Across all churned accounts'))),
  // Lifecycle Context - Row 2
  e('div', {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '20px'
    }
  }, e('div', {
    className: 'card',
    style: {
      padding: '16px',
      textAlign: 'center',
      borderTop: '3px solid #ca8a04'
    }
  }, e('div', {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '4px'
    }
  }, 'Peak Churn Window'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#ca8a04'
    }
  }, '12\u201318 mo'), e('div', {
    style: {
      fontSize: '0.7rem',
      color: '#64748b'
    }
  }, 'Highest cancellation concentration')), e('div', {
    className: 'card',
    style: {
      padding: '16px',
      textAlign: 'center',
      borderTop: '3px solid #0d9488'
    }
  }, e('div', {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '4px'
    }
  }, 'Early Churn Rate (<6mo)'), e('div', {
    style: {
      fontSize: '1.8rem',
      fontWeight: 800,
      color: '#0d9488'
    }
  }, '1 case'), e('div', {
    style: {
      fontSize: '0.7rem',
      color: '#64748b'
    }
  }, 'Isolated \u2014 not systemic'))),
  // Executive-Level Churn Analysis
  e('div', {
    className: 'card'
  }, e('div', {
    className: 'retention-header',
    style: {
      marginBottom: '16px'
    }
  }, e('h3', {
    className: 'section-title',
    style: {
      marginBottom: 0
    }
  }, e('span', {
    className: 'dot',
    style: {
      backgroundColor: maroon
    }
  }), 'Executive Summary: Churn & Retention Analysis')), e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, e('div', {
    style: {
      padding: '14px 16px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      borderLeft: '3px solid ' + teal
    }
  }, e('div', {
    style: {
      fontWeight: 700,
      color: '#1e293b',
      fontSize: '0.85rem',
      marginBottom: '4px'
    }
  }, 'Churn Timing'), e('div', {
    style: {
      fontSize: '0.8rem',
      color: '#475569',
      lineHeight: '1.5'
    }
  }, 'Inbound churn is not driven by early onboarding breakdowns. The majority of churn occurs between 12\u201318 months, suggesting lifecycle value perception and renewal positioning are the primary friction points.')), e('div', {
    style: {
      padding: '14px 16px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      borderLeft: '3px solid ' + orange
    }
  }, e('div', {
    style: {
      fontWeight: 700,
      color: '#1e293b',
      fontSize: '0.85rem',
      marginBottom: '4px'
    }
  }, 'Revenue Lifespan'), e('div', {
    style: {
      fontSize: '0.8rem',
      color: '#475569',
      lineHeight: '1.5'
    }
  }, 'Average revenue lifespan across churned accounts is approximately 2 years. One early-stage churn case (Nicholas) represents isolated onboarding exposure, not systemic failure.')), e('div', {
    style: {
      padding: '14px 16px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      borderLeft: '3px solid ' + maroon
    }
  }, e('div', {
    style: {
      fontWeight: 700,
      color: '#1e293b',
      fontSize: '0.85rem',
      marginBottom: '4px'
    }
  }, 'Portfolio Risk Profile'), e('div', {
    style: {
      fontSize: '0.8rem',
      color: '#475569',
      lineHeight: '1.5'
    }
  }, "The largest exposure risk sits within Jacob\u2019s portfolio due to volume concentration, while John demonstrates the strongest long-term durability profile.")), e('div', {
    style: {
      padding: '14px 16px',
      backgroundColor: 'rgba(20,184,166,0.05)',
      borderRadius: '8px',
      border: '1px solid rgba(20,184,166,0.2)'
    }
  }, e('div', {
    style: {
      fontWeight: 700,
      color: '#1e293b',
      fontSize: '0.85rem',
      marginBottom: '8px'
    }
  }, '2026 Retention Strategy Focus'), e('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }
  }, e('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.8rem',
      color: '#475569'
    }
  }, e('span', {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: teal,
      flexShrink: 0
    }
  }), 'Renewal reinforcement at 10\u201314 months'), e('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.8rem',
      color: '#475569'
    }
  }, e('span', {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: teal,
      flexShrink: 0
    }
  }), 'Proactive lifecycle value audits'), e('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.8rem',
      color: '#475569'
    }
  }, e('span', {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      backgroundColor: teal,
      flexShrink: 0
    }
  }), 'Targeted stabilization of mid-tenure accounts'))))))), activeTab === 'ra' && e('div', null,
  // DSM Performance Overview - moved to top
  e('div', {
    className: 'card',
    style: {
      marginBottom: '20px'
    }
  }, e('div', {
    className: 'retention-header'
  }, e('h3', {
    className: 'section-title',
    style: {
      marginBottom: 0
    }
  }, e('span', {
    className: 'dot',
    style: {
      backgroundColor: maroon
    }
  }), 'DSM Performance Overview'), e('div', {
    style: {
      fontSize: '0.75rem',
      color: '#64748b',
      fontStyle: 'italic'
    }
  }, 'Portfolio, tenure, churn history, and 2026 YTD retention')), e('div', {
    style: {
      overflowX: 'auto'
    }
  }, e('table', {
    style: {
      width: '100%',
      minWidth: '700px'
    }
  }, e('thead', null, e('tr', {
    style: {
      borderBottom: '2px solid #e2e8f0'
    }
  }, e('th', {
    style: {
      textAlign: 'left',
      padding: '10px 12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'DSM'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Clients'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Avg Tenure'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Cancels'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Avg Mo to Cancel'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Median Mo'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderLeft: '2px solid #e2e8f0'
    }
  }, '2026 YTD Avg'))), e('tbody', null, cancelByDsmData.map(function (row, idx) {
    var tenureColor = row.avgYears === null ? '#94a3b8' : row.avgYears >= 3 ? '#0d9488' : row.avgYears >= 1 ? '#475569' : '#d97706';
    var cancelColor = row.avgMonths === null ? '#94a3b8' : row.avgMonths >= 18 ? '#0d9488' : row.avgMonths >= 12 ? '#475569' : '#d97706';
    var medianColor = row.medianMonths === null ? '#94a3b8' : row.medianMonths >= 18 ? '#0d9488' : row.medianMonths >= 12 ? '#475569' : '#d97706';
    var ytdColor = row.ytd2026 === null ? '#94a3b8' : row.ytd2026 >= 100 ? '#0d9488' : row.ytd2026 >= 97 ? '#475569' : row.ytd2026 >= 95 ? '#d97706' : '#dc2626';
    return e('tr', {
      key: idx,
      style: {
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#fff'
      }
    }, e('td', {
      style: {
        padding: '10px 12px',
        fontWeight: 600,
        color: '#1e293b',
        fontSize: '0.85rem'
      }
    }, row.name), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 12px',
        fontWeight: 600,
        color: row.clients ? '#1e293b' : '#94a3b8'
      }
    }, row.clients || '\u2014'), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 12px',
        fontWeight: 700,
        color: tenureColor
      }
    }, row.avgYears ? row.avgYears.toFixed(2) + ' yrs' : '\u2014'), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 12px',
        fontWeight: 700,
        color: row.cancels > 0 ? '#1e293b' : '#94a3b8'
      }
    }, row.cancels || '\u2014'), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 12px',
        fontWeight: 700,
        color: cancelColor
      }
    }, row.avgMonths ? row.avgMonths.toFixed(1) + ' mo' : '\u2014'), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 12px',
        fontWeight: 700,
        color: medianColor
      }
    }, row.medianMonths ? row.medianMonths.toFixed(1) + ' mo' : '\u2014'), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 12px',
        fontWeight: 800,
        color: ytdColor,
        borderLeft: '2px solid #f1f5f9',
        fontSize: '0.9rem'
      }
    }, row.ytd2026 ? row.ytd2026.toFixed(1) + '%' : '\u2014'));
  })), e('tfoot', null, e('tr', {
    style: {
      borderTop: '2px solid #cbd5e1',
      backgroundColor: '#f1f5f9'
    }
  }, e('td', {
    style: {
      padding: '10px 12px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, 'Portfolio Avg'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, '211'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, '2.1 yrs'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, '17'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, '21.8 mo'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, '18.9 mo'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 12px',
      fontWeight: 800,
      color: '#0d9488',
      borderLeft: '2px solid #e2e8f0',
      fontSize: '0.9rem'
    }
  }, '96.8%')))))), e('div', {
    className: 'grid-2',
    style: {
      gap: '24px'
    }
  },
  // 2026 Card (Priority)
  e('div', {
    className: 'card'
  }, e('div', {
    className: 'retention-header'
  }, e('h3', {
    className: 'section-title',
    style: {
      marginBottom: 0
    }
  }, e('span', {
    className: 'dot',
    style: {
      backgroundColor: orange
    }
  }), '2026 Retention by Account Manager'), e('div', {
    className: 'retention-team-avg'
  }, 'Team Average: ', e('strong', null, '97.6%'))), e('div', {
    className: 'retention-list'
  }, e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'Henry Pfeil'), e('span', {
    className: 'retention-rate excellent'
  }, '102.3%'), e('span', {
    className: 'retention-breakdown'
  }, 'Jan: 101.3%, Feb: 103.4%')), e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'Jacob Yarbrough'), e('span', {
    className: 'retention-rate alert'
  }, '95.96%'), e('span', {
    className: 'retention-breakdown'
  }, 'Jan: 100.4%, Feb: 90.9%, Mar: 95.02%, Apr: 97.5%')), e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'John Halcomb'), e('span', {
    className: 'retention-rate alert'
  }, '95.89%'), e('span', {
    className: 'retention-breakdown'
  }, 'Jan: 100.1%, Feb: 90%, Mar: 100%, Apr: 93.45%')), e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'Brian Hoffman'), e('span', {
    className: 'retention-rate alert'
  }, '94.05%'), e('span', {
    className: 'retention-breakdown'
  }, 'Jan: 88.3%, Feb: 99.8%')))),
  // 2025 Card (Reference)
  e('div', {
    className: 'card'
  }, e('div', {
    className: 'retention-header'
  }, e('h3', {
    className: 'section-title',
    style: {
      marginBottom: 0
    }
  }, e('span', {
    className: 'dot',
    style: {
      backgroundColor: teal
    }
  }), '2025 Retention by Account Manager'), e('div', {
    className: 'retention-team-avg'
  }, 'Team Average: ', e('strong', null, '97.9%'))), e('div', {
    className: 'retention-list'
  }, e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'Jacob Yarbrough'), e('span', {
    className: 'retention-rate excellent'
  }, '98.75%')), e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'Aaron Graue'), e('span', {
    className: 'retention-rate excellent'
  }, '98.3%')), e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'Brian Hoffman'), e('span', {
    className: 'retention-rate good'
  }, '97.9%')), e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'John Halcomb'), e('span', {
    className: 'retention-rate warning'
  }, '96.8%')), e('div', {
    className: 'retention-row inactive'
  }, e('span', {
    className: 'retention-name'
  }, 'Dajah Ray'), e('span', {
    className: 'retention-rate warning'
  }, '96.7%'), e('span', {
    className: 'retention-note'
  }, 'no longer in role')), e('div', {
    className: 'retention-row inactive'
  }, e('span', {
    className: 'retention-name'
  }, 'Bryan Dykes'), e('span', {
    className: 'retention-rate alert'
  }, '95.5%'), e('span', {
    className: 'retention-note'
  }, 'no longer in role')), e('div', {
    className: 'retention-row'
  }, e('span', {
    className: 'retention-name'
  }, 'Henry Pfeil'), e('span', {
    className: 'retention-rate na'
  }, 'N/A'), e('span', {
    className: 'retention-note'
  }, 'Started in November'))))),
  // Cancel Risk by Account Manager
  e('div', {
    className: 'card',
    style: {
      marginTop: '20px'
    }
  }, e('div', {
    className: 'retention-header'
  }, e('h3', {
    className: 'section-title',
    style: {
      marginBottom: 0
    }
  }, e('span', {
    className: 'dot',
    style: {
      backgroundColor: orange
    }
  }), 'Cancel Risk by Account Manager')), e('table', {
    style: {
      width: '100%'
    }
  }, e('thead', null, e('tr', {
    style: {
      borderBottom: '2px solid #e2e8f0'
    }
  }, e('th', {
    style: {
      textAlign: 'left',
      padding: '10px 16px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Account Manager'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 16px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Accounts at Risk'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 16px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Total MRR at Risk'), e('th', {
    style: {
      textAlign: 'center',
      padding: '10px 16px',
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, 'Avg Chance of Cancel'))), e('tbody', null, [{
    name: 'Matt Gilmore',
    accounts: 18,
    mrr: 34750,
    chance: 20
  }, {
    name: 'Brian Hoffman',
    accounts: 11,
    mrr: 32259,
    chance: 33
  }, {
    name: 'Henry Pfeil',
    accounts: 10,
    mrr: 30971,
    chance: 38
  }, {
    name: 'John Halcomb',
    accounts: 7,
    mrr: 18130,
    chance: 20
  }, {
    name: 'Aaron Graue',
    accounts: 7,
    mrr: 12727,
    chance: 18
  }, {
    name: 'Jacob Yarbrough',
    accounts: 4,
    mrr: 11275,
    chance: 44
  }, {
    name: 'Anna Walschleger',
    accounts: 1,
    mrr: 1545,
    chance: 25
  }].map(function (row, idx) {
    var chanceColor = row.chance >= 40 ? '#dc2626' : row.chance >= 30 ? '#d97706' : '#475569';
    return e('tr', {
      key: idx,
      style: {
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: idx % 2 === 0 ? '#f8fafc' : '#fff'
      }
    }, e('td', {
      style: {
        padding: '10px 16px',
        fontWeight: 600,
        color: '#1e293b',
        fontSize: '0.85rem'
      }
    }, row.name), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 16px',
        fontWeight: 700,
        color: '#1e293b'
      }
    }, row.accounts), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 16px',
        fontWeight: 700,
        color: '#1e293b'
      }
    }, '$' + row.mrr.toLocaleString()), e('td', {
      style: {
        textAlign: 'center',
        padding: '10px 16px',
        fontWeight: 700,
        color: chanceColor
      }
    }, row.chance + '%'));
  })), e('tfoot', null, e('tr', {
    style: {
      borderTop: '2px solid #cbd5e1',
      backgroundColor: '#f1f5f9'
    }
  }, e('td', {
    style: {
      padding: '10px 16px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, 'Total'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 16px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, '58'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 16px',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, '$141,657'), e('td', {
    style: {
      textAlign: 'center',
      padding: '10px 16px',
      fontWeight: 700,
      color: '#475569'
    }
  }, '28% avg'))))),
  // January MRM Completion
  e('div', {
    className: 'card',
    style: {
      marginTop: '20px'
    }
  }, e('div', {
    className: 'mrm-completion'
  }, e('span', {
    className: 'mrm-label'
  }, 'January MRM Completion'), e('span', {
    className: 'mrm-value'
  }, '91.2%')))), activeTab === 'fulfill' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SubNav, {
    items: foNav,
    active: foSub,
    onSelect: setFoSub
  }), foSub === 'overview' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, heroKpi('MARCH TOTAL BILLING', fmt(grandTotal), '215 clients \u2014 182 active + 22 implementing'), kpiCard('WEBSITE & SEO CONTENT', fmt(441049), '86.4% of total revenue', 'Core product \u2014 Website + Ongoing SEO', 'neutral'), kpiCard('PPC MANAGEMENT', fmt(35677), '7.0% of total revenue', '35 active Google Ads accounts', 'neutral'), kpiCard('OTHER SERVICES', fmt(33030), '6.5% of total revenue', 'Social, Hosting, Backlinking, etc.', 'neutral')), /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: teal
    }
  }), "Revenue Breakdown by Service"), serviceSummary.map((s, i) => {
    const pct = s.total / grandTotal * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 0',
        borderBottom: i < serviceSummary.length - 1 ? '1px solid #f1f5f9' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: '200px',
        fontSize: '0.85rem',
        fontWeight: 500,
        color: '#334155'
      }
    }, s.service), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: '20px',
        background: '#f1f5f9',
        borderRadius: '4px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: Math.max(pct, 0.5) + '%',
        background: i === 0 ? teal : i === 1 ? maroon : '#94a3b8',
        borderRadius: '4px'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        width: '90px',
        textAlign: 'right',
        fontWeight: 700,
        fontSize: '0.85rem'
      }
    }, fmt(s.total)), /*#__PURE__*/React.createElement("span", {
      style: {
        width: '48px',
        textAlign: 'right',
        fontSize: '0.75rem',
        color: '#94a3b8'
      }
    }, pct.toFixed(1), "%"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderTop: '2px solid #e2e8f0',
      marginTop: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '200px',
      fontSize: '0.85rem',
      fontWeight: 800
    }
  }, "Total"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: '90px',
      textAlign: 'right',
      fontWeight: 800,
      fontSize: '1rem'
    }
  }, fmt(grandTotal)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: '48px',
      textAlign: 'right',
      fontSize: '0.75rem',
      fontWeight: 700
    }
  }, "100%")))), foSub === 'seo' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, heroKpi('WEBSITE & SEO CONTENT REVENUE', fmt(441049), '86.4% of total \u2014 Core product'), kpiCard('WEBSITE + SEO', '161', '78% of SEO clients', 'We built the site + manage SEO', 'neutral'), kpiCard('SEO ONLY', '38', '19% of SEO clients', 'No website build contracted', 'neutral')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: maroon
    }
  }), "Revenue by Digital Success Manager"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: '#64748b',
      marginBottom: '12px'
    }
  }, "215 total clients across 8 DSMs"), dsmSummary.map((d, i) => {
    const pct = d.revenue / dsmSummary[0].revenue * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 0',
        borderBottom: i < dsmSummary.length - 1 ? '1px solid #f1f5f9' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: '130px',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#334155',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, d.name), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: '16px',
        background: '#f1f5f9',
        borderRadius: '4px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: pct + '%',
        background: i < 3 ? maroon : i < 6 ? teal : '#94a3b8',
        borderRadius: '4px',
        opacity: 1 - i * 0.06
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        width: '75px',
        textAlign: 'right',
        fontWeight: 700,
        fontSize: '0.8rem'
      }
    }, fmt(d.revenue)));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: maroon
    }
  }), "Content Production"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'rgba(13,148,136,0.04)',
      borderRadius: '8px',
      border: '1px solid rgba(13,148,136,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: teal,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '12px'
    }
  }, "February Results"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800
    }
  }, "1,745"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Total Records")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#16a34a'
    }
  }, "1,737"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Completed")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#16a34a'
    }
  }, "99.5%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Completion"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(13,148,136,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.1rem',
      fontWeight: 700
    }
  }, "1,578.1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Hours Scheduled")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.1rem',
      fontWeight: 700
    }
  }, "1,398.8"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Hours Completed")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      background: 'rgba(140,8,43,0.04)',
      borderRadius: '8px',
      border: '1px solid rgba(140,8,43,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: maroon,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '12px'
    }
  }, "March Scheduled"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800
    }
  }, "2,768"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Total Records")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#f59e0b'
    }
  }, "103"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Completed")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#f59e0b'
    }
  }, "3.7%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Completion"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(140,8,43,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.1rem',
      fontWeight: 700
    }
  }, "1,914.8"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Hours Scheduled")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.1rem',
      fontWeight: 700
    }
  }, "97.8"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#64748b'
    }
  }, "Hours Completed"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '10px',
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 10px',
      borderRadius: '10px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: 'rgba(245,158,11,0.1)',
      color: '#d97706'
    }
  }, "+1,023 records vs Feb"), /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 10px',
      borderRadius: '10px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: 'rgba(245,158,11,0.1)',
      color: '#d97706'
    }
  }, "+336.7 hrs scheduled"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: teal
    }
  }), "GA4 Performance \u2014 Last 30 Days"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '12px',
      marginBottom: '16px'
    }
  }, [{
    label: 'TOTAL SESSIONS',
    value: '477,506',
    sub: '80 clients with GA4 connected'
  }, {
    label: 'ORGANIC SESSIONS',
    value: '150,337',
    sub: '31% of total traffic'
  }, {
    label: 'TOTAL CONVERSIONS',
    value: '354,740',
    sub: 'Forms + calls + sitewide'
  }, {
    label: 'FORM SUBMISSIONS',
    value: '62,458',
    sub: '29,319 click-to-call'
  }].map((k, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.6rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '6px'
    }
  }, k.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.4rem',
      fontWeight: 800,
      color: '#1e293b'
    }
  }, k.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: '#94a3b8',
      marginTop: '4px'
    }
  }, k.sub)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '8px'
    }
  }, "Top Performers by Traffic"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "Client"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Sessions"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Organic"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Org %"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Conversions"))), /*#__PURE__*/React.createElement("tbody", null, [{
    client: 'Santa Cruz Toyota',
    sess: 35692,
    org: 11223,
    orgPct: 31,
    conv: 522
  }, {
    client: 'Suntrup Direct',
    sess: 35586,
    org: 8245,
    orgPct: 23,
    conv: 1121
  }, {
    client: 'Sunset Ford St. Louis',
    sess: 34358,
    org: 8134,
    orgPct: 24,
    conv: 370
  }, {
    client: 'BMW of West St. Louis',
    sess: 33740,
    org: 7381,
    orgPct: 22,
    conv: 667
  }, {
    client: 'Suntrup Hyundai South',
    sess: 33565,
    org: 11208,
    orgPct: 33,
    conv: 544
  }, {
    client: 'SkyView Atlanta',
    sess: 25326,
    org: 10169,
    orgPct: 40,
    conv: 269654
  }, {
    client: 'Belkin Burden Goldman',
    sess: 15159,
    org: 9826,
    orgPct: 65,
    conv: 1295
  }, {
    client: 'Ron Bouchard Honda',
    sess: 16729,
    org: 6269,
    orgPct: 37,
    conv: 399
  }, {
    client: 'Datawave Marine',
    sess: 2052,
    org: 1511,
    orgPct: 74,
    conv: 20017
  }].map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: rowBg(i)
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      fontSize: '0.85rem',
      fontWeight: 600
    }
  }, r.client), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      textAlign: 'right',
      fontWeight: 700
    }
  }, r.sess.toLocaleString()), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      textAlign: 'right',
      fontSize: '0.8rem'
    }
  }, r.org.toLocaleString()), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      textAlign: 'right',
      fontSize: '0.8rem',
      color: r.orgPct >= 40 ? '#16a34a' : '#64748b'
    }
  }, r.orgPct, "%"), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      textAlign: 'right',
      fontWeight: 600
    }
  }, r.conv.toLocaleString()))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px',
      padding: '10px 14px',
      background: '#fffbeb',
      borderRadius: '6px',
      border: '1px solid #fef3c7',
      fontSize: '0.75rem',
      color: '#92400e'
    }
  }, /*#__PURE__*/React.createElement("strong", null, "Coverage gap:"), " Only 80 of 206 accounts (39%) have GA4 connected via Windsor. 130 clients still need setup."))), foSub === 'ppc' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, heroKpi('PAID MANAGEMENT REVENUE', '$47,427', '55% growth since Aug 2025'), kpiCard('IN-HOUSE', '$34,927', '78% kept in-house', 'Vendor share down from 57% to 22%', 'up'), kpiCard('VEA COST', '$10,500', '22% of paid revenue', '16 VEA-managed accounts', 'neutral'), kpiCard('FEB PAID LEADS', '1,508', '11% MoM increase', '1,355 \u2192 1,508 in WhatConverts', 'up')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#16a34a'
    }
  }), "In-House Fulfillment"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, "Clients"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800
    }
  }, "17")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, "Revenue"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800
    }
  }, "$34,927"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginTop: '8px'
    }
  }, "100% margin on management fees")), /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#3b82f6'
    }
  }), "Vendor Fulfillment (VEA)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, "Clients"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800
    }
  }, "16")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, "Billed"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800
    }
  }, "$21,227")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }
  }, "VEA Cost"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.5rem',
      fontWeight: 800,
      color: '#dc2626'
    }
  }, "$10,500"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginTop: '8px'
    }
  }, "Vendor share: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#dc2626'
    }
  }, "22%"), " \\u2014 down from 57% in Aug"))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: teal
    }
  }), "Paid Revenue Growth Since August 2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '16px',
      background: '#f8fafc',
      borderRadius: '8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '4px'
    }
  }, "Aug 2025"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: '#94a3b8'
    }
  }, "$21,477"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: '#94a3b8',
      marginTop: '4px'
    }
  }, "57% to vendor")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '2rem',
      fontWeight: 800,
      color: '#16a34a'
    }
  }, "+55%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: '#64748b'
    }
  }, "revenue growth"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '16px',
      background: 'rgba(13,148,136,0.06)',
      borderRadius: '8px',
      border: '1px solid rgba(13,148,136,0.15)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: teal,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '4px'
    }
  }, "Mar 2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.75rem',
      fontWeight: 800
    }
  }, "$47,427"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: teal,
      marginTop: '4px'
    }
  }, "Only 22% to vendor"))))), foSub === 'social' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, heroKpi('SOCIAL MEDIA REVENUE', fmt(16175), '3.2% of total revenue'), kpiCard('SOCIAL CONTENT', '~20', 'Clients with social services', 'Content creation + posting', 'neutral'), kpiCard('SOCIAL BOOST', '~8', 'Clients with paid social', 'Facebook + LinkedIn boosts', 'neutral')), /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#6366f1'
    }
  }), "Social Media Services"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      color: '#64748b',
      lineHeight: 1.6
    }
  }, "Social media management includes organic content creation, scheduling, and paid social boosts across Facebook and LinkedIn. Approximately 28 clients have some form of social service bundled with their SEO contract."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '8px'
    }
  }, "Service Types"), ['Social Content Only', 'Social Boost \u2014 Facebook', 'Social Boost \u2014 LinkedIn'].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '6px 0',
      fontSize: '0.8rem',
      fontWeight: 500,
      borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none'
    }
  }, s))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#f8fafc',
      borderRadius: '8px',
      padding: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '8px'
    }
  }, "Monthly Billing"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.75rem',
      fontWeight: 800,
      marginBottom: '4px'
    }
  }, fmt(16175)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: '#64748b'
    }
  }, "Standalone social management fees"))))), foSub === 'other' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, kpiCard('WEBSITE HOSTING', fmt(7980), '1.6% of total', 'Managed hosting services', 'neutral'), kpiCard('SEO - LOCAL LIFT', fmt(4700), '0.9% of total', 'Local SEO packages', 'neutral'), kpiCard('BACKLINKING', fmt(4175), '0.8% of total', 'Link building campaigns', 'neutral')), /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#94a3b8'
    }
  }), "Other Services Summary"), [{
    service: 'Website Hosting',
    total: 7980,
    desc: 'Managed WordPress hosting for client sites'
  }, {
    service: 'SEO - Local Lift',
    total: 4700,
    desc: 'Local SEO citation building + GBP optimization'
  }, {
    service: 'Backlinking',
    total: 4175,
    desc: 'Off-site link building campaigns'
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 0',
      borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 600
    }
  }, s.service), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: '#94a3b8',
      marginTop: '2px'
    }
  }, s.desc)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: '1rem'
    }
  }, fmt(s.total)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      width: '40px',
      textAlign: 'right'
    }
  }, (s.total / grandTotal * 100).toFixed(1), "%"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px 0',
      borderTop: '2px solid #e2e8f0',
      marginTop: '4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontWeight: 800
    }
  }, "Total Other Services"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: '1rem'
    }
  }, fmt(16855)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      fontWeight: 700,
      width: '40px',
      textAlign: 'right'
    }
  }, "3.3%")))), foSub === 'websites' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, heroKpi('WEBSITES LAUNCHED (2 YR)', '62', 'March 2024 – present'), kpiCard('2026 LAUNCHES', '8', 'Sites launched this year', '3 in Jan, 3 in Feb, 2 pending', 'neutral'), kpiCard('IMPLEMENTING', String(implementingPipeline.length), fmt(pipelineTotal) + '/mo pipeline value', pipelineAtRisk.length + ' at risk of cancellation', pipelineAtRisk.length > 0 ? 'down' : 'neutral'), kpiCard('AVG SITE HEALTH', '92%', '104 we-built sites (Semrush)', '81% excellent or good | AI: 82%', 'up')), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: teal
    }
  }), "SEMrush Site Health"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: '#64748b'
    }
  }, "104 we-built sites audited"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      fontWeight: 700
    }
  }, "Avg: 92%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: teal
    }
  }, "AI: 82%"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '10px'
    }
  }, "Health Distribution"), [{
    label: 'Excellent (95-100%)',
    count: 41,
    color: '#16a34a',
    pct: 39
  }, {
    label: 'Good (90-94%)',
    count: 43,
    color: teal,
    pct: 41
  }, {
    label: 'Fair (80-89%)',
    count: 15,
    color: '#f59e0b',
    pct: 14
  }, {
    label: 'Needs Work (70-79%)',
    count: 4,
    color: '#f97316',
    pct: 4
  }, {
    label: 'Critical (<70%)',
    count: 1,
    color: '#dc2626',
    pct: 1
  }].map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      width: '140px',
      color: '#475569'
    }
  }, b.label), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: '14px',
      background: '#f1f5f9',
      borderRadius: '4px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: b.pct + '%',
      background: b.color,
      borderRadius: '4px'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: '0.8rem',
      width: '24px',
      textAlign: 'right'
    }
  }, b.count)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '10px'
    }
  }, "Subcategory Averages"), [{
    label: 'Crawlability',
    value: '94%',
    color: teal
  }, {
    label: 'Site Performance',
    value: '95%',
    color: '#16a34a'
  }, {
    label: 'Internal Linking',
    value: '91%',
    color: teal
  }, {
    label: 'AI Search Health',
    value: '82%',
    color: '#f59e0b'
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.8rem',
      color: '#475569'
    }
  }, m.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: '0.85rem',
      color: m.color
    }
  }, m.value)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#f59e0b'
    }
  }), "Implementing Pipeline"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: '#64748b'
    }
  }, implementingPipeline.length, " clients"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      fontWeight: 700
    }
  }, fmt(pipelineTotal), "/mo"), pipelineAtRisk.length > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: '#dc2626',
      fontWeight: 600
    }
  }, pipelineAtRisk.length, " at risk"))), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "Client"), /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "DSM"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Monthly Value"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Days"), /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "Status"))), /*#__PURE__*/React.createElement("tbody", null, implementingPipeline.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i,
    style: rowBg(i)
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      fontSize: '0.85rem',
      fontWeight: 600,
      color: r.cancel ? '#dc2626' : '#334155'
    }
  }, r.client), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      fontSize: '0.8rem',
      color: '#64748b'
    }
  }, r.dsm), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      textAlign: 'right',
      fontWeight: 700
    }
  }, r.value > 0 ? fmt(r.value) : '\u2014'), /*#__PURE__*/React.createElement("td", {
    style: {
      ...tdS,
      textAlign: 'right',
      fontSize: '0.8rem',
      fontWeight: 600,
      color: (() => {
        if (!r.kickoff) return '#94a3b8';
        const p = r.kickoff.split('/');
        const kd = new Date(2000 + parseInt(p[2]), parseInt(p[0]) - 1, parseInt(p[1]));
        const d = Math.floor((new Date('2026-03-03') - kd) / 86400000);
        return d > 90 ? '#dc2626' : d > 60 ? '#d97706' : '#334155';
      })()
    }
  }, (() => {
    if (!r.kickoff) return '\u2014';
    const p = r.kickoff.split('/');
    const kd = new Date(2000 + parseInt(p[2]), parseInt(p[0]) - 1, parseInt(p[1]));
    const d = Math.floor((new Date('2026-03-03') - kd) / 86400000);
    return d >= 0 ? d + 'd' : 'Soon';
  })()), /*#__PURE__*/React.createElement("td", {
    style: tdS
  }, r.cancel ? /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 10px',
      borderRadius: '10px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: 'rgba(220,38,38,0.1)',
      color: '#dc2626'
    }
  }, "Cancel ", r.cancel) : /*#__PURE__*/React.createElement("span", {
    style: {
      padding: '2px 10px',
      borderRadius: '10px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: 'rgba(245,158,11,0.1)',
      color: '#d97706'
    }
  }, "Implementing")))), /*#__PURE__*/React.createElement("tr", {
    style: {
      background: '#f1f5f9'
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px',
      fontWeight: 700,
      borderTop: '2px solid #e2e8f0'
    },
    colSpan: 3
  }, "Total Pipeline"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px',
      textAlign: 'right',
      fontWeight: 800,
      borderTop: '2px solid #e2e8f0'
    }
  }, fmt(pipelineTotal)), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: '12px 14px',
      borderTop: '2px solid #e2e8f0',
      fontSize: '0.75rem',
      color: '#64748b'
    }
  }, implementingPipeline.length, " clients"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#16a34a'
    }
  }), "2026 Launches"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "Client"), /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "Owner"), /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "Kickoff"), /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "Launched"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Days"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Target"), /*#__PURE__*/React.createElement("th", {
    style: thS()
  }, "On Time"), /*#__PURE__*/React.createElement("th", {
    style: thS('right')
  }, "Hours"))), /*#__PURE__*/React.createElement("tbody", null, recentLaunches.map((r, i) => {
    const onTime = r.days <= r.target;
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
      style: rowBg(i)
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdS,
        fontSize: '0.85rem',
        fontWeight: 600
      }
    }, r.client), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdS,
        fontSize: '0.8rem',
        color: '#64748b'
      }
    }, r.owner), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdS,
        fontSize: '0.8rem'
      }
    }, r.kickoff), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdS,
        fontSize: '0.8rem',
        fontWeight: 600
      }
    }, r.launch), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdS,
        textAlign: 'right',
        fontWeight: 700,
        color: onTime ? '#16a34a' : '#dc2626'
      }
    }, r.days), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdS,
        textAlign: 'right',
        fontSize: '0.8rem',
        color: '#94a3b8'
      }
    }, r.target, "d"), /*#__PURE__*/React.createElement("td", {
      style: tdS
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        padding: '2px 10px',
        borderRadius: '10px',
        fontSize: '0.7rem',
        fontWeight: 600,
        background: onTime ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
        color: onTime ? '#16a34a' : '#dc2626'
      }
    }, onTime ? 'Yes' : 'Over')), /*#__PURE__*/React.createElement("td", {
      style: {
        ...tdS,
        textAlign: 'right',
        fontSize: '0.8rem'
      }
    }, r.hrsC > 0 ? r.hrsC.toFixed(0) + '/' + r.hrsS.toFixed(0) : '\u2014'));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginTop: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: maroon
    }
  }), "By Project Owner"), [{
    name: 'Nicholas Chrismer',
    projects: 53,
    pct: 85
  }, {
    name: 'Merideth Neff',
    projects: 9,
    pct: 15
  }].map((o, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 0',
      borderBottom: i === 0 ? '1px solid #f1f5f9' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 600,
      width: '160px'
    }
  }, o.name), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: '16px',
      background: '#f1f5f9',
      borderRadius: '4px',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: o.pct + '%',
      background: i === 0 ? maroon : teal,
      borderRadius: '4px'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: '0.85rem',
      width: '30px',
      textAlign: 'right'
    }
  }, o.projects)))), /*#__PURE__*/React.createElement("div", {
    style: cs
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: teal
    }
  }), "Launch Time Distribution"), [{
    range: 'Under 60 days',
    count: 4,
    color: '#16a34a'
  }, {
    range: '60-90 days (on target)',
    count: 39,
    color: teal
  }, {
    range: '91-120 days',
    count: 8,
    color: '#f59e0b'
  }, {
    range: '120+ days',
    count: 11,
    color: '#dc2626'
  }].map((b, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0',
      borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: b.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.8rem',
      fontWeight: 500,
      flex: 1
    }
  }, b.range), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: '0.85rem'
    }
  }, b.count), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.7rem',
      color: '#94a3b8',
      width: '35px',
      textAlign: 'right'
    }
  }, (b.count / 62 * 100).toFixed(0), "%")))))), foSub === 'insights' && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      marginBottom: '16px',
      padding: '28px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, ' + maroon + ', #9A3A4D)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontSize: '1rem',
      fontWeight: 700
    }
  }, "F")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.05rem',
      fontWeight: 700,
      color: '#1e293b'
    }
  }, "Fulfillment Snapshot"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      color: '#94a3b8',
      fontWeight: 500
    }
  }, "March 2026"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: '16px'
    }
  }, [{
    value: '215',
    label: 'Total Clients',
    sub: '182 active + 22 implementing',
    color: maroon
  }, {
    value: '62',
    label: 'Sites Launched (2 Yr)',
    sub: 'Median 84 days to launch',
    color: teal
  }, {
    value: fmt(pipelineTotal),
    label: 'Pipeline MRR',
    sub: '22 clients implementing',
    color: maroon
  }, {
    value: '477K',
    label: 'Sessions (30 Days)',
    sub: '150K organic (31%)',
    color: teal
  }].map((k, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center',
      padding: '16px',
      borderRadius: '10px',
      background: i % 2 === 0 ? 'rgba(124,45,62,0.04)' : 'rgba(20,184,166,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: k.color,
      lineHeight: 1
    }
  }, k.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.7rem',
      fontWeight: 600,
      color: '#475569',
      marginTop: '6px'
    }
  }, k.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.65rem',
      color: '#94a3b8',
      marginTop: '2px'
    }
  }, k.sub))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      borderTop: '3px solid #16a34a'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      color: '#16a34a',
      marginBottom: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#16a34a'
    }
  }), "Wins"), ['8 websites launched in 2026 — 5 of 8 on time or under target', 'February content completion at 99.5% — near-perfect delivery with March scheduled content up substantially', 'Site health avg 92% across 104 audited sites (81% excellent/good)', '62K form submissions + 29K click-to-call in last 30 days'].map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: '10px',
      padding: '10px 12px',
      marginBottom: '8px',
      borderRadius: '8px',
      background: 'rgba(22,163,74,0.04)',
      border: '1px solid rgba(22,163,74,0.1)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#16a34a',
      fontWeight: 700,
      fontSize: '0.85rem',
      flexShrink: 0
    }
  }, "+"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.8rem',
      color: '#334155',
      lineHeight: 1.5
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...cs,
      borderTop: '3px solid #f59e0b'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.85rem',
      fontWeight: 700,
      color: '#d97706',
      marginBottom: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#f59e0b'
    }
  }), "Risks & Watch Items"), [{
    title: '3 of 8 recent launches over target days',
    desc: 'Median 84 days is within 60-90 target but 3 recent launches were significantly over. Focus on early-stage blockers.'
  }, {
    title: 'Average AI Search Health is 82%',
    desc: 'New metric with room for improvement — 10-point gap vs 92% overall site health.'
  }, {
    title: 'March content volume up 59%',
    desc: '2,768 records scheduled vs 1,745 in Feb. Capacity pressure to monitor for quality maintenance.'
  }, {
    title: 'Only 39% of active clients have GA4 connected',
    desc: 'Prioritize connecting the remaining 102 clients to demonstrate organic value and conversion tracking.'
  }].map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: '10px 12px',
      marginBottom: '8px',
      borderRadius: '8px',
      background: 'rgba(245,158,11,0.04)',
      border: '1px solid rgba(245,158,11,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.8rem',
      fontWeight: 700,
      color: '#1e293b',
      marginBottom: '3px'
    }
  }, r.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '0.75rem',
      color: '#64748b',
      lineHeight: 1.5
    }
  }, r.desc))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '32px',
      paddingTop: '16px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.8rem',
      color: '#94a3b8'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Abstrakt Marketing Group"), /*#__PURE__*/React.createElement("span", null, "Powered by ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#475569'
    }
  }, "INBOUND"), " ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: maroon
    }
  }, "SDR"))));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Dashboard));
</script>
</body>
</html>
