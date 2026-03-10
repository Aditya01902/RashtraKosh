export const KNOWN_DB_FIELDS = [
    "schemeId",
    "ministry.name",
    "department.name",
    "name", // Scheme name
    "allocatedCapital",
    "allocatedRevenue",
    "expenditureQ1",
    "expenditureQ2",
    "expenditureQ3",
    "expenditureQ4",
    "physicalTargetValue",
    "physicalAchievedValue",
    "beneficiaryTarget",
    "beneficiaryAchieved",
    "sectorKpiName",
    "sectorKpiBaseline",
    "sectorKpiCurrent"
];

// Map of canonical DB field names to known aliases (lowercase)
const ALIAS_MAP: Record<string, string[]> = {
    "schemeId": ["scheme id", "scheme_id", "scheme code", "uid"],
    "ministry.name": ["ministry name", "ministryname", "min. name", "ministry"],
    "department.name": ["department name", "departmentname", "dept. name", "department"],
    "name": ["scheme name", "schemename", "scheme", "program name", "project name"],
    "allocatedCapital": ["budget 2024 capital", "alloc cap 24-25", "allocated capital", "capital budget", "ca", "capital allocation"],
    "allocatedRevenue": ["budget 2024 revenue", "alloc rev 24-25", "allocated revenue", "revenue budget", "ra", "revenue allocation"],
    "expenditureQ1": ["expenditure q1", "q1 spend", "q1 exp", "apr-jun spend"],
    "expenditureQ2": ["expenditure q2", "q2 spend", "q2 exp", "jul-sep spend"],
    "expenditureQ3": ["expenditure q3", "q3 spend", "q3 exp", "oct-dec spend"],
    "expenditureQ4": ["expenditure q4", "q4 spend", "q4 exp", "jan-mar spend"],
    "physicalTargetValue": ["physical target", "target value", "target physical"],
    "physicalAchievedValue": ["physical achieved", "achieved value", "accomplished"],
    "beneficiaryTarget": ["beneficiary target", "target beneficiaries", "planned benes"],
    "beneficiaryAchieved": ["beneficiary achieved", "actual beneficiaries", "reached benes"],
    "sectorKpiName": ["kpi name", "indicator", "sector kpi"],
    "sectorKpiBaseline": ["kpi baseline", "baseline value", "starting kpi"],
    "sectorKpiCurrent": ["kpi current", "current value", "latest kpi"]
};

/**
 * Calculates a basic Levenshtein distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
    if (!s1.length) return s2.length;
    if (!s2.length) return s1.length;

    const arr = [];
    for (let i = 0; i <= s2.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= s1.length; j++) {
            arr[i][j] = i === 0 ? j
                : Math.min(
                    arr[i - 1][j] + 1,
                    arr[i][j - 1] + 1,
                    arr[i - 1][j - 1] + (s1[j - 1] === s2[i - 1] ? 0 : 1)
                );
        }
    }
    return arr[s2.length][s1.length];
}

/**
 * Maps an array of uploaded file columns to expected database fields
 */
export function mapColumns(fileColumns: string[]) {
    return fileColumns.map(colName => {
        const normalizedCol = colName.toLowerCase().trim();

        let bestMatch: string | null = null;
        let highestConfidence: "high" | "medium" | "low" | "none" = "none";
        let minDistance = Infinity;

        // 1. Exact or Alias Match
        for (const [dbField, aliases] of Object.entries(ALIAS_MAP)) {
            if (normalizedCol === dbField.toLowerCase() || aliases.includes(normalizedCol)) {
                bestMatch = dbField;
                highestConfidence = "high";
                break;
            }

            // 2. Fuzzy Match (Levenshtein)
            for (const alias of [...aliases, dbField.toLowerCase()]) {
                const dist = levenshteinDistance(normalizedCol, alias);
                // Calculate a basic similarity score (0 to 1)
                const maxLen = Math.max(normalizedCol.length, alias.length);
                const similarity = 1 - (dist / maxLen);

                if (similarity > 0.8 && dist < minDistance) {
                    minDistance = dist;
                    bestMatch = dbField;
                    highestConfidence = similarity > 0.9 ? "high" : "medium";
                } else if (similarity > 0.6 && dist < minDistance && highestConfidence === "none") {
                    minDistance = dist;
                    bestMatch = dbField;
                    highestConfidence = "low";
                }
            }
        }

        return {
            fileColumn: colName,
            dbField: bestMatch,
            confidence: highestConfidence
        };
    });
}

/**
 * Returns a simple Record mapping file columns to DB fields
 */
export function autoMapColumns(headers: string[]): Record<string, string> {
    const mappings = mapColumns(headers);
    const result: Record<string, string> = {};
    for (const m of mappings) {
        if (m.dbField) {
            result[m.fileColumn] = m.dbField;
        }
    }
    return result;
}

/**
 * Applies a column mapping to a set of parsed rows
 * Returned rows will only have the mapped keys (DB fields)
 */
export function applyMapping(rows: Record<string, unknown>[], mapping: Record<string, string>): Record<string, unknown>[] {
    return rows.map(row => {
        const newRow: Record<string, unknown> = {};
        for (const [fileCol, dbField] of Object.entries(mapping)) {
            if (fileCol in row) {
                newRow[dbField] = row[fileCol];
            }
        }
        return newRow;
    });
}
