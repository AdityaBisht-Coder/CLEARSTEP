import type { ReactNode } from "react";

export default function StatCard({ icon, label, value, note }: { icon: ReactNode; label: string; value: string; note: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span>{icon}</div><div className="stat-number">{value}</div><div className="stat-note">{note}</div></div>;
}