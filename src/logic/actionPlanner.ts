import type { DocumentResult, PlannedAction } from "../types";

const ACTION_START = /^(?:(?:all )?(?:applicants?|students?|users?|candidates?|participants?)\\s+(?:must|should|shall|need to|are required to|required to)\\s+|you\\s+(?:must|should|need to)\\s+)?(?:submit|upload|provide|attach|include|complete|register|send|obtain|prepare|contact|select|create|save|fill(?: in| out)?|sign|email|apply|deliver|present|confirm|return|pay|bring|visit|download|print|check|review|enter|choose|verify)\\b/i;

function toInstruction(sentence: string): string {
  return sentence
    .replace(/^(?:(?:all )?(?:applicants?|students?|users?|candidates?|participants?)\\s+(?:must|should|shall|need to|are required to|required to)|you\\s+(?:must|should|need to))\\s+/i, "")
    .replace(/^you\\s+/i, "")
    .replace(/\\s+/g, " ")
    .trim();
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\\s+/g, " ").trim();
}

export function buildActionPlan(document: DocumentResult): PlannedAction[] {
  const seen = new Set<string>();
  return document.evidence
    .filter((item) => item.type === "requirement" && ACTION_START.test(item.text))
    .map((item) => {
      const text = toInstruction(item.text);
      return {
        id: item.id,
        text: text.charAt(0).toUpperCase() + text.slice(1),
        source: item.title,
        pages: item.pages,
        completed: false,
      };
    })
    .filter((item) => {
      const key = normalise(item.text);
      if (key.length < 18 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
