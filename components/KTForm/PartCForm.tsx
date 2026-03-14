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
          <p className="text-xs text-[var(--slate)] mb-2">What was a &quot;myth&quot; you held about this product/module before the KT?</p>
          <textarea
            className={textareaCls}
            placeholder='e.g., "I assumed GST filing was a separate process — turns out it&apos;s embedded in every invoice automatically."'
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
