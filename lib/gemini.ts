import { GoogleGenAI } from "@google/genai";
import { KTFormData, KTDocument, SynthesisOutput } from "./types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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

  const result = await genAI.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.7, topP: 0.9, maxOutputTokens: 4096 },
  });
  let fullText = "";

  for await (const chunk of result) {
    fullText += chunk.text ?? "";
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
