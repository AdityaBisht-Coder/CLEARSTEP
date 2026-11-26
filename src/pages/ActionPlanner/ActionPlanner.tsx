import React from "react";
import { AlertCircle, ListChecks, Plus, ShieldCheck, Trash2 } from "lucide-react";
import type { DocumentResult, PlannedAction } from "../../types";

export default function ActionPlanner({ document, actions, setActions, onUpload }: {
  document: DocumentResult | null; actions: PlannedAction[]; setActions: (actions: PlannedAction[] | ((current: PlannedAction[]) => PlannedAction[])) => void; onUpload: () => void;
}) {
  const [newActionText, setNewActionText] = React.useState("");
  const completed = actions.filter((item) => item.completed).length;
  const addAction = () => {
    if (!newActionText.trim()) return;
    setActions((current) => [...current, { id: `manual-${Date.now()}`, text: newActionText.trim(), source: "Added manually", pages: [], completed: false }]);
    setNewActionText("");
  };
  const copyPlan = () => {
    const text = ["CLEARSTEP ACTION PLAN", ...actions.map((item, index) => `${item.completed ? "[x]" : "[ ]"} ${index + 1}. ${item.text} (Page ${item.pages.join(", ") || "Not specified"})`)].join("\n");
    void navigator.clipboard?.writeText(text);
  };
  return <div className="page-content secondary-page">
    <div className="eyebrow"><ListChecks size={14} /> ACTION MANAGEMENT</div>
    <div className="document-heading"><div><h1>Action Planner</h1><p className="subtitle">Turn document requirements into a checklist you can actually work through.</p></div><button className="secondary-button" onClick={copyPlan} disabled={!actions.length}>Copy plan</button></div>
    {!document ? <div className="empty-state"><div className="coming-icon"><ListChecks size={26} /></div><h2>Your action plan will appear here</h2><p>Upload a PDF first. CLEARSTEP will turn detected requirements and time limits into a reviewable checklist.</p><button className="primary-button" onClick={onUpload}>Upload a document</button></div> : <>
      <section className="plan-progress-card"><div className="plan-progress-top"><div><strong>{completed} of {actions.length} steps completed</strong><p>Mark each step as you finish it. Check the source PDF before acting.</p></div><span>{actions.length ? Math.round(completed / actions.length * 100) : 0}%</span></div><div className="plan-progress-track"><span style={{ width: `${actions.length ? completed / actions.length * 100 : 0}%` }} /></div></section>
      <div className="add-action-row"><input value={newActionText} onChange={(event) => setNewActionText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addAction(); }} placeholder="Add your own task..." aria-label="New task" /><button className="primary-button" disabled={!newActionText.trim()} onClick={addAction}><Plus size={16} /> Add step</button></div>
      {actions.length ? <div className="action-checklist">{actions.map((item, index) => <div className={`action-task ${item.completed ? "completed" : ""}`} key={item.id}>
        <label className="action-task-main"><input type="checkbox" checked={item.completed} onChange={(event) => setActions((current) => current.map((action) => action.id === item.id ? { ...action, completed: event.target.checked } : action))} /><span className="action-task-copy"><strong>{item.text}</strong><small>{item.source} · {item.pages.length ? `Source page${item.pages.length > 1 ? "s" : ""} ${item.pages.join(", ")}` : "Personal task"}</small></span></label>
        <button className="icon-button action-remove" onClick={() => setActions((current) => current.filter((action) => action.id !== item.id))} aria-label={`Remove task ${index + 1}`}><Trash2 size={16} /></button>
      </div>)}</div> : <div className="empty-state compact"><AlertCircle size={23} /><h3>No clear action candidates found</h3><p>Add your own steps above. The document's extracted text remains available in Documents for review.</p></div>}
      <div className="notice-card"><ShieldCheck size={20} /><div><strong>Review before acting</strong><p>Checklist items are suggestions from text-pattern matches, not verified instructions. Confirm each against its cited page in the original PDF.</p></div></div>
    </>}
  </div>;
}