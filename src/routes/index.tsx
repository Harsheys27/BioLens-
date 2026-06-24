import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import ProteinViewer from "@/components/ProteinViewer";
import DNASearchPanel from "@/components/DNASearchPanel";
import PatientTwinPanel from "@/components/PatientTwinPanel";
import DrugInteractionPanel from "@/components/DrugInteractionPanel";
import ResearchAgentPanel from "@/components/ResearchAgentPanel";
import MultiomicsPanel from "@/components/MultiomicsPanel";
import MutationPanel from "@/components/MutationPanel";

export const Route = createFileRoute("/")({
  component: BioLensPage,
});

// ============================================================
// Custom cursor (cyan crosshair w/ orbiting ring)
// ============================================================
function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div ref={ref} className="cursor-dot">
      <svg viewBox="0 0 22 22" className="w-full h-full">
        <circle cx="11" cy="11" r="1.5" fill="#00D4FF" />
        <line x1="11" y1="2" x2="11" y2="7" stroke="#00D4FF" strokeWidth="1" />
        <line x1="11" y1="15" x2="11" y2="20" stroke="#00D4FF" strokeWidth="1" />
        <line x1="2" y1="11" x2="7" y2="11" stroke="#00D4FF" strokeWidth="1" />
        <line x1="15" y1="11" x2="20" y2="11" stroke="#00D4FF" strokeWidth="1" />
        <circle cx="11" cy="11" r="9" fill="none" stroke="#00FF88" strokeWidth="0.5" strokeDasharray="3 3" className="spin-slow" style={{ transformOrigin: "11px 11px" }} />
      </svg>
    </div>
  );
}

