"use client";

import { useState } from "react";
import { KTFormData, PartA, PartB, PartC } from "@/lib/types";
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
