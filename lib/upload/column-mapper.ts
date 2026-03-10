// Levenshtein distance implementation for fuzzy matching
function levenshtein(a: string, b: string): number {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

const EXPECTED_COLUMNS = [
    { key: "schemeId", label: "Scheme ID", aliases: ["scheme id", "id", "slug"] },
    { key: "fiscalYear", label: "Fiscal Year", aliases: ["year", "fy", "financial year"] },
    { key: "allocatedAmount", label: "Allocated Amount", aliases: ["allocated", "budget allocation", "be"] },
    { key: "revisedAmount", label: "Revised Amount", aliases: ["revised", "re", "revised estimate"] },
    { key: "actualExpenditure", label: "Actual Expenditure", aliases: ["actual", "actuals", "expenditure"] },
    { key: "expenditureType", label: "Expenditure Type", aliases: ["type", "capital/revenue", "exp type"] },
];

export function autoMapColumns(headers: string[]) {
    const mapping: Record<string, string> = {};

    for (const expected of EXPECTED_COLUMNS) {
        let bestMatch = null;
        let minDistance = Infinity;

        for (const header of headers) {
            const normalizedHeader = header.toLowerCase().trim();

            // Check exact alias matches first
            if (expected.aliases.includes(normalizedHeader) || expected.key.toLowerCase() === normalizedHeader || expected.label.toLowerCase() === normalizedHeader) {
                bestMatch = header;
                break;
            }

            // Fuzzy matching fallback
            for (const alias of [...expected.aliases, expected.label]) {
                const dist = levenshtein(alias, normalizedHeader);
                if (dist < minDistance && dist < 4) { // Threshold for acceptable typo
                    minDistance = dist;
                    bestMatch = header;
                }
            }
        }

        if (bestMatch) {
            mapping[bestMatch] = expected.key;
        }
    }

    return mapping;
}

export function applyMapping(rows: Record<string, unknown>[], mapping: Record<string, string>) {
    return rows.map(row => {
        const mappedRow: Record<string, unknown> = {};
        for (const [originalKey, expectedKey] of Object.entries(mapping)) {
            if (row[originalKey] !== undefined) {
                mappedRow[expectedKey] = row[originalKey];
            }
        }
        return mappedRow;
    });
}
