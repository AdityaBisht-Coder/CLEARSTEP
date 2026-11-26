import * as pdfjsLib from "pdfjs-dist";
import type { DocumentResult, ExtractedPage } from "../types";
import { analyseText } from "./evidenceAnalyser";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export async function extractPdf(file: File): Promise<DocumentResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: ExtractedPage[] = [];
  let totalWords = 0;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const textItems = content.items.filter((item) => "str" in item);
    const fragments: string[] = [];
    let previousY: number | null = null;
    let previousEndX: number | null = null;

    for (const item of textItems) {
      if (!("str" in item)) continue;
      const value = item.str;
      if (!value) continue;
      const x = item.transform[4];
      const y = item.transform[5];
      const lineChanged = previousY !== null && Math.abs(y - previousY) > 2;
      const horizontalGap = previousEndX === null ? 0 : x - previousEndX;
      if (fragments.length > 0) {
        if (lineChanged) fragments.push("\n");
        else if (horizontalGap > 1.5 && !/\s$/.test(fragments[fragments.length - 1])) fragments.push(" ");
      }
      fragments.push(value);
      previousY = y;
      previousEndX = x + item.width;
    }

    const text = fragments.join("").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim();
    totalWords += text ? text.split(/\s+/).length : 0;
    pages.push({ page: pageNumber, text });
  }

  return { name: file.name, pages, evidence: analyseText(pages), totalWords };
}