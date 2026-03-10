import fs from "fs";

const dataPath = "C:\\Users\\quant\\.gemini\\antigravity\\brain\\5554dc64-cdfb-4444-a858-0b0075276471\\ingested_oomf_data.json";
const walkPath = "C:\\Users\\quant\\.gemini\\antigravity\\brain\\5554dc64-cdfb-4444-a858-0b0075276471\\walkthrough.md";

async function main() {
    const allocations = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const auditTrail = fs.readFileSync(walkPath, "utf8");

    const res = await fetch("http://localhost:3000/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allocations, auditTrail })
    });

    const json = await res.json();
    console.log("Ingest Result:", json);
}

main().catch(console.error);
