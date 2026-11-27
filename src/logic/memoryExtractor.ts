import type { DocumentResult } from "../types";

export type LumiMemoryCategory =
  | "About Me"
  | "Projects"
  | "Goals"
  | "Preferences"
  | "Learning"
  | "Important";

export type LumiMemoryFragment = {
  id: string;
  category: LumiMemoryCategory;
  content: string;
  sourcePage: number;
};

const LABELS: Record<string, LumiMemoryCategory> = {
  "ABOUT ME": "About Me",
  PROJECT: "Projects",
  PROJECTS: "Projects",
  GOAL: "Goals",
  GOALS: "Goals",
  PREFERENCE: "Preferences",
  PREFERENCES: "Preferences",
  LEARNING: "Learning",
  IMPORTANT: "Important",
};

const LABEL_PATTERN = /^(ABOUT ME|PROJECTS?|GOALS?|PREFERENCES?|LEARNING|IMPORTANT)\s*:\s*(.*)$/i;

// Only explicitly labelled statements are imported. Wrapped PDF lines are
// joined to their labelled statement, but headings and unrelated text are ignored.
export function extractMemoryFragments(document: DocumentResult | null): LumiMemoryFragment[] {
  if (!document) return [];

  const found = new Map<string, LumiMemoryFragment>();

  for (const page of document.pages) {
    let current: LumiMemoryFragment | null = null;

    const saveCurrent = () => {
      if (!current) return;
      current.content = current.content.trim().replace(/\s+/g, " ");
      if (current.content.length >= 8 && current.content.length <= 2000) {
        const key = current.category + "::" + current.content.toLowerCase();
        if (!found.has(key)) found.set(key, current);
      }
      current = null;
    };

    for (const rawLine of page.text.split(/\r?\n/)) {
      const line = rawLine.replace(/^\s*(?:[-*•▪]\s*)?/, "").trim();
      if (!line) continue;

      const match = line.match(LABEL_PATTERN);
      if (match) {
        saveCurrent();
        const category = LABELS[match[1].toUpperCase()];
        const content = match[2].trim();
        if (category && content) {
          current = {
            id: "memory-" + (found.size + 1),
            category,
            content,
            sourcePage: page.page,
          };
        }
        continue;
      }

      // PDF extraction may wrap a long paragraph onto another visual line.
      // Continue only lower-case sentence fragments to avoid swallowing headings.
      if (
        current &&
        /^[a-z0-9("'‘“]/.test(line) &&
        current.content.length + line.length < 2000
      ) {
        current.content += " " + line;
      } else {
        saveCurrent();
      }
    }

    saveCurrent();
  }

  return Array.from(found.values()).slice(0, 20);
}
