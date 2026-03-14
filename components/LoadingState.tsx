interface LoadingStateProps {
  message: string;
}

const STEPS = [
  "Running Value-Clustering Audit...",
  "Building Outside-In narrative...",
  "Running So-What stress test...",
  "Identifying the product engine...",
];

export default function LoadingState({ message }: LoadingStateProps) {
  const currentStep = STEPS.findIndex((s) => s === message);

  return (
    <div className="max-w-lg mx-auto mt-24 text-center">
      {/* Animated orb */}
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-[var(--amber)]/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-2 rounded-full bg-[var(--amber)]/30 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
        <div className="relative w-20 h-20 rounded-full bg-[var(--ink)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--amber)] animate-spin" style={{ animationDuration: "3s" }} fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3M5.636 5.636l2.121 2.121M16.243 16.243l2.121 2.121M5.636 18.364l2.121-2.121M16.243 7.757l2.121-2.121"/>
          </svg>
        </div>
      </div>

      <h3 className="font-display text-2xl font-700 text-[var(--ink)] mb-2">
        KT Agent at Work
      </h3>
      <p className="text-[var(--slate)] text-sm mb-8 font-mono">{message}</p>

      {/* Progress steps */}
      <div className="space-y-3 text-left">
        {STEPS.map((step, i) => {
          const isDone = currentStep > i;
          const isActive = currentStep === i;
          const isPending = currentStep < i;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? "bg-[var(--amber)]/10 border border-[var(--amber)]/30" :
                isDone ? "bg-[var(--sage)]/8 border border-[var(--sage)]/20" :
                "bg-white/40 border border-[var(--mist)]"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDone ? "bg-[var(--sage)]" :
                isActive ? "bg-[var(--amber)]" :
                "bg-[var(--mist)]"
              }`}>
                {isDone ? (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[var(--slate)]" />
                )}
              </div>
              <span className={`text-sm ${
                isActive ? "text-[var(--ink)] font-600 font-display" :
                isDone ? "text-[var(--sage)]" :
                isPending ? "text-[var(--slate)]" : ""
              }`}>
                {step}
              </span>
              {isActive && (
                <div className="ml-auto shimmer w-16 h-3 rounded" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
