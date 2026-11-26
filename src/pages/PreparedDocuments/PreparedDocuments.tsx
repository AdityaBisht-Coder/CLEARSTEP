import React from "react";
import { Clipboard, Download, FileOutput, Mail, ListChecks, FileText, ShieldCheck } from "lucide-react";
import type { DocumentResult, PlannedAction } from "../../types";
import "./PreparedDocuments.css";

type DraftKind = "checklist" | "email" | "brief";

export default function PreparedDocuments({ document, actions, onUpload }: { document: DocumentResult | null; actions: PlannedAction[]; onUpload: () => void }) {
  const [kind, setKind] = React.useState<DraftKind>("checklist");
  const [draft, setDraft] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!document) { setDraft(""); return; }
    const requirements = document.evidence.filter((item) => item.type === "requirement");
    const deadlines = document.evidence.filter((item) => item.type === "deadline");
    const emails = document.evidence.filter((item) => item.type === "email");
    const links = document.evidence.filter((item) => item.type === "link");
    let output = "";
    if (kind === "checklist") {
      output = [
        "CLEARSTEP — DOCUMENT ACTION CHECKLIST",
        `Source document: ${document.name}`,
        `Pages analysed: ${document.pages.length}`,
        "",
        "ACTION ITEMS",
        ...(actions.length ? actions.map((item, index) => `${item.completed ? "[x]" : "[ ]"} ${index + 1}. ${item.text} [Source: ${item.pages.length ? `page ${item.pages.join(", ")}` : "manually added"}]`) : ["No action candidates were detected. Review the source document and add tasks manually."]),
        "",
        "POSSIBLE DEADLINES — VERIFY IN SOURCE",
        ...(deadlines.length ? deadlines.map((item) => `- ${item.text} (page ${item.pages.join(", ")})`) : ["- None detected"]),
        "",
        "REVIEW NOTE: Automatically detected items are suggestions. Confirm all details in the original document before acting.",
      ].join("\n");
    } else if (kind === "email") {
      const recipient = emails[0]?.text ?? "[Recipient email address]";
      output = [
        "Subject: Clarification regarding " + document.name,
        "",
        `To: ${recipient}`,
        "",
        "Dear Sir/Madam,",
        "",
        `I am writing regarding the instructions provided in "${document.name}". I have reviewed the document and would appreciate clarification on the following points:`,
        "",
        ...requirements.slice(0, 5).map((item) => `- ${item.text} (source page ${item.pages.join(", ")})`),
        ...(requirements.length ? [] : ["- [Write your specific question here]"]),
        "",
        "Please let me know if any additional information or documents are required.",
        "",
        "Thank you,",
        "[Your name]",
        "[Your contact details]",
        "",
        "DRAFT ONLY — Review the recipient, facts and wording before sending.",
      ].join("\n");
    } else {
      output = [
        "CLEARSTEP — DOCUMENT PREPARATION BRIEF",
        `Source: ${document.name}`,
        `Pages: ${document.pages.length} | Extracted words: ${document.totalWords}`,
        "",
        "POSSIBLE REQUIREMENTS",
        ...(requirements.length ? requirements.map((item) => `- ${item.text} (page ${item.pages.join(", ")})`) : ["- No requirement patterns detected"]),
        "",
        "POSSIBLE DEADLINES",
        ...(deadlines.length ? deadlines.map((item) => `- ${item.text} (page ${item.pages.join(", ")})`) : ["- No deadline patterns detected"]),
        "",
        "CONTACTS",
        ...(emails.length ? emails.map((item) => `- ${item.text} (page ${item.pages.join(", ")})`) : ["- No email addresses detected"]),
        "",
        "LINKS",
        ...(links.length ? links.map((item) => `- ${item.text} (page ${item.pages.join(", ")})`) : ["- No links detected"]),
        "",
        "LIMITATION: This brief is generated using local text-pattern detection. It is not an authoritative interpretation of the source.",
      ].join("\n");
    }
    setDraft(output);
    setCopied(false);
  }, [document, actions, kind]);

  const copyDraft = async () => {
    await navigator.clipboard?.writeText(draft);
    setCopied(true);
  };
  const downloadDraft = () => {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `CLEARSTEP-${kind}-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <div className="page-content secondary-page prepared-page">
    <div className="eyebrow"><FileOutput size={14} /> DOCUMENT GENERATION</div>
    <div className="document-heading"><div><h1>Prepared Documents</h1><p className="subtitle">Turn extracted information into editable working drafts.</p></div></div>
    {!document ? <div className="empty-state"><div className="coming-icon"><FileOutput size={26} /></div><h2>Nothing to prepare yet</h2><p>Upload a PDF to generate a checklist, a draft email or a structured preparation brief.</p><button className="primary-button" onClick={onUpload}>Upload a document</button></div> : <>
      <div className="prepared-source"><FileText size={18} /><div><strong>{document.name}</strong><span>{document.pages.length} pages · {document.evidence.length} evidence candidates</span></div></div>
      <div className="draft-tabs" role="tablist" aria-label="Prepared document type">
        <button className={kind === "checklist" ? "active" : ""} onClick={() => setKind("checklist")}><ListChecks size={16} /> Action checklist</button>
        <button className={kind === "email" ? "active" : ""} onClick={() => setKind("email")}><Mail size={16} /> Email draft</button>
        <button className={kind === "brief" ? "active" : ""} onClick={() => setKind("brief")}><FileText size={16} /> Preparation brief</button>
      </div>
      <div className="draft-toolbar"><div><strong>Editable draft</strong><span>Review and modify before using.</span></div><div className="draft-actions"><button className="secondary-button" onClick={() => void copyDraft()}><Clipboard size={15} /> {copied ? "Copied" : "Copy"}</button><button className="primary-button" onClick={downloadDraft}><Download size={15} /> Download .txt</button></div></div>
      <textarea className="prepared-editor" value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck />
      <div className="notice-card prepared-notice"><ShieldCheck size={20} /><div><strong>Human review required</strong><p>These are editable drafts, not verified submissions. Confirm names, dates, recipients, requirements and every source reference before using them. CLEARSTEP never sends or submits them.</p></div></div>
    </>}
  </div>;
}