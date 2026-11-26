import type { Evidence, ExtractedPage } from "../types";

export function analyseText(pages: ExtractedPage[]): Evidence[] {
  const evidenceByKey = new Map<string, Evidence>();
  const patterns: { type: Evidence["type"]; title: string; regex: RegExp }[] = [
    { type: "deadline", title: "Possible calendar deadline", regex: /\b(?:deadline|due date|last date|submit(?:ted)? before|on or before)\b[^.!?\n]{0,120}/gi },
    { type: "deadline", title: "Relative time limit", regex: /\bwithin\s+\d+\s+(?:(?:calendar|business)\s+)?(?:hours?|days?|weeks?)\b/gi },
    { type: "email", title: "Email address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
    { type: "link", title: "Web link", regex: /https?:\/\/[^\s<>"')\]]+/gi },
    { type: "requirement", title: "Possible requirement", regex: /\b(?:must|required to|should|need to|needs to|shall|submit|attach|include|provide|upload|register)\b[^.!?\n]{0,180}/gi },
  ];

  for (const page of pages) {
    for (const pattern of patterns) {
      for (const match of page.text.matchAll(pattern.regex)) {
        let text = match[0].trim().replace(/\s+/g, " ");
        if (pattern.type === "link") text = text.replace(/[.,;:!?]+$/g, "");
        if (pattern.type === "requirement" && (/\bendpoint\b/i.test(text) || /https?:\/\//i.test(text))) continue;
        if (!text) continue;
        const normalized = pattern.type === "link" ? text.toLowerCase().replace(/#.*$/, "") : text.toLowerCase().replace(/\s+/g, " ").trim();
        const key = `${pattern.type}:${normalized}`;
        const existing = evidenceByKey.get(key);
        if (existing) {
          if (!existing.pages.includes(page.page)) existing.pages.push(page.page);
          continue;
        }
        evidenceByKey.set(key, {
          id: `evidence-${evidenceByKey.size + 1}`,
          type: pattern.type,
          title: pattern.title,
          text,
          page: page.page,
          pages: [page.page],
        });
      }
    }
  }
  return Array.from(evidenceByKey.values());
}