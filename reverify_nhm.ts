import fs from 'fs';
const pdf = require('pdf-parse');
// const pdf = require('pdf-parse'); // This line is removed as per instruction
import { GoogleGenerativeAI } from '@google/generative-ai';

// GEMINI_API_KEY removed for security. Accessing via environment variables.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not defined in the environment.");
    process.exit(1);
}

async function main() {
    console.log("Reading outcome.pdf...");
    const pdfBuffer = fs.readFileSync('outcome.pdf');

    let pdfText = "";
    try {
        console.log("Running pdf-parse (advanced mode)...");
        // Using the same pattern as in the ingest route
        const pdfParseModule = eval('require')('pdf-parse');

        // If it's the class-based one from the ingest route:
        if (pdfParseModule.PDFParse) {
            const parser = new pdfParseModule.PDFParse({ data: pdfBuffer });
            const parsed = await parser.getText();
            await parser.destroy();
            pdfText = parsed.text;
        } else {
            // standard pdf-parse
            const data = await pdfParseModule(pdfBuffer);
            pdfText = data.text;
        }
        console.log("PDF parsed successfully. Length:", pdfText.length);
        console.log("PDF START:", pdfText.substring(0, 1000));
    } catch (e: any) {
        console.error("PDF Parse Failed:", e.message);
        return;
    }

    // Search for Revised Estimate 2023-24
    const searchTerms = ["Revised Estimate 2023-24", "RE 2023-24", "BE 2023-24", "29,085", "NHM"];
    let relevantSnippets = "";
    const lines = pdfText.split('\n');

    console.log("Searching for RE/BE 2023-24...");
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (searchTerms.some(term => line.includes(term))) {
            console.log(`Found "${line.trim()}" at line ${i}`);
            const start = Math.max(0, i - 10);
            const end = Math.min(lines.length, i + 40);
            relevantSnippets += `--- CONTEXT AT LINE ${i} ---\n` + lines.slice(start, end).join('\n') + "\n";
        }
    }

    // Limit to 200k for Flash model
    relevantSnippets = relevantSnippets.substring(0, 200000);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const prompt = `
    Extract the budget allocation data for "National Health Mission" (NHM) for the Financial Year 2023-24.
    Look for:
    - Budget Estimate (BE) 2023-24
    - Revised Estimate (RE) 2023-24
    - Actuals 2022-23
    - Budget Estimate (BE) 2024-25
    - Capital vs Revenue split for 2023-24 (BE).

    IMPORTANT: If you see Multiple entries, look for the main one under Department of Health and Family Welfare.
    Return ONLY a JSON object:
    {
      "scheme_name": "National Health Mission",
      "fy_2023_24": {
        "BE": number,
        "RE": number,
        "Actuals": number,
        "Capital": number,
        "Revenue": number
      },
      "fy_2024_25": {
        "BE": number
      },
      "source_snippet_used": "string"
    }

    Text:
    ${relevantSnippets}
    `;

    console.log("Calling Gemini 3.1 Flash Lite Preview...");
    try {
        const result = await model.generateContent(prompt);
        console.log("--- FINAL EXTRACTION RESULT ---");
        console.log(result.response.text());
    } catch (e: any) {
        console.error("Gemini API Error:", e.message);
    }
}

main().catch(console.error);
