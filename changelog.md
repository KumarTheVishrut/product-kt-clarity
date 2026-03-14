# KT Agent — Change Document
**Objective:** Replace the freeform textarea input with a structured 3-part form (A → B → C), then synthesize collected data into the KT output.

---

## Summary of Changes

| # | File | Action | What Changes |
|---|------|--------|--------------|
| 1 | `lib/types.ts` | **Replace** | New form data types for Parts A, B, C |
| 2 | `lib/gemini.ts` | **Replace** | New prompt that takes structured form JSON, runs synthesis strategy |
| 3 | `app/api/kt-stream/route.ts` | **Modify** | Accept `formData` instead of `productDescription` |
| 4 | `app/page.tsx` | **Replace** | New 4-state machine: `form → loading → complete → error` |
| 5 | `components/InputPanel.tsx` | **Delete** | No longer needed — replaced by KTForm |
| 6 | `components/KTForm/` | **Create (new folder)** | 3 new components for the form wizard |
| 7 | `components/KTOutput.tsx` | **Modify** | Add synthesis section: Value Clusters, Narrative, So-What chain |

---

## Change 1 — `lib/types.ts` (REPLACE entire file)

```typescript
// ─── FORM INPUT TYPES ───────────────────────────────────────────────────────

export interface PartA {
  natureOfProduct: string;
  productPromise: string;       // "The Big Why"
  northStarMetric: string;
  painPoints: [string, string, string, string, string]; // exactly 5
}

export interface FeatureEntry {
  id: string;                   // uuid, generated client-side
  moduleName: string;
  feature: string;              // Inside-Out: what was built
  benefitL1: string;            // So What? Ladder 1 — practical advantage
  benefitL2: string;            // So What? Ladder 2 — business/life outcome
  useCaseStory: string;         // "As a [User], I [Action] so that [Benefit]"
  techStory?: string;           // Optional differentiator
  traditionalWorkflow: string;  // The As-Is Pain
  knowledgeRetrieved: string;   // Skill/domain knowledge aggregated
}

export interface PartB {
  features: FeatureEntry[];     // At least 1, no upper limit
}

export interface PartC {
  unlearnedAssumptions: string; // Myth held before KT
  governanceGuardrail: string;  // How the module prevents mistakes
  followUpGap: string;          // Domain logic to research
}

export interface KTFormData {
  partA: PartA;
  partB: PartB;
  partC: PartC;
}

// ─── SYNTHESIS OUTPUT TYPES ─────────────────────────────────────────────────

export interface ValueCluster {
  pillarName: string;           // e.g., "Cash Flow Management Engine"
  features: string[];           // Feature names grouped under this pillar
  insight: string;              // Why these features form a pillar
}

export interface PersonaNarrative {
  persona: string;              // e.g., "The CFO"
  productPromiseLink: string;   // Which promise this serves
  useCases: string[];
  featuresUsed: string[];
  synthesisStatement: string;   // The 3-layer formula output
}

export interface SoWhatChain {
  feature: string;
  chain: string[];              // Each "So what?" step
  trueInsight: string;          // The wall — final synthesis
}

export interface SynthesisOutput {
  valueClusters: ValueCluster[];
  narratives: PersonaNarrative[];
  soWhatChains: SoWhatChain[];
  engineIdentified: string;     // The core "engine" of the product
  finalReview: {
    productPromise: string;
    keyUseCases: string[];
    coreFeatures: string[];
    soWhatStatement: string;    // "Effortless transforms accounting from..."
  };
}

export interface KTDocument {
  // Echoed from form
  natureOfProduct: string;
  productPromise: string;
  northStarMetric: string;
  painPoints: string[];
  features: FeatureEntry[];
  assumptionsChallenged: string;
  governanceGuardrail: string;
  followUpGap: string;
  // Generated synthesis
  synthesis: SynthesisOutput;
}

export interface StreamChunk {
  type: "progress" | "partial" | "complete" | "error";
  message?: string;
  data?: KTDocument;
  error?: string;
}
```

---

## Change 2 — `lib/gemini.ts` (REPLACE entire file)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KTFormData, KTDocument, SynthesisOutput } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYNTHESIS_SYSTEM_PROMPT = `You are a Senior Product Strategist and KT Analyst. You receive structured form data from a Knowledge Transfer session and apply the Universal KT Synthesis Strategy to produce deep insights.

