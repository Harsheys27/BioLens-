import { useEffect, useState } from "react";

export default function MutationPanel({ geneName, onClose }: { geneName: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/mutations/${encodeURIComponent(geneName)}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [geneName]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col border border-[color:var(--bio-cyan)]/30">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--bio-cyan)]/20 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">MUTATION LAYER</div>
            <h3 className="font-mono text-xl text-glow-green mt-1">{geneName} Variants</h3>
          </div>
          <button onClick={onClose} className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10 text-[color:var(--foreground)]">CLOSE ×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-[color:var(--bio-cyan)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              {data.mutations?.length > 0 ? (
                data.mutations.map((m: any, i: number) => {
                  const riskColor = m.risk_score > 0.8 ? "#FF0055" : m.risk_score > 0.5 ? "#FFB800" : "#00FF88";
                  return (
                    <div key={i} className="glass rounded-lg p-4" style={{ borderLeft: `3px solid ${riskColor}` }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-sm text-white">{m.name}</div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: riskColor, color: riskColor }}>{m.type || "Unknown"}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)]">Score: {m.risk_score}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-mono" style={{ color: riskColor }}>{(m.risk_score * 100).toFixed(0)}%</div>
                          <div className="text-[10px] font-mono text-[color:var(--muted-foreground)]">RISK</div>
                        </div>
                      </div>
                      {m.effect && <div className="font-mono text-xs text-[color:var(--muted-foreground)] mt-3">{m.effect}</div>}
                    </div>
                  );
                })
              ) : (
                <div className="glass rounded-lg p-4 text-center font-mono text-sm text-[color:var(--muted-foreground)]">
                  No known mutations in database for {geneName}
                </div>
              )}

              {data.affected_proteins?.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-2">AFFECTED PROTEINS</div>
                  {data.affected_proteins.map((p: string, i: number) => (
                    <div key={i} className="font-mono text-xs py-1 text-[color:var(--foreground)]">• {p}</div>
                  ))}
                </div>
              )}

              {data.diseases?.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-2">LINKED DISEASES</div>
                  {data.diseases.map((d: string, i: number) => (
                    <div key={i} className="font-mono text-xs py-1 text-[color:var(--bio-magenta)]">• {d}</div>
                  ))}
                </div>
              )}

              {data.drugs?.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-2">TARGETING DRUGS</div>
                  {data.drugs.map((dr: string, i: number) => (
                    <div key={i} className="font-mono text-xs py-1 text-[color:var(--bio-green)]">• {dr}</div>
                  ))}
                </div>
              )}

              <div className="text-[10px] font-mono text-[color:var(--muted-foreground)]">
                Source: {data.source || "BioLens Mutation Database"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}