# KT Agent — Universal Product Knowledge Transfer

An AI-powered Next.js application that transforms product descriptions and KT session notes into structured knowledge documents using the **Universal Product KT Deconstruction Framework**, powered by Google Gemini.

---

## Features

- 🧠 **AI-Powered Analysis** — Paste raw product notes, get a structured KT Master Document
- 📊 **Full Deconstruction Table** — Module × Feature × Skills × Pain × Solution
- 🎯 **Strategic Context** — Auto-generates Pain Points, Target User, North Star Metric
- 🔄 **Knowledge Synthesis** — Surfaces assumptions challenged, gaps, and guardrails
- 📥 **Export** — Download as Markdown or copy as JSON
- ⚡ **Streaming** — Real-time progress via Server-Sent Events

---

## Quick Start

### 1. Clone / unzip the project

```bash
cd kt-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Gemini API key

Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

```bash
cp .env.local.example .env.local
# Edit .env.local and add your key:
# GEMINI_API_KEY=your_key_here
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
kt-agent/
├── app/
│   ├── api/kt-stream/route.ts   # Streaming API endpoint (SSE)
│   ├── globals.css              # Design system & animations
│   ├── layout.tsx
│   └── page.tsx                 # Main app state machine
├── components/
│   ├── Header.tsx               # Top nav
│   ├── InputPanel.tsx           # Product description input
│   ├── LoadingState.tsx         # Progress visualization
│   └── KTOutput.tsx             # Full KT document renderer
├── lib/
│   ├── gemini.ts                # Google AI SDK integration
│   └── types.ts                 # TypeScript interfaces
└── .env.local.example           # API key template
```

---

## How the KT Framework Works

The agent generates a document with 3 sections:

### Section 1 — Strategic Context
- Nature of Product, Target User
- Top 5 Pain Points
- North Star Metric

### Section 2 — Deconstruction Table
| Module | Feature | Skills Used | Traditional Workflow | Solution Delivered |
|--------|---------|-------------|---------------------|-------------------|

### Section 3 — Synthesis
- Assumptions Challenged
- Technical / Domain Gaps
- Governance & Guardrails

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| AI | Google Gemini 2.0 Flash via `@google/generative-ai` |
| Streaming | Server-Sent Events (SSE) |
| Styling | Tailwind CSS with custom design system |
| Language | TypeScript |

---

## Extending the Agent

**Change the AI model** in `lib/gemini.ts`:
```ts
model: "gemini-2.0-flash-exp"  // change to "gemini-1.5-pro" for higher quality
```

**Add more output formats** in `components/KTOutput.tsx` — the `generateMarkdown()` function can be adapted for CSV, DOCX, etc.

**Add authentication** — wrap the API route with NextAuth or Clerk for multi-user setups.
