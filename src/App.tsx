
import { useRef, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  Globe,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  Plus,
  UploadCloud,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  FileCheck2,
} from "lucide-react";
import "./index.css";

type Page =
  | "Dashboard"
  | "Documents"
  | "Action Planner"
  | "Execution Workspace"
  | "Verification Centre";

const navigation = [
  { name: "Dashboard" as Page, icon: LayoutDashboard },
  { name: "Documents" as Page, icon: FileText },
  { name: "Action Planner" as Page, icon: ListChecks },
  { name: "Execution Workspace" as Page, icon: Globe },
  { name: "Verification Centre" as Page, icon: ShieldCheck },
];

function App() {
  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function selectFile(file?: File) {
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF document.");
      return;
    }

    setSelectedFile(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-symbol">
            <Sparkles size={21} />
          </div>
          <div>
            <div className="brand-name">CLEARSTEP</div>
            <div className="brand-caption">INTELLIGENT TASK EXECUTION</div>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
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
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setMobileMenu(false);
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.name}</span>
                {activePage === item.name && (
                  <span className="active-indicator" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <div className="security-icon">
              <ShieldCheck size={19} />
            </div>
            <div>
              <strong>Human in control</strong>
              <p>Actions require your approval.</p>
            </div>
          </div>

          <button className="nav-item settings-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="version-label">
            CLEARSTEP v0.1.0
            <span>PROTOTYPE</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />{" "}
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="system-status">
              <span className="status-dot" />
              Systems online
            </div>
            <button className="icon-button" aria-label="Search">
              <Search size={19} />
            </button>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="avatar">C</div>
          </div>
        </header>

        {activePage === "Dashboard" ? (
          <div className="page-content">
            <div className="welcome-row">
              <div>
                <div className="eyebrow">
                  <Sparkles size={14} /> YOUR INTELLIGENT WORKSPACE
                </div>
                <h1>Good morning.</h1>
                <p className="subtitle">
                  Turn complicated information into clear, actionable steps.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() => fileInput.current?.click()}
              >
                <Plus size={18} /> New task
              </button>
            </div>

            <section className="hero-card">
              <div className="hero-content">
                <div className="hero-tag">
                  <span className="hero-tag-dot" />
                  INTRODUCING CLEARSTEP
                </div>
                <h2>
                  From information
                  <br />
                  <span>to action.</span>
                </h2>
                <p>
                  Upload a document. Understand what needs to be done.
                  Prepare every action with evidence and verification.
                </p>
                <button
                  className="hero-button"
                  onClick={() => fileInput.current?.click()}
                >
                  Analyse a document <ArrowUpRight size={17} />
                </button>
              </div>

              <div className="hero-graphic" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="graphic-core">
                  <Sparkles size={34} />
                </div>
                <div className="graphic-node node-one">
                  <FileText size={19} />
                </div>
                <div className="graphic-node node-two">
                  <ListChecks size={19} />
                </div>
                <div className="graphic-node node-three">
                  <ShieldCheck size={19} />
                </div>
              </div>
              <div className="hero-decoration">CS / 001</div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <span>Documents processed</span>
                  <FileText size={18} />
                </div>
                <div className="stat-number">—</div>
                <div className="stat-note">No documents yet</div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Actions prepared</span>
                  <ListChecks size={18} />
                </div>
                <div className="stat-number">—</div>
                <div className="stat-note">Awaiting first task</div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Verified actions</span>
                  <ShieldCheck size={18} />
                </div>
                <div className="stat-number">—</div>
                <div className="stat-note">Verification not started</div>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <h3>Get started</h3>
                <p>Give CLEARSTEP something to work with.</p>
              </div>
              <span className="section-index">01 — INPUT</span>
            </div>

            <section
              className={`upload-card ${dragging ? "dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  fileInput.current?.click();
                }
              }}
            >
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={handleFileChange}
              />

              <div className="upload-icon">
                <UploadCloud size={25} />
              </div>

              <div className="upload-text">
                <h3>
                  {selectedFile
                    ? selectedFile.name
                    : "Upload a document"}
                </h3>
                <p>
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB · PDF selected`
                    : "Drag and drop a PDF here, or browse your files."}
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInput.current?.click();
                }}
              >
                {selectedFile ? "Change file" : "Browse files"}
              </button>
            </section>

            {selectedFile && (
              <div className="selected-file">
                <CheckCircle2 size={17} />
                <span>Document selected and ready for the next development milestone.</span>
                <button onClick={() => setSelectedFile(null)}>
                  Remove
                </button>
              </div>
            )}

            <div className="section-heading workflow-heading">
              <div>
                <h3>How CLEARSTEP works</h3>
                <p>Every task follows a transparent workflow.</p>
              </div>
              <span className="section-index">02 — PROCESS</span>
            </div>

            <section className="workflow-grid">
              <WorkflowCard
                number="01"
                icon={<FileText size={20} />}
                title="Understand"
                description="Extract instructions, requirements and deadlines."
              />
              <WorkflowCard
                number="02"
                icon={<ListChecks size={20} />}
                title="Prepare"
                description="Turn requirements into structured actions."
              />
              <WorkflowCard
                number="03"
                icon={<ShieldCheck size={20} />}
                title="Verify"
                description="Check every action against its source evidence."
              />
              <WorkflowCard
                number="04"
                icon={<CheckCircle2 size={20} />}
                title="Approve"
                description="You review and authorise consequential actions."
              />
            </section>

            <footer className="page-footer">
              <span>CLEARSTEP © 2026</span>
              <span>UNDERSTAND. PREPARE. VERIFY. ACT.</span>
            </footer>
          </div>
        ) : (
          <div className="page-content secondary-page">
            <div className="eyebrow">
              <Sparkles size={14} /> CLEARSTEP WORKSPACE
            </div>
            <h1>{activePage}</h1>
            <p className="subtitle">
              This workspace is part of the CLEARSTEP architecture.
              Its functionality will be implemented in upcoming milestones.
            </p>
            <div className="coming-card">
              <div className="coming-icon">
                {activePage === "Documents" && <FileText size={25} />}
                {activePage === "Action Planner" && <ListChecks size={25} />}
                {activePage === "Execution Workspace" && <Globe size={25} />}
                {activePage === "Verification Centre" && <ShieldCheck size={25} />}
              </div>
              <h2>Under development</h2>
              <p>
                We're building this module step by step. The first
                document-processing engine is coming next.
              </p>
              <button
                className="secondary-button"
                onClick={() => setActivePage("Dashboard")}
              >
                Return to dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function WorkflowCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="workflow-card">
      <div className="workflow-top">
        <div className="workflow-icon">{icon}</div>
        <span>{number}</span>
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
}

export default App;
