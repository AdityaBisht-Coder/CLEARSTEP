import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileText, Play, RotateCcw, ShieldCheck } from "lucide-react";
import type { DocumentResult } from "../../types";
import { extractMemoryFragments } from "../../logic/memoryExtractor";
import type { LumiMemoryFragment } from "../../logic/memoryExtractor";
import "./DemoPortal.css";

type FormData = { name: string; email: string; phone: string; dateOfBirth: string; institution: string; course: string; annualIncome: string; statement: string };
const EMPTY: FormData = { name: "", email: "", phone: "", dateOfBirth: "", institution: "", course: "", annualIncome: "", statement: "" };

function valueAfter(text: string, labels: string[]): string {
  for (const label of labels) {
    const match = text.match(new RegExp("(?:^|\\n)\\s*" + label + "\\s*:\\s*([^\\n]+)", "i"));
    if (match?.[1]) return match[1].trim();
  }
  return "";
}
function extractProfile(document: DocumentResult | null): FormData {
  if (!document) return EMPTY;
  const text = document.pages.map((page) => page.text).join("\n");
  return {
    name: valueAfter(text, ["Applicant name", "Full name"]),
    email: valueAfter(text, ["Email address", "Email"]),
    phone: valueAfter(text, ["Mobile number", "Phone number", "Phone"]),
    dateOfBirth: valueAfter(text, ["Date of birth", "DOB"]),
    institution: valueAfter(text, ["Institution", "School or college"]),
    course: valueAfter(text, ["Course applied for", "Course"]),
    annualIncome: valueAfter(text, ["Annual family income", "Family income"]),
    statement: valueAfter(text, ["Why are you applying", "Statement of purpose", "Application statement"]),
  };
}

