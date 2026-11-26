import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import type { Page } from "../../types";

export default function Topbar({ activePage, onOpenMenu }: { activePage: Page; onOpenMenu: () => void }) {
  return <header className="topbar">
    <button className="mobile-menu" onClick={onOpenMenu} aria-label="Open menu"><Menu size={21} /></button>
    <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{activePage}</strong></div>
    <div className="topbar-actions"><div className="system-status"><span className="status-dot" /> Local processing</div>
      <button className="icon-button" aria-label="Search"><Search size={19} /></button>
      <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button><div className="avatar">C</div>
    </div>
  </header>;
}