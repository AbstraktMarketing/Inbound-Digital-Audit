"use client";
import React, { useState } from "react";

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

/* ── Theme tokens ── */
function getTheme(mode) {
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

const tabs = [
  "Website Performance",
  "Search Visibility",
  "Local Search Performance",
  "Content Performance",
  "Social & AI Visibility",
];

/* ── Mock Data ── */
const webPerfMetrics = [
  { label: "Site Health", value: "68%", status: "poor", detail: "Measures crawlability, technical errors, and optimization issues. Best-in-class sites score 90%+.", weighted: true, impact: "high",
    why: "Site health directly influences how effectively search engines crawl and index your pages. A low score means critical pages may never appear in search results.",
    fix: "Run a full technical audit to identify and resolve broken links, redirect chains, and crawl errors systematically.",
    expectedImpact: "Improving site health to 90%+ can increase indexed pages by 15-25% and improve crawl efficiency.",
    difficulty: "Medium" },
  { label: "Page Speed & Performance", value: "62%", status: "poor", detail: "Evaluates load speed, performance efficiency, and user experience impact. Target: 90%+.", impact: "high",
    why: "Page speed is a confirmed Google ranking factor. Slow sites lose visitors — 53% of mobile users abandon pages that take over 3 seconds to load.",
    fix: "Compress images, implement lazy loading, enable browser caching, and defer non-critical JavaScript.",
    expectedImpact: "Reaching 90%+ performance can reduce bounce rates by 20-30% and improve conversion rates.",
    difficulty: "Medium" },
  { label: "Mobile Optimization", value: "Yes", status: "good", detail: "Confirms your site is optimized for mobile users and Google's mobile-first indexing.", impact: "foundational",
    why: "Google uses mobile-first indexing — your mobile site IS your site for ranking purposes.",
    fix: "No action needed. Continue testing across devices when making site changes.",
    expectedImpact: "Maintains eligibility for mobile search rankings, which represent 60%+ of all searches.",
    difficulty: "N/A" },
  { label: "Security & SSL", value: "Valid", status: "good", detail: "Status ensures encrypted data protection and trust signals for users and search engines.", impact: "foundational",
    why: "SSL is a ranking signal and browsers flag non-secure sites with warnings, reducing visitor trust.",
    fix: "No action needed. Ensure certificate auto-renews before expiration.",
    expectedImpact: "Maintains trust signals and prevents browser security warnings.",
    difficulty: "N/A" },
  { label: "HTTP/2 Support", value: "Enabled", status: "good", detail: "Improves load performance through faster resource delivery.", impact: "foundational",
    why: "HTTP/2 enables multiplexed connections, reducing page load times significantly over HTTP/1.1.",
    fix: "No action needed. HTTP/2 is properly configured.",
    expectedImpact: "Supports faster page delivery — particularly beneficial for resource-heavy pages.",
    difficulty: "N/A" },
  { label: "Image Optimization", value: "34% Improvement Needed", status: "poor", detail: "17 of 50 images are slowing down load time. Slower pages reduce conversions and search performance.", impact: "high",
    why: "Unoptimized images are the #1 cause of slow page loads. They increase bandwidth costs and hurt Core Web Vitals scores.",
    fix: "Convert images to WebP format, implement responsive srcset attributes, and compress all images above 100KB.",
    expectedImpact: "Can reduce page load time by 40-60% on image-heavy pages.",
    difficulty: "Low" },
  { label: "Alt Tags", value: "58% Incomplete", status: "poor", detail: "Missing alt text limits accessibility and weakens image search visibility.", impact: "medium",
    why: "Alt tags enable image search rankings and are required for accessibility compliance (ADA/WCAG).",
    fix: "Audit all images and add descriptive, keyword-relevant alt text to each one.",
    expectedImpact: "Can open new traffic channels through Google Image Search and improve accessibility compliance.",
    difficulty: "Low" },
];
function calcWeightedScore(metrics) {
  const sv = { good: 100, warning: 50, poor: 0 };
  const impactWeight = { high: 3, medium: 1.5, foundational: 1 };
  let totalWeight = 0, totalScore = 0;
  metrics.forEach(m => {
    const base = impactWeight[m.impact] || 1;
    const w = m.weighted ? base * 1.25 : base;
    totalWeight += w;
    totalScore += w * (sv[m.status] ?? 0);
  });
  return Math.round(totalScore / totalWeight);
}
const mockWebPerf = {
  score: calcWeightedScore(webPerfMetrics),
  metrics: webPerfMetrics,
};

const mockSEO = {
  score: 65,
  metrics: [
    { label: "Organic Keywords", value: "312", status: "warning", detail: "312 keywords currently ranking in search results. Expanding keyword coverage increases visibility and traffic opportunities.", impact: "high",
      why: "Keyword rankings determine how often your site appears in search results. More rankings = more potential traffic.",
      fix: "Conduct keyword gap analysis to identify high-value terms competitors rank for that you don't.",
      expectedImpact: "Expanding from 312 to 500+ keywords could increase organic traffic by 30-50%.",
      difficulty: "Medium" },
    { label: "Branded Traffic Share", value: "24%", status: "poor", detail: "24% of organic traffic comes from branded searches. Low branded traffic may indicate limited brand awareness or weak demand capture.", impact: "high",
      why: "Low branded search volume means fewer people are actively looking for your company — a sign of weak brand awareness.",
      fix: "Invest in brand visibility campaigns, PR mentions, and thought leadership content to drive branded search demand.",
      expectedImpact: "Increasing branded traffic to 40%+ signals stronger brand recognition and higher conversion potential.",
      difficulty: "High" },
    { label: "Indexation Efficiency", value: "77%", status: "warning", detail: "156 of 203 pages are indexed. Unindexed pages cannot rank in search results, limiting organic growth.", impact: "high",
      why: "If Google hasn't indexed a page, it cannot appear in search results — those pages generate zero organic traffic.",
      fix: "Review unindexed pages for thin content, crawl blocks, or noindex tags. Submit priority pages via Search Console.",
      expectedImpact: "Indexing all quality pages could unlock rankings for 47 additional pages.",
      difficulty: "Low" },
    { label: "Domain Authority Score", value: "32/100", status: "warning", detail: "Indicates current backlink strength and competitive positioning. Higher authority improves ranking potential across competitive keywords.", impact: "medium",
      why: "Domain authority reflects your site's competitive strength. Higher authority means easier rankings for competitive terms.",
      fix: "Build high-quality backlinks through guest posts, digital PR, and industry partnerships.",
      expectedImpact: "Reaching DA 45+ would significantly improve ranking potential for mid-difficulty keywords.",
      difficulty: "High" },
    { label: "Backlink Profile", value: "423", status: "warning", detail: "423 referring links supporting your domain. Quality and relevance matter more than volume.", impact: "medium",
      why: "Backlinks remain one of the strongest ranking signals. Quality links from relevant sites pass authority to your domain.",
      fix: "Disavow toxic links and pursue link-building campaigns targeting industry-relevant, high-authority domains.",
      expectedImpact: "Improving link quality can lift rankings for mid-to-high difficulty keywords.",
      difficulty: "High" },
    { label: "XML Sitemap Status", value: "Found", status: "good", detail: "Sitemap detected and accessible to search engines.", impact: "foundational",
      why: "A sitemap helps search engines discover and understand the structure of your site.",
      fix: "No action needed. Ensure sitemap stays updated as new pages are added.",
      expectedImpact: "Maintains efficient crawl discovery for new and updated content.",
      difficulty: "N/A" },
    { label: "Robots.txt Configuration", value: "Yes", status: "good", detail: "Crawl directives are properly structured.", impact: "foundational",
      why: "Robots.txt controls which pages search engines can access — misconfiguration can block important content.",
      fix: "No action needed. Crawl directives are properly structured.",
      expectedImpact: "Ensures search engines can access all important pages without restriction.",
      difficulty: "N/A" },
  ],
};

const mockKeywords = [
  { keyword: "appointment setting services", position: 3, volume: 1300, traffic: 312, difficulty: 41 },
  { keyword: "outbound marketing agency", position: 5, volume: 480, traffic: 134, difficulty: 34 },
  { keyword: "b2b lead generation", position: 15, volume: 2900, traffic: 116, difficulty: 65 },
  { keyword: "marketing agency st louis", position: 8, volume: 720, traffic: 101, difficulty: 45 },
  { keyword: "seo company near me", position: 12, volume: 1600, traffic: 96, difficulty: 52 },
  { keyword: "digital marketing services", position: 24, volume: 4400, traffic: 88, difficulty: 78 },
  { keyword: "fractional marketing team", position: 6, volume: 390, traffic: 82, difficulty: 29 },
  { keyword: "b2b sales outsourcing", position: 11, volume: 880, traffic: 66, difficulty: 48 },
  { keyword: "lead generation companies", position: 27, volume: 3200, traffic: 51, difficulty: 72 },
  { keyword: "demand generation agency", position: 19, volume: 1100, traffic: 44, difficulty: 58 },
];

/*
 * Content Performance scoring:
 *   - First 2 metrics (Blog Exists, Content Freshness) are weighted 1.25x
 *   - Remaining metrics are weighted 1.0x
 *   - Status values: good = 100, warning = 50, poor = 0
 *   - Score = weighted avg of all metric scores
 */
const contentMetrics = [
  { label: "Blog Page Exists", value: "Yes", status: "good", detail: "A dedicated blog/news page was detected", weighted: true, impact: "foundational",
    why: "A blog page is the foundation for content marketing — it's where fresh, indexable content lives.", fix: "No action needed.", expectedImpact: "Provides the infrastructure for ongoing content strategy.", difficulty: "N/A" },
  { label: "Content Freshness", value: "38 days avg", status: "warning", detail: "Last blog post: 52 days ago", weighted: true, impact: "high",
    why: "Search engines favor sites that publish fresh content regularly. Stale content signals an inactive or abandoned site.",
    fix: "Establish a minimum 2x/month publishing cadence with keyword-targeted blog posts.",
    expectedImpact: "Regular publishing can increase organic traffic by 20-40% within 6 months.", difficulty: "Medium" },
  { label: "Meta Descriptions", value: "68% optimized", status: "warning", detail: "32% of pages missing or have duplicate meta descriptions", impact: "high",
    why: "Meta descriptions control how your pages appear in search results. Missing or duplicate descriptions reduce click-through rates.",
    fix: "Write unique, compelling meta descriptions for all pages — prioritize high-traffic pages first.",
    expectedImpact: "Optimized descriptions can improve CTR by 5-10%, driving more traffic from existing rankings.", difficulty: "Low" },
  { label: "H1 Tags", value: "All pages have H1", status: "good", detail: "Every page has a unique H1 heading tag", impact: "foundational",
    why: "H1 tags tell search engines the primary topic of each page.", fix: "No action needed.", expectedImpact: "Maintains clear page topic signals for search engines.", difficulty: "N/A" },
  { label: "Avg. Time on Page", value: "1m 42s", status: "warning", detail: "Industry avg is 2m 30s", impact: "medium",
    why: "Low time on page suggests content isn't engaging visitors — a signal to search engines that your content may not satisfy search intent.",
    fix: "Improve content depth, add visuals, and use better formatting to increase engagement.",
    expectedImpact: "Reaching 2m+ avg can improve engagement signals and support better rankings.", difficulty: "Medium" },
  { label: "Bounce Rate", value: "64%", status: "poor", detail: "Above the 50% threshold", impact: "high",
    why: "A high bounce rate means visitors leave without interacting — indicating content or UX issues.",
    fix: "Improve page load speed, strengthen above-the-fold content, and add clear calls to action.",
    expectedImpact: "Reducing bounce rate below 50% can significantly improve conversion rates.", difficulty: "Medium" },
  { label: "Readability Score", value: "Grade 11", status: "warning", detail: "Aim for Grade 8 for broader reach", impact: "medium",
    why: "Complex content limits your audience. Most web content should target an 8th-grade reading level for maximum reach.",
    fix: "Simplify sentence structure, use shorter paragraphs, and replace jargon with plain language.",
    expectedImpact: "Broader accessibility can increase engagement and reduce bounce rates.", difficulty: "Low" },
  { label: "Word Count (top pages)", value: "~620 avg", status: "poor", detail: "Competitors average 1,400+ words", impact: "high",
    why: "Thin content struggles to rank for competitive keywords. Longer, comprehensive content demonstrates topical authority.",
    fix: "Expand top landing pages to 1,200+ words with in-depth, valuable information.",
    expectedImpact: "Pages with 1,200+ words rank significantly higher for competitive terms.", difficulty: "Medium" },
  { label: "Internal Links / Page", value: "2.1 avg", status: "poor", detail: "Best practice is 3+ per page", impact: "medium",
    why: "Internal links distribute page authority and help search engines discover content. Too few = wasted link equity.",
    fix: "Add 3-5 contextual internal links per page, prioritizing links to high-value pages.",
    expectedImpact: "Better internal linking can improve crawl depth and boost rankings for linked pages.", difficulty: "Low" },
  { label: "Content-to-Code Ratio", value: "18%", status: "warning", detail: "Aim for 25%+", impact: "medium",
    why: "A low content-to-code ratio means your pages have more HTML/scripts than actual content — search engines prefer content-rich pages.",
    fix: "Reduce unnecessary scripts, clean up HTML bloat, and add more substantive content.",
    expectedImpact: "Improving ratio to 25%+ signals content-rich pages to search engines.", difficulty: "Medium" },
  { label: "Duplicate Content", value: "3 pages flagged", status: "poor", detail: "Near-duplicate meta descriptions", impact: "high",
    why: "Duplicate content confuses search engines about which page to rank, diluting your ranking potential.",
    fix: "Write unique content and meta descriptions for each flagged page. Add canonical tags where appropriate.",
    expectedImpact: "Resolving duplicates allows search engines to properly index and rank each unique page.", difficulty: "Low" },
];
const mockContentPerf = {
  score: calcWeightedScore(contentMetrics),
  metrics: contentMetrics,
};

const mockSocialLocal = {
  socialScore: 45,
  localScore: 70,
  combinedScore: 55,
  platforms: [
    { name: "LinkedIn", status: "Active", followers: "890", activity: "4 posts / month", health: "good" },
    { name: "Google Business", status: "Claimed", followers: "—", activity: "Last post 12 days ago", health: "warning" },
    { name: "Facebook", status: "Active", followers: "2,340", activity: "3 posts / month", health: "warning" },
    { name: "Instagram", status: "Active", followers: "1,120", activity: "2 posts / month", health: "poor" },
    { name: "X (Twitter)", status: "Inactive", followers: "312", activity: "No posts in 60+ days", health: "poor" },
    { name: "YouTube", status: "Not Found", followers: "—", activity: "—", health: "poor" },
    { name: "TikTok", status: "Not Found", followers: "—", activity: "—", health: "poor" },
  ],
  signals: [
    { label: "Open Graph Tags", value: "Partial", status: "warning", detail: "Missing og:image on 8 pages", impact: "medium",
      why: "Open Graph tags control how your pages appear when shared on social media. Missing tags = generic, unappealing previews.",
      fix: "Add og:title, og:description, and og:image tags to all pages — prioritize high-traffic pages.",
      expectedImpact: "Rich social previews can increase click-through rates from social shares by 2-3x.", difficulty: "Low" },
    { label: "Twitter Cards", value: "Incomplete", status: "poor", detail: "No twitter:card meta tags found", impact: "medium",
      why: "Twitter Cards create rich media previews when links are shared on X — without them, shared links appear as plain text.",
      fix: "Add twitter:card, twitter:title, twitter:description, and twitter:image meta tags to all pages.",
      expectedImpact: "Enables rich previews on X, improving engagement with shared content.", difficulty: "Low" },
    { label: "Social Share Buttons", value: "None", status: "poor", detail: "No sharing widgets detected", impact: "medium",
      why: "Without share buttons, visitors have no easy way to spread your content — reducing organic amplification.",
      fix: "Add floating or inline social share buttons to blog posts and key landing pages.",
      expectedImpact: "Pages with share buttons receive 7x more social engagement on average.", difficulty: "Low" },
    { label: "Brand Consistency", value: "Mixed", status: "warning", detail: "Profile images differ across platforms", impact: "high",
      why: "Inconsistent branding across platforms confuses customers and weakens brand recognition and trust.",
      fix: "Standardize profile images, bios, and brand messaging across all social platforms.",
      expectedImpact: "Consistent branding increases revenue by up to 23% according to brand studies.", difficulty: "Low" },
  ],
  localMetrics: [
    { label: "GBP Listing", value: "Claimed & Verified", status: "good", cta: "Passing" },
    { label: "Reviews", value: "4.2★ (89 reviews)", status: "good", cta: "Passing" },
    { label: "Local Citations", value: "34 found", status: "warning", cta: "Build Citations" },
    { label: "Local Keywords", value: "Moderate Usage", status: "warning", cta: "Expand Keywords" },
    { label: "Service Area", value: "Defined", status: "good", cta: "Passing" },
    { label: "Local Schema", value: "Present", status: "good", cta: "Passing" },
    { label: "Apple Maps", value: "Listed", status: "good", cta: "Passing" },
    { label: "Bing Places", value: "Incomplete", status: "poor", cta: "Claim Listing" },
  ],
  reviews: [
    { author: "Sarah M.", rating: 5, timeAgo: "2 weeks ago", text: "Excellent service, very professional team." },
    { author: "James K.", rating: 4, timeAgo: "1 month ago", text: "Good results, communication could be better." },
    { author: "Lisa R.", rating: 5, timeAgo: "2 months ago", text: "Transformed our online presence completely." },
  ],
};

const mockAISEO = {
  score: 41,
  metrics: [
    { label: "AI Search Mentions", value: "2 engines", status: "poor", impact: "high",
      why: "AI search engines like ChatGPT and Perplexity are becoming primary discovery channels. Low mentions = invisible to AI users.",
      fix: "Create comprehensive, well-structured content that AI models can easily cite and reference.",
      expectedImpact: "Being cited in AI search results can drive significant referral traffic from a growing channel.", difficulty: "High" },
    { label: "Structured Data", value: "Partial", status: "warning", impact: "high",
      why: "Structured data helps search engines and AI systems understand your content at a deeper level.",
      fix: "Implement Organization, FAQ, Service, and LocalBusiness schema across relevant pages.",
      expectedImpact: "Full structured data can enable rich results and improve AI content understanding.", difficulty: "Medium" },
    { label: "Entity Recognition", value: "Low", status: "poor", impact: "high",
      why: "If search engines don't recognize your brand as a distinct entity, you lose control over branded search results.",
      fix: "Build entity signals through consistent NAP data, schema markup, Wikidata entries, and authoritative mentions.",
      expectedImpact: "Strong entity recognition enables Knowledge Panels and branded search control.", difficulty: "High" },
    { label: "Content Depth", value: "Below Average", status: "poor", impact: "medium",
      why: "Shallow content is unlikely to be cited by AI systems or rank for competitive keywords.",
      fix: "Expand key pages with comprehensive, expert-level content that covers topics thoroughly.",
      expectedImpact: "Deeper content increases citation likelihood and topical authority signals.", difficulty: "Medium" },
    { label: "FAQ Schema", value: "Incomplete", status: "poor", impact: "medium",
      why: "FAQ schema enables rich results in Google and provides structured Q&A content that AI systems can directly cite.",
      fix: "Add FAQ schema to service pages, product pages, and any page addressing common customer questions.",
      expectedImpact: "FAQ rich results can increase page real estate in SERPs by up to 50%.", difficulty: "Low" },
    { label: "Topical Authority", value: "Moderate", status: "warning", impact: "high",
      why: "Topical authority signals to search engines that you're an expert in your field — critical for ranking and AI citations.",
      fix: "Build content clusters around core topics with pillar pages and supporting articles.",
      expectedImpact: "Strong topical authority can improve rankings across entire content clusters.", difficulty: "High" },
    { label: "Citation Likelihood", value: "18%", status: "poor", impact: "high",
      why: "Low citation likelihood means AI search tools are unlikely to reference your content when answering user queries.",
      fix: "Create definitive, data-rich content that serves as a primary source on key topics.",
      expectedImpact: "Increasing citation likelihood opens a growing traffic channel as AI search adoption rises.", difficulty: "High" },
    { label: "Knowledge Panel", value: "Incomplete", status: "poor", impact: "high",
      why: "A Knowledge Panel establishes brand authority and occupies premium real estate in Google search results.",
      fix: "Strengthen entity signals through Wikidata, consistent schema, authoritative mentions, and verified profiles.",
      expectedImpact: "A Knowledge Panel increases brand trust and click-through rates on branded searches.", difficulty: "High" },
  ],
};

const mockEntity = {
  score: 53,
  metrics: [
    { label: "NAP Consistency", value: "4 mismatches", status: "poor", detail: "4 inconsistencies found across directories. Inconsistent name, address, or phone data can reduce local ranking trust signals.", impact: "high",
      why: "Inconsistent business information across directories confuses search engines and erodes trust in your local listings.",
      fix: "Audit and correct all business listings to ensure identical Name, Address, and Phone across every directory.",
      expectedImpact: "Consistent NAP data is a top-3 local ranking factor — fixing this can immediately boost local visibility.", difficulty: "Low" },
    { label: "Verified Google Business Profile", value: "Yes", status: "good", detail: "A verified profile is essential for local map pack visibility and customer trust.", impact: "foundational",
      why: "A verified GBP is required to appear in Google's local map pack — the highest-converting local search placement.",
      fix: "No action needed. Keep profile updated with current hours, photos, and posts.", expectedImpact: "Maintains eligibility for local map pack and Google Maps visibility.", difficulty: "N/A" },
    { label: "Google Reviews", value: "89 reviews", status: "good", detail: "Strong review volume improves local rankings and conversion trust.", impact: "foundational",
      why: "Review quantity and quality are direct local ranking factors and strongly influence customer purchase decisions.",
      fix: "No action needed. Continue encouraging reviews and responding to all feedback.", expectedImpact: "Ongoing review growth sustains local ranking strength and conversion trust.", difficulty: "N/A" },
    { label: "Schema Markup", value: "Organization only", status: "warning", detail: "Additional structured data types could improve local and entity visibility.", impact: "high",
      why: "Limited schema means search engines have an incomplete understanding of your business, services, and relationships.",
      fix: "Add LocalBusiness, Service, FAQ, and Review schema to relevant pages.",
      expectedImpact: "Comprehensive schema enables rich results and improves entity recognition.", difficulty: "Medium" },
    { label: "Knowledge Graph", value: "Incomplete", status: "poor", detail: "A Knowledge Panel increases brand authority and search control.", impact: "high",
      why: "Without a Knowledge Panel, you have limited control over how your brand appears in search results.",
      fix: "Build entity signals through Wikidata, consistent schema, and authoritative third-party mentions.",
      expectedImpact: "A Knowledge Panel establishes brand authority and increases branded search CTR.", difficulty: "High" },
    { label: "Entity Associations", value: "Weak", status: "poor", detail: "Stronger entity connections improve AI and semantic search visibility.", impact: "high",
      why: "Weak entity associations mean search engines and AI systems don't understand your brand's relationships and relevance.",
      fix: "Build same-as links, earn mentions on authoritative sites, and strengthen Wikidata relationships.",
      expectedImpact: "Stronger entity signals improve visibility in both traditional and AI-powered search.", difficulty: "High" },
    { label: "Brand SERP Control", value: "Improvement Needed", status: "warning", detail: "Limited control over branded search results can impact credibility.", impact: "high",
      why: "When someone searches your brand name, you should control the majority of page-one results. Gaps let competitors or negative content fill the space.",
      fix: "Optimize owned properties (social profiles, directories, PR) to dominate branded search results.",
      expectedImpact: "Full brand SERP control protects reputation and increases click-through to owned properties.", difficulty: "Medium" },
    { label: "Wikidata", value: "Incomplete", status: "poor", detail: "Wikidata strengthens knowledge graph recognition and entity authority.", impact: "medium",
      why: "Wikidata is a primary data source for Google's Knowledge Graph. Without an entry, you're invisible to this system.",
      fix: "Create a Wikidata entry with accurate business information and link to authoritative sources.",
      expectedImpact: "A Wikidata entry can trigger Knowledge Panel eligibility and strengthen entity authority.", difficulty: "Medium" },
    { label: "Same-As Links", value: "2 found", status: "warning", detail: "Cross-platform identity links help search engines verify entity ownership.", impact: "medium",
      why: "Same-as links in schema connect your website to your social profiles, confirming entity ownership across the web.",
      fix: "Add sameAs schema properties linking to all verified social profiles and directory listings.",
      expectedImpact: "Strengthens entity verification and supports Knowledge Panel generation.", difficulty: "Low" },
    { label: "Entity Descriptions", value: "Inconsistent", status: "warning", detail: "Consistent messaging strengthens entity clarity for search engines and AI systems.", impact: "medium",
      why: "Different descriptions across platforms confuse search engines about what your business actually does.",
      fix: "Standardize your business description across all platforms, directories, and social profiles.",
      expectedImpact: "Consistent messaging strengthens entity clarity and improves brand search relevance.", difficulty: "Low" },
  ],
};

/* ── Helpers ── */
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



/* ── Abstrakt Logo SVG Component ── */
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
function scoreTier(score) {
  if (score >= 90) return { label: "Industry Leader", color: brand.talentTeal };
  if (score >= 70) return { label: "Competitive", color: brand.inboundOrange };
  if (score >= 50) return { label: "Growth Opportunity", color: brand.inboundOrange };
  return { label: "High Risk", color: brand.pipelineRed };
}

function ScoreRing({ score, size = 130, t }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? brand.talentTeal : score >= 70 ? brand.inboundOrange : brand.pipelineRed;
  const glowColor = score >= 90 ? "rgba(66,191,186,0.25)" : score >= 70 ? "rgba(244,111,10,0.25)" : "rgba(255,33,15,0.25)";
  const tier = scoreTier(score);
  return (
    <div style={{ position: "relative", width: size, height: size + 22, margin: "0 auto 14px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: `drop-shadow(0 0 12px ${glowColor})` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.cardBorder} strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", top: 0, left: 0, width: size, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 700, color: t.text, fontFamily: "'JetBrains Mono', monospace" }}>{score}</span>
        <span style={{ fontSize: 10, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 500 }}>/ 100</span>
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        padding: "3px 10px", borderRadius: 6, whiteSpace: "nowrap",
        background: `${tier.color}12`, border: `1px solid ${tier.color}25`,
        fontSize: 10, fontWeight: 700, color: tier.color, letterSpacing: 0.5,
      }}>{tier.label}</div>
    </div>
  );
}