export default function DemoPortal({ document }: { document: DocumentResult | null }) {
  const extracted = useMemo(() => extractProfile(document), [document]);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [filled, setFilled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const memoryFragments = useMemo(() => extractMemoryFragments(document), [document]);
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [transferStatus, setTransferStatus] = useState("");
  useEffect(() => {
    setSelectedMemoryIds(memoryFragments.map((item) => item.id));
    setTransferStatus("");
  }, [memoryFragments]);

  useEffect(() => { setForm(extracted); setFilled(false); setSubmitted(false); }, [extracted]);

  const fields = [
    ["name", "Applicant full name", "text"],
    ["email", "Email address", "email"],
    ["phone", "Mobile number", "tel"],
    ["dateOfBirth", "Date of birth", "text"],
    ["institution", "School / institution", "text"],
    ["course", "Course / programme", "text"],
    ["annualIncome", "Annual family income", "text"],
  ] as const;
  const populated = fields.filter(([key]) => Boolean(form[key])).length + (form.statement ? 1 : 0);

  function update(key: keyof FormData, value: string) { setForm((current) => ({ ...current, [key]: value })); setSubmitted(false); }
  function prepareForm() { setForm(extracted); setFilled(true); setSubmitted(false); }
  function resetForm() { setForm(EMPTY); setFilled(false); setSubmitted(false); }
  function transferMemoriesToLumi() {
    const approved = memoryFragments.filter((item) => selectedMemoryIds.includes(item.id));
    if (!approved.length) { setTransferStatus("Select at least one memory fragment first."); return; }

    const popup = window.open("https://lumiworks.org/memory", "lumi-memory-import");
    if (!popup) { setTransferStatus("Popup blocked. Allow popups for CLEARSTEP and try again."); return; }

    const requestId = crypto.randomUUID();
    let sent = false;
    setTransferStatus("Waiting for Lumi Memory to connect…");

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timeout);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://lumiworks.org" || event.source !== popup) return;
      if (event.data?.type === "CLEARSTEP_LUMI_READY" && !sent) {
        sent = true;
        setTransferStatus("Lumi connected. Sending approved memories…");
        popup.postMessage({
          type: "CLEARSTEP_IMPORT_MEMORIES",
          protocol: 1,
          requestId,
          approved: true,
          memories: approved.map((item) => ({
            category: item.category,
            content: item.content,
            sourcePage: item.sourcePage,
          })),
        }, "https://lumiworks.org");
      } else if (event.data?.type === "CLEARSTEP_IMPORT_RESULT" && event.data.requestId === requestId) {
        cleanup();
        if (event.data.ok) {
          setTransferStatus("Success: Lumi saved " + event.data.saved + " memories; " + event.data.duplicates + " duplicates skipped.");
        } else {
          setTransferStatus("Lumi could not import the memories: " + (event.data.error || "Unknown error"));
        }
      }
    };
    window.addEventListener("message", onMessage);
    const timeout = window.setTimeout(() => {
      cleanup();
      setTransferStatus("Connection timed out. Keep the Lumi Memory tab open, then try again.");
    }, 20000);
  }


  return <div className="page-content secondary-page demo-portal-page">
    <div className="eyebrow"><ClipboardCheck size={14} /> CONTROLLED AUTOMATION DEMONSTRATION</div>
    <div className="document-heading"><div><h1>Scholarship application portal</h1><p className="subtitle">A fictional portal used to demonstrate evidence-linked form preparation.</p></div><span className="demo-mode-pill">SIMULATION</span></div>
    <div className="demo-safety"><ShieldCheck size={19}/><div><strong>Safe demo environment</strong><p>This is not a real scholarship website. No information is transmitted or stored on a server. The final action only creates a local simulation receipt.</p></div></div>
    {!document && <div className="demo-no-document"><FileText size={22}/><div><strong>Upload the CLEARSTEP demonstration PDF first</strong><p>Then return here. The form will be prepared from labelled fields found in that document.</p></div></div>}
    <section className="lumi-transfer-card">
      <div className="lumi-transfer-heading">
        <div><span>LIVE INTEGRATION · LUMI MEMORY</span><h2>Extract memories from this PDF</h2>
        <p>Only clearly labelled statements are considered. Review the fragments and approve the transfer.</p></div>
        <strong>{memoryFragments.length} found</strong>
      </div>
      {memoryFragments.length === 0 ? <div className="lumi-transfer-empty">
        No labelled memory fragments found. Use lines such as <code>PROJECT: Building a personal finance tracker.</code> and upload the PDF again.
      </div> : <>
        <div className="lumi-memory-list">
          {memoryFragments.map((item: LumiMemoryFragment) => <label className="lumi-memory-item" key={item.id}>
            <input type="checkbox" checked={selectedMemoryIds.includes(item.id)} onChange={(event) => setSelectedMemoryIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} />
            <span><b>{item.category}</b><span>{item.content}</span><small>Evidence: PDF page {item.sourcePage}</small></span>
          </label>)}
        </div>
        <div className="lumi-transfer-footer">
          <span>{selectedMemoryIds.length} of {memoryFragments.length} selected · Human approval required</span>
          <button className="primary-button" onClick={transferMemoriesToLumi} disabled={!selectedMemoryIds.length}>Approve & transfer to Lumi</button>
        </div>
      </>}
      {transferStatus && <div className="lumi-transfer-status" role="status">{transferStatus}</div>}
      <p className="lumi-transfer-note"><ShieldCheck size={15}/> CLEARSTEP sends only the fragments you select. Lumi stores them in its existing local memory database; duplicate entries are skipped.</p>
    </section>
    <div className="demo-layout">
      <section className="demo-form-card">
        <div className="demo-form-heading"><div><span>APPLICATION FORM</span><h2>Applicant details</h2></div><span className="demo-step">01 / 03</span></div>
        <div className="demo-fields">
          {fields.map(([key, label, type]) => <label className="demo-field" key={key}><span>{label}</span><input type={type} value={form[key]} placeholder="Not found in source document" onChange={(event) => update(key, event.target.value)} /></label>)}
          <label className="demo-field demo-field-wide"><span>Application statement</span><textarea value={form.statement} placeholder="Not found in source document" rows={4} onChange={(event) => update("statement", event.target.value)} /></label>
        </div>
        <div className="demo-form-actions">
          <button className="secondary-button" onClick={resetForm}><RotateCcw size={15}/> Clear</button>
          <button className="primary-button" onClick={prepareForm} disabled={!document}><Play size={15}/> Auto-fill from PDF</button>
        </div>
        {filled && <div className="demo-success"><CheckCircle2 size={17}/> Form prepared from the uploaded document. Review and edit every field before continuing.</div>}
        <div className="demo-review-row"><button className="demo-link-button" onClick={() => setShowSources((value) => !value)}>{showSources ? "Hide" : "Show"} extraction details</button><span>{populated} of 8 fields populated</span></div>
        {showSources && <div className="demo-source-list">{fields.map(([key, label]) => <div key={key}><span>{label}</span><strong>{extracted[key] ? "Found in PDF" : "Not found"}</strong></div>)}<div><span>Application statement</span><strong>{extracted.statement ? "Found in PDF" : "Not found"}</strong></div></div>}
        <button className="demo-submit-button" disabled={!filled || populated === 0} onClick={() => setSubmitted(true)}>Review & simulate submission</button>
        {submitted && <div className="demo-receipt"><CheckCircle2 size={22}/><div><strong>Simulation completed</strong><p>Demo receipt: CS-DEMO-2026-001. No external submission occurred.</p></div></div>}
      </section>
      <aside className="demo-side-card">
        <div className="demo-side-icon"><AlertTriangle size={20}/></div><h3>Evidence before action</h3><p>Every auto-filled value should be checked against the original source document. Missing values remain blank rather than being guessed.</p>
        <div className="demo-side-stat"><strong>{document?.pages.length ?? 0}</strong><span>Source pages loaded</span></div>
        <div className="demo-side-stat"><strong>{populated}/8</strong><span>Form fields populated</span></div>
        <div className="demo-side-note">Human approval is required. CLEARSTEP does not send this form to any organisation.</div>
      </aside>
    </div>
  </div>;
}