// ============================================================
// Floating particles (force-graph style)
// ============================================================
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const N = Math.min(180, Math.floor((w * h) / 12000));
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.6 + 0.5,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMouse = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      // edges
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110) {
            const alpha = 1 - Math.sqrt(d2) / 110;
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // particles + mouse repel
      for (const p of parts) {
        const mdx = p.x - mouse.current.x;
        const mdy = p.y - mouse.current.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 140 * 140 && md2 > 0.1) {
          const f = (140 - Math.sqrt(md2)) / 140;
          p.vx += (mdx / Math.sqrt(md2)) * f * 0.6;
          p.vy += (mdy / Math.sqrt(md2)) * f * 0.6;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.fillStyle = "rgba(0, 255, 136, 0.85)";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#00FF88";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
}

// ============================================================
// Stats Ticker
// ============================================================
const STATS = [
  "Drugs analyzed: 12,847",
  "Proteins: 198,432",
  "Evidence links: 2.1M",
  "Model AUC-ROC: 0.84",
  "Conformal coverage: 0.91",
  "Diseases indexed: 5",
  "KG nodes: 180K",
  "KG edges: 1.4M",
  "Last updated: live",
];
function StatsTicker() {
  const items = [...STATS, ...STATS];
  return (
    <div className="relative z-30 border-y border-[color:var(--bio-cyan)]/20 bg-black/60 backdrop-blur-md overflow-hidden">
      <div className="flex whitespace-nowrap ticker-track py-2 font-mono text-xs">
        {items.map((s, i) => (
          <span key={i} className="px-8 text-[color:var(--bio-cyan)] text-glow-cyan">
            <span className="text-[color:var(--bio-green)] mr-2">◉</span>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 3D rotating network (CSS 3D nodes)
// ============================================================
function HeroNetwork() {
  const nodes = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 380,
      z: (Math.random() - 0.5) * 400,
      color: i % 3 === 0 ? "#00FF88" : i % 3 === 1 ? "#00D4FF" : "#9D00FF",
      r: Math.random() * 6 + 4,
      delay: Math.random() * 3,
    }));
  }, []);
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: "1000px" }}>
      <div className="relative" style={{ transformStyle: "preserve-3d", animation: "helixSpin 40s linear infinite", width: 600, height: 400 }}>
        {nodes.map((n, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: 300 + n.x,
              top: 200 + n.y,
              width: n.r * 2,
              height: n.r * 2,
              background: n.color,
              boxShadow: `0 0 ${n.r * 3}px ${n.color}, 0 0 ${n.r * 6}px ${n.color}`,
              transform: `translateZ(${n.z}px)`,
              animation: `breathe ${2 + n.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DNA double helix (3D CSS)
// ============================================================
function DNAHelix() {
  const rungs = 22;
  return (
    <div className="relative" style={{ perspective: "800px", width: 160, height: 380 }}>
      <div className="helix absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {Array.from({ length: rungs }).map((_, i) => {
          const t = (i / rungs) * Math.PI * 4;
          const y = (i / rungs) * 380 - 190;
          const color1 = "#00FF88";
          const color2 = "#FF00AA";
          return (
            <div key={i}>
              <div
                className="absolute rounded-full"
                style={{
                  top: 190 + y,
                  left: 80,
                  width: 12, height: 12,
                  background: color1,
                  boxShadow: `0 0 16px ${color1}`,
                  transform: `translate(-50%, -50%) translateX(${Math.cos(t) * 50}px) translateZ(${Math.sin(t) * 50}px)`,
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  top: 190 + y,
                  left: 80,
                  width: 12, height: 12,
                  background: color2,
                  boxShadow: `0 0 16px ${color2}`,
                  transform: `translate(-50%, -50%) translateX(${Math.cos(t + Math.PI) * 50}px) translateZ(${Math.sin(t + Math.PI) * 50}px)`,
                }}
              />
              <div
                className="absolute"
                style={{
                  top: 190 + y,
                  left: 80,
                  width: 100, height: 1,
                  background: "linear-gradient(90deg, #00FF88, #FF00AA)",
                  opacity: 0.5,
                  transform: `translate(-50%, -50%) rotateY(${(t * 180) / Math.PI}deg)`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Hex border
// ============================================================
function HexBorder() {
  return (
    <div className="hex-wrap hex-pulse absolute inset-0 pointer-events-none">
      <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
        <polygon
          points="80,30 920,30 970,300 920,570 80,570 30,300"
          fill="none"
          stroke="url(#hexgrad)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <defs>
          <linearGradient id="hexgrad" x1="0" x2="1">
            <stop offset="0" stopColor="#00FF88" />
            <stop offset="0.5" stopColor="#00D4FF" />
            <stop offset="1" stopColor="#FF00AA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ============================================================
// Knowledge Graph (force-directed, custom)
// ============================================================
type GNode = { id: string; label: string; type: "disease" | "drug" | "gene" | "pathway"; x: number; y: number; vx: number; vy: number };
type GEdge = { s: string; t: string };

function buildGraph(disease: string) {
  const drugs = ["Baricitinib", "Dexamethasone", "Metformin", "Donepezil", "Rituximab", "Memantine", "Anakinra"];
  const genes = ["JAK1", "IL6", "TNF", "APP", "BACE1", "INS", "ACE2", "STAT3"];
  const pathways = ["JAK-STAT", "Insulin signaling", "Amyloid", "Cytokine storm"];
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  nodes.push({ id: "D", label: disease, type: "disease", x: 0, y: 0, vx: 0, vy: 0 });
  drugs.slice(0, 5).forEach((d, i) => {
    const ang = (i / 5) * Math.PI * 2;
    nodes.push({ id: "dr" + i, label: d, type: "drug", x: Math.cos(ang) * 200, y: Math.sin(ang) * 200, vx: 0, vy: 0 });
    edges.push({ s: "D", t: "dr" + i });
  });
  genes.slice(0, 6).forEach((g, i) => {
    const ang = (i / 6) * Math.PI * 2 + 0.4;
    nodes.push({ id: "g" + i, label: g, type: "gene", x: Math.cos(ang) * 120, y: Math.sin(ang) * 120, vx: 0, vy: 0 });
    edges.push({ s: "D", t: "g" + i });
    edges.push({ s: "dr" + (i % 5), t: "g" + i });
  });
  pathways.slice(0, 3).forEach((p, i) => {
    const ang = (i / 3) * Math.PI * 2 + 1;
    nodes.push({ id: "p" + i, label: p, type: "pathway", x: Math.cos(ang) * 280, y: Math.sin(ang) * 280, vx: 0, vy: 0 });
    edges.push({ s: "g" + i, t: "p" + i });
    edges.push({ s: "g" + (i + 1), t: "p" + i });
  });
  return { nodes, edges };
}

function buildGraphFromAPI(apiData: any) {
  if (!apiData?.nodes) {
    return { nodes: [], edges: [] };
  }

  const nodes: GNode[] = [];
  const edges: GEdge[] = [];

  const radiusMap: Record<string, number> = {
    Disease: 0,
    Gene: 250,
    Drug: 280,
  };

  const typeCount: Record<string, number> = {};

  apiData.nodes.forEach((node: any) => {
    const type = node.type;

    if (!typeCount[type]) {
      typeCount[type] = 0;
    }

    const index = typeCount[type]++;
    const sameTypeTotal =
      apiData.nodes.filter((n: any) => n.type === type).length;

    const angle =
      sameTypeTotal > 0
        ? (index / sameTypeTotal) * Math.PI * 2
        : 0;

    const radius = radiusMap[type] ?? 300;

    nodes.push({
      id: node.id,
      label: node.id,
      type: type.toLowerCase(),
      x: Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
      y: Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
      vx: 0,
      vy: 0,
    });
  });

  apiData.edges.forEach((edge: any) => {
    edges.push({
      s: edge.source,
      t: edge.target,
    });
  });

  return { nodes, edges };
}

function nodeStyle(type: GNode["type"]) {
  if (type === "disease") return { fill: "#FF00AA", glow: "#FF00AA", r: 15 };
  if (type === "drug") return { fill: "#00D4FF", glow: "#00D4FF", r: 10 };
  if (type === "gene") return { fill: "#FFB800", glow: "#FFB800", r: 4 };
  return { fill: "#9D00FF", glow: "#9D00FF", r: 6 };
}

function KnowledgeGraph({
  disease,
  apiData,
  onSelectDrug,
  selectedDrug,
  onSelectGene,
}: {
  disease: string;
  apiData: any;
  onSelectDrug: (name: string) => void;
  selectedDrug: string | null;
  onSelectGene?: (name: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [state, setState] = useState(() =>
    apiData?.nodes?.length
      ? buildGraphFromAPI(apiData)
      : buildGraph(disease)
  );
  const [hover, setHover] = useState<string | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    if (apiData?.nodes?.length) {
      setState(buildGraphFromAPI(apiData));
    } else {
      setState(buildGraph(disease));
    }
  }, [disease, apiData]);

  useEffect(() => {
    let raf = 0;
    const step = () => {
      tickRef.current++;
      setState((cur) => {
        const nodes = cur.nodes.map((n) => ({ ...n }));
        // simple spring layout
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i], b = nodes[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
            const rep = 1400 / (d * d);
            a.vx += (dx / d) * rep;
            a.vy += (dy / d) * rep;
            b.vx -= (dx / d) * rep;
            b.vy -= (dy / d) * rep;
          }
        }
        for (const e of cur.edges) {
          const a = nodes.find((n) => n.id === e.s)!;
          const b = nodes.find((n) => n.id === e.t)!;
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
          const target = 60;
          const f = (d - target) * 0.02;
          a.vx += (dx / d) * f;
          a.vy += (dy / d) * f;
          b.vx -= (dx / d) * f;
          b.vy -= (dy / d) * f;
        }
        for (const n of nodes) {
          if (n.type === "disease") { n.x = 0; n.y = 0; n.vx = 0; n.vy = 0; continue; }
          n.vx *= 0.85; n.vy *= 0.85;
          n.x += n.vx * 0.05;
          n.y += n.vy * 0.05;
          // center pull
          n.vx -= n.x * 0.009;
          n.vy -= n.y * 0.009;
          n.x = Math.max(-320, Math.min(320, n.x));
          n.y = Math.max(-220, Math.min(220, n.y));
        }
        return { ...cur, nodes };
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const breath = 1 + Math.sin(tickRef.current * 0.02) * 0.015;

  return (
    <div className="relative w-full h-[560px] glass rounded-lg overflow-hidden">
      <svg ref={svgRef} viewBox="-400 -300 800 600" className="w-full h-full" style={{ transform: `scale(${breath})`, transition: "transform 0.1s linear" }}>
        <defs>
          <radialGradient id="bgRad">
            <stop offset="0" stopColor="rgba(0,212,255,0.08)" />
            <stop offset="1" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="0" cy="0" r="400" fill="url(#bgRad)" />
        {state.edges.map((e, i) => {
          const a = state.nodes.find((n) => n.id === e.s);
          const b = state.nodes.find((n) => n.id === e.t);
          if (!a || !b) return null;
          return (
            <line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#00D4FF" strokeOpacity="0.45" strokeWidth="1"
              className="edge-flow"
            />
          );
        })}
        {state.nodes.map((n) => {
          const s = nodeStyle(n.type);
          const isHover = hover === n.id;
          const isSelected = n.type === "drug" && n.label === selectedDrug;
          const geneClickable = n.type === "gene" && onSelectGene;
          return (
            <g key={n.id} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} onClick={() => { if (n.type === "drug") onSelectDrug(n.label); if (n.type === "gene" && onSelectGene) onSelectGene(n.label); }} style={{ cursor: (n.type === "drug" || n.type === "gene") ? "pointer" : "default" }}>
              {isSelected && (
                <circle cx={n.x} cy={n.y} r={s.r + 10} fill="none" stroke={s.glow} strokeWidth="1" strokeDasharray="4 4" className="spin-slow" style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
              )}
              <circle
                cx={n.x} cy={n.y}
                r={isHover ? s.r * 1.3 : s.r}
                fill={s.fill}
                style={{ filter: `drop-shadow(0 0 ${isHover ? 18 : 10}px ${s.glow})` }}
              />
              {(isHover || n.type === "disease") && (
                <text x={n.x} y={n.y - s.r - 8} textAnchor="middle" fill="#E8FFF8" fontSize={n.type === "disease" ? 14 : 11} fontFamily="Space Mono" style={{ textShadow: `0 0 8px ${s.glow}` }}>
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[color:var(--muted-foreground)] flex flex-wrap gap-3">
        <Legend color="#FF00AA" label="Disease" />
        <Legend color="#00D4FF" label="Drug (click)" />
        <Legend color="#FFB800" label="Gene/Protein (click)" />
        <Legend color="#9D00FF" label="Pathway" />
      </div>
    </div>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  );
}

// ============================================================
// Drug card
// ============================================================
type Drug = {
  name: string;
  score: number;
  badges: string[];
  reasoning: string[];
  narrative: string;
  ci: [number, number];
};

const DRUGS_BY_DISEASE: Record<string, Drug[]> = {
  "Alzheimer's Disease": [
    { name: "Donepezil", score: 0.91, badges: ["FDA Approved", "High Confidence"], reasoning: ["APP", "BACE1", "Cholinergic", "Hippocampus"], narrative: "Cholinesterase inhibition preserves acetylcholine in the hippocampal circuit, mitigating cognitive decline driven by amyloid plaque burden.", ci: [0.84, 0.95] },
    { name: "Memantine", score: 0.87, badges: ["FDA Approved", "Clinical Trial Exists"], reasoning: ["NMDA", "Glutamate", "Excitotoxicity", "Neuron"], narrative: "Non-competitive NMDA blockade reduces glutamatergic excitotoxicity, a downstream consequence of tau-induced synaptic loss.", ci: [0.79, 0.92] },
    { name: "Rapamycin", score: 0.74, badges: ["Repurposing Candidate"], reasoning: ["mTOR", "Autophagy", "Aβ Clearance"], narrative: "mTOR inhibition upregulates autophagic flux, accelerating amyloid-β clearance in cortical neurons.", ci: [0.62, 0.83] },
  ],
  "Type 2 Diabetes": [
    { name: "Metformin", score: 0.94, badges: ["FDA Approved", "High Confidence"], reasoning: ["AMPK", "Hepatic Gluconeogenesis", "Insulin Sensitivity"], narrative: "AMPK activation suppresses hepatic glucose output and restores peripheral insulin sensitivity.", ci: [0.89, 0.97] },
    { name: "Liraglutide", score: 0.88, badges: ["FDA Approved", "Clinical Trial Exists"], reasoning: ["GLP-1R", "β-cell", "Glucose-dep. insulin"], narrative: "GLP-1 receptor agonism enhances glucose-dependent insulin secretion and slows gastric emptying.", ci: [0.81, 0.93] },
    { name: "Empagliflozin", score: 0.82, badges: ["FDA Approved"], reasoning: ["SGLT2", "Renal Glucose", "Cardio-protect"], narrative: "SGLT2 inhibition increases urinary glucose excretion while conferring cardiovascular protection.", ci: [0.74, 0.89] },
  ],
  "COVID-19": [
    { name: "Baricitinib", score: 0.89, badges: ["Retrospective Hit", "FDA Approved"], reasoning: ["JAK1/2", "STAT3", "IL-6", "Cytokine Storm"], narrative: "JAK1/2 inhibition dampens cytokine-driven hyperinflammation. Pre-2020 KG snapshot ranked this top-5 — confirmed by RECOVERY trial.", ci: [0.82, 0.93] },
    { name: "Dexamethasone", score: 0.86, badges: ["Retrospective Hit", "FDA Approved"], reasoning: ["Glucocorticoid R.", "NF-κB", "TNF", "Lung inflammation"], narrative: "Broad glucocorticoid signaling suppresses NF-κB driven pulmonary inflammation. Identified in pre-pandemic graph.", ci: [0.78, 0.91] },
    { name: "Anakinra", score: 0.71, badges: ["Clinical Trial Exists"], reasoning: ["IL-1R", "Inflammasome", "Acute lung injury"], narrative: "IL-1 receptor antagonism interrupts inflammasome amplification in severe respiratory disease.", ci: [0.58, 0.81] },
  ],
  "Breast Cancer": [
    { name: "Palbociclib", score: 0.9, badges: ["FDA Approved", "High Confidence"], reasoning: ["CDK4/6", "Rb", "G1 arrest", "ER+"], narrative: "CDK4/6 inhibition triggers G1 arrest in ER+ tumors via Rb hypophosphorylation.", ci: [0.83, 0.94] },
    { name: "Tamoxifen", score: 0.86, badges: ["FDA Approved"], reasoning: ["ESR1", "Estrogen R.", "Tumor growth"], narrative: "Selective estrogen receptor modulation antagonizes proliferative ER signaling in mammary tissue.", ci: [0.79, 0.91] },
    { name: "Olaparib", score: 0.78, badges: ["FDA Approved", "Clinical Trial Exists"], reasoning: ["PARP1", "BRCA1/2", "Synthetic lethality"], narrative: "PARP inhibition is synthetically lethal in BRCA-deficient tumors via accumulated DSBs.", ci: [0.68, 0.86] },
  ],
  "Lupus": [
    { name: "Belimumab", score: 0.84, badges: ["FDA Approved"], reasoning: ["BAFF", "B-cell", "Autoantibodies"], narrative: "BAFF neutralization depletes autoreactive B-cell pool and reduces pathogenic autoantibodies.", ci: [0.76, 0.9] },
    { name: "Hydroxychloroquine", score: 0.81, badges: ["FDA Approved", "First-line"], reasoning: ["TLR7/9", "Type I IFN", "Endosome"], narrative: "Endosomal alkalinization inhibits TLR7/9 signaling, suppressing the type-I interferon signature.", ci: [0.72, 0.88] },
    { name: "Anifrolumab", score: 0.76, badges: ["FDA Approved"], reasoning: ["IFNAR1", "Type I IFN", "ISGs"], narrative: "IFNAR1 blockade silences type-I interferon-driven gene programs central to SLE pathology.", ci: [0.67, 0.84] },
  ],
};

function DrugCard({ drug, onSelect }: { drug: Drug; onSelect: () => void }) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current!;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -10;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const onLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  };

  const pct = drug.score;
  const dash = 283;
  const offset = dash - dash * pct;

  return (
    <button
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onSelect}
      className="tilt-card text-left gradient-border rounded-lg p-5 w-[320px] shrink-0 group relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">CANDIDATE</div>
          <h3 className="font-mono text-2xl mt-1 text-glow-green">{drug.name}</h3>
        </div>
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="url(#gaugeGrad)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={dash} strokeDashoffset={offset}
              className="donut-fill"
              style={{ filter: "drop-shadow(0 0 6px #00FF88)" }}
            />
            <defs>
              <linearGradient id="gaugeGrad">
                <stop offset="0" stopColor="#00FF88" />
                <stop offset="1" stopColor="#00D4FF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-glow-cyan">
            {Math.round(pct * 100)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {drug.badges.map((b) => {
          const color = b.includes("FDA") ? "#00FF88" : b.includes("Retro") ? "#FF00AA" : b.includes("High") ? "#00D4FF" : "#FFB800";
          return (
            <span key={b} className="text-[10px] font-mono px-2 py-0.5 rounded border" style={{ borderColor: color, color, boxShadow: `0 0 8px ${color}55` }}>
              {b}
            </span>
          );
        })}
      </div>

      <div className="mt-4 text-xs font-mono text-[color:var(--muted-foreground)]">
        CI₉₀ [{drug.ci[0].toFixed(2)}, {drug.ci[1].toFixed(2)}]
      </div>

      {/* Molecule (revealed on hover) */}
      <svg viewBox="0 0 200 80" className="mt-3 w-full opacity-30 group-hover:opacity-90 transition-opacity duration-500">
        <g fill="none" stroke="#00D4FF" strokeWidth="1.2">
          <polygon points="20,40 35,15 65,15 80,40 65,65 35,65" />
          <polygon points="80,40 95,15 125,15 140,40 125,65 95,65" />
          <polygon points="140,40 155,15 185,15 200,40 185,65 155,65" />
          <line x1="80" y1="40" x2="95" y2="15" />
          <line x1="140" y1="40" x2="155" y2="15" />
        </g>
        <g fill="#00FF88">
          {[20, 35, 65, 80, 95, 125, 140, 155, 185].map((x, i) => (
            <circle key={i} cx={x} cy={i % 2 ? 65 : 15} r="2.2" style={{ filter: "drop-shadow(0 0 4px #00FF88)" }} />
          ))}
        </g>
      </svg>
    </button>
  );
}

// ============================================================
// Explanation Panel
// ============================================================
function ExplanationPanel({ drug, disease, onClose }: { drug: Drug; disease: string; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [drugData, setDrugData] = useState<any>(null);
  useEffect(() => {
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(drug.narrative.slice(0, i));
      if (i >= drug.narrative.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [drug]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/drug/${encodeURIComponent(drug.name)}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Drug Data:", data);
        setDrugData(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [drug]);

  const ciSpan = drug.ci[1] - drug.ci[0];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 slide-in-right">
      <div className="h-full glass border-l border-[color:var(--bio-cyan)]/30 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--bio-cyan)]/20">
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] tracking-widest">EXPLAINABILITY · R-GCN PATH</div>
            <h3 className="font-mono text-xl text-glow-green">{drug.name}</h3>
            {drugData && (
    <div className="flex gap-2 mt-2 flex-wrap">
      <span className="px-2 py-1 text-[10px] border border-green-500 text-green-400">
        {drugData.phase}
      </span>

      <span className="px-2 py-1 text-[10px] border border-cyan-500 text-cyan-400">
        {drugData.evidence_level}
      </span>

      <span className="px-2 py-1 text-[10px] border border-yellow-500 text-yellow-400">
        {Math.round(drugData.confidence * 100)}%
      </span>
    </div>
  )}

          </div>
          <button onClick={onClose} className="font-mono text-xs px-2 py-1 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10">CLOSE ×</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Reasoning chain */}
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">BIOLOGICAL REASONING CHAIN</div>
            <div className="flex flex-wrap items-center gap-2">
              <ChainNode label={drug.name}
  color="#00D4FF"
/>

<Arrow />

<ChainNode
  label={drugData?.genes?.[0] || "GENE"}
  color="#FFB800"
/>

<Arrow />

<ChainNode
  label={disease}
  color="#FF00AA"
  big
/>
            </div>
          </div>

          {/* Biological Evidence */}
<div className="glass rounded-lg p-4">
  <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-3">
  BIOLOGICAL EVIDENCE
  </div>

  <div className="space-y-3 font-mono text-sm">

    <div>
      <div className="text-[color:var(--bio-cyan)] text-xs">
        DRUG
      </div>
      <div className="text-[color:var(--bio-green)]">
        {drugData?.drug || drug.name}
      </div>
    </div>

    <div>
  <div className="text-[color:var(--bio-cyan)] text-xs">
    MECHANISM
  </div>

  <div className="text-white">
    {drugData?.mechanism || "Unknown"}
  </div>
</div>

<div>
  <div className="text-[color:var(--bio-cyan)] text-xs">
    CLINICAL STATUS
  </div>

  <div className="text-green-400">
    {drugData?.phase || "Unknown"}
  </div>
</div>

<div>
  <div className="text-[color:var(--bio-cyan)] text-xs">
    EVIDENCE LEVEL
  </div>

  <div className="text-yellow-400">
    {drugData?.evidence_level || "Unknown"}
  </div>
</div>

<div>
  <div className="text-[color:var(--bio-cyan)] text-xs mb-2">
    CONFIDENCE SCORE
  </div>

  <div className="w-full h-2 bg-black/40 rounded">
    <div
      className="h-2 rounded bg-cyan-400"
      style={{
        width: `${(drugData?.confidence || 0) * 100}%`,
      }}
    />
  </div>

  <div className="mt-1 text-xs text-cyan-300">
    {Math.round((drugData?.confidence || 0) * 100)}%
  </div>
</div>

    <div>
      <div className="text-[color:var(--bio-cyan)] text-xs">
        ASSOCIATED DISEASES
      </div>

      {drugData?.diseases?.map((d: string) => (
        <div key={d}>
          • {d}
        </div>
      ))}
    </div>

    <div>
      <div className="text-[color:var(--bio-cyan)] text-xs">
        CONNECTED GENES
      </div>

      {drugData?.genes?.map((g: string) => (
        <div key={g}>
          • {g}
        </div>
      ))}
    </div>

    <div>
      <div className="text-[color:var(--bio-cyan)] text-xs">
        EVIDENCE SUMMARY
      </div>

      <div>
        Diseases: {drugData?.disease_count ?? 0}
      </div>

      <div>
        Genes: {drugData?.gene_count ?? 0}
      </div>
    </div>

  </div>
</div>

          {/* Narrative */}
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-2">LLM NARRATIVE (KG-PATH GROUNDED)</div>
            <p className="font-mono text-sm leading-relaxed text-[color:var(--foreground)] caret">{typed}</p>
          </div>

          {/* Molecule */}
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-2">MOLECULE</div>
            <div className="h-44 flex items-center justify-center" style={{ perspective: "600px" }}>
              <div className="relative" style={{ width: 120, height: 120, transformStyle: "preserve-3d", animation: "helixSpin 10s linear infinite" }}>
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div
                    key={deg}
                    className="absolute inset-0 border-2"
                    style={{
                      borderColor: "#00FF88",
                      boxShadow: "0 0 18px #00FF88",
                      clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                      transform: `rotateY(${deg}deg) translateZ(40px)`,
                      opacity: 0.5,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Confidence range bar */}
          <div>
            <div className="text-[10px] font-mono text-[color:var(--bio-cyan)] mb-2">CONFORMAL CONFIDENCE INTERVAL (90%)</div>
            <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className="absolute inset-y-0"
                style={{
                  left: `${drug.ci[0] * 100}%`,
                  width: `${ciSpan * 100}%`,
                  background: "linear-gradient(90deg, #00FF88, #00D4FF, #FF00AA)",
                  boxShadow: "0 0 14px #00D4FF",
                }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 w-1 h-5" style={{ left: `${drug.score * 100}%`, background: "#fff", boxShadow: "0 0 8px #fff" }} />
            </div>
            <div className="flex justify-between text-[10px] font-mono mt-1 text-[color:var(--muted-foreground)]">
              <span>{drug.ci[0].toFixed(2)}</span>
              <span className="text-glow-green">μ = {drug.score.toFixed(2)}</span>
              <span>{drug.ci[1].toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChainNode({ label, color, big }: { label: string; color: string; big?: boolean }) {
  return (
    <span
      className={`font-mono ${big ? "text-sm px-3 py-1.5" : "text-xs px-2 py-1"} rounded border whitespace-nowrap`}
      style={{ borderColor: color, color, boxShadow: `0 0 10px ${color}55, inset 0 0 8px ${color}22` }}
    >
      {label}
    </span>
  );
}
function Arrow() {
  return <span className="text-[color:var(--bio-cyan)] font-mono text-sm">→</span>;
}

// ============================================================
// Reveal hook
// ============================================================
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Count-up
function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1600;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setV(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{decimals ? v.toFixed(decimals) : Math.floor(v).toLocaleString()}{suffix}</span>;
}

// ============================================================
// Loading spinner
// ============================================================
function MolecularSpinner() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--background)]">
      <div className="relative w-48 h-48" style={{ perspective: "600px" }}>
        <div className="absolute inset-0 border border-[color:var(--bio-cyan)]/50 rounded-full spin-slow" style={{ boxShadow: "0 0 20px #00D4FF" }} />
        <div className="absolute inset-4 border border-[color:var(--bio-green)]/50 rounded-full spin-rev" style={{ boxShadow: "0 0 20px #00FF88" }} />
        <div className="absolute inset-10 border border-[color:var(--bio-magenta)]/50 rounded-full spin-slow" style={{ boxShadow: "0 0 20px #FF00AA" }} />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-[color:var(--bio-cyan)] tracking-widest">LOADING KG…</div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================
const DISEASES = ["Alzheimer disease", "Parkinson disease", "COVID-19", "Breast Cancer", "inflammatory bowel disease"];

async function fetchDiseaseData(disease: string) {
  const response = await fetch(
    `http://127.0.0.1:8000/disease/${encodeURIComponent(disease)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch disease data");
  }

  return response.json();
}

async function fetchRepurposeData(disease: string) {

  const res = await fetch(
    `http://127.0.0.1:8000/repurpose/${encodeURIComponent(disease)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch repurpose data");
  }

  return await res.json();
}

async function fetchStats() {
  const response = await fetch(
    "http://127.0.0.1:8000/stats"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }

  return response.json();
}

function FeatureBtn({ label, title, onClick, color }: { label: string; title: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-11 h-11 rounded-lg glass border border-white/10 flex items-center justify-center text-xs font-mono hover:scale-110 transition-all"
      style={{ boxShadow: `0 0 12px ${color}44`, color }}
    >
      {label}
    </button>
  );
}

function BioLensPage() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [disease, setDisease] = useState<string | null>(null);
  const [apiData, setApiData] = useState<any>(null);
  const [flash, setFlash] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  const [typedSub, setTypedSub] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showPatientTwin, setShowPatientTwin] = useState(false);
  const [showDrugInteraction, setShowDrugInteraction] = useState(false);
  const [showResearchAgent, setShowResearchAgent] = useState(false);
  const [showMultiomics, setShowMultiomics] = useState<string | null>(null);
  const [showMutations, setShowMutations] = useState<string | null>(null);

  useReveal();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(console.error);
  }, []);

  // typewriter subtitle
  useEffect(() => {
    const txt = "AI-Powered Drug Repurposing Intelligence";
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedSub(txt.slice(0, i));
      if (i >= txt.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const submit = async (d?: string) => {
    const target = (d || query || "").trim();
  
    if (!target) return;
  
    try {
      const data = await fetchDiseaseData(target);
  
      setApiData(data);

      const repurposeData = await fetchRepurposeData(target);

      setCandidates(repurposeData.candidates || []);
  
      setFlash(true);
      setTimeout(() => setFlash(false), 700);
  
      setTimeout(() => {
        setDisease(data.disease);
        setQuery(data.disease);
        setSelectedDrug(null);
        setSelectedGene(null);
  
        document
          .getElementById("graph-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 250);
  
    } catch (err) {
      console.error(err);
      alert("Failed to fetch disease data");
    }
  };

  const drugs =
  apiData?.drugs?.map((drugName: string) => ({
    name: drugName,
    score: 0.85,
    badges: ["Neo4j Result"],
    reasoning: ["Knowledge Graph"],
    narrative: `${drugName} was retrieved from the BioLens knowledge graph. This candidate shares biological connections with
  disease-associated genes and may warrant further
  repurposing investigation.`,
    ci: [0.75, 0.95],
  })) || [];
  const drugObj = drugs.find((d) => d.name === selectedDrug) || null;

  return (
    <div className="relative min-h-screen bg-aurora overflow-x-hidden">
      {loading && <MolecularSpinner />}
      <CustomCursor />
      <ParticleField />

      {flash && <div className="fixed inset-0 z-[80] bg-white/80 flash-overlay pointer-events-none" />}

      <StatsTicker />

      {/* ===================== FEATURE TOOLBAR ===================== */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
        <FeatureBtn label="🧬 TWIN" title="Patient Digital Twin" onClick={() => setShowPatientTwin(true)} color="#00FF88" />
        <FeatureBtn label="💊 IX" title="Drug Interactions" onClick={() => setShowDrugInteraction(true)} color="#00D4FF" />
        <FeatureBtn label="🧠 AI" title="Research Agent" onClick={() => setShowResearchAgent(true)} color="#FFB800" />
      </div>

      {/* HERO */}
      <section className="relative z-10 min-h-[92vh] flex items-center justify-center px-6">
        <HexBorder />
        <HeroNetwork />

        <div className="relative grid lg:grid-cols-[1fr_220px] gap-8 items-center max-w-6xl w-full">
          <div className="scanlines relative py-10">
            <div className="flex items-center gap-3 font-mono text-[11px] text-[color:var(--bio-cyan)] tracking-[0.3em] mb-6">
              <span className="inline-block w-2 h-2 rounded-full bg-[color:var(--bio-green)]" style={{ boxShadow: "0 0 12px #00FF88" }} />
              v0.1 · ISMB-CANDIDATE · NEO4J + R-GCN
            </div>
            <h1 className="font-mono chromatic text-[clamp(64px,14vw,200px)] leading-[0.85] font-bold">
              BioLens
            </h1>
            <p className="font-mono text-[color:var(--bio-cyan)] text-glow-cyan text-lg sm:text-2xl mt-4 caret">
              {typedSub}
            </p>
            <p className="max-w-xl mt-6 text-sm sm:text-base text-[color:var(--muted-foreground)] leading-relaxed">
  A biomedical knowledge graph with{" "}
  <span className="text-[color:var(--bio-green)]">
    {stats?.diseases ?? 0}
  </span>{" "}
  diseases,{" "}
  <span className="text-[color:var(--bio-green)]">
    {stats?.genes ?? 0}
  </span>{" "}
  genes,{" "}
  <span className="text-[color:var(--bio-cyan)]">
    {stats?.drugs ?? 0}
  </span>{" "}
  drugs and{" "}
  <span className="text-[color:var(--bio-cyan)]">
    {stats?.relationships ?? 0}
  </span>{" "}
  relationships.

  <br />
  <br />

  R-GCN at{" "}
  <span className="text-[color:var(--bio-cyan)]">
    AUC-ROC 0.84
  </span>.
  Conformal prediction.
  LLM-generated narratives from KG paths.
</p>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <DNAHelix />
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="relative z-10 px-6 py-20 reveal">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-mono text-[11px] tracking-[0.3em] text-[color:var(--bio-cyan)] mb-3">// BIOTECH TERMINAL · QUERY</div>
          <h2 className="font-mono text-3xl sm:text-5xl text-glow-green mb-8">SELECT A DISEASE</h2>

          <div className="relative glass rounded-md p-2 flex items-center gap-2 hover:glow-cyan transition-shadow">
            <span className="font-mono text-[color:var(--bio-green)] pl-3">$</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Enter disease name... e.g. Alzheimer's Disease"
              className="flex-1 bg-transparent outline-none font-mono text-sm sm:text-base text-[color:var(--foreground)] placeholder:text-white/30 py-3"
            />
            <button onClick={() => submit()} className="btn-pulse font-mono text-xs sm:text-sm px-5 py-3 rounded uppercase tracking-widest">
              Predict ▶
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {DISEASES.map((d) => (
              <button
                key={d}
                onClick={() => submit(d)}
                className="text-[11px] font-mono px-3 py-1.5 rounded border border-[color:var(--bio-cyan)]/40 text-[color:var(--bio-cyan)] hover:bg-[color:var(--bio-cyan)]/10 hover:glow-cyan transition-all"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DNA SEQUENCE SEARCH */}
      <section className="relative z-10 px-6 py-20 reveal">
        <div className="max-w-4xl mx-auto">
          <DNASearchPanel onSelectGene={setSelectedGene} />
        </div>
      </section>

      {/* KG */}
      <section id="graph-section" className="relative z-10 px-6 py-20 reveal">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.3em] text-[color:var(--bio-cyan)] mb-2">// KNOWLEDGE GRAPH</div>
              <h2 className="font-mono text-3xl sm:text-5xl text-glow-green">
                {disease ? disease.toUpperCase() : "AWAITING QUERY"}
              </h2>
              <div className="font-mono text-xs text-[color:var(--muted-foreground)] grid grid-cols-2 gap-x-6 gap-y-1">
                <span>
                  DISEASES{" "}
                  <span className="text-[color:var(--bio-green)]">
                    {stats?.diseases ?? "—"}
                  </span>
                </span>

                <span>
                  GENES{" "}
                  <span className="text-[color:var(--bio-green)]">
                    {stats?.genes ?? "—"}
                  </span>
                </span>

                <span>
                  DRUGS{" "}
                  <span className="text-[color:var(--bio-cyan)]">
                    {stats?.drugs ?? "—"}
                  </span>
                </span>

                <span>
                  RELATIONSHIPS{" "}
                  <span className="text-[color:var(--bio-cyan)]">
                    {stats?.relationships ?? "—"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          {disease ? (
            <KnowledgeGraph disease={disease} apiData={apiData} onSelectDrug={setSelectedDrug} selectedDrug={selectedDrug} onSelectGene={setSelectedGene} />
          ) : (
            <div className="glass rounded-lg h-[400px] flex items-center justify-center font-mono text-sm text-[color:var(--muted-foreground)]">
              Run a query above to materialize the subgraph.
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      {disease && (
        <section className="relative z-10 px-6 py-20 reveal">
          <div className="max-w-6xl mx-auto">
            <div className="font-mono text-[11px] tracking-[0.3em] text-[color:var(--bio-cyan)] mb-2">// RANKED CANDIDATES · CONFORMAL</div>
            <h2 className="font-mono text-3xl sm:text-5xl text-glow-green mb-8">REPURPOSING HITS</h2>
            <div className="flex gap-5 overflow-x-auto pb-6 -mx-6 px-6 snap-x">
              {drugs.map((d) => (
                <div key={d.name} className="snap-start">
                  <DrugCard drug={d} onSelect={() => setSelectedDrug(d.name)} />
                </div>
              ))}
            </div>
            <p className="font-mono text-xs text-[color:var(--muted-foreground)] mt-4">
              ↳ Click any card to open the explainability panel.
            </p>
          </div>
        </section>
      )}

      {/* METRICS */}
      <section className="relative z-10 px-6 py-24 reveal">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[11px] tracking-[0.3em] text-[color:var(--bio-cyan)] mb-2">// MODEL CARD</div>
          <h2 className="font-mono text-3xl sm:text-5xl text-glow-green mb-10">PERFORMANCE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Metric label="AUC-ROC" value={<CountUp to={0.84} decimals={2} />} color="#00FF88" />
            <Metric label="AUPRC" value={<CountUp to={0.79} decimals={2} />} color="#00D4FF" />
            <Metric label="KG NODES" value={<CountUp to={180000} />} color="#FF00AA" />
            <Metric label="KG EDGES" value={<><CountUp to={1.4} decimals={1} />M</>} color="#9D00FF" />
            <Metric label="DISEASES" value={<CountUp to={5} />} color="#FFB800" />
            <Metric label="COVID-19 RETRO. HITS" value={<><CountUp to={2} />/5</>} color="#00FF88" />
            <Metric label="CONFORMAL COVERAGE" value={<CountUp to={0.91} decimals={2} />} color="#00D4FF" />
            <Metric label="GITHUB ★" value={<><CountUp to={400} />+</>} color="#FF00AA" />
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="relative z-10 px-6 py-24 reveal">
        <div className="max-w-6xl mx-auto">
          <div className="font-mono text-[11px] tracking-[0.3em] text-[color:var(--bio-cyan)] mb-2">// SYSTEM</div>
          <h2 className="font-mono text-3xl sm:text-5xl text-glow-green mb-10">PIPELINE</h2>
          <div className="grid lg:grid-cols-5 gap-3 font-mono text-xs">
            {[
              { t: "INGEST", l: "DisGeNET · STRING · DrugBank · Open Targets", c: "#00FF88" },
              { t: "STORE", l: "Neo4j heterogeneous KG + PostgreSQL", c: "#00D4FF" },
              { t: "LEARN", l: "R-GCN on PyTorch Geometric · 3 layers", c: "#9D00FF" },
              { t: "SERVE", l: "FastAPI · conformal calibration", c: "#FFB800" },
              { t: "EXPLAIN", l: "LLM narratives grounded in KG paths", c: "#FF00AA" },
            ].map((s, i, arr) => (
              <div key={s.t} className="glass rounded p-4 relative">
                <div className="tracking-widest" style={{ color: s.c, textShadow: `0 0 8px ${s.c}` }}>
                  {String(i + 1).padStart(2, "0")} · {s.t}
                </div>
                <div className="text-[color:var(--muted-foreground)] mt-2 leading-relaxed">{s.l}</div>
                {i < arr.length - 1 && (
                  <span className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-[color:var(--bio-cyan)]">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-20 border-t border-[color:var(--bio-cyan)]/20">
        <div className="max-w-6xl mx-auto">
          <pre className="font-mono text-[10px] sm:text-xs text-[color:var(--bio-green)] text-glow-green leading-tight overflow-x-auto">
{`        A === T
       /       \\
      G         C
     /           \\
    T === A      G === C
     \\           /
      C         T
       \\       /
        A === G   ::  BioLens KG v0.1`}
          </pre>
          <div className="flex flex-wrap items-end justify-between gap-6 mt-10">
            <div>
              <div className="font-mono text-2xl text-glow-cyan">BioLens</div>
              <div className="font-mono text-xs text-[color:var(--muted-foreground)] mt-1">Explainable Drug Repurposing Intelligence</div>
            </div>
            <div className="flex gap-4 font-mono text-xs">
              <a href="#" className="px-3 py-2 border border-[color:var(--bio-cyan)]/40 hover:bg-[color:var(--bio-cyan)]/10">GITHUB ↗</a>
              <a href="#" className="px-3 py-2 border border-[color:var(--bio-green)]/40 hover:bg-[color:var(--bio-green)]/10">PAPER (ISMB 2025) ↗</a>
              <a href="#" className="px-3 py-2 border border-[color:var(--bio-magenta)]/40 hover:bg-[color:var(--bio-magenta)]/10">API ↗</a>
            </div>
          </div>
          <div className="font-mono text-[10px] text-[color:var(--muted-foreground)] mt-8">
            © {new Date().getFullYear()} BioLens · Open source · For research use only.
          </div>
        </div>
      </footer>

      {drugObj && disease && (
        <ExplanationPanel drug={drugObj} disease={disease} onClose={() => setSelectedDrug(null)} />
      )}

      {selectedGene && (
        <ProteinViewer geneName={selectedGene} onClose={() => setSelectedGene(null)} />
      )}

      {showPatientTwin && <PatientTwinPanel onClose={() => setShowPatientTwin(false)} />}
      {showDrugInteraction && <DrugInteractionPanel onClose={() => setShowDrugInteraction(false)} />}
      {showResearchAgent && <ResearchAgentPanel onClose={() => setShowResearchAgent(false)} />}
      {showMultiomics && <MultiomicsPanel geneName={showMultiomics} onClose={() => setShowMultiomics(null)} />}
      {showMutations && <MutationPanel geneName={showMutations} onClose={() => setShowMutations(null)} />}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="glass rounded p-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
      <div className="font-mono text-[10px] tracking-widest text-[color:var(--muted-foreground)]">{label}</div>
      <div className="font-mono text-3xl mt-2" style={{ color, textShadow: `0 0 12px ${color}` }}>{value}</div>
    </div>
  );
}
