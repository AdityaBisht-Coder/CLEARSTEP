export type Page = "Dashboard" | "Documents" | "Action Planner" | "Prepared Documents" | "Execution Workspace" | "Verification Centre";

export type Evidence = {
  id: string;
  type: "deadline" | "email" | "link" | "requirement";
  title: string;
  text: string;
  page: number;
  pages: number[];
};

export type ExtractedPage = { page: number; text: string };

export type DocumentResult = {
  name: string;
  pages: ExtractedPage[];
  evidence: Evidence[];
  totalWords: number;
};

export type PlannedAction = {
  id: string;
  text: string;
  source: string;
  pages: number[];
  completed: boolean;
};

export type AppPageProps = {
  document: DocumentResult | null;
  onUpload: () => void;
};