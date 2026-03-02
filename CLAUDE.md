# Inbound Digital Audit — Claude Instructions

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

## Session Documentation

**IMPORTANT:** At the conclusion of each session on the project (when the user says "save", "close", "done", "wrap up", or similar), update PROCESS.md at the project root.

Add a new session section documenting:
1. **Session Date** — The current date
2. **User Prompts** — List each prompt/request made by the user during the session
3. **Actions Taken** — Bullet points of what was implemented for each prompt
4. **Files Modified** — List of files that were created or changed
5. **Issues Encountered** — Any errors or problems that were resolved
6. **Current State** — Brief summary of where the project stands

## Project Overview

**What this is:** A Next.js 14 website audit tool that runs a client's URL through multiple data providers in parallel and renders a comprehensive digital marketing report.

**Tech stack:** Next.js 14, React 18, Upstash Redis (caching/storage), deployed on Vercel.

**Key directories:**
- `app/api/audit/` — Main orchestration endpoint (runs all providers, builds metrics, stores in KV)
- `app/api/providers/` — Individual data provider modules (PageSpeed, SEMrush, crawl, Places, Sheets)
- `components/` — React UI (form, loading animation, results display)
- `app/api/debug/` — Debug/test routes for individual providers

**Subdirectory CLAUDE.md files** exist in `app/api/providers/`, `app/api/audit/`, and `components/` with detailed context for each area.

## Environment Variables

The app uses these env vars (set in Vercel / .env.local):
- `GOOGLE_PSI_API_KEY` / `GOOGLE_API_KEY` — Google PageSpeed + Places
- `SEMRUSH_API_KEY` — SEMrush domain metrics
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_KEY` — Google Sheets logging
- `GOOGLE_SPREADSHEET_ID` + `GOOGLE_SHEET_NAME` — Target spreadsheet (has defaults)
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis (storage)
- `DEBUG_API_SECRET` — Bearer token required for `/api/debug/*` routes
