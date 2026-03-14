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
