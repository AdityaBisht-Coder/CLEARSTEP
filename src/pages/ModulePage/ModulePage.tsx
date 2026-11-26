import { useMemo, useState } from "react";
import { AlertCircle, Check, CircleHelp, Globe, RotateCcw, ShieldCheck, X } from "lucide-react";
import type { DocumentResult, EvidenceReviewStatus } from "../../types";

type Filter = "all" | "pending" | "confirmed" | "rejected";

export default function ModulePage({ title, description, document, icon, evidenceReviews = {}, onReview }: {
  title: string;
  description: string;
  document: DocumentResult | null;
  icon: "execution" | "verification";
  evidenceReviews?: Record<string, EvidenceReviewStatus>;
  onReview?: (id: string, status: EvidenceReviewStatus | null) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const isVerification = icon === "verification";
  const Icon = isVerification ? ShieldCheck : Globe;

  const counts = useMemo(() => {
    const values = document?.evidence ?? [];
    return {
      total: values.length,
      confirmed: values.filter((item) => evidenceReviews[item.id] === "confirmed").length,
      rejected: values.filter((item) => evidenceReviews[item.id] === "rejected").length,
    };
  }, [document, evidenceReviews]);

  const visibleEvidence = (document?.evidence ?? []).filter((item) => {
    const status = evidenceReviews[item.id];
    if (filter === "pending") return !status;
    if (filter === "confirmed") return status === "confirmed";
    if (filter === "rejected") return status === "rejected";
    return true;
  });

  if (!isVerification) {
    return <div className="page-content secondary-page"><div className="eyebrow"><Icon size={14} /> CLEARSTEP WORKSPACE</div><h1>{title}</h1><p className="subtitle">{description}</p><div className="coming-card module-card">
      <div className="notice-card"><ShieldCheck size={20} /><div><strong>Controlled preparation mode</strong><p>External websites, emails and submissions are not connected. This workspace is a preparation area only.</p></div></div>
      {!document ? <p>Upload a PDF in Documents to populate this workspace.</p> : <p><AlertCircle size={15} /> {document.evidence.length} evidence candidates are available from {document.name}.</p>}
    </div></div>;
  }

  const reviewed = counts.confirmed + counts.rejected;
  const progress = counts.total ? Math.round(reviewed / counts.total * 100) : 0;

  return <div className="page-content secondary-page verification-page">
    <div className="eyebrow"><ShieldCheck size={14} /> EVIDENCE QUALITY CONTROL</div>
    <div className="document-heading"><div><h1>{title}</h1><p className="subtitle">{description}</p></div></div>
    {!document ? <div className="empty-state"><div className="coming-icon"><ShieldCheck size={26} /></div><h2>Nothing to verify yet</h2><p>Upload a PDF in Documents. Every detected item will appear here with its source-page reference.</p></div> : <>
      <section className="verification-summary">
        <div className="verification-summary-top"><div><strong>{reviewed} of {counts.total} findings reviewed</strong><p>Check each item against the original PDF before confirming it.</p></div><span>{progress}%</span></div>
        <div className="verification-track"><span style={{ width: progress + "%" }} /></div>
        <div className="verification-counts">
          <span><Check size={15} /> {counts.confirmed} confirmed</span>
          <span><X size={15} /> {counts.rejected} rejected</span>
          <span><CircleHelp size={15} /> {counts.total - reviewed} pending</span>
        </div>
      </section>
      <div className="verification-toolbar">
        <div><strong>Evidence review</strong><p>{document.name} · {document.pages.length} pages</p></div>
        <div className="verification-filters">
          {(["all", "pending", "confirmed", "rejected"] as Filter[]).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All" : value[0].toUpperCase() + value.slice(1)}</button>)}
        </div>
      </div>
      {!visibleEvidence.length ? <div className="empty-state compact"><ShieldCheck size={23} /><h3>No findings in this view</h3><p>Choose another filter to see the other review statuses.</p></div> :
        <div className="verification-list">{visibleEvidence.map((item) => {
          const status = evidenceReviews[item.id];
          return <article className="verification-item" key={item.id}>
            <div className="verification-item-top"><div><span className={"verification-type " + item.type}>{item.type}</span><span className="verification-page">SOURCE PAGE {item.pages.join(", ")}</span></div><span className={"verification-status " + (status ?? "pending")}>{status ?? "Needs review"}</span></div>
            <h3>{item.title}</h3><p className="verification-evidence-text">{item.text}</p>
            <div className="verification-item-actions">
              <button className="verify-confirm" onClick={() => onReview?.(item.id, "confirmed")} disabled={status === "confirmed"}><Check size={15} /> Confirm</button>
              <button className="verify-reject" onClick={() => onReview?.(item.id, "rejected")} disabled={status === "rejected"}><X size={15} /> Reject</button>
              {status && <button className="verify-reset" onClick={() => onReview?.(item.id, null)}><RotateCcw size={14} /> Reset</button>}
            </div>
          </article>;
        })}</div>}
      <div className="notice-card verification-notice"><ShieldCheck size={20} /><div><strong>Human verification is essential</strong><p>Confirming a finding records your review; it does not prove the source document is correct. Rejected findings remain in the original evidence list for transparency. Always consult the original PDF before taking action.</p></div></div>
    </>}
  </div>;
}
