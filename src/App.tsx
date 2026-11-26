import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { AlertCircle, X } from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import Documents from "./pages/Documents/Documents";
import ActionPlanner from "./pages/ActionPlanner/ActionPlanner";
import PreparedDocuments from "./pages/PreparedDocuments/PreparedDocuments";
import ModulePage from "./pages/ModulePage/ModulePage";
import { extractPdf } from "./logic/pdfExtractor";
import type { DocumentResult, Evidence, Page, PlannedAction } from "./types";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [document, setDocument] = useState<DocumentResult | null>(null);
  const [actions, setActions] = useState<PlannedAction[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function selectFile(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF document."); return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("This prototype supports PDFs up to 25 MB."); return;
    }
    setError(""); setLoading(true); setActivePage("Documents");
    try {
      const result = await extractPdf(file);
      setDocument(result); setSelectedEvidence(null);
      setActions(result.evidence
        .filter((item) => item.type === "requirement" || item.type === "deadline")
        .filter((item) => item.text.length >= 28)
        .map((item) => ({ id: item.id, text: item.text, source: item.title, pages: item.pages, completed: false })));
    } catch (err) {
      console.error(err);
      setError("We couldn't read this PDF. It may be damaged, password-protected, or scanned without selectable text.");
    } finally { setLoading(false); }
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); setDragging(false); void selectFile(event.dataTransfer.files?.[0]);
  };
  const onUpload = () => fileInput.current?.click();
  const onRemoveDocument = () => { setDocument(null); setActions([]); setSelectedEvidence(null); };

  return <div className="app-shell">
    <Sidebar activePage={activePage} onNavigate={setActivePage} mobileMenu={mobileMenu} onClose={() => setMobileMenu(false)} />
    <main className="main-area">
      <Topbar activePage={activePage} onOpenMenu={() => setMobileMenu(true)} />
      {error && <div className="error-banner"><AlertCircle size={18} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
      <input ref={fileInput} type="file" accept=".pdf,application/pdf" hidden onChange={(event) => { void selectFile(event.target.files?.[0]); event.target.value = ""; }} />
      {activePage === "Dashboard" && <Dashboard document={document} dragging={dragging} setDragging={setDragging} onDrop={onDrop} onUpload={onUpload} onRemove={onRemoveDocument} />}
      {activePage === "Documents" && <Documents document={document} loading={loading} onUpload={onUpload} onRemove={onRemoveDocument} selectedEvidence={selectedEvidence} onSelectEvidence={setSelectedEvidence} />}
      {activePage === "Action Planner" && <ActionPlanner document={document} actions={actions} setActions={setActions} onUpload={onUpload} />}
      {activePage === "Prepared Documents" && <PreparedDocuments document={document} actions={actions} onUpload={onUpload} />}
      {activePage === "Execution Workspace" && <ModulePage title="Execution Workspace" description="Prepare digital tasks in a controlled workspace." document={document} icon="execution" />}
      {activePage === "Verification Centre" && <ModulePage title="Verification Centre" description="Review the evidence supporting each proposed action." document={document} icon="verification" />}
    </main>
  </div>;
}