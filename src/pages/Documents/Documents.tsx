import { AlertCircle, CalendarDays, ExternalLink, FileText, ListChecks, LoaderCircle, Mail, Plus, Trash2, X } from "lucide-react";
import type { DocumentResult, Evidence } from "../../types";
import StatCard from "../../components/shared/StatCard";
import "./Documents.css";

export default function Documents({ document, loading, onUpload, onRemove, selectedEvidence, onSelectEvidence }: {
  document: DocumentResult | null; loading: boolean; onUpload: () => void; onRemove: () => void;
  selectedEvidence: Evidence | null; onSelectEvidence: (item: Evidence | null) => void;
}) {
  const deadlines = document?.evidence.filter((item) => item.type === "deadline") ?? [];
  const requirements = document?.evidence.filter((item) => item.type === "requirement") ?? [];
  const contacts = document?.evidence.filter((item) => item.type === "email") ?? [];
  const links = document?.evidence.filter((item) => item.type === "link") ?? [];
  return <div className="page-content">
    <div className="eyebrow"><FileText size={14} /> DOCUMENT INTELLIGENCE</div>
    <div className="document-heading"><div><h1>Documents</h1><p className="subtitle">Extract text and inspect evidence from your PDF files.</p></div><button className="primary-button" onClick={onUpload}><Plus size={17} /> Upload PDF</button></div>
    {loading && <div className="processing-card"><LoaderCircle className="spin" size={25} /><div><strong>Reading your document...</strong><p>Extracting text locally, page by page.</p></div></div>}
    {!loading && !document && <div className="empty-state"><div className="coming-icon"><FileText size={26} /></div><h2>No document analysed yet</h2><p>Upload a text-based PDF to extract its contents and discover possible tasks.</p><button className="primary-button" onClick={onUpload}>Choose a PDF</button></div>}
    {document && !loading && <>
      <section className="document-summary"><div className="document-file-icon"><FileText size={25} /></div><div className="document-file-info"><strong>{document.name}</strong><p>{document.pages.length} pages · {document.totalWords.toLocaleString()} words · Processed in your browser</p></div><button className="icon-button" onClick={onRemove} title="Remove document"><Trash2 size={18} /></button></section>
      <section className="stats-grid document-stats">
        <StatCard icon={<CalendarDays size={18} />} label="Possible deadlines" value={String(deadlines.length)} note="Requires human confirmation" />
        <StatCard icon={<ListChecks size={18} />} label="Possible requirements" value={String(requirements.length)} note="Detected by text patterns" />
        <StatCard icon={<ExternalLink size={18} />} label="Links and contacts" value={String(links.length + contacts.length)} note="Found in extracted text" />
      </section>
      <div className="section-heading"><div><h3>Evidence explorer</h3><p>Each result links back to its source page.</p></div><span className="section-index">02 — EVIDENCE</span></div>
      {!document.evidence.length ? <div className="empty-state compact"><AlertCircle size={24} /><h3>No matching patterns found</h3><p>The PDF may contain scanned images rather than selectable text, or it may use wording our basic detector does not recognise.</p></div> :
        <div className="evidence-list">{document.evidence.map((item) => <button key={item.id} className={`evidence-item ${selectedEvidence?.id === item.id ? "selected" : ""}`} onClick={() => onSelectEvidence(item)}>
          <span className={`evidence-type ${item.type}`}>{item.type === "deadline" ? <CalendarDays size={16} /> : item.type === "email" ? <Mail size={16} /> : item.type === "link" ? <ExternalLink size={16} /> : <ListChecks size={16} />}</span>
          <span className="evidence-copy"><strong>{item.title}</strong><span>{item.text}</span></span><span className="page-reference">PAGE{item.pages.length > 1 ? "S" : ""} {item.pages.join(", ")}</span>
        </button>)}</div>}
      {selectedEvidence && <section className="source-panel"><div className="section-heading"><div><h3>Evidence details</h3><p>Source reference for the selected result.</p></div><button className="icon-button" onClick={() => onSelectEvidence(null)} aria-label="Close details"><X size={18} /></button></div>
        <div className="source-quote">{selectedEvidence.text}</div><div className="source-meta"><FileText size={15} /> {document.name} · Page{selectedEvidence.pages.length > 1 ? "s" : ""} {selectedEvidence.pages.join(", ")}</div>
        <p className="disclaimer">This is a text-pattern match, not an AI-confirmed interpretation. Check the original PDF before relying on it.</p></section>}
      <div className="section-heading workflow-heading"><div><h3>Extracted page text</h3><p>Review the text CLEARSTEP actually received.</p></div><span className="section-index">03 — SOURCE</span></div>
      <div className="page-text-list">{document.pages.map((page) => <details key={page.page} className="page-text-card"><summary>Page {page.page}<span>{page.text ? `${page.text.split(/\s+/).length} words` : "No selectable text"}</span></summary><p>{page.text || "No selectable text was extracted from this page."}</p></details>)}</div>
    </>}
  </div>;
}