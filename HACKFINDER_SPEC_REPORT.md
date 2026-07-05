# HackFinder — Enterprise Specification & Setup Guide
*Production-Ready Centralized Hackathon Discovery & Teammate Scouting SaaS*

**Lead Developer & Architect**: Prakhar Ojha (pojha2737@gmail.com)

---

## 1. Executive Product Summary
**HackFinder** is a premier, full-stack hub designed to solve a critical issue faced by builders, student developers, and tech recruiters: **the extreme fragmentation of the hackathon landscape.** Instead of browsing dozens of platforms separately, HackFinder aggregates active hackathons into a single premium interface, complete with smart fit ratings, collaborative teammate scouting channels, live scraping logs, and a server-backed Gemini AI Strategy Coach.

### Value Propositions
*   **Centralized Discovery**: Instant aggregation from platforms like Devpost, Devfolio, Unstop, Reskilll, and HackerEarth.
*   **Aesthetic & UX Polish**: Designed under the *Professional Polish* dark UI theme. Responsive layouts, real-time feedback loops, and smooth modal overlays.
*   **AI Strategic Coach**: Built-in server-side proxy utilizing `@google/genai` to formulate custom project structures, target tracks, and step-by-step submission timelines.
*   **Teammate Finder**: Fully integrated application pipeline connecting project captains with qualified candidates.

---

## 2. Technical Stack & Architecture

```
                       ┌────────────────────────────────┐
                       │       React 19 SPA (Vite)      │
                       │   styled with Tailwind CSS &   │
                       │    Professional Polish Theme   │
                       └───────────────┬────────────────┘
                                       │
                                       │ Client Requests / API Calls
                                       ▼
                       ┌────────────────────────────────┐
                       │      Express Custom Server     │
                       │          (TypeScript)          │
                       └───────────────┬────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
  ┌───────────────────────────┐                 ┌───────────────────────────┐
  │     Scraper Engine &      │                 │    Gemini AI SDK Proxy    │
  │     Source Providers      │                 │  (@google/genai v2.4.0)   │
  │ (Devfolio, HackerEarth,   │                 │                           │
  │  Reskilll, etc.)          │                 └───────────────────────────┘
  └───────────────────────────┘
```

### Key Technical Pillars
1.  **TypeScript-First Contract**: Strict data definitions located in `src/types.ts` unify both the backend API and client UI, eliminating runtime structure drifts.
2.  **Optimized ESM/CJS Hybrid Build**:
    *   **Development**: Runs using high-fidelity `tsx server.ts` wrapper.
    *   **Production**: Vite builds the frontend static package into `/dist`, and `esbuild` bundles `server.ts` into a self-contained CommonJS target (`dist/server.cjs`) handling native dependency resolution automatically.
3.  **Extensible Scraper Architecture**:
    *   Defined around a strict `SourceProvider` interface:
        ```typescript
        interface SourceProvider {
          name: string;
          fetchHackathons(): Promise<ScrapedHackathon[]>;
        }
        ```
    *   Addition of any future hackathon directory requires only implementing this interface and registering it inside `server.ts`.

---

## 3. Deep-Dive Feature Specifications

### A. Dynamic Hackathon Feed
*   **Intelligent Personalization**: Calculates an **Opportunity Match Score (35%-99%)** based on overlapping skills, mode compatibility, and interests registered during user onboarding.
*   **Granular Filters**: Sticky desktop controls to sort by Category, Physical Location Hub, Tech Theme, Mode, Difficulty, and Student Only eligibility.
*   **Status Journey Tracker**: Allows users to save/bookmark events and manage their status dynamically: *Saved*, *Applied*, *Registered*, *Won*, or *None*.

### B. Team Scout Finder
*   **Scout Listings**: Displays active groups looking for members.
*   **Integrated Action Portal**: Users can submit application messages to Team Captains with one click.
*   **Pending Inbox**: Team Captains can view incoming member requests, accept/reject proposals, and immediately unlock contact channels like Discord, email, or Slack.

### C. Gemini AI Strategic Coach
*   **API Security**: Access to `process.env.GEMINI_API_KEY` is isolated to the Node environment, preventing key leaks to client browsers.
*   **Dynamic Prompts**: Collects contextual information about the user's active skill profile and details of the current hackathon to construct highly specific product ideas, milestones, and development milestones.
*   **Robust Heuristics Fallback**: If an API key is missing, a rules-based fallback engine delivers structural templates to maintain an active interface.

### D. Scraper Pipeline Diagnostics
*   **Crawler Logs**: Admin-facing portal displaying status runs (`Running`, `Completed`, `Failed`), processing timelines, and real-time terminal output messages from ongoing scrape jobs.

---

## 4. Setup & Deployment Guidelines

### Prerequisites
*   Node.js v18 or newer
*   NPM (or Yarn/PNPM)

### Local Configuration
1.  **Clone / Download** the repository workspace.
2.  **Environment Variables**:
    Create `.env` file in the root folder (based on `.env.example`):
    ```env
    GEMINI_API_KEY="your_google_gemini_api_key_here"
    APP_URL="http://localhost:3000"
    ```
3.  **Installation**:
    ```bash
    npm install
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    *   The backend Express server and Vite development environment will launch at `http://localhost:3000`.

### Production Build & Deployment
1.  **Compile & Bundle**:
    ```bash
    npm run build
    ```
    *   This generates the optimized static files under `dist/` and compiles the production-ready unified server to `dist/server.cjs`.
2.  **Verify Production Start**:
    ```bash
    npm run start
    ```
3.  **Cloud Run / Vercel Ingress**:
    *   The system binds to port `3000` on interface `0.0.0.0` automatically. Configure your host environment port forward rules to direct incoming traffic directly.

---

## 5. Verification Certification
*   **Linter Diagnostics**: Successfully passed strict type checks (`tsc --noEmit`).
*   **Production Compiling**: Production bundling (`npm run build`) runs with `0` errors.
*   **HMR Support**: Properly synchronized with parent container systems.
