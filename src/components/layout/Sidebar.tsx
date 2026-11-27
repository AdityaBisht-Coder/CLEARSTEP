import { FileText, Globe, LayoutDashboard, ListChecks, ShieldCheck, Sparkles, Settings, FileOutput, X, ClipboardCheck } from "lucide-react";
import type { Page } from "../../types";

const items = [
  { name: "Dashboard" as Page, icon: LayoutDashboard },
  { name: "Documents" as Page, icon: FileText },
  { name: "Action Planner" as Page, icon: ListChecks },
  { name: "Prepared Documents" as Page, icon: FileOutput },
  { name: "Execution Workspace" as Page, icon: Globe },
  { name: "Demo Portal" as Page, icon: ClipboardCheck },
  { name: "Verification Centre" as Page, icon: ShieldCheck },
];

export default function Sidebar({ activePage, onNavigate, mobileMenu, onClose }: {
  activePage: Page; onNavigate: (page: Page) => void; mobileMenu: boolean; onClose: () => void;
}) {
  return <>
    {mobileMenu && <div className="mobile-overlay" onClick={onClose} />}
    <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-symbol"><Sparkles size={21} /></div>
        <div><div className="brand-name">CLEARSTEP</div><div className="brand-caption">INTELLIGENT TASK EXECUTION</div></div>
        <button className="mobile-close" onClick={onClose} aria-label="Close menu"><X size={20} /></button>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="navigation">
        {items.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${activePage === name ? "active" : ""}`} onClick={() => { onNavigate(name); onClose(); }}>
          <Icon size={18} strokeWidth={1.8} /><span>{name}</span>{activePage === name && <span className="active-indicator" />}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="security-card"><div className="security-icon"><ShieldCheck size={19} /></div><div><strong>Human in control</strong><p>Actions require your approval.</p></div></div>
        <button className="nav-item settings-item"><Settings size={18} /><span>Settings</span></button>
        <div className="version-label">CLEARSTEP v0.4.0 <span>PROTOTYPE</span></div>
      </div>
    </aside>
  </>;
}