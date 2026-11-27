import type { DocumentResult } from "../types";

export type LumiMemoryCategory =
  | "About Me" | "Projects" | "Goals"
  | "Preferences" | "Learning" | "Important";

export type LumiMemoryFragment = {
  id: string;
  category: LumiMemoryCategory;
  content: string;
  sourcePage: number;
};

const LABELS: Record<string, LumiMemoryCategory> = {
  "ABOUT ME": "About Me",
  "PROJECT": "Projects",
  "PROJECTS": "Projects",
  "GOAL": "Goals",
  "GOALS": "Goals",
  "PREFERENCE": "Preferences",
  "PREFERENCES": "Preferences",
  "LEARNING": "Learning",
  "IMPORTANT": "Important",
};

// Only explicitly labelled statements are imported. This avoids turning
// arbitrary document sentences into personal memories.
export function extractMemoryFragments(document: DocumentResult | null): LumiMemoryFragment[] {
  if (!document) return [];
  const found = new Map<string, LumiMemoryFragment>();

  for (const page of document.pages) {
    for (const rawLine of page.text.split(/\r?\n/)) {
      const line = rawLine.replace(/^\s*(?:[-*•▪]\s*)?/, "").trim();
      const match = line.match(/^(ABOUT ME|PROJECTS?|GOALS?|PREFERENCES?|LEARNING|IMPORTANT)\s*:\s*(.{8,500})$/i);
      if (!match) continue;
      const label = match[1].toUpperCase();
      const category = LABELS[label];
      const content = match[2].trim().replace(/\s+/g, " ");
      if (!category || content.length < 8) continue;
      const key = category + "::" + content.toLowerCase();
      if (!found.has(key)) {
        found.set(key, {
          id: "memory-" + (found.size + 1),
          category,
          content,
          sourcePage: page.page,
        });
      }
    }
  }
  return Array.from(found.values()).slice(0, 20);
}