function statusLabel(s) {
  if (s === "good") return "\u2705 Healthy";
  if (s === "warning") return "\uD83D\uDC40 Opportunity";
  return "\uD83D\uDC4B Needs Attention";
}

function impactBadge(impact) {
  if (!impact) return null;
  const cfg = {
    high: { emoji: "🔥", label: "High Impact", color: brand.pipelineRed, bg: "rgba(255,33,15,0.08)", border: "rgba(255,33,15,0.18)" },
    medium: { emoji: "⚡", label: "Medium Impact", color: brand.inboundOrange, bg: "rgba(244,111,10,0.08)", border: "rgba(244,111,10,0.18)" },
    foundational: { emoji: "🟢", label: "Foundational", color: brand.talentTeal, bg: "rgba(66,191,186,0.08)", border: "rgba(66,191,186,0.18)" },
  }[impact];
  if (!cfg) return null;
  return { ...cfg };
}

function ImpactTag({ impact }) {
  const b = impactBadge(impact);
  if (!b) return null;
  return React.createElement("span", { style: {
    fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
    padding: "2px 7px", borderRadius: 4,
    color: b.color, background: b.bg, border: `1px solid ${b.border}`,
    whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 3,
  }}, b.emoji + " " + b.label);
}

function generateTabSummary(metrics, tabType) {
  const good = metrics.filter(m => m.status === "good");
  const warning = metrics.filter(m => m.status === "warning");
  const poor = metrics.filter(m => m.status === "poor");
  const highImpactFailing = metrics.filter(m => m.impact === "high" && m.status !== "good");

  /* ── Risk label humanizer ── */
  const riskPhrases = {
    "Site Health": "Technical issues driving away visitors",
    "Page Speed & Performance": "Slow pages costing you leads",
    "Image Optimization": "Heavy images slowing conversions",
    "Alt Tags": "Missing image tags hurting accessibility",
    "Organic Keywords": "Competitors capturing your buyers' searches",
    "Branded Traffic Share": "Weak brand recognition in search",
    "Indexation Efficiency": "Pages invisible to search engines",
    "Domain Authority Score": "Low competitive strength online",
    "Backlink Profile": "Thin endorsement signals from other sites",
    "Content Freshness": "Stale content making you look inactive",
    "Meta Descriptions": "Weak search result copy losing clicks",
    "Bounce Rate": "Visitors leaving without converting",
    "Word Count (top pages)": "Thin pages that don't convince buyers",
    "Internal Links / Page": "Poor navigation costing page views",
    "Duplicate Content": "Duplicate pages confusing search engines",
    "Readability Score": "Complex content limiting your audience",
    "Content-to-Code Ratio": "Pages heavy on code, light on substance",
    "Open Graph Tags": "Broken social sharing previews",
    "Twitter Cards": "Missing X/Twitter card previews",
    "Social Share Buttons": "No way for visitors to amplify your content",
    "Brand Consistency": "Inconsistent brand eroding trust",
    "AI Search Mentions": "Invisible in AI-powered search",
    "Structured Data": "Search engines can't fully understand your business",
    "Entity Recognition": "Google doesn't recognize your brand",
    "Content Depth": "Content too shallow for AI citations",
    "FAQ Schema": "Missing FAQ rich results opportunity",
    "Topical Authority": "Not seen as an expert in your space",
    "Citation Likelihood": "AI tools unlikely to reference you",
    "Knowledge Panel": "No Knowledge Panel on branded searches",
    "NAP Consistency": "Conflicting business info across directories",
    "Schema Markup": "Incomplete business data for search engines",
    "Knowledge Graph": "Missing from Google's Knowledge Graph",
    "Entity Associations": "Weak connections between your brand properties",
    "Brand SERP Control": "Competitors appearing on your branded searches",
    "Wikidata": "No Wikidata entry for your business",
    "Same-As Links": "Disconnected social profiles",
    "Entity Descriptions": "Inconsistent business descriptions online",
  };
  const humanizeRisk = label => riskPhrases[label] || label;
  const risks = poor.filter(m => m.impact === "high" || m.impact === "medium").map(m => humanizeRisk(m.label));
  const topRisks = risks.slice(0, 3);

  const hasFoundation = good.length >= 2;
  const severityRatio = poor.length / (metrics.length || 1);
  const isHealthy = severityRatio < 0.15 && poor.length <= 1;
  const isCritical = severityRatio > 0.4;

  const summaries = {
    website: {
      summary: isHealthy
        ? "Your site delivers a fast, secure experience that keeps visitors engaged and converts. This technical edge means more of your ad spend and content investment turns into pipeline."
        : hasFoundation
        ? `Your site has a stable base, but ${isCritical ? "several" : "a few"} performance issues are costing you visitors. Slow pages and crawl problems mean prospects are bouncing before they ever see your offer.`
        : `Your site's technical issues are actively losing you business. ${poor.length} critical problems are driving prospects to competitors with faster, cleaner experiences.`,
      opportunity: isHealthy
        ? "Protect this advantage \u2014 monitor Core Web Vitals to stay ahead of competitors who are catching up."
        : "Fixing these issues can recover lost visitors, reduce cost-per-lead, and turn your website into the pipeline engine it should be.",
    },
    seo: {
      summary: isHealthy
        ? "You're capturing high-intent search traffic and converting searchers who are ready to buy. This organic pipeline reduces dependency on paid channels and lowers acquisition costs."
        : hasFoundation
        ? "Your SEO foundation is in place, but competitors are claiming the high-value keywords you're missing. Every keyword gap is a prospect choosing them over you."
        : "Your search visibility gaps mean buyers can't find you when they're actively looking to purchase. Competitors are capturing this demand instead.",
      opportunity: "Own page one for high-intent keywords \u2014 these searchers convert at 3-5x the rate of outbound leads.",
    },
    content: {
      summary: isHealthy
        ? "Your content is working as a sales asset \u2014 attracting qualified visitors, keeping them engaged, and building the trust that shortens sales cycles."
        : hasFoundation
        ? "Your content infrastructure exists, but thin pages and stale publishing mean you're leaving revenue on the table. Prospects aren't finding the answers they need to move forward."
        : "Content gaps are a direct revenue leak. Without fresh, in-depth pages, prospects leave your site unconvinced \u2014 and find what they need on a competitor's blog.",
      opportunity: "Consistent, expert-level content turns your website into a 24/7 sales rep that qualifies leads before your team ever picks up the phone.",
    },
    social: {
      summary: isHealthy
        ? "Your brand shows up consistently across social and AI search surfaces. This multi-channel presence builds the familiarity that makes outreach warmer and close rates higher."
        : hasFoundation
        ? "You have some social presence, but gaps in AI visibility and inconsistent branding mean you're invisible in the channels where modern buyers do research."
        : "Your brand is largely invisible across social and AI search. When prospects research your company before a call, they're finding very little \u2014 and that kills trust.",
      opportunity: "Capture buyers before competitors do \u2014 show up in the AI answers and social feeds where your prospects spend their time.",
    },
    local: {
      summary: isHealthy
        ? "Your local search presence is a competitive moat. Verified listings, strong reviews, and entity signals mean you show up when nearby buyers are ready to act."
        : hasFoundation
        ? "Your local foundation is solid, but entity gaps mean Google doesn't fully understand your business. This limits map pack appearances and branded search control."
        : "Weak local signals are handing nearby customers to competitors. Missing listings, thin reviews, and incomplete entity data mean you're invisible in local search.",
      opportunity: "Turn branded searches into a controlled traffic funnel \u2014 own your local map pack and Knowledge Panel to capture high-intent local buyers.",
    },
  };

  const s = summaries[tabType] || summaries.website;
  return { summary: s.summary, risks: topRisks, opportunity: s.opportunity };
}

