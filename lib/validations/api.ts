import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name is required").max(100, "Name is too long"),
    email: z.string().email("Invalid email address").max(150),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    institution: z.string().max(200).optional().nullable(),
    membershipTier: z.enum(["GENERAL", "EXPERT", "INSTITUTIONAL"]),
    credentials: z.string().max(1000).optional().nullable(),
}).strict();

export const feedbackSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters").max(200),
    body: z.string().min(50, "Body must be at least 50 characters").max(5000),
    category: z.enum(["SCHEME_PERFORMANCE", "POLICY_SUGGESTION", "ANOMALY_FLAG", "REALLOCATION_SUGGESTION", "DATA_QUALITY"]).optional().default("POLICY_SUGGESTION"),
    schemeId: z.string().max(100).optional().nullable(),
    isAnonymous: z.boolean().optional().default(false),
}).strict();

export const uploadCommitSchema = z.object({
    filename: z.string().max(500),
    fileSize: z.number().max(50 * 1024 * 1024), // 50MB reasonable max
    ministryId: z.string().max(100).optional().nullable(),
    departmentId: z.string().max(100).optional().nullable(),
    schemeId: z.string().max(100).optional().nullable(),
    rowsProcessed: z.number().nonnegative(),
    financialYear: z.string().max(20).optional().nullable(),
}).strict();

export const uploadValidationSchema = z.object({
    columns: z.array(z.string().max(200)).max(200),
    rowCount: z.number().nonnegative(),
    previewData: z.array(z.record(z.string(), z.any())).max(10), // only need a small preview validation
    type: z.enum(["SCHEME_METRICS", "FINANCIAL_DATA", "GENERAL"]).optional().default("GENERAL"),
}).strict();
