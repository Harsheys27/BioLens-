import { useState } from "react";

export default function DrugInteractionPanel({ onClose }: { onClose: () => void }) {
  const [drugInput, setDrugInput] = useState("Lisinopril, Metformin, Atorvastatin");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const drugs = drugInput.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("http://127.0.0.1:8000/drug_interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs }),
      });
      setResult(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const severityColor = (s: string) =>
    s === "high" ? "#FF0055" : s === "moderate" ? "#FFB800" : s === "low" ? "#00FF88" : "#888";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col border border-[color:var(--bio-cyan)]/30">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--bio-cyan)]/20 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">DRUG INTERACTION ENGINE</div>
            <h3 className="font-mono text-xl text-glow-green mt-1">Check Drug Combinations</h3>
          </div>
          <button onClick={onClose} className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10 text-[color:var(--foreground)]">CLOSE ×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">ENTER DRUGS (comma-separated)</label>
            <input
              value={drugInput}
              onChange={(e) => setDrugInput(e.target.value)}
              className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-3 font-mono text-sm text-white mt-1"
              placeholder="Lisinopril, Metformin, Atorvastatin"
            />
          </div>
          <button onClick={submit} disabled={loading} className="w-full font-mono text-sm px-6 py-3 rounded bg-[color:var(--bio-cyan)]/20 text-[color:var(--bio-cyan)] border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/30 transition-all">
            {loading ? "ANALYZING…" : "CHECK INTERACTIONS ▶"}
          </button>

          {result && (
            <div className="space-y-4 mt-4">
              {result.warnings?.length > 0 && (
                <div className="glass rounded-lg p-4 border border-red-500/20">
                  <div className="text-[10px] font-mono text-red-400 mb-3">⚠ WARNINGS ({result.warnings.length})</div>
                  {result.warnings.map((w: any, i: number) => (
                    <div key={i} className="py-2 border-b border-red-500/10 last:border-0">
                      <div className="font-mono text-xs text-red-400">{w.drug_1} + {w.drug_2}</div>
                      <div className="font-mono text-[10px] text-[color:var(--muted-foreground)] mt-1">{w.recommendation}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="glass rounded-lg p-4">
                <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">INTERACTION MATRIX</div>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-[color:var(--bio-cyan)]">Drug 1</th>
                        <th className="text-left py-2 text-[color:var(--bio-cyan)]">Drug 2</th>
                        <th className="text-left py-2 text-[color:var(--bio-cyan)]">Severity</th>
                        <th className="text-left py-2 text-[color:var(--bio-cyan)]">Mechanism</th>
                        <th className="text-left py-2 text-[color:var(--bio-cyan)]">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.interactions?.map((ix: any, i: number) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-2 text-[color:var(--bio-cyan)]">{ix.drug_1}</td>
                          <td className="py-2 text-[color:var(--bio-cyan)]">{ix.drug_2}</td>
                          <td className="py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: severityColor(ix.severity) + "22", color: severityColor(ix.severity) }}>{ix.severity.toUpperCase()}</span>
                          </td>
                          <td className="py-2 text-[color:var(--muted-foreground)] max-w-[200px] truncate">{ix.mechanism}</td>
                          <td className="py-2 text-[color:var(--muted-foreground)] max-w-[200px] truncate">{ix.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {result.safe_combinations?.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-green)] mb-3">✓ SAFE COMBINATIONS</div>
                  {result.safe_combinations.map((sc: any, i: number) => (
                    <div key={i} className="font-mono text-xs py-1 text-[color:var(--foreground)]">
                      {sc.drug_1} + {sc.drug_2} <span className="text-[color:var(--bio-green)]">({sc.severity})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}