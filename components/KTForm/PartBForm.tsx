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

  const features = data.features;
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