Return ONLY a valid JSON object — no markdown fences, no explanation.

Schema to return:
{
  "valueClusters": [
    {
      "pillarName": "string — the strategic pillar name (e.g., 'Cash Flow Management Engine')",
      "features": ["feature name 1", "feature name 2"],
      "insight": "string — why these features form a single pillar"
    }
  ],
  "narratives": [
    {
      "persona": "string — derived from targetUser or use case stories",
      "productPromiseLink": "string — which product promise this persona unlocks",
      "useCases": ["string"],
      "featuresUsed": ["string"],
      "synthesisStatement": "string — 'Because of [Promise], the [Persona] can now [Use Case]. This is possible because [Feature A] and [Feature B] aggregate [Skill] into a single workflow.'"
    }
  ],
  "soWhatChains": [
    {
      "feature": "string — feature name",
      "chain": ["So what step 1", "So what step 2", "So what step 3"],
      "trueInsight": "string — the final business truth at the end of the chain"
    }
  ],
  "engineIdentified": "string — the core product engine (e.g., 'The Tally Sync Bridge is the engine that enables real-time Governance.')",
  "finalReview": {
    "productPromise": "string",
    "keyUseCases": ["string", "string", "string"],
    "coreFeatures": ["string", "string", "string"],
    "soWhatStatement": "string — one powerful sentence: 'This product transforms X from Y into Z.'"
  }
}

Synthesis rules:
1. VALUE-CLUSTERING: Group features from different modules that deliver the same business outcome. Name the cluster as a strategic "engine."
2. NARRATIVES: Build at least one 3-layer story per distinct persona found in the use case stories. Use the formula: "Because of [Promise], [Persona] can [Use Case]. This is possible because [Features] aggregate [Knowledge] into a single workflow."
3. SO-WHAT CHAINS: Run the chain for the 3 most impactful features. Each chain must reach a business/human truth, not just a feature description.
4. ENGINE: Identify the single technical/domain piece that makes the whole product defensible.
5. FINAL REVIEW: This is the executive summary — what you'd tell a senior stakeholder in 30 seconds.`;

export async function* generateKTSynthesisStreaming(
  formData: KTFormData
): AsyncGenerator<{ type: string; message?: string; data?: KTDocument }> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 4096 },
  });

  yield { type: "progress", message: "Running Value-Clustering Audit..." };

  const featureSummary = formData.partB.features
    .map(
      (f, i) =>
        `Feature ${i + 1}: Module="${f.moduleName}" | Feature="${f.feature}" | Benefit L1="${f.benefitL1}" | Benefit L2="${f.benefitL2}" | Use Case="${f.useCaseStory}" | Tech="${f.techStory ?? "N/A"}" | Traditional="${f.traditionalWorkflow}" | Knowledge="${f.knowledgeRetrieved}"`
    )
    .join("\n");

  const prompt = `${SYNTHESIS_SYSTEM_PROMPT}

--- FORM DATA ---
PART A:
- Nature of Product: ${formData.partA.natureOfProduct}
- Product Promise: ${formData.partA.productPromise}
- North Star Metric: ${formData.partA.northStarMetric}
- Pain Points: ${formData.partA.painPoints.join(" | ")}

PART B — FEATURES (${formData.partB.features.length} total):
${featureSummary}

PART C:
- Unlearned Assumption: ${formData.partC.unlearnedAssumptions}
- Governance Guardrail: ${formData.partC.governanceGuardrail}
- Follow-up Gap: ${formData.partC.followUpGap}
--- END FORM DATA ---

Apply the full synthesis strategy and return the JSON now.`;

  yield { type: "progress", message: "Building Outside-In narrative..." };

  const result = await model.generateContentStream(prompt);
  let fullText = "";

  for await (const chunk of result.stream) {
    fullText += chunk.text();
    yield { type: "partial", message: "Running So-What stress test..." };
  }

  yield { type: "progress", message: "Identifying the product engine..." };

  const cleaned = fullText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const synthesis = JSON.parse(cleaned) as SynthesisOutput;

  const ktDocument: KTDocument = {
    natureOfProduct: formData.partA.natureOfProduct,
    productPromise: formData.partA.productPromise,
    northStarMetric: formData.partA.northStarMetric,
    painPoints: [...formData.partA.painPoints],
    features: formData.partB.features,
    assumptionsChallenged: formData.partC.unlearnedAssumptions,
    governanceGuardrail: formData.partC.governanceGuardrail,
    followUpGap: formData.partC.followUpGap,
    synthesis,
  };

  yield { type: "complete", data: ktDocument };
}
```

---

## Change 3 — `app/api/kt-stream/route.ts` (MODIFY — change body parsing only)

Replace this block:
```typescript
const { productDescription } = await req.json();

