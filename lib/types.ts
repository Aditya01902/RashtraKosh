import { PriorityCategory, UserRole, PlanStatus } from '@prisma/client';
import type { SchemeScore } from '@prisma/client';

export { PriorityCategory, UserRole, PlanStatus };
export type { SchemeScore };

export interface ReallocationItem {
    donorSchemeId: string;
    donorName: string;
    recipientSchemeId: string;
    recipientName: string;
    capitalAmount: number;
    revenueAmount: number;
    justification: string;
}

export interface MinistryWithStats {
    id: string;
    name: string;
    shortCode: string;
    color: string;
    sector: string;
    totalAllocated: number;
    totalUtilized: number;
    utilizationPct: number;
    avgFinalScore: number;
    departmentCount: number;
    schemeCount: number;
}

export interface DepartmentWithSchemes {
    id: string;
    name: string;
    ministryId: string;
    totalAllocated: number;
    avgScore: number;
    schemes: SchemeWithScore[];
}

export interface SchemeWithScore {
    id: string;
    name: string;
    description: string | null;
    departmentId: string;
    ministryName?: string;
    ministryShortCode?: string;
    priorityCategory: string;
    allocation: {
        allocated: number;
        allocatedCapital: number;
        allocatedRevenue: number;
        utilized: number;
        utilizedCapital: number;
        utilizedRevenue: number;
        unspentCapital: number;   // computed: allocatedCapital - utilizedCapital
        unspentRevenue: number;   // computed: allocatedRevenue - utilizedRevenue
        utilizationPct: number;   // computed: (utilized/allocated)*100
        surrendered: number;
        expenditureQ1: number;
        expenditureQ2: number;
        expenditureQ3: number;
        expenditureQ4: number;
        fiscalYear: string;
    };
    scores: ScoreRecord;
    absorptionCapacity: number;  // 0-1 factor used by projection model
}

export interface ScoreRecord {
    id: string;
    schemeId: string;
    fiscalYear: string;
    utilizationScore: number;
    utilizationBreakdown: UtilizationBreakdown;
    outputScore: number;
    outputBreakdown: OutputBreakdown;
    outcomeScore: number;
    outcomeBreakdown: OutcomeBreakdown;
    finalScore: number;
    scoreVersion: string;
    calculatedAt: string;
}

export interface UtilizationBreakdown {
    expenditureRate: number;       // 0-100
    temporalDistributionIndex: number;  // 0-100
    surrenderRateScore: number;    // 0-100
    supplementaryDiscipline: number;   // 0-100
}

export interface OutputBreakdown {
    physicalTargetAchievement: number;  // 0-100
    beneficiaryCoverageRatio: number;   // 0-100
    deliveryTimeliness: number;         // 0-100
    qualityComplianceScore: number;     // 0-100
    geographicDistributionIndex: number; // 0-100
}

export interface OutcomeBreakdown {
    sectorKpiImprovement: number;       // 0-100
    baselineVsCurrentIndex: number;     // 0-100
    beneficiaryReportedImpact: number;  // 0-100
    attributionScore: number;           // 0-100
    sustainabilityIndex: number;        // 0-100
}

// Reallocation Engine types
export type QuadrantClass = 'EFFICIENT' | 'OVERFUNDED' | 'STARVED' | 'FAILING';

export interface QuadrantScheme {
    schemeId: string;
    schemeName: string;
    ministryName: string;
    utilizationScore: number;
    finalScore: number;
    budgetAllocated: number;
    quadrant: QuadrantClass;
    reclaimableCapital: number;
    reclaimableRevenue: number;
    rootCause?: string;
}

export interface IdleMoneyRecord {
    schemeId: string;
    schemeName: string;
    ministryShortCode: string;
    reclaimableTotal: number;
    reclaimableCapital: number;
    reclaimableRevenue: number;
    rootCause: 'ADMINISTRATIVE' | 'PROCUREMENT' | 'REGULATORY' | 'DESIGN_FLAW' | 'CAPACITY_GAP';
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
    utilizationPct: number;
}

export interface ReallocFlow {
    fromSchemeId: string;
    fromSchemeName: string;
    toSchemeId: string;
    toSchemeName: string;
    amountCapital: number;
    amountRevenue: number;
    totalAmount: number;
    expenditureType: 'CAPITAL' | 'REVENUE' | 'MIXED';
    rationale: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

export interface NextYearProjection {
    schemeId: string;
    schemeName: string;
    ministryName: string;
    currentAllocated: number;
    currentCapital: number;
    currentRevenue: number;
    proposedAllocated: number;
    proposedCapital: number;
    proposedRevenue: number;
    deltaAmount: number;
    deltaPct: number;
    direction: 'INCREASE' | 'DECREASE' | 'FLAT';
    scoreMultiplier: number;
    priorityWeight: number;
    absorptionFactor: number;
    rationale: string;
    isFloorApplied: boolean;  // true if essential service floor prevented larger cut
}

// Feedback types
export interface FeedbackItemWithAuthor {
    id: string;
    title: string;
    body: string;
    category: string;
    schemeName: string | null;
    schemeId: string | null;
    author: {
        id: string;
        name: string;
        institution: string | null;
        membershipTier: string;
        credentialVerified: boolean;
    } | null;  // null if isAnonymous
    isAnonymous: boolean;
    status: string;
    weightedScore: number;
    voteCount: number;
    hasCurrentUserVoted: boolean;
    createdAt: string;
}

// Auth types
export interface FiscalYearStats {
    fiscalYear: string;
    totalAllocated: number;
    totalUtilized: number;
    avgFinalScore: number;
}

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: string;
    membershipTier: string;
    ministryId: string | null;
    credentialVerified: boolean;
}
