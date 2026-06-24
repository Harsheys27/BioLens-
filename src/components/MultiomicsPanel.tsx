import { useEffect, useState } from "react";

type TabType =
  | "transcript"
  | "protein"
  | "metabolite"
  | "epigenetic";

type MultiomicsData = {
  transcripts?: string[];
  expression_levels?: number[];
  upregulated?: boolean;
  downregulated?: boolean;
  expression_score?: number;

  proteins?: string[];
  protein_level?: number;
  targeted_by?: string[];
  source?: string;

  metabolites?: string[];
  pathways?: string[];
  signatures?: string[];

  methylation_status?: string;
  histone_modifications?: string[];
  regulatory_effect?: string;
};

interface Props {
  geneName: string;
  onClose: () => void;
}

export default function MultiomicsPanel({
  geneName,
  onClose,
}: Props) {
  const [tab, setTab] = useState<TabType>("transcript");
  const [data, setData] = useState<MultiomicsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const endpointMap: Record<TabType, string> = {
    transcript: `multiomics/transcript/${geneName}`,
    protein: `multiomics/protein/${geneName}`,
    metabolite: `multiomics/metabolite/${geneName}`,
    epigenetic: `multiomics/epigenetic/${geneName}`,
  };

  const fetchData = async (selectedTab: TabType) => {
    try {
      setLoading(true);
      setError("");
      setData(null);

      const res = await fetch(
        `http://127.0.0.1:8000/${endpointMap[selectedTab]}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      setData(json);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
  };

  useEffect(() => {
    fetchData(tab);
  }, [tab, geneName]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col border border-[color:var(--bio-cyan)]/30">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--bio-cyan)]/20">
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">
              MULTIOMICS LAYER
            </div>

            <h3 className="font-mono text-xl text-glow-green mt-1">
              {geneName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10"
          >
            CLOSE ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[color:var(--bio-cyan)]/20">
          {(
            [
              "transcript",
              "protein",
              "metabolite",
              "epigenetic",
            ] as TabType[]
          ).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`font-mono text-xs px-4 py-3 capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-cyan-400 text-cyan-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t === "transcript" && "Transcriptomics"}
              {t === "protein" && "Proteomics"}
              {t === "metabolite" && "Metabolomics"}
              {t === "epigenetic" && "Epigenomics"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {loading && (
            <div className="text-center py-12 text-cyan-400 font-mono">
              Loading...
            </div>
          )}

          {error && (
            <div className="text-red-400 font-mono">
              {error}
            </div>
          )}

          {!loading && data && (
            <div className="space-y-5">

              {/* TRANSCRIPT */}
              {tab === "transcript" && (
                <div className="glass p-4 rounded-lg">
                  <h4 className="font-mono text-cyan-400 mb-4">
                    TRANSCRIPTOMICS
                  </h4>

                  <div className="space-y-2 font-mono text-xs">
                    <div>
                      Transcripts:
                      {" "}
                      {data.transcripts?.join(", ") || "N/A"}
                    </div>

                    <div>
                      Expression Score:
                      {" "}
                      {Number(
                        data.expression_score ?? 0
                      ).toFixed(3)}
                    </div>

                    <div>
                      Upregulated:
                      {" "}
                      {data.upregulated ? "YES" : "NO"}
                    </div>

                    <div>
                      Downregulated:
                      {" "}
                      {data.downregulated ? "YES" : "NO"}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {data.expression_levels?.map((level, i) => (
                      <div key={i}>
                        <div className="text-xs mb-1">
                          {data.transcripts?.[i] ??
                            `Transcript ${i + 1}`}
                        </div>

                        <div className="h-3 bg-black rounded overflow-hidden">
                          <div
                            className="h-full bg-cyan-400"
                            style={{
                              width: `${Math.min(
                                level * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROTEIN */}
              {tab === "protein" && (
                <div className="glass p-4 rounded-lg">
                  <h4 className="font-mono text-cyan-400 mb-4">
                    PROTEOMICS
                  </h4>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      Proteins:
                      {" "}
                      {data.proteins?.join(", ") || "N/A"}
                    </div>

                    <div>
                      Protein Level:
                      {" "}
                      {Number(data.protein_level ?? 0).toFixed(3)}
                    </div>

                    <div>
                      Targeted By:
                      {" "}
                      {data.targeted_by?.join(", ") || "None"}
                    </div>

                    <div>
                      Source:
                      {" "}
                      {data.source ?? "Unknown"}
                    </div>
                  </div>
                </div>
              )}

              {/* METABOLITE */}
              {tab === "metabolite" && (
                <div className="glass p-4 rounded-lg">
                  <h4 className="font-mono text-cyan-400 mb-4">
                    METABOLOMICS
                  </h4>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      Metabolites:
                      {" "}
                      {data.metabolites?.join(", ") || "None"}
                    </div>

                    <div>
                      Pathways:
                      {" "}
                      {data.pathways?.join(", ") || "None"}
                    </div>

                    <div>
                      Signatures:
                      {" "}
                      {data.signatures?.join(", ") || "None"}
                    </div>
                  </div>
                </div>
              )}

              {/* EPIGENETIC */}
              {tab === "epigenetic" && (
                <div className="glass p-4 rounded-lg">
                  <h4 className="font-mono text-cyan-400 mb-4">
                    EPIGENOMICS
                  </h4>

                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      Methylation:
                      {" "}
                      {data.methylation_status ?? "Unknown"}
                    </div>

                    <div>
                      Histone Marks:
                      {" "}
                      {data.histone_modifications?.join(", ") || "None"}
                    </div>

                    <div>
                      Regulatory Effect:
                      {" "}
                      {data.regulatory_effect ?? "None"}
                    </div>
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