function getLocalLiftScenario(metrics) {
  const m = {};
  metrics.forEach(x => { m[x.label] = x.status; });
  const knowledgeGraphMissing = m["Knowledge Graph"] === "poor";
  const schemaPoor = m["Schema Markup"] !== "good";
  const entityWeak = m["Entity Associations"] === "poor";
  const napBad = m["NAP Consistency"] === "poor";
  const gbpGood = m["Verified Google Business Profile"] === "good";
  const reviewsGood = m["Google Reviews"] === "good";
  const highRiskCount = [knowledgeGraphMissing, schemaPoor, entityWeak, napBad].filter(Boolean).length;

  if (highRiskCount >= 3) {
    return {
      badge: "\uD83D\uDD34 High Risk",
      badgeColor: brand.pipelineRed,
      headline: "Local Buyers Can't Find You",
      body: "Critical gaps in your local presence mean nearby customers are finding competitors instead of you.",
      subBody: "Without proper entity data and structured markup, Google can't confidently show your business in local results.",
      listLabel: "Priority Fixes",
      items: ["Establish Knowledge Graph presence", "Expand schema markup coverage", "Correct citation inconsistencies", "Strengthen entity associations"],
    };
  }
  if (gbpGood && reviewsGood && (schemaPoor || entityWeak)) {
    return {
      badge: "🟠 Moderate Opportunity",
      badgeColor: brand.inboundOrange,
      headline: "Your Foundation Is Strong \u2014 Now Dominate Local Search",
      body: "You've built a solid local presence. Now it's time to turn that into a competitive moat \u2014 own your map pack, control your branded searches, and capture high-intent local buyers.",
      subBody: null,
      listLabel: "Growth Opportunities",
      items: ["Expand structured schema types", "Improve brand SERP control", "Strengthen entity associations", "Increase authoritative citations"],
    };
  }
  if (knowledgeGraphMissing) {
    return {
      badge: "🟡 Missing Signal",
      badgeColor: brand.inboundOrange,
      headline: "You're Missing a Major Authority Signal",
      body: "A Knowledge Panel increases trust, credibility, and brand control in search results.",
      subBody: "Building entity alignment and structured data increases your eligibility for Knowledge Graph inclusion.",
      listLabel: null,
      items: [],
    };
  }
  return {
    badge: null,
    badgeColor: null,
    headline: "Turn Local Search Into a Growth Channel",
    body: "Most businesses stop at \"having a Google Business Profile.\" That's only the starting line.",
    subBody: "Abstrakt helps strengthen the signals that influence local rankings, trust, and visibility:",
    listLabel: null,
    items: ["Entity alignment", "Structured data enhancements", "Brand SERP improvements", "Authority-building citations"],
  };
}

