import { z } from "zod";

// Mapped data row schema
export const UploadRowSchema = z.object({
    schemeId: z.string().min(1, "Scheme ID is required"),
    fiscalYear: z.string().regex(/^\d{4}-\d{2}$/, "Invalid fiscal year format (e.g., 2024-25)"),
    allocatedAmount: z.coerce.number().min(0, "Allocated amount must be positive"),
    revisedAmount: z.coerce.number().min(0).optional().nullable(),
    actualExpenditure: z.coerce.number().min(0).optional().nullable(),
    expenditureType: z.enum(["CAPITAL", "REVENUE", "MIXED"]),
});

export type UploadRow = z.infer<typeof UploadRowSchema>;

export function validateRows(rows: Record<string, unknown>[]) {
    const validRows: UploadRow[] = [];
    const errors: { row: number; error: string }[] = [];

    rows.forEach((row, index) => {
        const result = UploadRowSchema.safeParse(row);
        if (result.success) {
            // Range check logic
            if (
                result.data.actualExpenditure !== null &&
                result.data.actualExpenditure !== undefined &&
                result.data.revisedAmount !== null &&
                result.data.revisedAmount !== undefined &&
                result.data.actualExpenditure > result.data.revisedAmount * 1.5
            ) {
                errors.push({
                    row: index + 1,
                    error: `Actual expenditure (${result.data.actualExpenditure}) exceeds revised amount (${result.data.revisedAmount}) by more than 50%`
                });
            } else {
                validRows.push(result.data);
            }
        } else {
            errors.push({
                row: index + 1,
                // @ts-expect-error ZodError internal shape
                error: result.error.errors.map(e => e.message).join(", ")
            });
        }
    });

    return { validRows, errors, isValid: errors.length === 0 };
}
