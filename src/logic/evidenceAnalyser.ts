import type { Evidence, ExtractedPage } from "../types";

const DATE_PATTERN = /\b(?:\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i;
const RELATIVE_TIME = /\bwithin\s+\d+\s+(?:(?:calendar|business)\s+)?(?:hours?|days?|weeks?)\b/i;
const ACTION_VERB = /\b(?:submit|upload|provide|attach|include|complete|register|send|ensure|obtain|prepare|contact|select|create|save|fill(?: in| out)?|sign|email|apply|deliver|present|confirm|return)\b/i;
const DEADLINE_CUE = /\b(?:deadline|due date|last date|submit(?:ted)? by|apply by|applications? close|closes? on|no later than|on or before|before)\b/i;

function splitSentences(text: string): string[] {
  return text
    .replace(/[•▪●]/g, " ")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function cleanSentence(value: string): string {
  return value
    .replace(/^[-*•\s]+/, "")
    .replace(/\s+/g, " ")
    .replace(/^[“"']|[”"']$/g, "")
    .trim();
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
  const key = type + ":" + cleaned.toLowerCase().replace(/[^a-z0-9@:/]+/g, " ").trim();
  const existing = map.get(key);
  if (existing) {
    if (!existing.pages.includes(page)) existing.pages.push(page);
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

export function analyseText(pages: ExtractedPage[]): Evidence[] {
  const evidence = new Map<string, Evidence>();

  for (const page of pages) {
    const sentences = splitSentences(page.text);

    for (const sentence of sentences) {
      const hasAbsoluteDate = DATE_PATTERN.test(sentence);
      const hasRelativeTime = RELATIVE_TIME.test(sentence);
      const hasDeadlineCue = DEADLINE_CUE.test(sentence);

      if ((hasAbsoluteDate && hasDeadlineCue) || hasRelativeTime) {
        addEvidence(evidence, "deadline", "Possible deadline", sentence, page.page);
      }

      const isHeading = sentence.endsWith(":") || /\b(?:all|following) conditions\b/i.test(sentence);
      const isConditionOnly = /\bmust be\b/i.test(sentence) && !ACTION_VERB.test(sentence);
      if (
        sentence.length >= 35 &&
        ACTION_VERB.test(sentence) &&
        !isHeading &&
        !isConditionOnly &&
        !/https?:\/\//i.test(sentence)
      ) {
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
