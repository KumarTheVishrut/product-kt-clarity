export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--mist)] bg-[var(--paper)]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-[var(--ink)] rounded-lg rotate-3" />
            <div className="absolute inset-0 bg-[var(--amber)] rounded-lg -rotate-3 flex items-center justify-center">
              <span className="font-display font-800 text-[var(--ink)] text-xs tracking-tight">KT</span>
            </div>
          </div>
          <div>
            <span className="font-display font-700 text-[var(--ink)] text-lg tracking-tight">KT Agent</span>
            <span className="ml-2 text-xs text-[var(--slate)] font-mono hidden sm:inline">v1.0 · Powered by Gemini</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--mist)] bg-white/60">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] animate-pulse" />
            <span className="text-xs text-[var(--slate)] font-mono">gemini-2.0-flash</span>
          </div>
        </div>
      </div>
    </header>
  );
}
