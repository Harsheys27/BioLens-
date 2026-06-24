import { useState } from "react";

interface PatientTwinProps {
  onClose: () => void;
}

export default function PatientTwinPanel({ onClose }: PatientTwinProps) {
  const [age, setAge] = useState(65);
  const [sex, setSex] = useState("Male");
  const [weight, setWeight] = useState("");
  const [conditions, setConditions] = useState("Hypertension, Diabetes");
  const [familyHistory, setFamilyHistory] = useState("");
  const [genes, setGenes] = useState("APOE4");
  const [medications, setMedications] = useState("Lisinopril, Metformin");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/patient/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age,
          sex,
          weight: weight ? parseFloat(weight) : null,
          conditions: conditions.split(",").map((s) => s.trim()).filter(Boolean),
          family_history: familyHistory.split(",").map((s) => s.trim()).filter(Boolean),
          genes: genes.split(",").map((s) => s.trim()).filter(Boolean),
          current_medications: medications.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const riskColor = (level: string) =>
    level === "high" ? "#FF0055" : level === "moderate" ? "#FFB800" : "#00FF88";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col border border-[color:var(--bio-cyan)]/30">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--bio-cyan)]/20 shrink-0">
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">PATIENT DIGITAL TWIN</div>
            <h3 className="font-mono text-xl text-glow-green mt-1">Generate Risk Profile</h3>
          </div>
          <button onClick={onClose} className="font-mono text-xs px-3 py-1.5 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10 text-[color:var(--foreground)]">CLOSE ×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">AGE</label>
              <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value) || 0)} className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-2 font-mono text-sm text-white mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">SEX</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-2 font-mono text-sm text-white mt-1">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">WEIGHT (kg, optional)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-2 font-mono text-sm text-white mt-1" placeholder="70" />
            </div>
            <div>
              <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">GENES (comma-separated)</label>
              <input value={genes} onChange={(e) => setGenes(e.target.value)} className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-2 font-mono text-sm text-white mt-1" placeholder="APOE4, BRCA1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">CONDITIONS (comma-separated)</label>
              <input value={conditions} onChange={(e) => setConditions(e.target.value)} className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-2 font-mono text-sm text-white mt-1" placeholder="Hypertension, Diabetes" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">FAMILY HISTORY (comma-separated)</label>
              <input value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-2 font-mono text-sm text-white mt-1" placeholder="Alzheimer's, Heart Disease" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono text-[color:var(--bio-cyan)]">CURRENT MEDICATIONS (comma-separated)</label>
              <input value={medications} onChange={(e) => setMedications(e.target.value)} className="w-full bg-black/40 border border-[color:var(--bio-cyan)]/30 rounded p-2 font-mono text-sm text-white mt-1" placeholder="Lisinopril, Metformin" />
            </div>
          </div>
          <button onClick={submit} disabled={loading} className="w-full font-mono text-sm px-6 py-3 rounded bg-[color:var(--bio-cyan)]/20 text-[color:var(--bio-cyan)] border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/30 transition-all">
            {loading ? "GENERATING DIGITAL TWIN…" : "GENERATE DIGITAL TWIN ▶"}
          </button>

          {/* Results */}
          {result && (
            <div className="space-y-4 mt-6">
              <div className="glass rounded-lg p-4">
                <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-2">DIGITAL TWIN ID: {result.digital_twin_id}</div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-mono" style={{ color: riskColor(result.risk_profile.overall_risk.level) }}>
                    {result.risk_profile.overall_risk.score.toFixed(2)}
                  </div>
                  <div>
                    <div className="font-mono text-sm" style={{ color: riskColor(result.risk_profile.overall_risk.level) }}>
                      {result.risk_profile.overall_risk.level.toUpperCase()} RISK
                    </div>
                    <div className="text-xs font-mono text-[color:var(--muted-foreground)]">{result.risk_profile.explanation}</div>
                  </div>
                </div>
              </div>

              {result.risk_profile.factors.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">RISK FACTORS</div>
                  {result.risk_profile.factors.map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
                      <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: riskColor(f.impact) }} />
                      <div>
                        <div className="font-mono text-xs text-white">{f.factor}</div>
                        <div className="font-mono text-[10px] text-[color:var(--muted-foreground)]">{f.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.disease_probabilities.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">DISEASE PROBABILITIES</div>
                  {result.disease_probabilities.map((dp: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="flex-1">
                        <div className="font-mono text-xs text-white">{dp.disease}</div>
                        <div className="font-mono text-[10px] text-[color:var(--muted-foreground)]">{dp.evidence}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-black/40 rounded overflow-hidden">
                          <div className="h-full rounded" style={{ width: `${dp.probability * 100}%`, background: dp.probability > 0.5 ? "#FF0055" : dp.probability > 0.25 ? "#FFB800" : "#00FF88" }} />
                        </div>
                        <span className="font-mono text-xs text-white w-10 text-right">{(dp.probability * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.drug_interactions?.interactions?.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">DRUG INTERACTIONS</div>
                  {result.drug_interactions.interactions.map((ix: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0 font-mono text-xs">
                      <span className="text-[color:var(--bio-cyan)]">{ix.drug_1}</span>
                      <span className="text-[color:var(--muted-foreground)]">+</span>
                      <span className="text-[color:var(--bio-cyan)]">{ix.drug_2}</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px]" style={{ background: ix.severity === "high" ? "#FF005522" : ix.severity === "moderate" ? "#FFB80022" : "#00FF8822", color: ix.severity === "high" ? "#FF0055" : ix.severity === "moderate" ? "#FFB800" : "#00FF88" }}>
                        {ix.severity.toUpperCase()}
                      </span>
                      <span className="text-[color:var(--muted-foreground)] ml-auto text-[10px]">{ix.recommendation?.slice(0, 40)}…</span>
                    </div>
                  ))}
                </div>
              )}

              {result.treatment_recommendations?.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">TREATMENT RECOMMENDATIONS</div>
                  {result.treatment_recommendations.map((r: any, i: number) => (
                    <div key={i} className="py-1.5 border-b border-white/5 last:border-0 font-mono text-xs">
                      <span className="text-[color:var(--bio-green)]">{r.drug}</span>
                      <span className="text-[color:var(--muted-foreground)]"> → {r.condition} (score: {r.pathway_score})</span>
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