import { useState } from "react";

interface SearchResult {
  gene: string;
  similarity_score: number;
  diseases: string[];
  drugs: string[];
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  algorithm?: string;
  message?: string;
  error?: string;
}

interface DNASearchPanelProps {
  onSelectGene?: (geneName: string) => void;
}

export default function DNASearchPanel({ onSelectGene }: DNASearchPanelProps) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/sequence_search?q=${encodeURIComponent(trimmed)}`
      );
      const data: SearchResponse = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.message) {
        setError(data.message);
      } else {
        setResults(data.results || []);
        setAlgorithm(data.algorithm || null);
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-lg border border-[color:var(--bio-cyan)]/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[color:var(--bio-cyan)]/20">
        <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest mb-1">
          DNA SEQUENCE SEARCH
        </div>
        <h3 className="font-mono text-lg text-glow-green">
          Find Genes by Sequence
        </h3>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative glass rounded-md p-2 flex items-center gap-2">
          <span className="font-mono text-[color:var(--bio-green)] pl-2">🧬</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Enter DNA sequence or gene fragment... e.g. ATCGGATCG"
            className="flex-1 bg-transparent outline-none font-mono text-sm text-[color:var(--foreground)] placeholder:text-white/25 py-2"
          />
          <button
            onClick={search}
            disabled={loading}
            className="font-mono text-xs px-4 py-2 rounded border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/10 transition-colors disabled:opacity-40"
          >
            {loading ? "SEARCHING…" : "SEARCH"}
          </button>
        </div>
        <p className="font-mono text-[10px] text-[color:var(--muted-foreground)] mt-2">
          Uses Jaccard + substring + prefix similarity. BLAST integration ready.
        </p>
      </div>

      {/* Results */}
      <div className="border-t border-[color:var(--bio-cyan)]/20">
        {loading && (
          <div className="p-8 text-center font-mono text-sm text-[color:var(--bio-cyan)]">
            Searching knowledge graph…
          </div>
        )}

        {error && searched && !loading && (
          <div className="p-8 text-center">
            <div className="font-mono text-[color:var(--bio-magenta)] text-sm mb-1">
              ⚠ {error}
            </div>
            <p className="font-mono text-xs text-[color:var(--muted-foreground)]">
              Try a longer sequence or different characters
            </p>
          </div>
        )}

        {!loading && !error && results.length === 0 && searched && (
          <div className="p-8 text-center font-mono text-sm text-[color:var(--muted-foreground)]">
            No results found for "{input}"
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="p-4 space-y-3">
            {algorithm && (
              <div className="text-[10px] font-mono text-[color:var(--muted-foreground)] mb-3">
                Algorithm: {algorithm}
              </div>
            )}

            {results.map((result, idx) => (
              <div
                key={result.gene}
                className="glass rounded-md p-4 border border-[color:var(--bio-cyan)]/10 hover:border-[color:var(--bio-cyan)]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-[color:var(--muted-foreground)]">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => onSelectGene && onSelectGene(result.gene)}
                        className="font-mono text-base text-glow-green hover:underline cursor-pointer"
                      >
                        {result.gene}
                      </button>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded border"
                        style={{
                          borderColor: result.similarity_score > 0.5 ? "#00FF88" : result.similarity_score > 0.25 ? "#FFB800" : "#FF00AA",
                          color: result.similarity_score > 0.5 ? "#00FF88" : result.similarity_score > 0.25 ? "#FFB800" : "#FF00AA",
                        }}
                      >
                        {(result.similarity_score * 100).toFixed(1)}% match
                      </span>
                    </div>

                    {/* Score bar */}
                    <div className="w-full h-1.5 bg-black/40 rounded mt-2 overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(result.similarity_score * 100).toFixed(1)}%`,
                          background: result.similarity_score > 0.5
                            ? "linear-gradient(90deg, #00FF88, #00D4FF)"
                            : result.similarity_score > 0.25
                            ? "linear-gradient(90deg, #FFB800, #FF00AA)"
                            : "#FF00AA",
                        }}
                      />
                    </div>

                    {/* Associated Diseases */}
                    {result.diseases.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-[color:var(--bio-magenta)]">
                          DISEASES:
                        </span>
                        {result.diseases.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] font-mono px-2 py-0.5 rounded border border-[color:var(--bio-magenta)]/40 text-[color:var(--bio-magenta)]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Associated Drugs */}
                    {result.drugs.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] text-[color:var(--bio-cyan)]">
                          DRUGS:
                        </span>
                        {result.drugs.map((d) => (
                          <span
                            key={d}
                            className="text-[10px] font-mono px-2 py-0.5 rounded border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)]"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && !searched && (
        <div className="p-8 text-center font-mono text-xs text-[color:var(--muted-foreground)]">
          Enter a DNA sequence or gene name fragment to find matching genes,
          associated diseases, and targeting drugs from the BioLens knowledge graph.
        </div>
      )}
    </div>
  );
}