function getSEOScenario(seoMetrics, contentMetrics) {
  const seo = {};
  seoMetrics.forEach(x => { seo[x.label] = x.status; });
  const content = {};
  contentMetrics.forEach(x => { content[x.label] = x.status; });

  const keywordsWeak = seo["Organic Keywords"] !== "good";
  const brandedPoor = seo["Branded Traffic Share"] === "poor";
  const daLow = seo["Domain Authority Score"] !== "good";
  const backlinkWeak = seo["Backlink Profile"] !== "good";
  const wordCountPoor = content["Word Count (top pages)"] === "poor";
  const bouncePoor = content["Bounce Rate"] === "poor";
  const freshWarn = content["Content Freshness"] !== "good";
  const duplicatePoor = content["Duplicate Content"] === "poor";

  const seoFailCount = [keywordsWeak, brandedPoor, daLow, backlinkWeak].filter(Boolean).length;
  const contentFailCount = [wordCountPoor, bouncePoor, freshWarn, duplicatePoor].filter(Boolean).length;

  if (seoFailCount >= 3 && contentFailCount >= 3) {
    return {
      badge: "🔴 High Risk",
      badgeColor: brand.pipelineRed,
      headline: "Your Search Visibility Needs a Strategic Overhaul",
      body: "Multiple high-impact SEO and content signals are underperforming — limiting your ability to rank, attract traffic, and convert visitors.",
      subBody: "Without keyword depth, domain authority, and quality content working together, organic growth stays flat.",
      listLabel: "Priority Fixes",
      items: ["Expand keyword coverage and targeting", "Strengthen domain authority through backlinks", "Deepen content quality and publishing cadence", "Resolve technical indexation gaps"],
    };
  }
  if (contentFailCount >= 3 && seoFailCount < 3) {
    return {
      badge: "🟠 Content Gap",
      badgeColor: brand.inboundOrange,
      headline: "Your Content Strategy Is Holding Back Your Rankings",
      body: "Your technical SEO foundation is workable, but thin content, high bounce rates, and inconsistent publishing are limiting ranking potential.",
      subBody: "Search engines reward sites that publish deep, valuable content consistently. Closing this gap is the fastest path to organic growth.",
      listLabel: "Growth Opportunities",
      items: ["Increase page depth to 1,200+ words", "Establish a consistent publishing cadence", "Reduce bounce rate with stronger engagement", "Resolve duplicate content issues"],
    };
  }
  if (daLow && backlinkWeak) {
    return {
      badge: "🟡 Authority Gap",
      badgeColor: brand.inboundOrange,
      headline: "Your Domain Authority Is Limiting Competitive Rankings",
      body: "Your content and technical signals show potential, but low domain authority and a weak backlink profile are keeping you out of competitive keyword positions.",
      subBody: "Building authoritative backlinks is the most impactful lever to unlock rankings for mid-to-high difficulty keywords.",
      listLabel: null,
      items: [],
    };
  }
  return {
    badge: null,
    badgeColor: null,
    headline: "Accelerate Your Organic Growth with Abstrakt",
    body: "Ranking on page one isn't luck — it's a system. Abstrakt combines technical SEO, strategic content, and authority building into a unified growth engine.",
    subBody: null,
    listLabel: null,
    items: ["Keyword strategy & gap analysis", "SEO-optimized content production", "Technical SEO & site performance", "Backlink acquisition & authority building"],
  };
}

