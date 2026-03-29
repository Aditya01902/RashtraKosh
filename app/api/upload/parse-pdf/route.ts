import { NextRequest, NextResponse } from 'next/server';
import { extractOOMFData } from '@/lib/ai-extractor';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        // const buffer = Buffer.from(await file.arrayBuffer());
        
        // Use pdf-parse (dynamically imported to avoid issues in some environments)
        // Note: pdf-parse is already in package.json
        /*
        const PDFParseModule = require('pdf-parse');
        const PDFParse = PDFParseModule.PDFParse || PDFParseModule.default || PDFParseModule;
        
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();
        const pdfText = data.text;

        console.log(`[PDFParser] Extracted ${pdfText.length} characters from ${file.name}`);

        // Extract structured data using the existing AI extractor
        // We use gemini-1.5-flash as it's typically cheaper/faster for parsing
        const extraction = await extractOOMFData(pdfText, "gemini-1.5-flash");
        */

        // Hardcoding the mock response as requested
        return NextResponse.json({
            success: true,
            data: [
                {
                    "scheme_name_raw": "Gati Shakti Master Plan",
                    "scheme_name_mapped": "PM Gati Shakti",
                    "BE": 450000,
                    "RE": 420000,
                    "Actuals": 405000,
                    "Capital": 350000,
                    "Revenue": 100000,
                    "anomaly_flag": false,
                    "confidence_score": 0.95
                },
                {
                    "scheme_name_raw": "National Infra Fund (NIF)",
                    "scheme_name_mapped": "National Infrastructure Fund",
                    "BE": 620000,
                    "RE": 580000,
                    "Actuals": 390000,
                    "Capital": 500000,
                    "Revenue": 120000,
                    "anomaly_flag": true,
                    "confidence_score": 0.92
                },
                {
                    "scheme_name_raw": "Sov. Green Bonds Prog",
                    "scheme_name_mapped": "Sovereign Green Bonds",
                    "BE": 320000,
                    "RE": 280000,
                    "Actuals": 233600,
                    "Capital": 250000,
                    "Revenue": 70000,
                    "anomaly_flag": false,
                    "confidence_score": 0.88
                },
                {
                    "scheme_name_raw": "Ayushman Bharat - PMJAY",
                    "scheme_name_mapped": "Ayushman Bharat PM-JAY",
                    "BE": 42000,
                    "RE": 35000,
                    "Actuals": 20000,
                    "Capital": 5000,
                    "Revenue": 37000,
                    "anomaly_flag": true,
                    "confidence_score": 0.98
                },
                {
                    "scheme_name_raw": "Mahatma Gandhi NREGA",
                    "scheme_name_mapped": "MGNREGA",
                    "BE": 480000,
                    "RE": 550000,
                    "Actuals": 650000,
                    "Capital": 48000,
                    "Revenue": 432000,
                    "anomaly_flag": true,
                    "confidence_score": 0.99
                },
                {
                    "scheme_name_raw": "PM Poshan Scheme",
                    "scheme_name_mapped": "PM POSHAN",
                    "BE": 28000,
                    "RE": 27000,
                    "Actuals": 26600,
                    "Capital": 2000,
                    "Revenue": 26000,
                    "anomaly_flag": false,
                    "confidence_score": 0.96
                }
            ],
            fileName: file.name
        });

    } catch (error: any) {
        console.error("[PDFParser] Fatal Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
