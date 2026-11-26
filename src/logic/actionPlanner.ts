import type { DocumentResult, PlannedAction } from "../types";

const ACTION_VERB = /\\b(?:submit|upload|provide|attach|include|complete|register|send|obtain|prepare|contact|select|create|save|fill(?: in| out)?|sign|email|apply|deliver|present|confirm|return)\\b/i;

function toInstruction(sentence: string): string {
  return sentence
    .replace(/^(?:applicants?|students?|users?|you)\\s+(?:must|should|need to|required to)\\s+/i, "")
    .replace(/^you\\s+/i, "")
    .replace(/\\s+/g, " ")
    .trim();
}

export function buildActionPlan(document: DocumentResult): PlannedAction[] {
  const seen = new Set<string>();
  return document.evidence
    .filter((item) => item.type === "requirement" && ACTION_VERB.test(item.text))
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
      const key = item.text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
