import { useEffect, useState } from "react";

interface AlphaFoldResult {
  gene: string;
  uniprot_id: string | null;
  alphafold_page: string;
  structure_url: string | null;
}

interface ProteinViewerProps {
  geneName: string;
  onClose: () => void;
}

export default function ProteinViewer({ geneName, onClose }: ProteinViewerProps) {
  const [data, setData] = useState<AlphaFoldResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"mol" | "info">("mol");

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://127.0.0.1:8000/alphafold/${encodeURIComponent(geneName)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((result: AlphaFoldResult) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("AlphaFold fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [geneName]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col border border-[color:var(--bio-cyan)]/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--bio-cyan)]/20 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">
              PROTEIN STRUCTURE VIEWER · ALPHAFOLD DB
            </div>
            <h3 className="font-mono text-xl text-glow-green mt-1">
              {geneName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10 text-[color:var(--foreground)] transition-colors"
          >
            CLOSE ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[color:var(--bio-cyan)]/20 shrink-0">
          <button
            onClick={() => setViewMode("mol")}
            className={`font-mono text-xs px-4 py-2 transition-colors ${
              viewMode === "mol"
                ? "border-b-2 border-[color:var(--bio-cyan)] text-[color:var(--bio-cyan)]"
                : "text-[color:var(--muted-foreground)] hover:text-white"
            }`}
          >
            3D STRUCTURE
          </button>
          <button
            onClick={() => setViewMode("info")}
            className={`font-mono text-xs px-4 py-2 transition-colors ${
              viewMode === "info"
                ? "border-b-2 border-[color:var(--bio-cyan)] text-[color:var(--bio-cyan)]"
                : "text-[color:var(--muted-foreground)] hover:text-white"
            }`}
          >
            RESIDUE INFO
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {loading && (
            <div className="h-full flex items-center justify-center">
              <div className="relative w-24 h-24" style={{ perspective: "600px" }}>
                <div
                  className="absolute inset-0 border border-[color:var(--bio-cyan)]/50 rounded-full spin-slow"
                  style={{ boxShadow: "0 0 20px #00D4FF" }}
                />
                <div
                  className="absolute inset-4 border border-[color:var(--bio-green)]/50 rounded-full spin-rev"
                  style={{ boxShadow: "0 0 20px #00FF88" }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-[color:var(--bio-cyan)]">
                  LOADING
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center">
                <div className="font-mono text-[color:var(--bio-magenta)] mb-2">
                  ⚠ STRUCTURE UNAVAILABLE
                </div>
                <p className="font-mono text-sm text-[color:var(--muted-foreground)]">
                  Could not fetch AlphaFold structure for <strong>{geneName}</strong>.
                  <br />
                  {error}
                </p>
                <a
                  href={`https://alphafold.ebi.ac.uk/search?q=${encodeURIComponent(geneName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 font-mono text-xs px-4 py-2 border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/10 transition-colors"
                >
                  SEARCH ALPHAFOLD DB ↗
                </a>
              </div>
            </div>
          )}

          {data && !loading && !error && viewMode === "mol" && (
            <div className="h-full flex flex-col">
              {/* 3D Structure Viewer — AlphaFold embed is blocked by X-Frame-Options.
                  Open in external viewer via dedicated button. */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative w-32 h-32 mb-6" style={{ perspective: "600px" }}>
                  <div
                    className="absolute inset-0 border-2 border-[color:var(--bio-cyan)]/60 rounded-full spin-slow"
                    style={{ boxShadow: "0 0 30px rgba(0,212,255,0.3)" }}
                  />
                  <div
                    className="absolute inset-3 border-2 border-[color:var(--bio-green)]/60 rounded-full spin-rev"
                    style={{ boxShadow: "0 0 30px rgba(0,255,136,0.3)" }}
                  />
                  <div
                    className="absolute inset-7 border-2 border-[color:var(--bio-magenta)]/60 rounded-full spin-slow"
                    style={{ boxShadow: "0 0 30px rgba(255,0,170,0.3)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="font-mono text-3xl text-[color:var(--bio-cyan)]">🧬</div>
                  </div>
                </div>
                <div className="font-mono text-sm text-[color:var(--bio-cyan)] mb-2">
                  3D PROTEIN STRUCTURE
                </div>
                <div className="font-mono text-xs text-[color:var(--muted-foreground)] mb-2">
                  {data.uniprot_id ? `UniProt: ${data.uniprot_id}` : "UniProt ID not available"}
                </div>
                <p className="font-mono text-[10px] text-[color:var(--muted-foreground)] max-w-md mb-6">
                  {data.uniprot_id
                    ? "The AlphaFold 3D structure viewer cannot be embedded directly due to browser security policies. Open it in the full interactive viewer below."
                    : "No AlphaFold entry found for this gene. Search the database manually."}
                </p>
                <div className="flex gap-3 flex-wrap justify-center">
                  {data.uniprot_id ? (
                    <>
                      <a
                        href={`https://alphafold.ebi.ac.uk/entry/${data.uniprot_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs px-4 py-2.5 border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/10 transition-colors"
                      >
                        🔬 OPEN 3D MOL* VIEWER ↗
                      </a>
                      <a
                        href={`https://www.uniprot.org/uniprotkb/${data.uniprot_id}/entry`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs px-4 py-2.5 border border-[color:var(--bio-green)]/40 text-[color:var(--bio-green)] hover:bg-[color:var(--bio-green)]/10 transition-colors"
                      >
                        📋 UNIPROT ENTRY ↗
                      </a>
                    </>
                  ) : (
                    <a
                      href={`https://alphafold.ebi.ac.uk/search?q=${encodeURIComponent(geneName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs px-4 py-2.5 border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/10 transition-colors"
                    >
                      🔍 SEARCH ALPHAFOLD DB ↗
                    </a>
                  )}
                </div>
                <div className="mt-6 flex items-center gap-4 font-mono text-[10px] text-[color:var(--muted-foreground)]">
                  <span>🖱 Drag to rotate</span>
                  <span>🖱 Scroll to zoom</span>
                  <span>🖱 Right-drag to pan</span>
                  <span>🖱 Click residues for info</span>
                </div>
              </div>
            </div>
          )}

          {data && !loading && !error && viewMode === "info" && (
            <div className="h-full overflow-y-auto p-6 space-y-4">
              <div className="glass rounded-lg p-4">
                <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">
                  GENE INFORMATION
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div>
                    <span className="text-[color:var(--bio-cyan)]">Gene:</span>{" "}
                    <span className="text-white">{data.gene}</span>
                  </div>
                  <div>
                    <span className="text-[color:var(--bio-cyan)]">UniProt ID:</span>{" "}
                    <span className="text-[color:var(--bio-green)]">
                      {data.uniprot_id || "Not available"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[color:var(--bio-cyan)]">Source:</span>{" "}
                    <span className="text-white">
                      AlphaFold Protein Structure Database (EBI)
                    </span>
                  </div>
                  <div>
                    <span className="text-[color:var(--bio-cyan)]">Method:</span>{" "}
                    <span className="text-white">
                      AlphaFold2 (DeepMind) — state-of-the-art protein structure prediction
                    </span>
                  </div>
                  <div>
                    <span className="text-[color:var(--bio-cyan)]">Confidence:</span>{" "}
                    <span className="text-[color:var(--bio-green)]">
                      pLDDT scores available on AlphaFold DB
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-lg p-4">
                <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">
                  HOW TO USE
                </div>
                <ul className="space-y-1 font-mono text-xs text-[color:var(--muted-foreground)]">
                  <li>• Switch to <strong className="text-white">3D STRUCTURE</strong> tab to explore the protein</li>
                  <li>• <strong className="text-white">Drag</strong> to rotate the structure</li>
                  <li>• <strong className="text-white">Scroll</strong> to zoom in/out</li>
                  <li>• <strong className="text-white">Click</strong> on residues to see amino acid details</li>
                  <li>• <strong className="text-white">Right-click + drag</strong> to pan</li>
                  <li>• The structure is colored by pLDDT confidence score</li>
                </ul>
              </div>

              {data.uniprot_id && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">
                    QUICK ACTIONS
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={data.alphafold_page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/10 transition-colors"
                    >
                      VIEW ON ALPHAFOLD DB ↗
                    </a>
                    <a
                      href={`https://www.uniprot.org/uniprotkb/${data.uniprot_id}/entry`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-green)]/40 text-[color:var(--bio-green)] hover:bg-[color:var(--bio-green)]/10 transition-colors"
                    >
                      OPEN IN UNIPROT ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}