function getWebPerfScenario(metrics) {
  const m = {};
  metrics.forEach(x => { m[x.label] = x.status; });
  const siteHealthPoor = m["Site Health"] === "poor";
  const speedPoor = m["Page Speed & Performance"] === "poor";
  const imagePoor = m["Image Optimization"] === "poor";
  const altPoor = m["Alt Tags"] === "poor";
  const failCount = metrics.filter(x => x.status === "poor").length;
  const highImpactFails = metrics.filter(x => x.impact === "high" && x.status !== "good").length;

  if (failCount >= 3 && highImpactFails >= 2) {
    return {
      badge: "🔴 High Risk",
      badgeColor: brand.pipelineRed,
      headline: "Ready to Fix These High-Impact Issues?",
      body: "Your audit uncovered performance gaps that are limiting visibility and conversions.",
      subBody: "Without addressing speed, crawl efficiency, and optimization issues, your site is leaving traffic and revenue on the table.",
      listLabel: "Let's build a plan to improve",
      items: ["Page speed & crawl efficiency", "Technical SEO health", "Image & accessibility optimization", "Search performance & rankings"],
    };
  }
  if (speedPoor || imagePoor) {
    return {
      badge: "🟠 Performance Gap",
      badgeColor: brand.inboundOrange,
      headline: "Your Foundation Is Solid — Speed Is Holding You Back",
      body: "Core technical elements are in place, but load time and image optimization issues are creating friction for users and search engines.",
      subBody: null,
      listLabel: "Quick wins to unlock",
      items: ["Page load speed improvements", "Image compression & delivery", "Core Web Vitals optimization", "Crawl efficiency gains"],
    };
  }
  if (siteHealthPoor) {
    return {
      badge: "🟡 Health Check",
      badgeColor: brand.inboundOrange,
      headline: "Your Site Health Score Needs Attention",
      body: "Crawlability and technical errors are reducing how effectively search engines can discover and index your pages.",
      subBody: "Improving site health is foundational — it directly impacts how many of your pages can rank.",
      listLabel: null,
      items: [],
    };
  }
  return {
    badge: null,
    badgeColor: null,
    headline: "Keep Your Technical Edge Sharp",
    body: "Your site's technical foundation is performing well. A proactive website strategy ensures you stay ahead as your business grows.",
    subBody: null,
    listLabel: null,
    items: ["Ongoing performance monitoring", "Proactive technical maintenance", "Speed & UX optimization", "Scalable site architecture"],
  };
}

