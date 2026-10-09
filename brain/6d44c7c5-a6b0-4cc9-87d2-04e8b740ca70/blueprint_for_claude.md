# Architectural Blueprint: YouTube Lab Ecosystem (For Claude Opus / Sonnet Review)

**Project Context:** AgoraEuFalo SaaS Platform (Calm EdTech)
**Stack:** Vanilla JS, TailwindCSS, Firebase (Auth + Firestore Cloud), Cloudflare Workers (Webhooks).
**Architecture Pattern:** Hybrid (Static HTML for core SEO + Client-Side dynamic injection for widgets/courses).

## 1. Core Objective
Transform the platform into a "Content-First" hub by integrating a dynamic YouTube showcase. The goal is to use free, high-value YouTube content as a lead generation tool (requiring free signup to download PDFs) and as a soft upsell engine (bridging the YouTube video to the official, paywalled class inside the platform).

## 2. Data Model (Single Source of Truth)
**Firestore Collection:** `youtube_archive`
**Document ID:** `{videoId}` (e.g., `puJ2EskHXj4`)

```json
{
  "videoId": "puJ2EskHXj4",
  "title": "Connected Speech Fundamentals",
  "description": "Stop translating in your head and start linking sounds...",
  "thumbnailUrl": "https://i.ytimg.com/vi/puJ2EskHXj4/maxresdefault.jpg",
  "publishedAt": "2026-10-01T12:00:00Z",
  "status": "active",
  "featuredOnHome": true, // Determines rendering on index.html
  "materials": {
    "hasPdf": true,
    "pdfUrl": "https://storage.../connected_speech.pdf",
    "hasAudio": false,
    "audioUrl": ""
  },
  "referenceClass": {
    "hasReference": true,
    "courseId": "magic-stories",
    "lessonId": "ms012",
    "buttonLabel": "Acessar Magic Story 012 na Plataforma"
  }
}
```

## 3. Security Architecture (Firestore Zero Trust)
The platform operates on a strict Zero Trust model (P0-1). Any unmapped collection is blocked by default. 
To implement this ecosystem, `firestore.rules` MUST be updated prior to code execution:

```javascript
    // ========================================================================
    // 9. YOUTUBE LAB (Content-First Engine)
    // Leitura: Pública para renderização na vitrine e página de consumo.
    // Escrita: Exclusiva do Administrador Mestre.
    // ========================================================================
    match /youtube_archive/{videoId} {
      allow read: if true;
      allow write: if isAdmin();
    }
```

## 4. Interfaces & Routing Logic

### A. The Admin Panel (`admin/youtube-lab-manager.html`)
*   **Role:** Data ingestion.
*   **Logic:** The admin pastes a YouTube URL. The UI extracts the ID, calls YouTube's native image server (`img.youtube.com/vi/{id}/maxresdefault.jpg`) for the thumbnail, and sets up the document payload. The admin can upload PDFs and link a `courseId` and `lessonId` for cross-referencing.

### B. The Public Showcase (`index.html`)
*   **Role:** SEO footprint and Lead Generation.
*   **Logic:** A dynamic JS block fetches `db.collection('youtube_archive').where('featuredOnHome', '==', true).limit(3)`.
*   **Gatekeeper Hook:** 
    *   If `!isAuthenticated`: Clicking a video thumbnail triggers a frictionless signup modal ("Create a free account to access the PDFs"). Post-signup, redirects to the content.
    *   If `isAuthenticated`: Routes directly to `youtube-lab.html?v={videoId}`.

### C. The Consumption Page (`youtube-lab.html`)
*   **Role:** Retention, immersion, and cross-linking to paid products.
*   **Logic:** 
    *   Parses `?v=videoId` from the URL.
    *   Fetches the document from Firestore.
    *   Renders a cinematic 16:9 YouTube iframe.
    *   Renders the PDF/Audio download buttons.
*   **The "Cross-Link" Paywall Strategy (Decoupled Auth):**
    *   If `referenceClass.hasReference` is true, a primary CTA button is rendered (e.g., "Acessar Aula Magic Story 012").
    *   **Action:** This button does NOT evaluate user tiers or handle checkouts. It simply routes the user to `sala-de-aula.html?curso={courseId}&aula={lessonId}`.
    *   **Delegation:** The existing `access-engine.js` on `sala-de-aula.html` takes over. It checks if the user owns `magic-stories`. If yes, the class opens. If no, the native platform Paywall modal blocks the screen and offers the specific checkout (Product or Club Subscription). This prevents duplicating business logic and keeps the YouTube Lab focused purely on content distribution.

## 5. Architectural Review Request
*Is this decoupled routing strategy (using the existing `access-engine` on the destination page rather than building paywall logic into the `youtube-lab` page) the optimal pattern for a scalable, content-first SaaS architecture?*
