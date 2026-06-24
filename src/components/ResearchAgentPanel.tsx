import { useState, useEffect, useRef } from "react";

// ============================================================
// Progressive Section Component
// ============================================================
function Section({
  title,
  children,
  delay,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
  defaultOpen?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <div
      className="glass rounded-lg border border-[color:var(--bio-cyan)]/20 overflow-hidden transition-all duration-500"
      style={{ animation: "fadeSlideIn 0.5s ease-out" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 font-mono text-xs text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/5 transition-colors"
      >
        <span className="tracking-wider">{title}</span>
        <span className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

// ============================================================
// Loading Spinner
// ============================================================
function PulseSpinner() {
  return (
    <div className="flex items-center gap-2 py-4">
      <div className="flex gap-1">
        <div
          className="w-2 h-2 rounded-full bg-[color:var(--bio-cyan)]"
          style={{ animation: "pulse 1s ease-in-out infinite" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[color:var(--bio-green)]"
          style={{ animation: "pulse 1s ease-in-out 0.2s infinite" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[color:var(--bio-magenta)]"
          style={{ animation: "pulse 1s ease-in-out 0.4s infinite" }}
        />
      </div>
      <span className="font-mono text-xs text-[color:var(--bio-cyan)]">
        Agent running...
      </span>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ResearchAgentPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamPhase, setStreamPhase] = useState(0);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const EXAMPLE_QUESTIONS = [
    "Find Alzheimer's drug candidates",
    "Why is APOE4 dangerous?",
    "Find hypertension repurposing drugs",
    "How does Donepezil work?",
    "Find diabetes treatment candidates",
    "What pathways are involved in Alzheimer's?",
    "Find breast cancer drug candidates",
  ];

  // Cleanup stream timer
  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  const submit = async (q?: string) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setStreamPhase(0);

    // Simulate progressive loading (like Perplexity)
    streamTimer.current = setInterval(() => {
      setStreamPhase((p) => Math.min(p + 1, 7));
    }, 400);

    try {
      const res = await fetch("http://127.0.0.1:8000/research_agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Server error ${res.status}: ${errText}`);
      }
      const data = await res.json();
      setResult(data);
      if (streamTimer.current) clearInterval(streamTimer.current);
      setStreamPhase(7);
    } catch (err: any) {
      console.error("Research agent error:", err);
      setError(err.message || "Unknown error occurred");
      if (streamTimer.current) clearInterval(streamTimer.current);
    }
    setLoading(false);
  };

  const phases = [
    "Understanding query...",
    "Searching Neo4j knowledge graph...",
    "Retrieving external literature...",
    "Computing graph intelligence scores...",
    "Building reasoning chains...",
    "Summarizing literature...",
    "Generating research report...",
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass rounded-lg w-full max-w-5xl max-h-[94vh] flex flex-col border border-[color:var(--bio-cyan)]/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--bio-cyan)]/20 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">
              AUTONOMOUS RESEARCH AGENT v3.0
            </div>
            <h3 className="font-mono text-xl text-glow-green mt-1">
              BioLens Biomedical Intelligence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10 text-[color:var(--foreground)]"
          >
            CLOSE ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Example questions */}
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => submit(q)}
                disabled={loading}
                className="text-[11px] font-mono px-3 py-1.5 rounded border border-[color:var(--bio-cyan)]/30 text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/10 transition-all disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ask BioLens... e.g. Find Alzheimer's drug candidates"
              className="flex-1 bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-3 font-mono text-sm text-white placeholder:text-white/30"
            />
            <button
              onClick={() => submit()}
              disabled={loading}
              className="font-mono text-sm px-6 py-3 rounded bg-[color:var(--bio-cyan)]/20 text-[color:var(--bio-cyan)] border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/30 transition-all shrink-0 disabled:opacity-40"
            >
              {loading ? "…" : "RESEARCH ▶"}
            </button>
          </div>

          {/* Error state */}
          {error && !loading && (
            <div className="glass rounded-lg p-6 border border-red-500/30 text-center">
              <div className="font-mono text-sm text-red-400 mb-2">
                ⚠ RESEARCH AGENT ERROR
              </div>
              <div className="font-mono text-xs text-[color:var(--muted-foreground)] mb-4">
                {error}
              </div>
              <p className="font-mono text-[10px] text-[color:var(--muted-foreground)]">
                Verify the backend server is running at http://127.0.0.1:8000 and Neo4j is accessible.
              </p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-2">
              <PulseSpinner />
              <div className="font-mono text-[10px] text-[color:var(--bio-cyan)]/60">
                {phases[Math.min(streamPhase, phases.length - 1)]}
              </div>
              <div className="w-full h-0.5 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[color:var(--bio-cyan)] to-[color:var(--bio-green)] transition-all duration-500"
                  style={{
                    width: `${(streamPhase / phases.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Results */}
          {result && !error && (
            <div className="space-y-3">
              {/* Methodology badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[color:var(--bio-green)]/40 text-[color:var(--bio-green)]">
                  Intent: {result.intent}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)]">
                  GNN Ready: {result.gnn_status ? "✓" : "—"}
                </span>
                <span className="text-[10px] font-mono text-[color:var(--muted-foreground)]">
                  Generated: {result.generated_at
                    ? new Date(result.generated_at).toLocaleTimeString()
                    : ""}
                </span>
              </div>

              {/* Executive Summary */}
              <Section title="📋 EXECUTIVE SUMMARY" delay={200}>
                <p className="font-mono text-sm text-white leading-relaxed">
                  {result.summary}
                </p>
                <p className="font-mono text-[10px] text-[color:var(--muted-foreground)] mt-2">
                  {result.methodology}
                </p>
              </Section>

              {/* Candidate Drugs */}
              <Section title="💊 CANDIDATE DRUGS" delay={400}>
                {result.candidate_drugs?.length > 0 ? (
                  <div className="space-y-2">
                    {result.candidate_drugs.map((drug: any, i: number) => (
                      <div
                        key={i}
                        className="glass rounded p-3 flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="font-mono text-sm text-glow-green">
                            #{i + 1} {drug.drug}
                          </div>
                          <div className="font-mono text-[10px] text-[color:var(--muted-foreground)] mt-1">
                            {drug.mechanism}
                          </div>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-[color:var(--bio-cyan)]/30 text-[color:var(--bio-cyan)]">
                              {drug.phase}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-yellow-500/30 text-yellow-400">
                              {drug.evidence_level}
                            </span>
                          </div>
                          {drug.genes?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {drug.genes.map((g: string) => (
                                <span
                                  key={g}
                                  className="text-[9px] font-mono px-1 py-0.5 rounded bg-[color:var(--bio-cyan)]/10 text-[color:var(--bio-cyan)]"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-mono text-xl text-glow-cyan">
                            {Math.round(drug.score * 100)}%
                          </div>
                          <div className="font-mono text-[9px] text-[color:var(--muted-foreground)]">
                            confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No candidate drugs found in knowledge graph. Try a different
                    query or expand the knowledge graph.
                  </div>
                )}
              </Section>

              {/* Confidence Scores */}
              {result.confidence_scores?.length > 0 && (
                <Section title="📊 CONFIDENCE SCORES" delay={600}>
                  <div className="space-y-2">
                    {result.confidence_scores.map((cs: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="font-mono text-xs text-white w-16">
                          #{cs.rank} {cs.drug}
                        </span>
                        <div className="flex-1 h-4 bg-black/40 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[color:var(--bio-cyan)] to-[color:var(--bio-green)]"
                            style={{ width: `${cs.score * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[color:var(--bio-green)] w-12 text-right">
                          {Math.round(cs.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Genes */}
              <Section title="🧬 GENES INVOLVED" delay={800}>
                {result.genes?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.genes.map((gene: string, i: number) => (
                      <span
                        key={i}
                        className="font-mono text-xs px-3 py-1.5 rounded border border-[color:var(--bio-green)]/30 text-[color:var(--bio-green)] hover:bg-[color:var(--bio-green)]/10 cursor-default"
                        style={{
                          boxShadow: "0 0 8px rgba(0,255,136,0.15)",
                        }}
                      >
                        {gene}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No genes identified.
                  </div>
                )}
              </Section>

              {/* Pathways */}
              <Section title="🔬 PATHWAYS" delay={1000}>
                {result.pathways?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.pathways.map((pw: string, i: number) => (
                      <span
                        key={i}
                        className="font-mono text-xs px-3 py-1.5 rounded border border-purple-400/30 text-purple-400"
                      >
                        {pw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No pathways identified.
                  </div>
                )}
              </Section>

              {/* Reasoning Chain */}
              <Section title="🔗 REASONING CHAINS" delay={1200}>
                {result.reasoning_chain?.length > 0 ? (
                  <div className="space-y-3">
                    {result.reasoning_chain.map((chain: any, i: number) => (
                      <div
                        key={i}
                        className="glass rounded p-3 border-l-2"
                        style={{
                          borderLeftColor: "var(--bio-cyan)",
                        }}
                      >
                        <div className="font-mono text-xs text-[color:var(--bio-cyan)] mb-2">
                          {chain.chain}
                        </div>
                        {chain.steps?.map((step: string, j: number) => (
                          <div
                            key={j}
                            className="font-mono text-[11px] text-[color:var(--foreground)] ml-4 py-0.5"
                          >
                            {j + 1}. {step}
                          </div>
                        ))}
                        {chain.graph_evidence && (
                          <div className="font-mono text-[9px] text-[color:var(--bio-green)] mt-2 ml-4 opacity-70">
                            ⟐ {chain.graph_evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No reasoning chains generated.
                  </div>
                )}
              </Section>

              {/* Knowledge Graph Paths */}
              <Section title="🕸️ KNOWLEDGE GRAPH PATHS" delay={1400}>
                {result.graph_paths?.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto space-y-1">
                    {result.graph_paths.map((path: any, i: number) => (
                      <div
                        key={i}
                        className="font-mono text-[10px] py-1.5 px-2 border-b border-white/5 last:border-0"
                      >
                        {path.disease && path.gene && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[color:var(--bio-magenta)]">
                              {path.disease}
                            </span>
                            <span className="text-[color:var(--bio-cyan)]">
                              → ASSOCIATED_WITH →
                            </span>
                            <span className="text-[color:var(--bio-green)]">
                              {path.gene}
                            </span>
                            {path.drugs?.length > 0 && (
                              <>
                                <span className="text-[color:var(--bio-cyan)]">
                                  → TARGETED_BY →
                                </span>
                                <span className="text-[color:var(--bio-cyan)]">
                                  {path.drugs.join(", ")}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        {path.drug_detail && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[color:var(--bio-cyan)]">
                              💊 {path.drug_detail.drug}
                            </span>
                            <span className="text-[color:var(--muted-foreground)]">
                              {path.drug_detail.mechanism || "Unknown mechanism"}
                            </span>
                            <span className="text-yellow-400">
                              {path.drug_detail.phase}
                            </span>
                          </div>
                        )}
                        {path.error && (
                          <span className="text-red-400">{path.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No graph paths traversed.
                  </div>
                )}
              </Section>

              {/* Supporting Papers */}
              <Section title="📚 SUPPORTING PAPERS" delay={1600}>
                {result.papers?.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {result.papers.map((paper: any, i: number) => (
                      <a
                        key={i}
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block glass rounded p-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[color:var(--bio-cyan)]/10 text-[color:var(--bio-cyan)]">
                            {paper.source}
                          </span>
                          <span className="text-[9px] font-mono text-[color:var(--muted-foreground)]">
                            {paper.type}
                          </span>
                          <span className="text-[9px] font-mono text-[color:var(--bio-green)]">
                            {paper.year}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-white">
                          {paper.title}
                        </div>
                        <div className="font-mono text-[10px] text-[color:var(--muted-foreground)] mt-1">
                          {paper.description}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No papers retrieved.
                  </div>
                )}
              </Section>

              {/* Citations */}
              <Section title="📝 CITATIONS & REFERENCES" delay={1800}>
                {result.citations?.length > 0 ? (
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {result.citations.map((cite: string, i: number) => (
                      <div
                        key={i}
                        className="font-mono text-[10px] py-1 text-[color:var(--foreground)] border-b border-white/5 last:border-0"
                      >
                        [{i + 1}] {cite}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No citations available.
                  </div>
                )}
              </Section>

              {/* Literature Summary */}
              {result.literature_summary && (
                <Section title="📖 LITERATURE SUMMARY" delay={2000}>
                  <p className="font-mono text-xs text-white mb-3">
                    {result.literature_summary.summary}
                  </p>
                  <div className="space-y-2">
                    {result.literature_summary.key_findings?.map(
                      (finding: string, i: number) => (
                        <div
                          key={i}
                          className="font-mono text-[11px] text-[color:var(--foreground)] flex items-start gap-2"
                        >
                          <span className="text-[color:var(--bio-green)] mt-0.5">
                            ●
                          </span>
                          {finding}
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[color:var(--bio-cyan)]">
                      Sources: {result.literature_summary.source_count}
                    </span>
                    <span className="text-[10px] font-mono text-[color:var(--bio-cyan)]">
                      Citations: {result.literature_summary.citation_count}
                    </span>
                  </div>
                </Section>
              )}

              {/* Research Gaps */}
              <Section title="⚠️ RESEARCH GAPS" delay={2200}>
                {result.research_gaps?.length > 0 ? (
                  <div className="space-y-2">
                    {result.research_gaps.map((gap: string, i: number) => (
                      <div
                        key={i}
                        className="font-mono text-[11px] text-[color:var(--warning)] flex items-start gap-2"
                      >
                        <span className="mt-0.5">⚠</span>
                        <span>{gap}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No research gaps identified.
                  </div>
                )}
              </Section>

              {/* Future Directions */}
              <Section title="🚀 FUTURE DIRECTIONS" delay={2400}>
                {result.future_directions?.length > 0 ? (
                  <div className="space-y-2">
                    {result.future_directions.map(
                      (direction: string, i: number) => (
                        <div
                          key={i}
                          className="font-mono text-[11px] text-[color:var(--foreground)] flex items-start gap-2"
                        >
                          <span className="text-[color:var(--bio-cyan)] mt-0.5">
                            →
                          </span>
                          <span>{direction}</span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="font-mono text-xs text-[color:var(--muted-foreground)]">
                    No future directions available.
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}