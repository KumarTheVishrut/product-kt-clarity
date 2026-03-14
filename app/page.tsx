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
