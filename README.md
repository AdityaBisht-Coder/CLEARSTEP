# CLEARSTEP

**From information to action.**

CLEARSTEP is a web-based document analysis prototype that helps turn PDF instructions into a structured, reviewable action plan. It extracts selectable text from a PDF, identifies candidate deadlines, requirements, email addresses and web links, and keeps those findings connected to their source pages.

**Live prototype:** https://clearstep.pages.dev/  
**Repository:** https://github.com/AdityaBisht-Coder/CLEARSTEP

> **Project status:** Experimental prototype. CLEARSTEP uses rule-based text-pattern detection, not a large language model or a fully autonomous agent. All extracted findings are candidates that need human review.

## What it does

- **PDF text extraction** — reads selectable text page by page from PDF files in the browser.
- **Evidence explorer** — displays candidate findings with their source page references.
- **Candidate detection** — looks for deadline-related text, action requirements, email addresses and URLs.
- **Action Planner** — converts detected requirement candidates into an editable checklist, with source-page references.
- **Prepared Documents** — creates editable text drafts such as an action checklist, email draft and preparation brief.
- **Human-in-control workflow** — keeps external actions under user control. CLEARSTEP does not submit forms, send emails or interact with external websites on the user's behalf.

## How it works

1. Select a PDF in the app.
2. CLEARSTEP extracts selectable text from each page using PDF.js.
3. A rule-based analyser searches the extracted text for patterns that may indicate deadlines, requirements, email addresses and links.
4. Candidate findings are shown with page references so the user can check them against the original PDF.
5. The Action Planner and Prepared Documents workspace help organise the findings into editable next steps and drafts.

The current analyser is intentionally transparent and lightweight. It does not understand every instruction semantically, and a detected phrase is not automatically a confirmed requirement or deadline.

## Run locally

### Requirements

- Node.js (version 22 or a compatible current LTS release)
- npm

### Setup

```bash
git clone https://github.com/AdityaBisht-Coder/CLEARSTEP.git
cd CLEARSTEP
npm install
npm run dev
```

Vite will print a local development URL, usually:

```text
http://localhost:5173
```

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Run TypeScript checks and create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Technology

- React 19
- TypeScript
- Vite
- PDF.js (`pdfjs-dist`) for PDF text extraction
- Lucide React for icons
- Cloudflare Pages for the hosted prototype

## Current limitations

- Supports PDF files up to **25 MB**.
- Extracts selectable text. Scanned/image-only PDFs are not currently processed with OCR.
- Password-protected, damaged or unsupported PDFs may fail to load.
- Detection is based on text patterns and can miss relevant information or flag irrelevant text.
- Date interpretation and task wording may be incomplete or inaccurate.
- Source-page references help with review, but users must still verify every finding against the original document.
- Execution Workspace and Verification Centre are controlled preparation/review areas; external websites, email accounts and submission services are not connected.
- The current prototype does not use a hosted AI API or require an API key.

## Privacy and safety

PDF extraction and analysis are performed in the browser by the app. The current prototype does not send the selected PDF to a CLEARSTEP application backend. Avoid uploading documents containing sensitive personal information to any online service unless you understand and accept its privacy implications.

CLEARSTEP is an assistance tool, not an authority on application rules, deadlines or eligibility. Always consult the original issuing organisation and confirm important details before acting.

## Project direction

The project is exploring whether evidence-linked task preparation can make multi-step digital instructions easier to understand and less error-prone.

Planned areas for further development include stronger requirement classification, improved date and deadline interpretation, better evidence grouping, and more robust verification workflows. These are future goals, not claims about current functionality.

## Contributing

This is an evolving student project. Suggestions, bug reports and improvement ideas are welcome through GitHub Issues.

## License

No open-source license has been added yet. Unless a license is added to this repository, standard copyright restrictions apply.
