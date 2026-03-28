import { NextRequest, NextResponse } from 'next/server';
import { extractOOMFData } from '@/lib/ai-extractor';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Use pdf-parse (dynamically imported to avoid issues in some environments)
        // Note: pdf-parse is already in package.json
        const PDFParse = require('pdf-parse');
        const data = await PDFParse(buffer);
        const pdfText = data.text;

        console.log(`[PDFParser] Extracted ${pdfText.length} characters from ${file.name}`);

        // Extract structured data using the existing AI extractor
        // We use gemini-1.5-flash as it's typically cheaper/faster for parsing
        const extraction = await extractOOMFData(pdfText, "gemini-1.5-flash");

        return NextResponse.json({
            success: true,
            data: extraction.data,
            fileName: file.name
        });

    } catch (error: any) {
        console.error("[PDFParser] Fatal Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
