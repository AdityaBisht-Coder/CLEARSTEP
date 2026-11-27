import type { Evidence, ExtractedPage } from "../types";

const MONTH = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)";
const DATE_PATTERN = new RegExp(
  "\\b(?:\\d{1,2}(?:st|nd|rd|th)?\\s+" + MONTH + "\\s+\\d{4}|" +
  MONTH + "\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}|\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\b",
  "i"
);
const RELATIVE_TIME = /\bwithin\s+\d+\s+(?:(?:calendar|business)\s+)?(?:hours?|days?|weeks?)\b/i;
const DEADLINE_CUE = /\b(?:deadline|due date|last date|submit(?:ted)? by|apply by|applications? close|closes? on|no later than|on or before|before|by)\b/i;

const ACTIONS = "(?:submit|upload|provide|attach|include|complete|register|send|obtain|prepare|contact|select|create|save|fill(?: in| out)?|sign|email|apply|deliver|present|confirm|return|pay|bring|visit|download|print|check|review|enter|choose|verify)";
const IMPERATIVE = new RegExp("^" + ACTIONS + "\\b", "i");
const MODAL_INSTRUCTION = new RegExp(
  "^(?:(?:all )?(?:applicants?|students?|users?|candidates?|participants?)|you|the applicant|each applicant)\\s+" +
  "(?:must|should|shall|need to|are required to|required to)\\s+" + ACTIONS + "\\b",
  "i"
);
const GENERIC_OR_META = /^(?:this guide|this document|this form|the following|important information|general information|for more information|note:|instructions?:|requirements?:|eligibility criteria:?|all (?:of )?the following conditions:?)/i;
const URL_PATTERN = /https?:\/\//i;

function cleanSentence(value: string): string {
  return value
    .replace(/^[\s\-–—*•▪●]+/, "")
    .replace(/\s+/g, " ")
    .replace(/^[“"']|[”"']$/g, "")
    .trim();
}

function splitText(text: string): string[] {
  return text
    .replace(/[•▪●]/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/)
    .map(cleanSentence)
    .filter(Boolean);
}

function normalise(value: string): string {
  return value.toLowerCase()
    .replace(/\b(the|a|an|to|of|and|or|your|their|please)\b/g, " ")
    .replace(/[^a-z0-9@]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dateKey(text: string): string | null {
  const match = text.match(DATE_PATTERN);
  if (!match) return null;
  const parsed = new Date(match[0].replace(/(\d)(st|nd|rd|th)\b/i, "$1"));
  if (Number.isNaN(parsed.getTime())) return match[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  return parsed.toISOString().slice(0, 10);
}

function addEvidence(
  map: Map<string, Evidence>,
  type: Evidence["type"],
  title: string,
  text: string,
  page: number
) {
  const cleaned = cleanSentence(text);
  if (!cleaned) return;
  const canonical = type === "deadline" ? dateKey(cleaned) : null;
  const key = type + ":" + (canonical ?? normalise(cleaned));
  const existing = map.get(key);
  if (existing) {
    if (!existing.pages.includes(page)) existing.pages.push(page);
    if (cleaned.length > existing.text.length) existing.text = cleaned;
    return;
  }
  map.set(key, {
    id: "evidence-" + (map.size + 1),
    type,
    title,
    text: cleaned,
    page,
    pages: [page],
  });
}

function isActionableRequirement(sentence: string): boolean {
  if (sentence.length < 28 || sentence.length > 280) return false;
  if (sentence.endsWith(":") || GENERIC_OR_META.test(sentence) || URL_PATTERN.test(sentence)) return false;
  if (/\b(?:this guide|this document|this section)\b/i.test(sentence)) return false;
  return IMPERATIVE.test(sentence) || MODAL_INSTRUCTION.test(sentence);
}

export function analyseText(pages: ExtractedPage[]): Evidence[] {
  const evidence = new Map<string, Evidence>();

  for (const page of pages) {
    const sentences = splitText(page.text);

    for (const sentence of sentences) {
      const hasAbsoluteDate = DATE_PATTERN.test(sentence);
      const hasRelativeTime = RELATIVE_TIME.test(sentence);
      const hasDeadlineCue = DEADLINE_CUE.test(sentence);

      if ((hasAbsoluteDate && hasDeadlineCue) || (hasRelativeTime && (hasDeadlineCue || /^within\b/i.test(sentence)))) {
        addEvidence(evidence, "deadline", "Possible deadline", sentence, page.page);
      }

      if (isActionableRequirement(sentence)) {
        addEvidence(evidence, "requirement", "Action requirement", sentence, page.page);
      }
    }

    for (const match of page.text.matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi)) {
      addEvidence(evidence, "email", "Email address", match[0], page.page);
    }

    for (const match of page.text.matchAll(/https?:\/\/[^\s<>"')\]]+/gi)) {
      const url = match[0].replace(/[.,;:!?]+$/g, "");
      addEvidence(evidence, "link", "Web link", url, page.page);
    }
  }

  return Array.from(evidence.values());
}
