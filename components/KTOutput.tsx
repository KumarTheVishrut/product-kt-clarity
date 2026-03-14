"use client";

import { KTDocument } from "@/lib/types";
import { useState } from "react";

interface KTOutputProps {
  document: KTDocument;
  onReset: () => void;
}

function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 bg-[var(--ink)] rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-xs font-bold text-[var(--amber)]">{number}</span>
      </div>
      <div>
        <h2 className="font-display text-lg font-700 text-[var(--ink)]">{title}</h2>
      </div>
      <div className="flex-1 h-px bg-[var(--mist)]" />
    </div>
  );
}

export default function KTOutput({ document, onReset }: KTOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(document, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMD = () => {
    const md = generateMarkdown(document);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `kt-document-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-8 pb-16 stagger-child">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[var(--sage)]" />
            <span className="text-xs font-mono text-[var(--sage)] font-medium uppercase tracking-wider">KT Document Generated</span>
          </div>
          <h2 className="font-display text-2xl font-700 text-[var(--ink)]">{document.natureOfProduct}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMD}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--mist)] bg-white text-sm font-display font-600 text-[var(--ink)] hover:border-[var(--amber)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export MD
          </button>
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--mist)] bg-white text-sm font-display font-600 text-[var(--ink)] hover:border-[var(--amber)] transition-all"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-[var(--sage)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy JSON
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--ink)] text-[var(--paper)] text-sm font-display font-700 hover:bg-[var(--rust)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.243m-4.243 0H12m0 0V8m0 4H7.757" />
            </svg>
            New KT
          </button>
        </div>
      </div>

      {/* Section 1: Strategic Context */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] p-6 mb-5 stagger-child">
        <SectionLabel number="01" title="Strategic Context — The Right to Exist" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--paper)] border border-[var(--mist)]">
              <div className="text-xs font-mono text-[var(--slate)] uppercase tracking-wider mb-1">Nature of Product</div>
              <div className="font-display font-600 text-[var(--ink)]">{document.natureOfProduct}</div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--amber)]/8 border border-[var(--amber)]/20">
              <div className="text-xs font-mono text-[var(--amber)] uppercase tracking-wider mb-1">Product Promise — The Big Why</div>
              <div className="font-display font-600 text-[var(--ink)] leading-snug">{document.productPromise}</div>
            </div>
          </div>

          {/* North Star */}
          <div className="p-4 rounded-xl bg-[var(--ink)] border border-[var(--ink)] flex flex-col justify-between">
            <div className="text-xs font-mono text-[var(--amber)] uppercase tracking-wider mb-2">⭐ North Star Metric</div>
            <div className="font-display text-xl font-700 text-[var(--paper)] leading-snug">{document.northStarMetric}</div>
            <div className="text-xs text-[var(--slate)] mt-3">The single most important metric this product improves</div>
          </div>
        </div>

        {/* Pain Points */}
        <div className="mt-5">
          <div className="text-xs font-mono text-[var(--slate)] uppercase tracking-wider mb-3">Top 5 Pain Points (The Villain)</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
            {document.painPoints.map((pain, i) => (
              <div
                key={i}
                className="flex gap-2.5 p-3 rounded-xl border border-[var(--rust)]/20 bg-[var(--rust)]/5"
              >
                <span className="font-mono text-xs text-[var(--rust)] font-bold flex-shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-xs text-[var(--ink)] leading-relaxed">{pain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Feature Deconstruction Table */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] overflow-hidden mb-5 stagger-child">
        <div className="p-6 pb-4">
          <SectionLabel number="02" title="Feature Deconstruction Table" />
          <p className="text-xs text-[var(--slate)] -mt-3 mb-0 font-mono">
            {document.features.length} features analyzed
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="kt-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Module</th>
                <th style={{ width: "140px" }}>Feature</th>
                <th style={{ width: "180px" }}>So What? L1 (Benefit)</th>
                <th style={{ width: "180px" }}>So What? L2 (Value)</th>
                <th style={{ width: "200px" }}>Use Case Story</th>
                <th style={{ width: "180px" }}>Traditional Workflow</th>
                <th style={{ width: "180px" }}>Knowledge Retrieved</th>
              </tr>
            </thead>
            <tbody>
              {document.features.map((row, i) => (
                <tr key={i}>
                  <td>
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-[var(--ink)] text-[var(--paper)] text-xs font-display font-600 whitespace-nowrap">
                      {row.moduleName}
                    </span>
                  </td>
                  <td className="font-display font-600 text-[var(--ink)]">{row.feature}</td>
                  <td>
                    <div className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[var(--amber)] mt-1.5 flex-shrink-0" />
                      <span className="text-[var(--ink)]">{row.benefitL1}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[var(--sage)] mt-1.5 flex-shrink-0" />
                      <span className="text-[var(--sage)] font-medium">{row.benefitL2}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-[var(--slate)] italic">{row.useCaseStory}</span>
                  </td>
                  <td>
                    <div className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[var(--rust)] mt-1.5 flex-shrink-0" />
                      <span className="text-[var(--slate)]">{row.traditionalWorkflow}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-[var(--ink)]">{row.knowledgeRetrieved}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Reflection */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] p-6 mb-5 stagger-child">
        <SectionLabel number="03" title="Unlearning & Reflection — The Footer" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SynthesisCard
            icon="🔄"
            color="amber"
            title="Assumptions Challenged"
            content={document.assumptionsChallenged}
          />
          <SynthesisCard
            icon="🔬"
            color="rust"
            title="Follow-up / Study Gap"
            content={document.followUpGap}
          />
          <SynthesisCard
            icon="🛡️"
            color="sage"
            title="Governance Guardrail"
            content={document.governanceGuardrail}
          />
        </div>
      </div>

      {/* Section 4: Value Clusters */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] p-6 mb-5 stagger-child">
        <SectionLabel number="04" title="Value Clusters — Strategic Pillars" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {document.synthesis.valueClusters.map((cluster, i) => (
            <div key={i} className="p-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--ink)]/3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-[var(--ink)] flex items-center justify-center text-[var(--amber)] text-xs font-mono font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="font-display text-sm font-bold text-[var(--ink)]">{cluster.pillarName}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {cluster.features.map((f, fi) => (
                  <span key={fi} className="px-2 py-0.5 rounded-full bg-[var(--amber)]/15 text-[var(--amber)] text-xs font-mono border border-[var(--amber)]/30">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[var(--slate)] leading-relaxed">{cluster.insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Outside-In Narratives */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] p-6 mb-5 stagger-child">
        <SectionLabel number="05" title="Outside-In Narratives — Persona Stories" />
        <div className="space-y-4">
          {document.synthesis.narratives.map((n, i) => (
            <div key={i} className="border border-[var(--sage)]/20 rounded-xl overflow-hidden">
              <div className="bg-[var(--sage)]/8 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--sage)] flex items-center justify-center text-white text-xs font-bold">
                  {n.persona.charAt(0)}
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-[var(--ink)]">{n.persona}</div>
                  <div className="text-xs text-[var(--slate)]">{n.productPromiseLink}</div>
                </div>
                <div className="ml-auto flex flex-wrap gap-1">
                  {n.featuresUsed.map((f, fi) => (
                    <span key={fi} className="px-2 py-0.5 rounded-full bg-[var(--sage)]/15 text-[var(--sage)] text-[10px] font-mono border border-[var(--sage)]/30">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-4">
                <div className="border-l-4 border-[var(--sage)] pl-4 py-1">
                  <p className="text-sm text-[var(--ink)] leading-relaxed italic">&ldquo;{n.synthesisStatement}&rdquo;</p>
                </div>
                {n.useCases.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {n.useCases.map((uc, ui) => (
                      <span key={ui} className="text-xs text-[var(--slate)] bg-[var(--mist)] rounded-lg px-2 py-1">{uc}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: So-What Chains */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] p-6 mb-5 stagger-child">
        <SectionLabel number="06" title="So-What Chains — Business Truth" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {document.synthesis.soWhatChains.map((chain, i) => (
            <div key={i} className="border border-[var(--mist)] rounded-xl p-4">
              <div className="font-display text-sm font-bold text-[var(--ink)] mb-3 pb-2 border-b border-[var(--mist)]">
                {chain.feature}
              </div>
              <div className="space-y-2 mb-3">
                {chain.chain.map((step, si) => (
                  <div key={si} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--amber)]/15 text-[var(--amber)] text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {si + 1}
                    </span>
                    <span className="text-xs text-[var(--slate)] leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-[var(--rust)]/8 border border-[var(--rust)]/20">
                <div className="text-[10px] font-mono text-[var(--rust)] uppercase tracking-wider mb-1">True Insight</div>
                <p className="text-xs text-[var(--ink)] font-medium leading-relaxed">{chain.trueInsight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7: Final Review */}
      <div className="bg-white rounded-2xl border border-[var(--mist)] p-6 mb-5 stagger-child">
        <SectionLabel number="07" title="Final Review — 3-Layer Story Stack" />

        <div className="p-4 mb-4 rounded-xl bg-[var(--ink)]/4 border border-[var(--ink)]/10">
          <div className="text-xs font-mono text-[var(--slate)] uppercase tracking-wider mb-1">Product Engine</div>
          <p className="text-sm font-display font-semibold text-[var(--ink)]">{document.synthesis.engineIdentified}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--amber)]/8 border border-[var(--amber)]/20">
            <div className="text-xs font-mono text-[var(--amber)] uppercase tracking-wider mb-2">Product Promise</div>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{document.synthesis.finalReview.productPromise}</p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--sage)]/8 border border-[var(--sage)]/20">
            <div className="text-xs font-mono text-[var(--sage)] uppercase tracking-wider mb-2">Key Use Cases</div>
            <ul className="space-y-1">
              {document.synthesis.finalReview.keyUseCases.map((uc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--ink)]">
                  <span className="text-[var(--sage)] font-bold flex-shrink-0">→</span>
                  {uc}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[var(--mist)] border border-[var(--mist)]">
            <div className="text-xs font-mono text-[var(--slate)] uppercase tracking-wider mb-2">Core Features</div>
            <div className="flex flex-wrap gap-1.5">
              {document.synthesis.finalReview.coreFeatures.map((f, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-white border border-[var(--mist)] text-xs font-display text-[var(--ink)]">{f}</span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--rust)]/8 border border-[var(--rust)]/20">
            <div className="text-xs font-mono text-[var(--rust)] uppercase tracking-wider mb-2">So What Statement</div>
            <p className="text-sm font-display font-semibold text-[var(--ink)] leading-relaxed italic">
              &ldquo;{document.synthesis.finalReview.soWhatStatement}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-[var(--slate)] font-mono">
          Generated with KT Agent · Universal Product KT Deconstruction Framework · Powered by Google Gemini
        </p>
      </div>
    </div>
  );
}

function SynthesisCard({
  icon,
  color,
  title,
  content,
}: {
  icon: string;
  color: "amber" | "rust" | "sage";
  title: string;
  content: string;
}) {
  const colorMap = {
    amber: "border-[var(--amber)]/30 bg-[var(--amber)]/5",
    rust: "border-[var(--rust)]/30 bg-[var(--rust)]/5",
    sage: "border-[var(--sage)]/30 bg-[var(--sage)]/5",
  };

  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="font-display text-sm font-700 text-[var(--ink)]">{title}</span>
      </div>
      <p className="text-sm text-[var(--ink)] leading-relaxed">{content}</p>
    </div>
  );
}

function generateMarkdown(doc: KTDocument): string {
  const lines = [
    `# Product KT Document`,
    ``,
    `## Section 1: Strategic Context`,
    ``,
    `**Nature of Product:** ${doc.natureOfProduct}`,
    `**Product Promise:** ${doc.productPromise}`,
    `**North Star Metric:** ${doc.northStarMetric}`,
    ``,
    `### Top 5 Pain Points`,
    ...doc.painPoints.map((p, i) => `${i + 1}. ${p}`),
    ``,
    `## Section 2: Feature Deconstruction Table`,
    ``,
    `| Module | Feature | So What L1 | So What L2 | Use Case | Traditional Workflow | Knowledge Retrieved |`,
    `|--------|---------|------------|------------|----------|---------------------|---------------------|`,
    ...doc.features.map(
      (f) =>
        `| ${f.moduleName} | ${f.feature} | ${f.benefitL1} | ${f.benefitL2} | ${f.useCaseStory} | ${f.traditionalWorkflow} | ${f.knowledgeRetrieved} |`
    ),
    ``,
    `## Section 3: Reflection`,
    ``,
    `**Assumptions Challenged:** ${doc.assumptionsChallenged}`,
    ``,
    `**Follow-up Gap:** ${doc.followUpGap}`,
    ``,
    `**Governance Guardrail:** ${doc.governanceGuardrail}`,
    ``,
    `## Section 4: Value Clusters`,
    ``,
    ...doc.synthesis.valueClusters.flatMap((c) => [
      `### ${c.pillarName}`,
      `Features: ${c.features.join(", ")}`,
      ``,
      c.insight,
      ``,
    ]),
    `## Section 5: Outside-In Narratives`,
    ``,
    ...doc.synthesis.narratives.flatMap((n) => [
      `### ${n.persona}`,
      `**Promise:** ${n.productPromiseLink}`,
      ``,
      `> ${n.synthesisStatement}`,
      ``,
    ]),
    `## Section 6: So-What Chains`,
    ``,
    ...doc.synthesis.soWhatChains.flatMap((c) => [
      `### ${c.feature}`,
      ...c.chain.map((s, i) => `${i + 1}. ${s}`),
      ``,
      `**True Insight:** ${c.trueInsight}`,
      ``,
    ]),
    `## Section 7: Final Review`,
    ``,
    `**Engine:** ${doc.synthesis.engineIdentified}`,
    ``,
    `**Product Promise:** ${doc.synthesis.finalReview.productPromise}`,
    ``,
    `**Key Use Cases:**`,
    ...doc.synthesis.finalReview.keyUseCases.map((uc) => `- ${uc}`),
    ``,
    `**Core Features:** ${doc.synthesis.finalReview.coreFeatures.join(", ")}`,
    ``,
    `**So What Statement:** ${doc.synthesis.finalReview.soWhatStatement}`,
    ``,
    `---`,
    `*Generated by KT Agent · Powered by Google Gemini*`,
  ];

  return lines.join("\n");
}