if (!productDescription || productDescription.trim().length < 10) {
  return new Response(
    JSON.stringify({ error: "Please provide a meaningful product description." }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
```

With:
```typescript
const { formData } = await req.json();

if (!formData || !formData.partA || !formData.partB || !formData.partC) {
  return new Response(
    JSON.stringify({ error: "Incomplete form data. Please fill all parts." }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
```

Also replace the generator call:
```typescript
// OLD
const generator = generateKTDocumentStreaming(productDescription);

// NEW
const generator = generateKTSynthesisStreaming(formData);
```

Also update the import at the top:
```typescript
// OLD
import { generateKTDocumentStreaming } from "@/lib/gemini";

// NEW
import { generateKTSynthesisStreaming } from "@/lib/gemini";
```

---

## Change 4 — `app/page.tsx` (REPLACE entire file)

```typescript
"use client";

import { useState } from "react";
import { KTDocument, KTFormData } from "@/lib/types";
import KTFormWizard from "@/components/KTForm/KTFormWizard";
import KTOutput from "@/components/KTOutput";
import LoadingState from "@/components/LoadingState";
import Header from "@/components/Header";

type AppState = "form" | "loading" | "complete" | "error";

export default function Home() {
  const [state, setState] = useState<AppState>("form");
  const [progressMessage, setProgressMessage] = useState("");
  const [ktDocument, setKtDocument] = useState<KTDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: KTFormData) => {
    setState("loading");
    setError(null);
    setKtDocument(null);
    setProgressMessage("Initializing KT Synthesis...");

    try {
      const res = await fetch("/api/kt-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json) continue;
          const chunk = JSON.parse(json);

          if (chunk.type === "progress" || chunk.type === "partial") {
            setProgressMessage(chunk.message ?? "Processing...");
          } else if (chunk.type === "complete") {
            setKtDocument(chunk.data);
            setState("complete");
          } else if (chunk.type === "error") {
            throw new Error(chunk.error);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("form");
    setKtDocument(null);
    setError(null);
    setProgressMessage("");
  };

  return (
    <div className="min-h-screen grid-bg">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {state === "form" && (
          <KTFormWizard onSubmit={handleFormSubmit} />
        )}

        {state === "loading" && (
          <LoadingState message={progressMessage} />
        )}

        {state === "error" && (
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-white border border-[var(--rust)] rounded-2xl p-8">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[var(--rust)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--ink)] mb-2">Something went wrong</h3>
              <p className="text-[var(--slate)] text-sm mb-6">{error}</p>
              <button onClick={handleReset} className="px-6 py-2.5 bg-[var(--ink)] text-[var(--paper)] rounded-xl font-display text-sm font-semibold hover:bg-[var(--rust)] transition-colors">
                Back to Form
              </button>
            </div>
          </div>
        )}

        {state === "complete" && ktDocument && (
          <KTOutput document={ktDocument} onReset={handleReset} />
        )}

      </main>
    </div>
  );
}
```

---

## Change 5 — Delete `components/InputPanel.tsx`

```bash
rm components/InputPanel.tsx
```

---

## Change 6 — Create `components/KTForm/` (NEW folder + 3 files)

### 6a. `components/KTForm/KTFormWizard.tsx` (NEW FILE)

This is the top-level wizard that manages which part (A / B / C) is active and holds all form state.

```typescript
"use client";

import { useState } from "react";
import { KTFormData, PartA, PartB, PartC, FeatureEntry } from "@/lib/types";
import PartAForm from "./PartAForm";
import PartBForm from "./PartBForm";
import PartCForm from "./PartCForm";

interface Props {
  onSubmit: (data: KTFormData) => void;
}

const STEPS = [
  { id: "A", label: "Product Identity", subtitle: "Outside-In Strategy" },
  { id: "B", label: "Feature Entry", subtitle: "Inside-Out Bridge" },
  { id: "C", label: "Synthesis & Reflection", subtitle: "Wrap-Up" },
];

const defaultPartA: PartA = {
  natureOfProduct: "",
  productPromise: "",
  northStarMetric: "",
  painPoints: ["", "", "", "", ""],
};

const defaultPartB: PartB = {
  features: [],
};

const defaultPartC: PartC = {
  unlearnedAssumptions: "",
  governanceGuardrail: "",
  followUpGap: "",
};

export default function KTFormWizard({ onSubmit }: Props) {
  const [step, setStep] = useState<"A" | "B" | "C">("A");
  const [partA, setPartA] = useState<PartA>(defaultPartA);
  const [partB, setPartB] = useState<PartB>(defaultPartB);
  const [partC, setPartC] = useState<PartC>(defaultPartC);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const handleSubmit = () => {
    onSubmit({ partA, partB, partC });
  };

  return (
    <div className="pt-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--amber)]/40 bg-[var(--amber)]/10 mb-5">
          <span className="text-xs font-mono text-[var(--amber)] font-medium">KT Deconstruction Form</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[var(--ink)] leading-tight mb-3">
          Structure your KT, <br />then synthesize it.
        </h1>
        <p className="text-[var(--slate)] max-w-lg mx-auto text-base">
          Fill the 3-part form first. The AI synthesizes insights only after all data is collected.
        </p>
      </div>

      {/* Step progress bar */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => {
                // Only allow going back to completed steps
                if (i < currentStepIndex) setStep(s.id as "A" | "B" | "C");
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all ${
                s.id === step
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : i < currentStepIndex
                  ? "bg-[var(--sage)]/15 text-[var(--sage)] cursor-pointer hover:bg-[var(--sage)]/25"
                  : "bg-[var(--mist)] text-[var(--slate)] cursor-default"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 ${
                s.id === step ? "bg-[var(--amber)] text-[var(--ink)]" :
                i < currentStepIndex ? "bg-[var(--sage)] text-white" :
                "bg-[var(--slate)]/30 text-[var(--slate)]"
              }`}>
                {i < currentStepIndex ? "✓" : s.id}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-display font-semibold leading-none">{s.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{s.subtitle}</div>
              </div>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${i < currentStepIndex ? "bg-[var(--sage)]" : "bg-[var(--mist)]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form panels */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] shadow-sm overflow-hidden">
        {step === "A" && (
          <PartAForm
            data={partA}
            onChange={setPartA}
            onNext={() => setStep("B")}
          />
        )}
        {step === "B" && (
          <PartBForm
            data={partB}
            onChange={setPartB}
            onBack={() => setStep("A")}
            onNext={() => setStep("C")}
          />
        )}
        {step === "C" && (
          <PartCForm
            data={partC}
            onChange={setPartC}
            onBack={() => setStep("B")}
            onSubmit={handleSubmit}
            featureCount={partB.features.length}
          />
        )}
      </div>
    </div>
  );
}
```

---

### 6b. `components/KTForm/PartAForm.tsx` (NEW FILE)

```typescript
"use client";

import { PartA } from "@/lib/types";

interface Props {
  data: PartA;
  onChange: (data: PartA) => void;
  onNext: () => void;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-display text-sm font-semibold text-[var(--ink)] mb-1">{label}</label>
      {hint && <p className="text-xs text-[var(--slate)] mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder-[var(--slate)] focus:outline-none focus:border-[var(--amber)] transition-colors";

export default function PartAForm({ data, onChange, onNext }: Props) {
  const update = (key: keyof PartA, value: string) =>
    onChange({ ...data, [key]: value });

  const updatePain = (i: number, value: string) => {
    const next = [...data.painPoints] as PartA["painPoints"];
    next[i] = value;
    onChange({ ...data, painPoints: next });
  };

  const isValid =
    data.natureOfProduct.trim() &&
    data.productPromise.trim() &&
    data.northStarMetric.trim() &&
    data.painPoints.every((p) => p.trim().length > 0);

  return (
    <div>
      {/* Part header */}
      <div className="bg-[var(--ink)] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--amber)] flex items-center justify-center">
          <span className="font-mono font-bold text-[var(--ink)] text-sm">A</span>
        </div>
        <div>
          <h2 className="font-display text-white font-bold text-lg">Part A — Product Identity</h2>
          <p className="text-[var(--slate)] text-xs">The "Outside-In" Strategy · Set the context once per product</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Nature of Product" hint="e.g., Fintech SaaS / ERP Middleware / Logistics Platform">
            <input
              type="text"
              className={inputCls}
              placeholder="Fintech SaaS"
              value={data.natureOfProduct}
              onChange={(e) => update("natureOfProduct", e.target.value)}
            />
          </Field>
          <Field label="North Star Metric" hint="The single metric that proves the product is working">
            <input
              type="text"
              className={inputCls}
              placeholder="Days Sales Outstanding / Time to Close"
              value={data.northStarMetric}
              onChange={(e) => update("northStarMetric", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Product Promise — The Big 'Why'" hint="The high-level emotional or strategic outcome this product delivers">
          <textarea
            className={`${inputCls} h-24 resize-none`}
            placeholder="e.g., Financial autonomy for non-accountant founders — so they never need to call their CA for day-to-day decisions."
            value={data.productPromise}
            onChange={(e) => update("productPromise", e.target.value)}
          />
        </Field>

        <Field label="Top 5 Pain Points — The Villains" hint="What does the user suffer from without this product?">
          <div className="space-y-2.5">
            {data.painPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[var(--rust)]/10 border border-[var(--rust)]/30 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--rust)] flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  className={inputCls}
                  placeholder={`Pain point ${i + 1}`}
                  value={p}
                  onChange={(e) => updatePain(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </Field>
      </div>

      <div className="flex justify-end px-6 py-4 border-t border-[var(--mist)] bg-[var(--paper)]/40">
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-sm font-bold transition-all ${
            isValid
              ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--rust)] hover:-translate-y-0.5 shadow-sm"
              : "bg-[var(--mist)] text-[var(--slate)] cursor-not-allowed"
          }`}
        >
          Next: Feature Entry →
        </button>
      </div>
    </div>
  );
}
```

---

### 6c. `components/KTForm/PartBForm.tsx` (NEW FILE)

```typescript
"use client";

import { useState } from "react";
import { PartB, FeatureEntry } from "@/lib/types";

interface Props {
  data: PartB;
  onChange: (data: PartB) => void;
  onBack: () => void;
  onNext: () => void;
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder-[var(--slate)] focus:outline-none focus:border-[var(--amber)] transition-colors";
const textareaCls = `${inputCls} resize-none`;

function newFeature(): FeatureEntry {
  return {
    id: Math.random().toString(36).slice(2),
    moduleName: "",
    feature: "",
    benefitL1: "",
    benefitL2: "",
    useCaseStory: "",
    techStory: "",
    traditionalWorkflow: "",
    knowledgeRetrieved: "",
  };
}

function FeatureCard({
  feature,
  index,
  onChange,
  onRemove,
  isOnly,
}: {
  feature: FeatureEntry;
  index: number;
  onChange: (f: FeatureEntry) => void;
  onRemove: () => void;
  isOnly: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const update = (key: keyof FeatureEntry, value: string) =>
    onChange({ ...feature, [key]: value });

  return (
    <div className="border border-[var(--mist)] rounded-xl overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-[var(--paper)] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-[var(--ink)] flex items-center justify-center text-xs font-mono font-bold text-[var(--amber)]">
            {index + 1}
          </span>
          <div>
            <span className="font-display text-sm font-semibold text-[var(--ink)]">
              {feature.moduleName || "Module Name"} · {feature.feature || "Feature Name"}
            </span>
            {!expanded && feature.benefitL1 && (
              <p className="text-xs text-[var(--slate)] truncate max-w-xs">{feature.benefitL1}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOnly && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-xs text-[var(--rust)] hover:underline px-2 py-1"
            >
              Remove
            </button>
          )}
          <span className="text-[var(--slate)] text-lg">{expanded ? "−" : "+"}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-[var(--mist)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-display font-semibold text-[var(--slate)] uppercase tracking-wider mb-1">Module Name</label>
              <input className={inputCls} placeholder="e.g., Invoicing, CRM, Dashboard" value={feature.moduleName} onChange={(e) => update("moduleName", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-display font-semibold text-[var(--slate)] uppercase tracking-wider mb-1">Feature (Inside-Out)</label>
              <input className={inputCls} placeholder="What did the product team build?" value={feature.feature} onChange={(e) => update("feature", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-display font-semibold text-[var(--amber)] uppercase tracking-wider mb-1">So What? → Ladder 1 (Benefit)</label>
              <input className={inputCls} placeholder="Practical advantage for the user" value={feature.benefitL1} onChange={(e) => update("benefitL1", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-display font-semibold text-[var(--amber)] uppercase tracking-wider mb-1">So What? → Ladder 2 (Value)</label>
              <input className={inputCls} placeholder="Why does that matter to their business?" value={feature.benefitL2} onChange={(e) => update("benefitL2", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-display font-semibold text-[var(--slate)] uppercase tracking-wider mb-1">Use Case Story</label>
            <textarea className={`${textareaCls} h-16`} placeholder='As a [User], I [Action] so that [Benefit].' value={feature.useCaseStory} onChange={(e) => update("useCaseStory", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-display font-semibold text-[var(--slate)] uppercase tracking-wider mb-1">Traditional Workflow (As-Is Pain)</label>
              <textarea className={`${textareaCls} h-16`} placeholder="How did the user struggle without this?" value={feature.traditionalWorkflow} onChange={(e) => update("traditionalWorkflow", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-display font-semibold text-[var(--slate)] uppercase tracking-wider mb-1">Knowledge Retrieved (Skill)</label>
              <textarea className={`${textareaCls} h-16`} placeholder="What domain/technical skill did you just aggregate?" value={feature.knowledgeRetrieved} onChange={(e) => update("knowledgeRetrieved", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-display font-semibold text-[var(--sage)] uppercase tracking-wider mb-1">Tech Story / Differentiator (Optional)</label>
            <input className={inputCls} placeholder="What technical magic makes this possible?" value={feature.techStory ?? ""} onChange={(e) => update("techStory", e.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PartBForm({ data, onChange, onBack, onNext }: Props) {
  const addFeature = () =>
    onChange({ features: [...data.features, newFeature()] });

  const updateFeature = (i: number, f: FeatureEntry) => {
    const next = [...data.features];
    next[i] = f;
    onChange({ features: next });
  };

  const removeFeature = (i: number) => {
    const next = data.features.filter((_, idx) => idx !== i);
    onChange({ features: next });
  };

  // Start with one empty card if none
  const features = data.features.length === 0 ? [] : data.features;
  const isValid = features.length >= 1 && features.every(
    (f) => f.moduleName.trim() && f.feature.trim() && f.benefitL1.trim() && f.useCaseStory.trim()
  );

  return (
    <div>
      <div className="bg-[var(--ink)] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--amber)] flex items-center justify-center">
          <span className="font-mono font-bold text-[var(--ink)] text-sm">B</span>
        </div>
        <div>
          <h2 className="font-display text-white font-bold text-lg">Part B — Feature Entry Form</h2>
          <p className="text-[var(--slate)] text-xs">The Inside-Out → Outside-In Bridge · One card per feature from your KT</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-mono text-[var(--amber)]">{features.length} feature{features.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {features.length === 0 && (
          <div className="text-center py-10 text-[var(--slate)]">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-display text-sm font-semibold mb-1">No features yet</p>
            <p className="text-xs">Add one feature card per tool or capability shown in your KT session.</p>
          </div>
        )}

        {features.map((f, i) => (
          <FeatureCard
            key={f.id}
            feature={f}
            index={i}
            onChange={(updated) => updateFeature(i, updated)}
            onRemove={() => removeFeature(i)}
            isOnly={features.length === 1}
          />
        ))}

        <button
          onClick={addFeature}
          className="w-full py-3 rounded-xl border-2 border-dashed border-[var(--mist)] text-[var(--slate)] text-sm font-display font-semibold hover:border-[var(--amber)] hover:text-[var(--amber)] transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Add Feature
        </button>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--mist)] bg-[var(--paper)]/40">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl border border-[var(--mist)] text-sm font-display font-semibold text-[var(--ink)] hover:bg-[var(--mist)] transition-colors">
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-sm font-bold transition-all ${
            isValid
              ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--rust)] hover:-translate-y-0.5 shadow-sm"
              : "bg-[var(--mist)] text-[var(--slate)] cursor-not-allowed"
          }`}
        >
          Next: Synthesis & Reflection →
        </button>
      </div>
    </div>
  );
}
```

---

### 6d. `components/KTForm/PartCForm.tsx` (NEW FILE)

```typescript
"use client";

import { PartC } from "@/lib/types";

interface Props {
  data: PartC;
  onChange: (data: PartC) => void;
  onBack: () => void;
  onSubmit: () => void;
  featureCount: number;
}

const textareaCls = "w-full px-4 py-3 rounded-xl border border-[var(--mist)] bg-[var(--paper)] text-sm text-[var(--ink)] placeholder-[var(--slate)] focus:outline-none focus:border-[var(--amber)] transition-colors resize-none h-24";

export default function PartCForm({ data, onChange, onBack, onSubmit, featureCount }: Props) {
  const update = (key: keyof PartC, value: string) => onChange({ ...data, [key]: value });

  const isValid =
    data.unlearnedAssumptions.trim().length > 10 &&
    data.governanceGuardrail.trim().length > 10 &&
    data.followUpGap.trim().length > 10;

  return (
    <div>
      <div className="bg-[var(--ink)] px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--amber)] flex items-center justify-center">
          <span className="font-mono font-bold text-[var(--ink)] text-sm">C</span>
        </div>
        <div>
          <h2 className="font-display text-white font-bold text-lg">Part C — Synthesis & Reflection</h2>
          <p className="text-[var(--slate)] text-xs">Wrap-up · What changed in your perspective after the KT?</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Summary bar */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--sage)]/8 border border-[var(--sage)]/20">
          <div className="w-7 h-7 rounded-full bg-[var(--sage)] flex items-center justify-center text-white text-xs">✓</div>
          <span className="text-sm text-[var(--ink)]">
            Ready to synthesize <strong>{featureCount} feature{featureCount !== 1 ? "s" : ""}</strong> across Parts A & B. Complete this reflection to unlock AI synthesis.
          </span>
        </div>

        <div>
          <label className="block font-display text-sm font-semibold text-[var(--ink)] mb-1">
            🔄 Unlearned Assumption
          </label>
          <p className="text-xs text-[var(--slate)] mb-2">What was a "myth" you held about this product/module before the KT?</p>
          <textarea
            className={textareaCls}
            placeholder='e.g., "I assumed GST filing was a separate process — turns out it\'s embedded in every invoice automatically."'
            value={data.unlearnedAssumptions}
            onChange={(e) => update("unlearnedAssumptions", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-display text-sm font-semibold text-[var(--ink)] mb-1">
            🛡️ The Governance Guardrail
          </label>
          <p className="text-xs text-[var(--slate)] mb-2">How does this product stop a user from making a critical mistake?</p>
          <textarea
            className={textareaCls}
            placeholder='e.g., "The system prevents duplicate invoice numbers and flags any GST mismatch before filing."'
            value={data.governanceGuardrail}
            onChange={(e) => update("governanceGuardrail", e.target.value)}
          />
        </div>

        <div>
          <label className="block font-display text-sm font-semibold text-[var(--ink)] mb-1">
            🔬 Follow-up / Study Gap
          </label>
          <p className="text-xs text-[var(--slate)] mb-2">What domain logic do you need to research to truly master this?</p>
          <textarea
            className={textareaCls}
            placeholder='e.g., "Need to study FIFO vs LIFO inventory valuation to understand the stock module deeply."'
            value={data.followUpGap}
            onChange={(e) => update("followUpGap", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--mist)] bg-[var(--paper)]/40">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl border border-[var(--mist)] text-sm font-display font-semibold text-[var(--ink)] hover:bg-[var(--mist)] transition-colors">
          ← Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!isValid}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-display text-sm font-bold transition-all ${
            isValid
              ? "bg-[var(--amber)] text-[var(--ink)] hover:brightness-95 hover:-translate-y-0.5 shadow-sm"
              : "bg-[var(--mist)] text-[var(--slate)] cursor-not-allowed"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate KT Synthesis
        </button>
      </div>
    </div>
  );
}
```

---

## Change 7 — `components/KTOutput.tsx` (MODIFY — add Synthesis sections)

After the existing Section 3 (Synthesis cards for assumptions/guardrails/gaps), add a **Section 4 block** for the AI-generated synthesis output. Also update the component's props type from `KTDocument` (old) to the new one.

### 7a. Update the import and prop type at the top of `KTOutput.tsx`

The `document` prop type stays `KTDocument` — but `KTDocument` now has a `synthesis` field. Destructure it.

### 7b. Add Section 4 — Value Clusters

Render `document.synthesis.valueClusters` as cards with pillar name, grouped features, and insight.

### 7c. Add Section 5 — Outside-In Narratives

Render `document.synthesis.narratives` — each as a bordered card with persona, features used, and the synthesis statement in a blockquote-style callout.

### 7d. Add Section 6 — So-What Chains

Render `document.synthesis.soWhatChains` — each feature as a vertical chain with numbered steps ending in a highlighted "True Insight" box.

### 7e. Add Section 7 — Final Review (3-Layer Story Stack)

Render `document.synthesis.finalReview` as a 2-column table mirroring the framework's output format:
- Product Promise
- Key Use Cases  
- Core Features
- So What Statement

### 7f. Update `generateMarkdown()` to include synthesis sections

Append clusters, narratives, chains, and final review to the exported markdown.

---

## LoadingState — Update step labels (minor)

In `components/LoadingState.tsx`, update the `STEPS` array to reflect synthesis steps:

```typescript
const STEPS = [
  "Running Value-Clustering Audit...",
  "Building Outside-In narrative...",
  "Running So-What stress test...",
  "Identifying the product engine...",
];
```

---

## File Tree After Changes

```
kt-agent/
├── app/
│   ├── api/kt-stream/route.ts     ← MODIFIED (formData input)
│   ├── globals.css                 (unchanged)
│   ├── layout.tsx                  (unchanged)
│   └── page.tsx                   ← REPLACED (form state machine)
├── components/
│   ├── Header.tsx                  (unchanged)
│   ├── KTForm/                    ← NEW FOLDER
│   │   ├── KTFormWizard.tsx       ← NEW
│   │   ├── PartAForm.tsx          ← NEW
│   │   ├── PartBForm.tsx          ← NEW
│   │   └── PartCForm.tsx          ← NEW
│   ├── InputPanel.tsx             ← DELETE
│   ├── KTOutput.tsx               ← MODIFY (add synthesis sections 4–7)
│   └── LoadingState.tsx           ← MODIFY (update step labels)
└── lib/
    ├── gemini.ts                  ← REPLACED (synthesis prompt + function)
    └── types.ts                   ← REPLACED (new form + synthesis types)
```

---

## User Flow After Changes

```
/ (page load)
  └── KTFormWizard [state: "form"]
        ├── Step A: PartAForm — product identity (4 fields + 5 pain points)
        ├── Step B: PartBForm — feature cards (add as many as needed)
        └── Step C: PartCForm — reflection (3 fields) → "Generate KT Synthesis"
              ↓
        [state: "loading"] — SSE stream from /api/kt-stream
              ↓ formData (PartA + PartB + PartC) sent as JSON
              ↓ Gemini synthesizes: value clusters, narratives, so-what chains, engine, final review
              ↓
        [state: "complete"] — KTOutput renders
              ├── Section 1: Strategic Context (from form)
              ├── Section 2: Feature Table (from form)
              ├── Section 3: Reflection (from form)
              ├── Section 4: Value Clusters (AI synthesis)
              ├── Section 5: Outside-In Narratives (AI synthesis)
              ├── Section 6: So-What Chains (AI synthesis)
              └── Section 7: Final Review — 3-Layer Story Stack (AI synthesis)
```
