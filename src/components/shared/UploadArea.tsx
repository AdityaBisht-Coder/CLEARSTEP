import { CheckCircle2, UploadCloud } from "lucide-react";
import type { DragEvent, KeyboardEvent } from "react";
import type { DocumentResult } from "../../types";

export default function UploadArea({ dragging, setDragging, onDrop, onBrowse, document, onRemove }: {
  dragging: boolean;
  setDragging: (value: boolean) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onBrowse: () => void;
  document: DocumentResult | null;
  onRemove: () => void;
}) {
  return <>
    <section className={`upload-card ${dragging ? "dragging" : ""}`}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={onBrowse}
      role="button" tabIndex={0}
      onKeyDown={(event: KeyboardEvent<HTMLElement>) => { if (event.key === "Enter" || event.key === " ") onBrowse(); }}>
      <div className="upload-icon"><UploadCloud size={25} /></div>
      <div className="upload-text">
        <h3>{document ? document.name : "Upload a document"}</h3>
        <p>{document ? `${document.pages.length} pages · ${document.totalWords} words extracted` : "Drag and drop a PDF here, or browse your files."}</p>
      </div>
      <button className="secondary-button" onClick={(event) => { event.stopPropagation(); onBrowse(); }}>{document ? "Replace PDF" : "Browse files"}</button>
    </section>
    {document && <div className="selected-file"><CheckCircle2 size={17} /><span>PDF extracted successfully in this browser.</span><button onClick={onRemove}>Remove</button></div>}
  </>;
}