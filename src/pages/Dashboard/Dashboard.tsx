import { ArrowUpRight, CheckCircle2, FileText, ListChecks, Plus, ShieldCheck, Sparkles } from "lucide-react";
import type { DragEvent } from "react";
import type { DocumentResult } from "../../types";
import StatCard from "../../components/shared/StatCard";
import UploadArea from "../../components/shared/UploadArea";

function WorkflowCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return <div className="workflow-card"><div className="workflow-top"><div className="workflow-icon">{icon}</div><span>{number}</span></div><h4>{title}</h4><p>{description}</p></div>;
}

export default function Dashboard({ document, dragging, setDragging, onDrop, onUpload, onRemove }: {
  document: DocumentResult | null; dragging: boolean; setDragging: (value: boolean) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void; onUpload: () => void; onRemove: () => void;
}) {
  const evidenceCount = document?.evidence.length ?? 0;
  return <div className="page-content">
    <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14} /> YOUR INTELLIGENT WORKSPACE</div><h1>Good morning.</h1><p className="subtitle">Turn complicated information into clear, actionable steps.</p></div>
      <button className="primary-button" onClick={onUpload}><Plus size={18} /> New task</button>
    </div>
    <section className="hero-card"><div className="hero-content"><div className="hero-tag"><span className="hero-tag-dot" /> INTRODUCING CLEARSTEP</div>
      <h2>From information<br /><span>to action.</span></h2><p>Upload a document. Understand what needs to be done. Prepare every action with evidence and verification.</p>
      <button className="hero-button" onClick={onUpload}>Analyse a document <ArrowUpRight size={17} /></button></div>
      <div className="hero-graphic" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="graphic-core"><Sparkles size={34} /></div><div className="graphic-node node-one"><FileText size={19} /></div><div className="graphic-node node-two"><ListChecks size={19} /></div><div className="graphic-node node-three"><ShieldCheck size={19} /></div></div>
      <div className="hero-decoration">CS / 004</div>
    </section>
    <section className="stats-grid">
      <StatCard icon={<FileText size={18} />} label="Documents processed" value={document ? "1" : "0"} note={document ? "PDF extracted locally" : "No documents yet"} />
      <StatCard icon={<ListChecks size={18} />} label="Evidence items found" value={String(evidenceCount)} note="Candidate requirements and references" />
      <StatCard icon={<ShieldCheck size={18} />} label="Verified actions" value="0" note="Human review not completed" />
    </section>
    <div className="section-heading"><div><h3>Get started</h3><p>Give CLEARSTEP something to work with.</p></div><span className="section-index">01 — INPUT</span></div>
    <UploadArea dragging={dragging} setDragging={setDragging} onDrop={onDrop} onBrowse={onUpload} document={document} onRemove={onRemove} />
    <div className="section-heading workflow-heading"><div><h3>How CLEARSTEP works</h3><p>Every task follows a transparent workflow.</p></div><span className="section-index">02 — PROCESS</span></div>
    <section className="workflow-grid">
      <WorkflowCard number="01" icon={<FileText size={20} />} title="Understand" description="Extract instructions, requirements and deadlines." />
      <WorkflowCard number="02" icon={<ListChecks size={20} />} title="Prepare" description="Turn requirements into structured actions." />
      <WorkflowCard number="03" icon={<ShieldCheck size={20} />} title="Verify" description="Check every action against its source evidence." />
      <WorkflowCard number="04" icon={<CheckCircle2 size={20} />} title="Approve" description="You review and authorise consequential actions." />
    </section>
    <footer className="page-footer"><span>CLEARSTEP © 2026</span><span>UNDERSTAND. PREPARE. VERIFY. ACT.</span></footer>
  </div>;
}