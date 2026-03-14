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
          <p className="text-[var(--slate)] text-xs">The &quot;Outside-In&quot; Strategy · Set the context once per product</p>
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
