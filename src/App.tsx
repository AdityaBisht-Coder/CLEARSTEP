
import { useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  LayoutDashboard, FileText, ListChecks, Globe, ShieldCheck,
  Settings, Search, Bell, Plus, UploadCloud, ArrowUpRight,
  CheckCircle2, AlertCircle, Sparkles, ChevronRight, Menu, X,
  CalendarDays, Mail, ExternalLink, Trash2, LoaderCircle,
} from "lucide-react";
import "./index.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type Page =
  | "Dashboard"
  | "Documents"
  | "Action Planner"
  | "Execution Workspace"
  | "Verification Centre";

type Evidence = {
  id: string;
  type: "deadline" | "email" | "link" | "requirement";
  title: string;
  text: string;
  page: number;
  pages: number[];
};

type ExtractedPage = {
  page: number;
  text: string;
};

type DocumentResult = {
  name: string;
  pages: ExtractedPage[];
  evidence: Evidence[];
  totalWords: number;
};

const navigation = [
  { name: "Dashboard" as Page, icon: LayoutDashboard },
  { name: "Documents" as Page, icon: FileText },
  { name: "Action Planner" as Page, icon: ListChecks },
  { name: "Execution Workspace" as Page, icon: Globe },
  { name: "Verification Centre" as Page, icon: ShieldCheck },
];

function analyseText(pages: ExtractedPage[]): Evidence[] {
  const evidenceByKey = new Map<string, Evidence>();

  const patterns: {
    type: Evidence["type"];
    title: string;
    regex: RegExp;
  }[] = [
    {
      type: "deadline",
      title: "Possible calendar deadline",
      regex: /\b(?:deadline|due date|last date|submit(?:ted)? before|on or before)\b[^.!?\n]{0,120}/gi,
    },
    {
      type: "deadline",
      title: "Relative time limit",
      regex: /\bwithin\s+\d+\s+(?:(?:calendar|business)\s+)?(?:hours?|days?|weeks?)\b/gi,
    },
    {
      type: "email",
      title: "Email address",
      regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    },
    {
      type: "link",
      title: "Web link",
      regex: /https?:\/\/[^\s<>"')\]]+/gi,
    },
    {
      type: "requirement",
      title: "Possible requirement",
      regex: /\b(?:must|required to|should|need to|needs to|shall|submit|attach|include|provide|upload|register)\b[^.!?\n]{0,180}/gi,
    },
  ];

  for (const page of pages) {
    for (const pattern of patterns) {
      for (const match of page.text.matchAll(pattern.regex)) {
        let text = match[0].trim().replace(/\s+/g, " ");
        if (pattern.type === "link") {
          text = text.replace(/[.,;:!?]+$/g, "");
        }
        if (!text) continue;

        const normalized = pattern.type === "link"
          ? text.toLowerCase().replace(/#.*$/, "")
          : text.toLowerCase().replace(/\s+/g, " ").trim();
        const key = `${pattern.type}:${normalized}`;
        const existing = evidenceByKey.get(key);

        if (existing) {
          if (!existing.pages.includes(page.page)) existing.pages.push(page.page);
          continue;
        }

        evidenceByKey.set(key, {
          id: `evidence-${evidenceByKey.size + 1}`,
          type: pattern.type,
          title: pattern.title,
          text,
          page: page.page,
          pages: [page.page],
        });
      }
    }
  }

  return Array.from(evidenceByKey.values());
}

async function extractPdf(file: File): Promise<DocumentResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: ExtractedPage[] = [];
  let totalWords = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const text = content.items
      .filter((item) => "str" in item)
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    totalWords += text ? text.split(/\s+/).length : 0;
    pages.push({ page: pageNumber, text });
  }

  return {
    name: file.name,
    pages,
    evidence: analyseText(pages),
    totalWords,
  };
}

