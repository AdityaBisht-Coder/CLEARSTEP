import { AlertCircle, Globe, ShieldCheck } from "lucide-react";
import type { DocumentResult } from "../../types";

export default function ModulePage({ title, description, document, icon }: { title: string; description: string; document: DocumentResult | null; icon: "execution" | "verification" }) {
  const Icon = icon === "execution" ? Globe : ShieldCheck;
  return <div className="page-content secondary-page"><div className="eyebrow"><Icon size={14} /> CLEARSTEP WORKSPACE</div><h1>{title}</h1><p className="subtitle">{description}</p><div className="coming-card module-card">
    <div className="notice-card"><ShieldCheck size={20} /><div><strong>{icon === "execution" ? "Controlled preparation mode" : "Human verification required"}</strong><p>{icon === "execution" ? "External websites, emails and submissions are not connected. This workspace is a preparation area only." : "Pattern detection is not proof of correctness. Review each candidate against the original source before marking it verified."}</p></div></div>
    {!document ? <p>Upload a PDF in Documents to populate this workspace.</p> : <p><AlertCircle size={15} /> {document.evidence.length} evidence candidates are available from {document.name}.</p>}
  </div></div>;
}