function ExpandableMetricRow({ label, value, status, detail, t, index = 0, impact, weighted, estimated, why, fix, expectedImpact, difficulty, findings }) {
  const [open, setOpen] = React.useState(false);
  const isEven = index % 2 === 0;
  const sColor = statusColor(status);
  const ctaText = statusLabel(status);
  const hasExpand = why || fix || (findings && findings.length > 0);
  const diffColor = { Low: brand.talentTeal, Medium: brand.inboundOrange, High: brand.pipelineRed }[difficulty] || t.subtle;
  return (
    <div style={{ borderBottom: `1px solid ${t.cardBorder}`, borderLeft: `3px solid ${sColor}` }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 18px 13px 16px",
        background: isEven ? "transparent" : t.hoverRow,
        transition: "background 0.2s", cursor: hasExpand ? "pointer" : "default",
      }}
        onClick={() => hasExpand && setOpen(!open)}
        onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
        onMouseLeave={e => e.currentTarget.style.background = isEven ? "transparent" : t.hoverRow}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {hasExpand && <span style={{ fontSize: 10, color: t.subtle, transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0deg)", flexShrink: 0 }}>▶</span>}
            <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{label}</span>
            {weighted && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: brand.cloudBlue,
                background: "rgba(4,129,163,0.1)", border: "1px solid rgba(4,129,163,0.2)",
                padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
              }}>+25% weight</span>
            )}
            {estimated && (
              <span style={{
                fontSize: 9, fontWeight: 600, color: brand.inboundOrange,
                background: "rgba(244,111,10,0.08)", border: "1px solid rgba(244,111,10,0.18)",
                padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
              }}>Estimated</span>
            )}
            <ImpactTag impact={impact} />
          </div>
          {detail && <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4, marginTop: 3, marginLeft: hasExpand ? 18 : 0 }}>{detail}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, color: sColor, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{value}</span>
          <span style={{
            padding: "3px 9px", borderRadius: 6,
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            color: t.text, background: `${sColor}12`, border: `1px solid ${sColor}25`,
            textTransform: "uppercase", whiteSpace: "nowrap",
          }}>{ctaText}</span>
        </div>
      </div>
      {open && hasExpand && (
        <div style={{
          padding: "0 18px 16px 37px",
          background: isEven ? `${t.hoverRow}` : t.hoverRow,
        }}>
          {findings && findings.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: sColor, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Specific Findings</div>
              <div style={{
                background: t.bg, borderRadius: 8, border: `1px solid ${t.cardBorder}`,
                padding: "10px 14px",
              }}>
                {findings.map((f, i) => (
                  <div key={i} style={{
                    fontSize: 12, color: t.body, lineHeight: 1.6,
                    padding: "4px 0",
                    borderBottom: i < findings.length - 1 ? `1px solid ${t.cardBorder}` : "none",
                    fontFamily: f.startsWith("/") || f.includes("(") ? "'JetBrains Mono', monospace" : "inherit",
                  }}>
                    <span style={{ color: sColor, marginRight: 6, fontSize: 8 }}>{"\u25CF"}</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
          {why && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Why It Matters</div>
              <div style={{ fontSize: 12, color: t.body, lineHeight: 1.5 }}>{why}</div>
            </div>
          )}
          {fix && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Recommended Fix</div>
              <div style={{ fontSize: 12, color: t.body, lineHeight: 1.5 }}>{fix}</div>
            </div>
          )}
          {expectedImpact && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Expected Impact</div>
              <div style={{ fontSize: 12, color: t.body, lineHeight: 1.5 }}>{expectedImpact}</div>
            </div>
          )}
          {difficulty && difficulty !== "N/A" && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Difficulty</div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: diffColor,
                padding: "3px 10px", borderRadius: 6,
                background: `${diffColor}12`, border: `1px solid ${diffColor}25`,
              }}>{difficulty}</span>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

/* kept as alias for backward compatibility */
function MetricRow(props) { return <ExpandableMetricRow {...props} />; }

function Card({ title, subtitle, children, t, style: s }) {
  return (
    <div style={{
      background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 14,
      overflow: "hidden", backdropFilter: "blur(8px)", ...s,
    }}>
      {title && (
        <div style={{
          padding: subtitle ? "14px 18px 10px" : "14px 18px", borderBottom: subtitle ? "none" : `1px solid ${t.cardBorder}`, fontSize: 13,
          fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 3, height: 14, background: accent, borderRadius: 2, display: "inline-block" }} />
          {title}
        </div>
      )}
      {subtitle && (
        <div style={{ padding: "0 18px 12px", borderBottom: `1px solid ${t.cardBorder}`, fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Tab Renderers ── */
function WebPerformanceTab({ t, data, recap, onSaveRecap, canEdit }) {
  const webPerfData = data?.webPerf || mockWebPerf;
  const allIssues = [
    { issue: "Broken Internal Links", count: 23, severity: "high", detail: "Pages returning 4xx errors hurt crawlability and user experience" },
    { issue: "Slow Page Load (>3s)", count: 18, severity: "high", detail: "18 pages exceed the 3-second threshold — primarily image-heavy landing pages" },
    { issue: "Missing Meta Descriptions", count: 14, severity: "medium", detail: "Pages without meta descriptions lose click-through potential in SERPs" },
    { issue: "Redirect Chains", count: 11, severity: "medium", detail: "Multiple sequential redirects (3+ hops) slowing crawl efficiency" },
    { issue: "Duplicate Title Tags", count: 9, severity: "medium", detail: "Identical titles across service pages reduce search differentiation" },
    { issue: "Images Without Alt Text", count: 31, severity: "high", detail: "Missing alt attributes hurt accessibility and image search rankings" },
    { issue: "Mixed Content (HTTP/HTTPS)", count: 6, severity: "low", detail: "Some resources still loading over HTTP on secure pages" },
    { issue: "Orphan Pages", count: 4, severity: "low", detail: "Pages with no internal links pointing to them — invisible to crawlers" },
  ];
  const sevOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...allIssues].sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || b.count - a.count);
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {(() => { const s = generateTabSummary(webPerfData.metrics, "website"); return <SummaryCard t={t} summary={s.summary} risks={s.risks} opportunity={s.opportunity} score={webPerfData.score} scoreLabel="Website Performance Score" recap={recap} onSaveRecap={onSaveRecap} canEdit={canEdit} />; })()}
      <Card title="Audit Findings" t={t}>
        {webPerfData.metrics.map((m, i) => (
          <ExpandableMetricRow key={i} {...m} t={t} index={i} />
        ))}
      </Card>
      <Card title="Site Health — Highest Impact Issues" t={t}>
        <div style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          {sorted.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 18px 13px 16px", borderBottom: `1px solid ${t.cardBorder}`,
              borderLeft: `3px solid ${item.severity === "high" ? brand.pipelineRed : item.severity === "medium" ? brand.inboundOrange : brand.talentTeal}`,
              background: i % 2 !== 0 ? t.hoverRow : "transparent",
              transition: "background 0.2s", cursor: "default",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? t.hoverRow : "transparent"}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{item.issue}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                    padding: "2px 7px", borderRadius: 4,
                    color: item.severity === "high" ? brand.pipelineRed : item.severity === "medium" ? brand.inboundOrange : brand.talentTeal,
                    background: item.severity === "high" ? "rgba(255,33,15,0.1)" : item.severity === "medium" ? "rgba(244,111,10,0.1)" : "rgba(66,191,186,0.1)",
                    border: `1px solid ${item.severity === "high" ? "rgba(255,33,15,0.2)" : item.severity === "medium" ? "rgba(244,111,10,0.2)" : "rgba(66,191,186,0.2)"}`,
                  }}>{item.severity}</span>
                </div>
                <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4, marginTop: 3 }}>{item.detail}</div>
              </div>
              <div style={{
                fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: item.severity === "high" ? brand.pipelineRed : item.severity === "medium" ? brand.inboundOrange : brand.talentTeal,
                minWidth: 36, textAlign: "right",
              }}>{item.count}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SEOTab({ t, data, recap, onSaveRecap, canEdit }) {
  const seoData = data?.seo || mockSEO;
  const aiSeoData = data?.aiSeo || mockAISEO;
  const keywordsData = data?.keywords || mockKeywords;
  const combinedScore = Math.round((seoData.score + aiSeoData.score) / 2);
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {(() => { const s = generateTabSummary([...seoData.metrics, ...aiSeoData.metrics], "seo"); return <SummaryCard t={t} summary={s.summary} risks={s.risks} opportunity={s.opportunity} score={combinedScore} scoreLabel="Search Visibility Score" recap={recap} onSaveRecap={onSaveRecap} canEdit={canEdit} />; })()}

      <Card title="Organic Search Health" t={t}>
        {seoData.metrics.map((m, i) => <MetricRow key={i} {...m} t={t} index={i} />)}
      </Card>
      <Card title="Top Performing Search Terms" t={t}>
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 80px", padding: "10px 18px",
            borderBottom: `1px solid ${t.cardBorder}`, gap: 8,
          }}>
            {["Keyword", "Ranking Position", "Monthly Search Volume", "Estimated Traffic", "Competitive Difficulty"].map(h => (
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
                <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.body }}>{kw.volume.toLocaleString()}</span>
                <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", color: t.body }}>{kw.traffic.toLocaleString()}</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <div style={{ width: 36, height: 5, borderRadius: 3, background: t.cardBorder, overflow: "hidden" }}>
                    <div style={{ width: `${kw.difficulty}%`, height: "100%", borderRadius: 3, background: diffColor }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: diffColor, fontWeight: 600 }}>{kw.difficulty}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ContentPerformanceTab({ t, data, recap, onSaveRecap, canEdit }) {
  const contentData = data?.content || mockContentPerf;
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {(() => { const s = generateTabSummary(contentData.metrics, "content"); return <SummaryCard t={t} summary={s.summary} risks={s.risks} opportunity={s.opportunity} score={contentData.score} scoreLabel="Content Performance Score" recap={recap} onSaveRecap={onSaveRecap} canEdit={canEdit} />; })()}
      <Card title="Content Metrics" t={t}>
        {contentData.metrics.map((m, i) => (
          <ExpandableMetricRow key={i} {...m} t={t} index={i} />
        ))}
      </Card>
    </div>
  );
}

function SocialLocalTab({ t, data, recap, onSaveRecap, canEdit }) {
  const d = data?.socialLocal || mockSocialLocal;
  const aiSeoData = data?.aiSeo || mockAISEO;
  const combinedScore = Math.round((aiSeoData.score + (d.socialScore || 45)) / 2);
  // Use places reviews if available
  const reviews = data?.places?.reviews?.length > 0 ? data.places.reviews : (d.reviews || []);
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {(() => { const s = generateTabSummary([...aiSeoData.metrics, ...(d.signals || [])], "social"); return <SummaryCard t={t} summary={s.summary} risks={s.risks} opportunity={s.opportunity} score={combinedScore} scoreLabel="Social & AI Visibility Score" recap={recap} onSaveRecap={onSaveRecap} canEdit={canEdit} />; })()}

      <Card title="AI Visibility Metrics" t={t}>
        {aiSeoData.metrics.map((m, i) => <MetricRow key={i} {...m} t={t} index={i} />)}
      </Card>

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
          {d.platforms.map((p, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 90px 80px 1fr", alignItems: "center",
              padding: "12px 18px", borderBottom: `1px solid ${t.cardBorder}`, gap: 8, transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.hoverRow}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{p.name}</span>
              <span style={{ fontSize: 12, color: statusColor(p.health), textAlign: "center", fontWeight: 600 }}>{p.status}</span>
              <span style={{ fontSize: 12, color: t.body, fontFamily: "'JetBrains Mono', monospace", textAlign: "center" }}>{p.followers}</span>
              <span style={{ fontSize: 11, color: t.subtle, textAlign: "right" }}>{p.activity}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Social SEO Signals" t={t}>
        {d.signals.map((m, i) => <MetricRow key={i} {...m} t={t} index={i} />)}
      </Card>

      <Card title="Recent Reviews" t={t}>
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          {reviews.length > 0 ? reviews.map((review, i) => (
            <div key={i} style={{ borderBottom: i < reviews.length - 1 ? `1px solid ${t.cardBorder}` : "none", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{review.author}</span>
                <span style={{ color: brand.inboundOrange, fontSize: 13 }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                <span style={{ fontSize: 11, color: t.subtle }}>{review.timeAgo}</span>
              </div>
              <p style={{ fontSize: 13, color: t.body, margin: 0, lineHeight: 1.5 }}>{review.text}</p>
            </div>
          )) : (
            <p style={{ fontSize: 13, color: t.subtle, textAlign: "center", padding: 20 }}>No reviews available.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ summary, risks, opportunity, t, score, scoreLabel, recap, onSaveRecap, canEdit }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({ summary: "", risks: "", opportunity: "" });

  const hasRecap = recap && (recap.summary || recap.opportunity || (recap.risks && recap.risks.length > 0));
  const displaySummary = hasRecap && recap.summary ? recap.summary : summary;
  const displayRisks = hasRecap && recap.risks && recap.risks.length > 0 ? recap.risks : risks;
  const displayOpportunity = hasRecap && recap.opportunity ? recap.opportunity : opportunity;

  const startEdit = () => {
    setDraft({
      summary: (hasRecap && recap.summary) || summary || "",
      risks: ((hasRecap && recap.risks && recap.risks.length > 0) ? recap.risks : risks || []).join("\n"),
      opportunity: (hasRecap && recap.opportunity) || opportunity || "",
    });
    setEditing(true);
  };

  const saveEdit = () => {
    const parsed = {
      summary: draft.summary.trim() || undefined,
      risks: draft.risks.trim() ? draft.risks.split("\n").map(r => r.trim()).filter(Boolean) : undefined,
      opportunity: draft.opportunity.trim() || undefined,
    };
    onSaveRecap(parsed);
    setEditing(false);
  };

  const textareaStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 12,
    border: `1px solid ${t.cardBorder}`, background: t.bg, color: t.text,
    fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, resize: "vertical", outline: "none",
  };

  return (
    <Card title={null} t={t}>
      <div style={{ padding: "14px 18px 6px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.cardBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: 0.3 }}>Recommendations</div>
          {hasRecap && !editing && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: brand.cloudBlue,
              background: "rgba(4,129,163,0.1)", border: "1px solid rgba(4,129,163,0.2)",
              padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1,
            }}>Post-Call Recap</span>
          )}
        </div>
        {canEdit && !editing && (
          <button onClick={startEdit} style={{
            padding: "4px 12px", borderRadius: 6, border: `1px solid ${t.cardBorder}`,
            background: "transparent", color: t.subtle, fontSize: 11, fontWeight: 500,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.color = t.subtle; }}
          >
            ✎ {hasRecap ? "Edit Recap" : "Customize"}
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.5, padding: "8px 12px", borderRadius: 8, background: `${brand.cloudBlue}08`, border: `1px solid ${brand.cloudBlue}15` }}>
            Tie findings to what you discussed on the call. The prospect sees this version when they open the shareable link.
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Summary</div>
            <textarea rows={3} style={textareaStyle} value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })}
              placeholder="As we discussed, your team is relying heavily on outbound..." />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Key Risks (one per line)</div>
            <textarea rows={3} style={textareaStyle} value={draft.risks} onChange={e => setDraft({ ...draft, risks: e.target.value })}
              placeholder="Organic demand capture is underdeveloped&#10;No content engine to support outbound&#10;Competitors own high-intent keywords" />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Biggest Opportunity</div>
            <textarea rows={2} style={textareaStyle} value={draft.opportunity} onChange={e => setDraft({ ...draft, opportunity: e.target.value })}
              placeholder="Build an inbound engine that delivers warm leads to your sales team..." />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setEditing(false)} style={{
              padding: "8px 18px", borderRadius: 8, border: `1px solid ${t.cardBorder}`,
              background: "transparent", color: t.subtle, fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>Cancel</button>
            <button onClick={saveEdit} style={{
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
              color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 2px 10px rgba(66,191,186,0.2)",
            }}>Save Recap</button>
          </div>
        </div>
      ) : (
        <div style={{ padding: "16px 18px", display: "flex", gap: 20 }}>
          {score !== undefined && (
            <div style={{
              textAlign: "center", flexShrink: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "8px 12px",
              borderRight: `1px solid ${t.cardBorder}`, paddingRight: 20,
            }}>
              <ScoreRing score={score} size={120} t={t} />
              <div style={{ fontSize: 9, color: t.subtle, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 500, marginTop: 6, maxWidth: 120, lineHeight: 1.3 }}>{scoreLabel}</div>
            </div>
          )}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: t.body, lineHeight: 1.6 }}>{displaySummary}</div>
            {displayRisks && displayRisks.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: brand.pipelineRed, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Primary Risks</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {displayRisks.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: t.body }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: brand.pipelineRed, flexShrink: 0 }} />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {displayOpportunity && (
              <div style={{
                padding: "12px 16px", borderRadius: 8,
                background: `${accent}08`, border: `1px solid ${accent}20`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Biggest Opportunity</div>
                <div style={{ fontSize: 12, color: t.body, lineHeight: 1.5 }}>{displayOpportunity}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function EntitySEOTab({ t, data, recap, onSaveRecap, canEdit }) {
  const entityData = data?.entity || mockEntity;
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {(() => { const s = generateTabSummary(entityData.metrics, "local"); return <SummaryCard t={t} summary={s.summary} risks={s.risks} opportunity={s.opportunity} score={entityData.score} scoreLabel="Local Search Performance Score" recap={recap} onSaveRecap={onSaveRecap} canEdit={canEdit} />; })()}
      <Card title="How Your Brand Appears in Local Search" subtitle="Signals that influence how Google understands and ranks your business locally." t={t}>
        {entityData.metrics.map((m, i) => <MetricRow key={i} {...m} t={t} index={i} />)}
      </Card>
    </div>
  );
}

/* ── Light/Dark Toggle ── */
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

/* ── Main Component ── */
export default function DigitalHealthAssessment({ auditData, auditId, onReset }) {
  const [view, setView] = useState("results");
  const [activeTab, setActiveTab] = useState(0);
  const [mode, setMode] = useState("light");
  const [copied, setCopied] = useState(false);
  const [recap, setRecap] = useState(auditData?.recap || {});
  const [recapSaving, setRecapSaving] = useState(false);
  const t = getTheme(mode);

  const saveRecap = async (tabKey, tabRecap) => {
    const next = { ...recap, [tabKey]: tabRecap };
    setRecap(next);
    if (!auditId) return;
    setRecapSaving(true);
    try {
      await fetch(`/api/audit/${auditId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recap: { [tabKey]: tabRecap } }),
      });
    } catch (e) { console.error("Recap save failed:", e); }
    setRecapSaving(false);
  };

  // Resolve data: use auditData from API if available, fallback to mock
  const data = {
    meta: auditData?.meta || {},
    webPerf: auditData?.webPerf || mockWebPerf,
    seo: auditData?.seo || mockSEO,
    keywords: auditData?.keywords?.length > 0 ? auditData.keywords : mockKeywords,
    content: auditData?.content || mockContentPerf,
    socialLocal: auditData?.socialLocal || mockSocialLocal,
    aiSeo: auditData?.aiSeo || mockAISEO,
    entity: auditData?.entity || mockEntity,
    places: auditData?.places || null,
  };

  const tabContent = [
    <WebPerformanceTab t={t} data={data} recap={recap.website} onSaveRecap={(r) => saveRecap("website", r)} canEdit={!!auditId} />,
    <SEOTab t={t} data={data} recap={recap.seo} onSaveRecap={(r) => saveRecap("seo", r)} canEdit={!!auditId} />,
    <EntitySEOTab t={t} data={data} recap={recap.local} onSaveRecap={(r) => saveRecap("local", r)} canEdit={!!auditId} />,
    <ContentPerformanceTab t={t} data={data} recap={recap.content} onSaveRecap={(r) => saveRecap("content", r)} canEdit={!!auditId} />,
    <SocialLocalTab t={t} data={data} recap={recap.social} onSaveRecap={(r) => saveRecap("social", r)} canEdit={!!auditId} />,
  ];

  const tabScores = [
    data.webPerf.score,
    Math.round((data.seo.score + data.aiSeo.score) / 2),
    data.entity.score,
    data.content.score,
    Math.round((data.aiSeo.score + (data.socialLocal.socialScore || 45)) / 2),
  ];

  return (
    <div style={{
      minHeight: "100vh", background: t.bgGrad, color: t.text,
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      transition: "background 0.4s, color 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.scrollHover}; }
      `}</style>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 20px" }}>

        {/* ── Top Bar: Logo left, Mode toggle + Reset right ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <AbstraktLogo fill={t.logoFill} height={26} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {auditId && (
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/results/${auditId}`);
                setCopied(true); setTimeout(() => setCopied(false), 2000);
              }} style={{
                padding: "6px 14px", borderRadius: 20, border: `1px solid ${accent}30`,
                background: `${accent}10`, color: accent, fontSize: 12, fontWeight: 500,
                cursor: "pointer", transition: "all 0.25s", letterSpacing: 0.3,
              }}>{copied ? "\u2713 Copied!" : "Share Link"}</button>
            )}
            {onReset && (
              <button onClick={onReset} style={{
                padding: "6px 14px", borderRadius: 20, border: `1px solid ${t.toggleBorder}`,
                background: t.toggleBg, color: t.subtle, fontSize: 12, fontWeight: 500,
                cursor: "pointer", transition: "all 0.25s", letterSpacing: 0.3,
              }}>← New Audit</button>
            )}
            <ModeToggle mode={mode} setMode={setMode} t={t} />
          </div>
        </div>

        {/* ── Header ── */}
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
            color: brand.pipelineRed,
          }}>
            Digital Visibility &<br />Performance Audit
          </h1>
          {data.meta?.companyName && (
            <p style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 6 }}>
              {data.meta.companyName}
            </p>
          )}
          {data.meta?.url && (
            <p style={{ fontSize: 12, color: accent, fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
              {data.meta.url}
            </p>
          )}
          <p style={{ fontSize: 14, color: t.subtle, letterSpacing: 0.3 }}>{"Understand exactly where your online presence is driving growth \u2014 and where it\u2019s holding you back."}</p>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 36 }}>
          {view === "results" ? (
            <>
              <button onClick={() => setView("results")} style={{
                padding: "11px 28px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 1.2,
                boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
                transition: "all 0.25s ease",
              }}>
                Audit Results
              </button>
              <button onClick={() => setView("form")} style={{
                padding: "8px 16px", borderRadius: 8, border: "none", background: "transparent",
                color: t.subtle, fontSize: 12, fontWeight: 500, cursor: "pointer",
                letterSpacing: 0.3, transition: "color 0.2s",
                textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "rgba(128,128,128,0.3)",
              }}
                onMouseEnter={e => e.currentTarget.style.color = t.text}
                onMouseLeave={e => e.currentTarget.style.color = t.subtle}
              >
                Edit Submission
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setView("results")} style={{
                padding: "11px 28px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 1.2,
                boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
                transition: "all 0.25s ease",
              }}>
                View Audit Results →
              </button>
            </>
          )}
        </div>

        {view === "form" ? (
          <Card t={t}>
            <div style={{ padding: 36 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: "center", color: t.text }}>
                Assess Your Digital Visibility
              </h2>
              <p style={{ fontSize: 14, color: t.subtle, textAlign: "center", marginBottom: 36 }}>
                Enter your business details to get a comprehensive performance audit
              </p>
              {["Business Name", "Website URL", "Industry", "Address", "Phone Number"].map((label, i) => (
                <div key={i} style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 11, color: t.subtle, textTransform: "uppercase",
                    letterSpacing: 1.5, marginBottom: 7, fontWeight: 500 }}>{label}</label>
                  <input type="text" placeholder={`Enter ${label.toLowerCase()}`} style={{
                    width: "100%", padding: "13px 16px", borderRadius: 10,
                    border: `1px solid ${t.cardBorder}`, background: t.inputBg,
                    color: t.text, fontSize: 14, outline: "none", transition: "border-color 0.2s",
                  }}
                    onFocus={e => e.target.style.borderColor = accent}
                    onBlur={e => e.target.style.borderColor = t.cardBorder}
                  />
                </div>
              ))}
              <button style={{
                width: "100%", padding: "15px", borderRadius: 10, border: "none",
                background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: 1.5,
                boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
              }}>
                Run Assessment →
              </button>
            </div>
          </Card>
        ) : (
          <>
            {/* Tab Bar */}
            <div style={{
              display: "flex", gap: 4, marginBottom: 30, overflowX: "auto",
              padding: "5px", background: t.toggleBg, borderRadius: 12,
              border: `1px solid ${t.cardBorder}`,
            }}>
              {tabs.map((tab, i) => {
                const s = tabScores[i];
                const dotColor = s >= 90 ? brand.talentTeal : s >= 70 ? brand.inboundOrange : s >= 50 ? brand.inboundOrange : brand.pipelineRed;
                return (
                <button key={tab} onClick={() => setActiveTab(i)} style={{
                  flex: "0 0 auto", padding: "10px 16px", borderRadius: 8, border: "none",
                  background: i === activeTab ? `linear-gradient(135deg, ${accent}, ${accentAlt})` : "transparent",
                  color: i === activeTab ? "#fff" : t.subtle,
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap", transition: "all 0.25s", letterSpacing: 0.3,
                  boxShadow: i === activeTab ? "0 2px 10px rgba(66,191,186,0.2)" : "none",
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  {tab}
                  <span style={{
                    fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                    padding: "2px 6px", borderRadius: 10,
                    background: i === activeTab ? "rgba(255,255,255,0.2)" : `${dotColor}18`,
                    color: i === activeTab ? "#fff" : dotColor,
                    lineHeight: 1.2,
                  }}>{s}<span style={{ fontSize: 8, opacity: 0.7, fontWeight: 500 }}>/100</span></span>
                </button>
                );
              })}
            </div>

            {tabContent[activeTab]}

            {/* Export Actions */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 12, marginTop: 32,
              flexWrap: "wrap",
            }}>
              <button onClick={() => alert("PDF download will be available when connected to live data.")} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10,
                border: `1px solid ${t.cardBorder}`, background: t.cardBg,
                color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.25s", letterSpacing: 0.3,
                backdropFilter: "blur(8px)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = t.hoverRow; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.background = t.cardBg; }}
              >
                <span style={{ fontSize: 16 }}>↓</span>
                Download PDF
              </button>
              <button onClick={() => alert("Email delivery will be available when connected to live data.")} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10,
                border: `1px solid ${t.cardBorder}`, background: t.cardBg,
                color: t.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.25s", letterSpacing: 0.3,
                backdropFilter: "blur(8px)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = t.hoverRow; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.background = t.cardBg; }}
              >
                <span style={{ fontSize: 16 }}>✉</span>
                Email Report
              </button>
            </div>

            {/* CTA */}
            {activeTab === 2 ? (() => {
              const scenario = getLocalLiftScenario(data.entity.metrics);
              return (
              <div style={{
                marginTop: 40, padding: "0", borderRadius: 14,
                background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  padding: "28px 32px 20px", position: "relative", overflow: "hidden",
                  background: scenario.badgeColor ? `${scenario.badgeColor}08` : `linear-gradient(135deg, ${accent}12, ${accentAlt}08)`,
                  borderBottom: `1px solid ${t.cardBorder}`,
                }}>
                  <div style={{
                    position: "absolute", top: -40, right: -40, width: 160, height: 160,
                    background: `radial-gradient(circle, ${scenario.badgeColor ? scenario.badgeColor + "12" : "rgba(66,191,186,0.1)"} 0%, transparent 70%)`, borderRadius: "50%",
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, position: "relative" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 2 }}>
                      Abstrakt Local Lift
                    </div>
                    {scenario.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: scenario.badgeColor,
                        background: `${scenario.badgeColor}12`, border: `1px solid ${scenario.badgeColor}25`,
                        padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5,
                      }}>{scenario.badge}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0, position: "relative", lineHeight: 1.3 }}>
                    {scenario.headline}
                  </h3>
                </div>

                {/* Body */}
                <div style={{ padding: "24px 32px" }}>
                  <p style={{ fontSize: 13, color: t.body, lineHeight: 1.7, margin: "0 0 20px" }}>
                    {scenario.body}
                  </p>
                  {scenario.subBody && (
                    <p style={{ fontSize: 13, color: t.body, lineHeight: 1.7, margin: "0 0 20px" }}>
                      {scenario.subBody}
                    </p>
                  )}
                  {scenario.items.length > 0 && (
                    <>
                      {scenario.listLabel && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
                          {scenario.listLabel}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 24 }}>
                        {scenario.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.text, fontWeight: 500 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: scenario.badgeColor || accent, flexShrink: 0 }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <p style={{ fontSize: 13, color: t.body, lineHeight: 1.7, margin: "0 0 28px", fontStyle: "italic" }}>
                    Let's build a structured plan to improve your Knowledge Graph presence and Entity authority signals.
                  </p>

                  {/* Pricing Tiers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {[
                      { name: "Local Lift", price: "$500", period: "/mo", desc: "Full local visibility management", featured: true },
                      { name: "Listing Management", price: "$300", period: "/mo", desc: "Up to 2 business listings" },
                      { name: "Review Response", price: "$150", period: "/mo", desc: "Positive & negative review management" },
                    ].map((tier, i) => (
                      <div key={i} style={{
                        padding: "20px 16px", borderRadius: 10, textAlign: "center",
                        background: tier.featured ? `linear-gradient(135deg, ${accent}15, ${accentAlt}10)` : t.hoverRow,
                        border: `1px solid ${tier.featured ? accent + "40" : t.cardBorder}`,
                        position: "relative",
                      }}>
                        {tier.featured && (
                          <div style={{
                            position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                            fontSize: 8, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5,
                            background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                            padding: "3px 10px", borderRadius: 10,
                          }}>Most Popular</div>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{tier.name}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: t.text, lineHeight: 1, marginBottom: 4 }}>
                          {tier.price}<span style={{ fontSize: 13, fontWeight: 500, color: t.subtle }}>{tier.period}</span>
                        </div>
                        <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{tier.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <button style={{
                      padding: "15px 40px", borderRadius: 10, border: "none",
                      background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                      color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                      letterSpacing: 0.5, boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
                    }}>
                      Build My Local Strategy →
                    </button>
                  </div>
                </div>
              </div>
              );
            })() : activeTab === 1 ? (() => {
              const scenario = getSEOScenario(data.seo.metrics, data.content.metrics);
              return (
              <div style={{
                marginTop: 40, padding: "0", borderRadius: 14,
                background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  padding: "28px 32px 20px", position: "relative", overflow: "hidden",
                  background: scenario.badgeColor ? `${scenario.badgeColor}08` : `linear-gradient(135deg, ${accent}12, ${accentAlt}08)`,
                  borderBottom: `1px solid ${t.cardBorder}`,
                }}>
                  <div style={{
                    position: "absolute", top: -40, right: -40, width: 160, height: 160,
                    background: `radial-gradient(circle, ${scenario.badgeColor ? scenario.badgeColor + "12" : "rgba(66,191,186,0.1)"} 0%, transparent 70%)`, borderRadius: "50%",
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, position: "relative" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 2 }}>
                      Website & SEO Content
                    </div>
                    {scenario.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: scenario.badgeColor,
                        background: `${scenario.badgeColor}12`, border: `1px solid ${scenario.badgeColor}25`,
                        padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5,
                      }}>{scenario.badge}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0, position: "relative", lineHeight: 1.3 }}>
                    {scenario.headline}
                  </h3>
                </div>

                {/* Body */}
                <div style={{ padding: "24px 32px" }}>
                  <p style={{ fontSize: 13, color: t.body, lineHeight: 1.7, margin: "0 0 20px" }}>
                    {scenario.body}
                  </p>
                  {scenario.subBody && (
                    <p style={{ fontSize: 13, color: t.body, lineHeight: 1.7, margin: "0 0 20px" }}>
                      {scenario.subBody}
                    </p>
                  )}
                  {scenario.items.length > 0 && (
                    <>
                      {scenario.listLabel && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
                          {scenario.listLabel}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 24 }}>
                        {scenario.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.text, fontWeight: 500 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: scenario.badgeColor || accent, flexShrink: 0 }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Pricing */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {[
                      { name: "Website & SEO Content", price: "$2,500", period: "/mo", desc: "Full website + SEO content — 12 month engagement", featured: true },
                      { name: "SEO Content Only", price: "From $1,500", period: "/mo", desc: "Based on content volume" },
                      { name: "Backlinks Add-On", price: "$500–$1K+", period: "/mo", desc: "2–4 backlinks/month at $500, $750, or $1,000+" },
                    ].map((tier, i) => (
                      <div key={i} style={{
                        padding: "20px 16px", borderRadius: 10, textAlign: "center",
                        background: tier.featured ? `linear-gradient(135deg, ${accent}15, ${accentAlt}10)` : t.hoverRow,
                        border: `1px solid ${tier.featured ? accent + "40" : t.cardBorder}`,
                        position: "relative",
                      }}>
                        {tier.featured && (
                          <div style={{
                            position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                            fontSize: 8, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5,
                            background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                            padding: "3px 10px", borderRadius: 10,
                          }}>Recommended</div>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{tier.name}</div>
                        <div style={{ fontSize: tier.price.length > 8 ? 22 : 28, fontWeight: 800, color: t.text, lineHeight: 1, marginBottom: 4 }}>
                          {tier.price}{tier.period && <span style={{ fontSize: 13, fontWeight: 500, color: t.subtle }}>{tier.period}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{tier.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <button style={{
                      padding: "15px 40px", borderRadius: 10, border: "none",
                      background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                      color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                      letterSpacing: 0.5, boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
                    }}>
                      Build My SEO Growth Plan →
                    </button>
                  </div>
                </div>
              </div>
              );
            })() : activeTab === 0 ? (() => {
              const scenario = getWebPerfScenario(data.webPerf.metrics);
              return (
              <div style={{
                marginTop: 40, padding: "0", borderRadius: 14,
                background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  padding: "28px 32px 20px", position: "relative", overflow: "hidden",
                  background: scenario.badgeColor ? `${scenario.badgeColor}08` : `linear-gradient(135deg, ${accent}12, ${accentAlt}08)`,
                  borderBottom: `1px solid ${t.cardBorder}`,
                }}>
                  <div style={{
                    position: "absolute", top: -40, right: -40, width: 160, height: 160,
                    background: `radial-gradient(circle, ${scenario.badgeColor ? scenario.badgeColor + "12" : "rgba(66,191,186,0.1)"} 0%, transparent 70%)`, borderRadius: "50%",
                  }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, position: "relative" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 2 }}>
                      Website Performance
                    </div>
                    {scenario.badge && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: scenario.badgeColor,
                        background: `${scenario.badgeColor}12`, border: `1px solid ${scenario.badgeColor}25`,
                        padding: "2px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5,
                      }}>{scenario.badge}</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0, position: "relative", lineHeight: 1.3 }}>
                    {scenario.headline}
                  </h3>
                </div>

                {/* Body */}
                <div style={{ padding: "24px 32px" }}>
                  <p style={{ fontSize: 13, color: t.body, lineHeight: 1.7, margin: "0 0 20px" }}>
                    {scenario.body}
                  </p>
                  {scenario.subBody && (
                    <p style={{ fontSize: 13, color: t.body, lineHeight: 1.7, margin: "0 0 20px" }}>
                      {scenario.subBody}
                    </p>
                  )}
                  {scenario.items.length > 0 && (
                    <>
                      {scenario.listLabel && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
                          {scenario.listLabel}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 24 }}>
                        {scenario.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: t.text, fontWeight: 500 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: scenario.badgeColor || accent, flexShrink: 0 }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Pricing */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                    {[
                      { name: "Project Website", price: "$6K–$20K+", period: "", desc: "Based on pages needed and functionality requirements", featured: true },
                      { name: "Website & SEO Content", price: "$2,500", period: "/mo", desc: "Full website + SEO content — 12 month engagement" },
                    ].map((tier, i) => (
                      <div key={i} style={{
                        padding: "20px 16px", borderRadius: 10, textAlign: "center",
                        background: tier.featured ? `linear-gradient(135deg, ${accent}15, ${accentAlt}10)` : t.hoverRow,
                        border: `1px solid ${tier.featured ? accent + "40" : t.cardBorder}`,
                        position: "relative",
                      }}>
                        {tier.featured && (
                          <div style={{
                            position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                            fontSize: 8, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 1.5,
                            background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                            padding: "3px 10px", borderRadius: 10,
                          }}>Recommended</div>
                        )}
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.subtle, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{tier.name}</div>
                        <div style={{ fontSize: tier.price.length > 8 ? 22 : 28, fontWeight: 800, color: t.text, lineHeight: 1, marginBottom: 4 }}>
                          {tier.price}{tier.period && <span style={{ fontSize: 13, fontWeight: 500, color: t.subtle }}>{tier.period}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: t.subtle, lineHeight: 1.4 }}>{tier.desc}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <button style={{
                      padding: "15px 40px", borderRadius: 10, border: "none",
                      background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                      color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                      letterSpacing: 0.5, boxShadow: "0 4px 20px rgba(66,191,186,0.25)",
                    }}>
                      Fix My Website Performance →
                    </button>
                  </div>
                </div>
              </div>
              );
            })() : (
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
                color: brand.pipelineRed,
              }}>
                GET A PERSONALIZED DIGITAL STRATEGY FROM ABSTRAKT
              </h3>
              <p style={{ fontSize: 15, color: t.body, marginBottom: 28, maxWidth: 520, margin: "0 auto 28px", position: "relative" }}>
                Ready to improve your digital visibility and outperform your competition?
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
            )}
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