function App() {
  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [document, setDocument] = useState<DocumentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function selectFile(file?: File) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF document.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("This prototype supports PDFs up to 25 MB.");
      return;
    }

    setError("");
    setLoading(true);
    setActivePage("Documents");

    try {
      const result = await extractPdf(file);
      setDocument(result);
      setSelectedEvidence(null);
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't read this PDF. It may be damaged, password-protected, or scanned without selectable text.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    void selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void selectFile(event.dataTransfer.files?.[0]);
  }

  const deadlines = document?.evidence.filter((item) => item.type === "deadline") ?? [];
  const requirements = document?.evidence.filter((item) => item.type === "requirement") ?? [];
  const contacts = document?.evidence.filter((item) => item.type === "email") ?? [];
  const links = document?.evidence.filter((item) => item.type === "link") ?? [];

  return (
    <div className="app-shell">
      {mobileMenu && (
        <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-symbol"><Sparkles size={21} /></div>
          <div>
            <div className="brand-name">CLEARSTEP</div>
            <div className="brand-caption">INTELLIGENT TASK EXECUTION</div>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.name);
                  setMobileMenu(false);
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.name}</span>
                {activePage === item.name && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <div className="security-icon"><ShieldCheck size={19} /></div>
            <div>
              <strong>Human in control</strong>
              <p>Actions require your approval.</p>
            </div>
          </div>
          <button className="nav-item settings-item">
            <Settings size={18} /><span>Settings</span>
          </button>
          <div className="version-label">CLEARSTEP v0.2.0 <span>PROTOTYPE</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} /> <strong>{activePage}</strong>
          </div>
          <div className="topbar-actions">
            <div className="system-status"><span className="status-dot" /> Local processing</div>
            <button className="icon-button" aria-label="Search"><Search size={19} /></button>
            <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
            <div className="avatar">C</div>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button>
          </div>
        )}

        <input
          ref={fileInput}
          type="file"
          accept=".pdf,application/pdf"
          hidden
          onChange={handleFileChange}
        />

        {activePage === "Dashboard" && (
          <div className="page-content">
            <div className="welcome-row">
              <div>
                <div className="eyebrow"><Sparkles size={14} /> YOUR INTELLIGENT WORKSPACE</div>
                <h1>Good morning.</h1>
                <p className="subtitle">Turn complicated information into clear, actionable steps.</p>
              </div>
              <button className="primary-button" onClick={() => fileInput.current?.click()}>
                <Plus size={18} /> New task
              </button>
            </div>

            <section className="hero-card">
              <div className="hero-content">
                <div className="hero-tag"><span className="hero-tag-dot" /> INTRODUCING CLEARSTEP</div>
                <h2>From information<br /><span>to action.</span></h2>
                <p>Upload a document. Understand what needs to be done. Prepare every action with evidence and verification.</p>
                <button className="hero-button" onClick={() => fileInput.current?.click()}>
                  Analyse a document <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="hero-graphic" aria-hidden="true">
                <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                <div className="graphic-core"><Sparkles size={34} /></div>
                <div className="graphic-node node-one"><FileText size={19} /></div>
                <div className="graphic-node node-two"><ListChecks size={19} /></div>
                <div className="graphic-node node-three"><ShieldCheck size={19} /></div>
              </div>
              <div className="hero-decoration">CS / 002</div>
            </section>

            <section className="stats-grid">
              <StatCard icon={<FileText size={18} />} label="Documents processed" value={document ? "1" : "0"} note={document ? "PDF extracted locally" : "No documents yet"} />
              <StatCard icon={<ListChecks size={18} />} label="Evidence items found" value={document ? String(document.evidence.length) : "0"} note="Candidate requirements and references" />
              <StatCard icon={<ShieldCheck size={18} />} label="Verified actions" value="0" note="Human review not completed" />
            </section>

            <div className="section-heading">
              <div><h3>Get started</h3><p>Give CLEARSTEP something to work with.</p></div>
              <span className="section-index">01 — INPUT</span>
            </div>

            <UploadArea
              dragging={dragging}
              setDragging={setDragging}
              onDrop={handleDrop}
              onBrowse={() => fileInput.current?.click()}
              document={document}
              onRemove={() => setDocument(null)}
            />

            <div className="section-heading workflow-heading">
              <div><h3>How CLEARSTEP works</h3><p>Every task follows a transparent workflow.</p></div>
              <span className="section-index">02 — PROCESS</span>
            </div>
            <section className="workflow-grid">
              <WorkflowCard number="01" icon={<FileText size={20} />} title="Understand" description="Extract instructions, requirements and deadlines." />
              <WorkflowCard number="02" icon={<ListChecks size={20} />} title="Prepare" description="Turn requirements into structured actions." />
              <WorkflowCard number="03" icon={<ShieldCheck size={20} />} title="Verify" description="Check every action against its source evidence." />
              <WorkflowCard number="04" icon={<CheckCircle2 size={20} />} title="Approve" description="You review and authorise consequential actions." />
            </section>
            <footer className="page-footer"><span>CLEARSTEP © 2026</span><span>UNDERSTAND. PREPARE. VERIFY. ACT.</span></footer>
          </div>
        )}

        {activePage === "Documents" && (
          <div className="page-content">
            <div className="eyebrow"><FileText size={14} /> DOCUMENT INTELLIGENCE</div>
            <div className="document-heading">
              <div>
                <h1>Documents</h1>
                <p className="subtitle">Extract text and inspect evidence from your PDF files.</p>
              </div>
              <button className="primary-button" onClick={() => fileInput.current?.click()}><Plus size={17} /> Upload PDF</button>
            </div>

            {loading && (
              <div className="processing-card">
                <LoaderCircle className="spin" size={25} />
                <div><strong>Reading your document...</strong><p>Extracting text locally, page by page.</p></div>
              </div>
            )}

            {!loading && !document && (
              <div className="empty-state">
                <div className="coming-icon"><UploadCloud size={26} /></div>
                <h2>No document analysed yet</h2>
                <p>Upload a text-based PDF to extract its contents and discover possible tasks.</p>
                <button className="primary-button" onClick={() => fileInput.current?.click()}>Choose a PDF</button>
              </div>
            )}

            {document && !loading && (
              <>
                <section className="document-summary">
                  <div className="document-file-icon"><FileText size={25} /></div>
                  <div className="document-file-info">
                    <strong>{document.name}</strong>
                    <p>{document.pages.length} pages · {document.totalWords.toLocaleString()} words · Processed in your browser</p>
                  </div>
                  <button className="icon-button" onClick={() => setDocument(null)} title="Remove document"><Trash2 size={18} /></button>
                </section>

                <section className="stats-grid document-stats">
                  <StatCard icon={<CalendarDays size={18} />} label="Possible deadlines" value={String(deadlines.length)} note="Requires human confirmation" />
                  <StatCard icon={<ListChecks size={18} />} label="Possible requirements" value={String(requirements.length)} note="Detected by text patterns" />
                  <StatCard icon={<ExternalLink size={18} />} label="Links and contacts" value={String(links.length + contacts.length)} note="Found in extracted text" />
                </section>

                <div className="section-heading">
                  <div><h3>Evidence explorer</h3><p>Each result links back to its source page.</p></div>
                  <span className="section-index">02 — EVIDENCE</span>
                </div>

                {document.evidence.length === 0 ? (
                  <div className="empty-state compact">
                    <AlertCircle size={24} />
                    <h3>No matching patterns found</h3>
                    <p>The PDF may contain scanned images rather than selectable text, or it may use wording our basic detector does not recognise.</p>
                  </div>
                ) : (
                  <div className="evidence-list">
                    {document.evidence.map((item) => (
                      <button
                        key={item.id}
                        className={`evidence-item ${selectedEvidence?.id === item.id ? "selected" : ""}`}
                        onClick={() => setSelectedEvidence(item)}
                      >
                        <span className={`evidence-type ${item.type}`}>
                          {item.type === "deadline" ? <CalendarDays size={16} /> : item.type === "email" ? <Mail size={16} /> : item.type === "link" ? <ExternalLink size={16} /> : <ListChecks size={16} />}
                        </span>
                        <span className="evidence-copy">
                          <strong>{item.title}</strong>
                          <span>{item.text}</span>
                        </span>
                        <span className="page-reference">PAGE{item.pages.length > 1 ? "S" : ""} {item.pages.join(", ")}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedEvidence && (
                  <section className="source-panel">
                    <div className="section-heading">
                      <div><h3>Evidence details</h3><p>Source reference for the selected result.</p></div>
                      <button className="icon-button" onClick={() => setSelectedEvidence(null)} aria-label="Close details"><X size={18} /></button>
                    </div>
                    <div className="source-quote">{selectedEvidence.text}</div>
                    <div className="source-meta"><FileText size={15} /> {document.name} · Page{selectedEvidence.pages.length > 1 ? "s" : ""} {selectedEvidence.pages.join(", ")}</div>
                    <p className="disclaimer">This is a text-pattern match, not an AI-confirmed interpretation. Check the original PDF before relying on it.</p>
                  </section>
                )}

                <div className="section-heading workflow-heading">
                  <div><h3>Extracted page text</h3><p>Review the text CLEARSTEP actually received.</p></div>
                  <span className="section-index">03 — SOURCE</span>
                </div>
                <div className="page-text-list">
                  {document.pages.map((page) => (
                    <details key={page.page} className="page-text-card">
                      <summary>Page {page.page}<span>{page.text ? `${page.text.split(/\s+/).length} words` : "No selectable text"}</span></summary>
                      <p>{page.text || "No selectable text was extracted from this page."}</p>
                    </details>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activePage === "Action Planner" && (
          <ModulePage title="Action Planner" icon={<ListChecks size={25} />} description="Candidate actions extracted from your document." document={document}>
            {document ? (
              <div className="evidence-list">
                {requirements.map((item) => <EvidenceRow key={item.id} item={item} onClick={() => { setSelectedEvidence(item); setActivePage("Documents"); }} />)}
                {deadlines.map((item) => <EvidenceRow key={item.id} item={item} onClick={() => { setSelectedEvidence(item); setActivePage("Documents"); }} />)}
                {requirements.length + deadlines.length === 0 && <p>No candidate actions found. Review the extracted document text.</p>}
              </div>
            ) : null}
          </ModulePage>
        )}

        {activePage === "Execution Workspace" && (
          <ModulePage title="Execution Workspace" icon={<Globe size={25} />} description="Prepare digital tasks in a controlled workspace." document={document}>
            <div className="notice-card"><ShieldCheck size={20} /><div><strong>Safe prototype mode</strong><p>Real websites, emails and submissions are not connected. Future actions will require explicit user approval.</p></div></div>
            {document && <p>Detected email addresses: {contacts.length}. Detected links: {links.length}.</p>}
          </ModulePage>
        )}

        {activePage === "Verification Centre" && (
          <ModulePage title="Verification Centre" icon={<ShieldCheck size={25} />} description="Review the evidence supporting each proposed action." document={document}>
            <div className="notice-card"><AlertCircle size={20} /><div><strong>Human verification required</strong><p>Pattern detection is not proof of correctness. CLEARSTEP has not marked any action as verified.</p></div></div>
            {document && <p>{document.evidence.length} evidence items are available for review.</p>}
          </ModulePage>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span>{icon}</div><div className="stat-number">{value}</div><div className="stat-note">{note}</div></div>;
}

function UploadArea({ dragging, setDragging, onDrop, onBrowse, document, onRemove }: {
  dragging: boolean;
  setDragging: (value: boolean) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onBrowse: () => void;
  document: DocumentResult | null;
  onRemove: () => void;
}) {
  return (
    <>
      <section className={`upload-card ${dragging ? "dragging" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={onBrowse}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onBrowse(); }}>
        <div className="upload-icon"><UploadCloud size={25} /></div>
        <div className="upload-text">
          <h3>{document ? document.name : "Upload a document"}</h3>
          <p>{document ? `${document.pages.length} pages · ${document.totalWords} words extracted` : "Drag and drop a PDF here, or browse your files."}</p>
        </div>
        <button className="secondary-button" onClick={(event) => { event.stopPropagation(); onBrowse(); }}>{document ? "Replace PDF" : "Browse files"}</button>
      </section>
      {document && <div className="selected-file"><CheckCircle2 size={17} /><span>PDF extracted successfully in this browser.</span><button onClick={onRemove}>Remove</button></div>}
    </>
  );
}

function WorkflowCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return <div className="workflow-card"><div className="workflow-top"><div className="workflow-icon">{icon}</div><span>{number}</span></div><h4>{title}</h4><p>{description}</p></div>;
}

function EvidenceRow({ item, onClick }: { item: Evidence; onClick: () => void }) {
  return <button className="evidence-item" onClick={onClick}><span className={`evidence-type ${item.type}`}><ListChecks size={16} /></span><span className="evidence-copy"><strong>{item.title}</strong><span>{item.text}</span></span><span className="page-reference">PAGE{item.pages.length > 1 ? "S" : ""} {item.pages.join(", ")}</span></button>;
}

function ModulePage({ title, icon, description, document, children }: {
  title: string;
  icon: React.ReactNode;
  description: string;
  document: DocumentResult | null;
  children: React.ReactNode;
}) {
  return <div className="page-content secondary-page"><div className="eyebrow">{icon} CLEARSTEP WORKSPACE</div><h1>{title}</h1><p className="subtitle">{description}</p><div className="coming-card module-card">{children}{!document && <p>Upload a PDF in Documents to populate this workspace.</p>}</div></div>;
}

export default App;
