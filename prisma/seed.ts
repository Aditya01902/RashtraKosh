import { PrismaClient, Sector, PriorityCategory, KpiDirection, UserRole, MembershipTier, FeedbackCategory, FeedbackStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper: compute utilization score
function computeUtilizationScore(allocated: number, utilized: number, capAlloc: number, capUtil: number, revAlloc: number, revUtil: number, surrendered: number, suppDemands: number): { score: number, breakdown: Record<string, number> } {
    const score = allocated > 0 ? Math.round((utilized / allocated) * 10000) / 100 : 0;

    return {
        score: score,
        breakdown: {
            expenditureRate: score,
            temporalDistribution: capAlloc > 0 ? Math.round((capUtil / capAlloc) * 10000) / 100 : 100,
            surrenderRate: allocated > 0 ? Math.round((1 - surrendered / allocated) * 10000) / 100 : 0,
            supplementaryDemand: Math.round(Math.max(0, 100 - suppDemands * 15) * 100) / 100
        }
    };
}

// Helper: compute output score
function computeOutputScore(physTarget: number, physAchieved: number, benTarget: number, benAchieved: number, timeliness: number, quality: number, geoDist: number): { score: number, breakdown: Record<string, number> } {
    const PT = physTarget > 0 ? Math.round(Math.min(physAchieved / physTarget, 1.0) * 10000) / 100 : 0;
    const BC = benTarget > 0 ? Math.round(Math.min(benAchieved / benTarget, 1.0) * 10000) / 100 : 0;
    const DT = Math.round(timeliness * 100) / 100;
    const QC = Math.round(quality * 100) / 100;
    const GD = Math.round(geoDist * 100) / 100;

    const score = 0.30 * PT + 0.25 * BC + 0.20 * DT + 0.15 * QC + 0.10 * GD;

    return {
        score: Math.round(score * 100) / 100,
        breakdown: {
            physicalTargetAchievement: PT,
            beneficiaryCoverageRatio: BC,
            deliveryTimeliness: DT,
            qualityComplianceScore: QC,
            geographicDistributionIndex: GD
        }
    };
}

// Helper: compute outcome score
function computeOutcomeScore(baselineVsCurrent: number, beneficiaryReported: number, attribution: number, sustainability: number): { score: number, breakdown: Record<string, number> } {
    // Round direct inputs to match breakdown display
    const KPI = Math.round(baselineVsCurrent * 100) / 100;
    const BCI = Math.round(baselineVsCurrent * 100) / 100; // In seed, these are often the same mock value
    const BI = Math.round(beneficiaryReported * 100) / 100;
    const AS = Math.round(attribution * 100) / 100;
    const SI = Math.round(sustainability * 100) / 100;

    // Use lib/scoring/outcome logic: 0.30 * KPI + 0.25 * BCI + 0.20 * BI + 0.15 * AS + 0.10 * SI
    const score = 0.30 * KPI + 0.25 * BCI + 0.20 * BI + 0.15 * AS + 0.10 * SI;

    return {
        score: Math.round(score * 100) / 100,
        breakdown: {
            sectorKpiImprovement: KPI,
            baselineVsCurrentIndex: BCI,
            beneficiaryImpact: BI,
            attributionScore: AS,
            sustainabilityIndex: SI
        }
    };
}

// Helper: compute final score
function computeFinalScore(util: number, output: number, outcome: number): number {
    const finalScore = 0.30 * util + 0.35 * outcome + 0.35 * output;
    return Math.round(finalScore * 100) / 100;
}

const FISCAL_YEAR = "2024-25";

interface SchemeData {
    name: string;
    description: string;
    priorityCategory: PriorityCategory;
    launchYear: number;
    allocated: number;
    utilized: number;
    capPct: number;
    revPct: number;
    output: {
        physTarget: number; physAchieved: number; unit: string;
        benTarget: number; benAchieved: number;
        timeliness: number; quality: number; geoDist: number;
        dataSource: string;
    };
    outcome: {
        kpiName: string; kpiBaseline: number; kpiCurrent: number;
        direction: KpiDirection;
        baselineVsCurrent: number; beneficiaryReported: number;
        attribution: number; sustainability: number;
        dataSource: string; surveyYear: number;
    };
}

interface MinistryData {
    name: string; shortCode: string; color: string; sector: Sector;
    departments: { name: string; schemes: SchemeData[] }[];
}

const ministriesData: MinistryData[] = [
    {
        name: "Ministry of Finance", shortCode: "MoF", color: "#FF9933", sector: Sector.FINANCE,
        departments: [
            {
                name: "Dept. of Economic Affairs",
                schemes: [
                    {
                        name: "PM Gati Shakti", description: "National master plan for multi-modal connectivity and infrastructure development",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2021,
                        allocated: 450000, utilized: 405000, capPct: 70, revPct: 30,
                        output: { physTarget: 25000, physAchieved: 22500, unit: "km", benTarget: 5000000, benAchieved: 4500000, timeliness: 88, quality: 85, geoDist: 72, dataSource: "Ministry of Finance Annual Report 2024-25" },
                        outcome: { kpiName: "Logistics Performance Index", kpiBaseline: 3.18, kpiCurrent: 3.42, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 78, beneficiaryReported: 75, attribution: 70, sustainability: 80, dataSource: "World Bank LPI Report", surveyYear: 2024 }
                    },
                    {
                        name: "National Infrastructure Fund", description: "Long-term funding for critical national infrastructure projects",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2019,
                        allocated: 620000, utilized: 558000, capPct: 85, revPct: 15,
                        output: { physTarget: 120, physAchieved: 108, unit: "projects", benTarget: 8000000, benAchieved: 7200000, timeliness: 82, quality: 90, geoDist: 68, dataSource: "DEA Project Tracker" },
                        outcome: { kpiName: "Infrastructure Quality Rating", kpiBaseline: 4.2, kpiCurrent: 4.6, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 82, beneficiaryReported: 78, attribution: 75, sustainability: 85, dataSource: "Global Competitiveness Index", surveyYear: 2024 }
                    },
                    {
                        name: "Sovereign Green Bonds", description: "Government securities to finance green infrastructure and climate action",
                        priorityCategory: PriorityCategory.ENVIRONMENT, launchYear: 2023,
                        allocated: 320000, utilized: 233600, capPct: 90, revPct: 10,
                        output: { physTarget: 50, physAchieved: 35, unit: "projects", benTarget: 2000000, benAchieved: 1400000, timeliness: 65, quality: 88, geoDist: 55, dataSource: "RBI Green Bond Framework" },
                        outcome: { kpiName: "Carbon Emission Reduction (MT)", kpiBaseline: 2500, kpiCurrent: 2320, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 62, beneficiaryReported: 60, attribution: 55, sustainability: 90, dataSource: "MoEFCC Climate Report", surveyYear: 2024 }
                    },
                    {
                        name: "Standup India Support", description: "Credit facilities for underserved demographics",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2016,
                        allocated: 50000, utilized: 48000, capPct: 20, revPct: 80,
                        output: { physTarget: 50000, physAchieved: 48000, unit: "loans disbursed", benTarget: 50000, benAchieved: 48000, timeliness: 90, quality: 85, geoDist: 75, dataSource: "SIDBI Dashboard" },
                        outcome: { kpiName: "Entrepreneurship Index Growth", kpiBaseline: 20, kpiCurrent: 22, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 60, beneficiaryReported: 65, attribution: 55, sustainability: 60, dataSource: "Ministry Report", surveyYear: 2024 }
                    },
                    {
                        name: "Startup India Seed Fund", description: "Seed funding for early-stage startups",
                        priorityCategory: PriorityCategory.ADMINISTRATIVE, launchYear: 2021,
                        allocated: 10000, utilized: 5000, capPct: 90, revPct: 10,
                        output: { physTarget: 5000, physAchieved: 2500, unit: "startups funded", benTarget: 5000, benAchieved: 2500, timeliness: 60, quality: 80, geoDist: 65, dataSource: "DPIIT Portal" },
                        outcome: { kpiName: "Startup Survival Rate (%)", kpiBaseline: 10, kpiCurrent: 30, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 90, beneficiaryReported: 85, attribution: 80, sustainability: 75, dataSource: "DPIIT Report", surveyYear: 2024 }
                    }
                ]
            },
            {
                name: "Dept. of Revenue",
                schemes: [
                    {
                        name: "GST Implementation Support", description: "Technology and capacity building for nationwide GST compliance",
                        priorityCategory: PriorityCategory.ADMINISTRATIVE, launchYear: 2017,
                        allocated: 340000, utilized: 316200, capPct: 20, revPct: 80,
                        output: { physTarget: 12000, physAchieved: 11100, unit: "taxpayer touchpoints", benTarget: 15000000, benAchieved: 13950000, timeliness: 90, quality: 82, geoDist: 85, dataSource: "GSTN Annual Report" },
                        outcome: { kpiName: "GST Compliance Rate (%)", kpiBaseline: 68, kpiCurrent: 78, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 85, beneficiaryReported: 72, attribution: 80, sustainability: 75, dataSource: "CBIC Data Analytics", surveyYear: 2024 }
                    },
                    {
                        name: "Tax Dispute Resolution", description: "Fast-track resolution of pending direct and indirect tax disputes",
                        priorityCategory: PriorityCategory.ADMINISTRATIVE, launchYear: 2020,
                        allocated: 242000, utilized: 203280, capPct: 15, revPct: 85,
                        output: { physTarget: 250000, physAchieved: 195000, unit: "cases resolved", benTarget: 500000, benAchieved: 390000, timeliness: 72, quality: 80, geoDist: 78, dataSource: "CBDT Annual Report" },
                        outcome: { kpiName: "Pendency Reduction Rate (%)", kpiBaseline: 35, kpiCurrent: 52, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 75, beneficiaryReported: 68, attribution: 72, sustainability: 70, dataSource: "Tax Tribunal Statistics", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Education", shortCode: "MoE", color: "#4F9EFF", sector: Sector.EDUCATION,
        departments: [
            {
                name: "Dept. of School Education",
                schemes: [
                    {
                        name: "PM POSHAN", description: "Mid-day meal programme for nutritional support in government schools",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2021,
                        allocated: 28000, utilized: 26600, capPct: 5, revPct: 95,
                        output: { physTarget: 120000, physAchieved: 118200, unit: "schools covered", benTarget: 120000000, benAchieved: 118000000, timeliness: 95, quality: 78, geoDist: 88, dataSource: "POSHAN Tracker Portal" },
                        outcome: { kpiName: "Underweight Children Rate (%)", kpiBaseline: 32.1, kpiCurrent: 28.5, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 80, beneficiaryReported: 82, attribution: 65, sustainability: 75, dataSource: "NFHS-6 Survey", surveyYear: 2024 }
                    },
                    {
                        name: "Samagra Shiksha", description: "Integrated scheme for school education from pre-school to class XII",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2018,
                        allocated: 46000, utilized: 41400, capPct: 30, revPct: 70,
                        output: { physTarget: 1150000, physAchieved: 1035000, unit: "schools strengthened", benTarget: 250000000, benAchieved: 225000000, timeliness: 85, quality: 80, geoDist: 82, dataSource: "UDISE+ Portal" },
                        outcome: { kpiName: "Net Enrollment Ratio (%)", kpiBaseline: 87.4, kpiCurrent: 91.2, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 78, beneficiaryReported: 76, attribution: 72, sustainability: 80, dataSource: "ASER 2024 Report", surveyYear: 2024 }
                    },
                    {
                        name: "NEP Implementation", description: "National Education Policy 2020 implementation including curriculum reform",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2020,
                        allocated: 20000, utilized: 14000, capPct: 40, revPct: 60,
                        output: { physTarget: 500, physAchieved: 310, unit: "institutions reformed", benTarget: 10000000, benAchieved: 6200000, timeliness: 55, quality: 75, geoDist: 60, dataSource: "NEP Implementation Cell" },
                        outcome: { kpiName: "Multi-disciplinary Program Adoption (%)", kpiBaseline: 12, kpiCurrent: 28, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 65, beneficiaryReported: 62, attribution: 58, sustainability: 68, dataSource: "UGC Annual Report", surveyYear: 2024 }
                    }
                ]
            },
            {
                name: "Dept. of Higher Education",
                schemes: [
                    {
                        name: "PM Research Fellowship", description: "Fellowship scheme attracting top talent into doctoral research programs",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2021,
                        allocated: 15000, utilized: 13950, capPct: 10, revPct: 90,
                        output: { physTarget: 3000, physAchieved: 2790, unit: "fellowships awarded", benTarget: 3000, benAchieved: 2790, timeliness: 92, quality: 95, geoDist: 65, dataSource: "PMRF Portal" },
                        outcome: { kpiName: "Research Publications per Fellow", kpiBaseline: 1.2, kpiCurrent: 2.8, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 88, beneficiaryReported: 90, attribution: 85, sustainability: 82, dataSource: "Scopus/Web of Science", surveyYear: 2024 }
                    },
                    {
                        name: "National Scholarship Portal", description: "Centralized portal for scholarship disbursement to SC/ST/OBC/minority students",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2015,
                        allocated: 30000, utilized: 27000, capPct: 5, revPct: 95,
                        output: { physTarget: 8000000, physAchieved: 7200000, unit: "scholarships disbursed", benTarget: 8000000, benAchieved: 7200000, timeliness: 85, quality: 80, geoDist: 90, dataSource: "NSP Dashboard" },
                        outcome: { kpiName: "Higher Education GER (%)", kpiBaseline: 27.1, kpiCurrent: 30.5, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 75, beneficiaryReported: 80, attribution: 60, sustainability: 78, dataSource: "AISHE Report 2024", surveyYear: 2024 }
                    },
                    {
                        name: "RUSA (Rashtriya Uchchatar Shiksha Abhiyan)", description: "Funding to state higher education institutions",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2013,
                        allocated: 40000, utilized: 20000, capPct: 80, revPct: 20,
                        output: { physTarget: 300, physAchieved: 150, unit: "institutions upgraded", benTarget: 2000000, benAchieved: 1000000, timeliness: 50, quality: 65, geoDist: 60, dataSource: "RUSA Dashboard" },
                        outcome: { kpiName: "State University Quality Score", kpiBaseline: 40, kpiCurrent: 41, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 55, beneficiaryReported: 50, attribution: 45, sustainability: 50, dataSource: "NAAC Aggregated Data", surveyYear: 2024 }
                    },
                    {
                        name: "SWAYAM Plus", description: "Online massive open courses for skill enhancement",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2017,
                        allocated: 15000, utilized: 14000, capPct: 10, revPct: 90,
                        output: { physTarget: 500, physAchieved: 480, unit: "courses launched", benTarget: 5000000, benAchieved: 4800000, timeliness: 95, quality: 85, geoDist: 80, dataSource: "SWAYAM Portal" },
                        outcome: { kpiName: "Skill Employability Rate (%)", kpiBaseline: 20, kpiCurrent: 45, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 85, beneficiaryReported: 80, attribution: 75, sustainability: 85, dataSource: "AICTE Tracking", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Health & Family Welfare", shortCode: "MoHFW", color: "#1FCF74", sector: Sector.HEALTH,
        departments: [
            {
                name: "Dept. of Health Services",
                schemes: [
                    {
                        name: "Ayushman Bharat PM-JAY", description: "World's largest government-funded health insurance scheme providing ₹5 lakh cover",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2018,
                        allocated: 42000, utilized: 38640, capPct: 15, revPct: 85,
                        output: { physTarget: 30000000, physAchieved: 27600000, unit: "treatments authorized", benTarget: 550000000, benAchieved: 500000000, timeliness: 90, quality: 82, geoDist: 78, dataSource: "PM-JAY Dashboard" },
                        outcome: { kpiName: "Out-of-Pocket Health Expenditure (%)", kpiBaseline: 62.6, kpiCurrent: 48.2, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 85, beneficiaryReported: 78, attribution: 80, sustainability: 72, dataSource: "NHA Estimates 2024", surveyYear: 2024 }
                    },
                    {
                        name: "National Health Mission", description: "Strengthening public health infrastructure across rural and urban India",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2013,
                        allocated: 27000, utilized: 24300, capPct: 35, revPct: 65,
                        output: { physTarget: 180000, physAchieved: 162000, unit: "health facilities upgraded", benTarget: 400000000, benAchieved: 360000000, timeliness: 82, quality: 78, geoDist: 75, dataSource: "NHM HMIS Portal" },
                        outcome: { kpiName: "Maternal Mortality Rate (per 100k)", kpiBaseline: 113, kpiCurrent: 97, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 80, beneficiaryReported: 74, attribution: 75, sustainability: 82, dataSource: "SRS Special Bulletin", surveyYear: 2024 }
                    },
                    {
                        name: "Mission Indradhanush", description: "Full immunization drive to reach every child under 2 years",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2014,
                        allocated: 18995, utilized: 13297, capPct: 25, revPct: 75,
                        output: { physTarget: 40000000, physAchieved: 28000000, unit: "children vaccinated", benTarget: 40000000, benAchieved: 28000000, timeliness: 62, quality: 85, geoDist: 58, dataSource: "IMI Dashboard" },
                        outcome: { kpiName: "Full Immunization Coverage (%)", kpiBaseline: 62, kpiCurrent: 76.4, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 72, beneficiaryReported: 70, attribution: 68, sustainability: 65, dataSource: "NFHS-6 Data", surveyYear: 2024 }
                    },
                    {
                        name: "PM Swasthya Suraksha Yojana (PMSSY)", description: "Setting up AIIMS-like institutions and upgrading government medical colleges across India",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2006,
                        allocated: 2005, utilized: 1825, capPct: 97.76, revPct: 2.24,
                        output: { physTarget: 22, physAchieved: 20, unit: "medical institutions upgraded", benTarget: 5000000, benAchieved: 4550000, timeliness: 85, quality: 88, geoDist: 70, dataSource: "PMSSY Dashboard" },
                        outcome: { kpiName: "Tertiary Care Bed Availability (per 10k)", kpiBaseline: 1.2, kpiCurrent: 1.8, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 78, beneficiaryReported: 82, attribution: 75, sustainability: 80, dataSource: "CBHI Health Statistics", surveyYear: 2024 }
                    },
                    {
                        name: "National Digital Health Mission", description: "Creating digital health IDs and unified health infrastructure",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2020,
                        allocated: 35000, utilized: 17000, capPct: 90, revPct: 10,
                        output: { physTarget: 100000000, physAchieved: 50000000, unit: "ABHA IDs created", benTarget: 100000000, benAchieved: 50000000, timeliness: 60, quality: 80, geoDist: 70, dataSource: "NDHM Portal" },
                        outcome: { kpiName: "Digital Health Integration (%)", kpiBaseline: 5, kpiCurrent: 15, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 85, beneficiaryReported: 80, attribution: 90, sustainability: 85, dataSource: "NHA Report", surveyYear: 2024 }
                    },
                    {
                        name: "E-Sanjeevani Telemedicine", description: "National telemedicine service for remote health access",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2019,
                        allocated: 12000, utilized: 11800, capPct: 15, revPct: 85,
                        output: { physTarget: 80000000, physAchieved: 79000000, unit: "consultations done", benTarget: 80000000, benAchieved: 79000000, timeliness: 95, quality: 85, geoDist: 90, dataSource: "E-Sanjeevani Dashboard" },
                        outcome: { kpiName: "Rural Health Access Index", kpiBaseline: 10, kpiCurrent: 35, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 88, beneficiaryReported: 90, attribution: 85, sustainability: 80, dataSource: "MoHFW Survey", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Agriculture", shortCode: "MoA", color: "#F5C842", sector: Sector.AGRICULTURE,
        departments: [
            {
                name: "Dept. of Agriculture & Farmers Welfare",
                schemes: [
                    {
                        name: "PM Kisan Samman Nidhi", description: "Direct income support of ₹6,000/year to small and marginal farmer families",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2019,
                        allocated: 70000, utilized: 66500, capPct: 0, revPct: 100,
                        output: { physTarget: 110000000, physAchieved: 104500000, unit: "beneficiaries paid", benTarget: 110000000, benAchieved: 104500000, timeliness: 92, quality: 88, geoDist: 92, dataSource: "PM-KISAN Portal" },
                        outcome: { kpiName: "Farmer Income Growth Rate (%)", kpiBaseline: 2.4, kpiCurrent: 5.8, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 82, beneficiaryReported: 72, attribution: 60, sustainability: 70, dataSource: "Agriculture Census 2024", surveyYear: 2024 }
                    },
                    {
                        name: "Fasal Bima Yojana", description: "Crop insurance scheme protecting farmers against natural calamities and pest attacks",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2016,
                        allocated: 50000, utilized: 42500, capPct: 5, revPct: 95,
                        output: { physTarget: 60000000, physAchieved: 45600000, unit: "farmers insured", benTarget: 60000000, benAchieved: 45600000, timeliness: 72, quality: 70, geoDist: 75, dataSource: "PMFBY Portal" },
                        outcome: { kpiName: "Claim Settlement Ratio (%)", kpiBaseline: 55, kpiCurrent: 68, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 70, beneficiaryReported: 62, attribution: 65, sustainability: 68, dataSource: "Insurance Regulatory Authority", surveyYear: 2024 }
                    },
                    {
                        name: "Soil Health Card Scheme", description: "Providing soil health cards with crop-wise nutrient recommendations",
                        priorityCategory: PriorityCategory.ENVIRONMENT, launchYear: 2015,
                        allocated: 30000, utilized: 22500, capPct: 20, revPct: 80,
                        output: { physTarget: 50000000, physAchieved: 37500000, unit: "cards issued", benTarget: 50000000, benAchieved: 37500000, timeliness: 68, quality: 72, geoDist: 70, dataSource: "SHC Portal" },
                        outcome: { kpiName: "Fertilizer Use Efficiency Index", kpiBaseline: 42, kpiCurrent: 55, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 68, beneficiaryReported: 58, attribution: 55, sustainability: 72, dataSource: "ICAR Study Report", surveyYear: 2024 }
                    },
                    {
                        name: "PM Krishi Sinchayee Yojana", description: "Enhancing physical access of water on farm and expanding cultivable area",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2015,
                        allocated: 65000, utilized: 62000, capPct: 85, revPct: 15,
                        output: { physTarget: 2000000, physAchieved: 1900000, unit: "hectares irrigated", benTarget: 5000000, benAchieved: 4800000, timeliness: 90, quality: 80, geoDist: 75, dataSource: "PMKSY Dashboard" },
                        outcome: { kpiName: "Crop Yield Growth (%)", kpiBaseline: 45, kpiCurrent: 48, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 58, beneficiaryReported: 60, attribution: 55, sustainability: 65, dataSource: "Agri Census", surveyYear: 2024 }
                    },
                    {
                        name: "Paramparagat Krishi Vikas Yojana", description: "Promoting organic farming through cluster approach",
                        priorityCategory: PriorityCategory.ENVIRONMENT, launchYear: 2015,
                        allocated: 20000, utilized: 12000, capPct: 10, revPct: 90,
                        output: { physTarget: 50000, physAchieved: 30000, unit: "clusters formed", benTarget: 1000000, benAchieved: 600000, timeliness: 65, quality: 70, geoDist: 60, dataSource: "PKVY Portal" },
                        outcome: { kpiName: "Organic Production Volume Indicator", kpiBaseline: 15, kpiCurrent: 17, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 50, beneficiaryReported: 55, attribution: 45, sustainability: 50, dataSource: "APEDA Report", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Defence", shortCode: "MoD", color: "#6B7280", sector: Sector.OTHER,
        departments: [
            {
                name: "Dept. of Military Affairs",
                schemes: [
                    {
                        name: "Defence Modernization Programme", description: "Modernization of armed forces including procurement of indigenous defence equipment",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2018,
                        allocated: 380000, utilized: 346000, capPct: 75, revPct: 25,
                        output: { physTarget: 150, physAchieved: 135, unit: "procurement contracts", benTarget: 1500000, benAchieved: 1365000, timeliness: 80, quality: 92, geoDist: 60, dataSource: "MoD Annual Report 2024-25" },
                        outcome: { kpiName: "Defence Indigenization Rate (%)", kpiBaseline: 54, kpiCurrent: 68, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 78, beneficiaryReported: 80, attribution: 72, sustainability: 85, dataSource: "SIPRI Defence Report", surveyYear: 2024 }
                    },
                    {
                        name: "Border Infrastructure & Roads", description: "Strategic border road construction and infrastructure in frontier areas",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2015,
                        allocated: 242000, utilized: 217800, capPct: 90, revPct: 10,
                        output: { physTarget: 3500, physAchieved: 3150, unit: "km roads constructed", benTarget: 2000000, benAchieved: 1800000, timeliness: 85, quality: 88, geoDist: 55, dataSource: "BRO Annual Report" },
                        outcome: { kpiName: "Border Connectivity Index", kpiBaseline: 58, kpiCurrent: 72, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 75, beneficiaryReported: 70, attribution: 78, sustainability: 82, dataSource: "Strategic Assessment Division", surveyYear: 2024 }
                    },
                    {
                        name: "Agniveer Scheme Integration", description: "Short-term recruitment scheme for the armed forces",
                        priorityCategory: PriorityCategory.HUMAN_CAPITAL, launchYear: 2022,
                        allocated: 45000, utilized: 43000, capPct: 5, revPct: 95,
                        output: { physTarget: 46000, physAchieved: 45000, unit: "recruits trained", benTarget: 46000, benAchieved: 45000, timeliness: 95, quality: 85, geoDist: 85, dataSource: "Armed Forces Dashboard" },
                        outcome: { kpiName: "Force Youth Profile Index", kpiBaseline: 20, kpiCurrent: 40, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 85, beneficiaryReported: 80, attribution: 90, sustainability: 75, dataSource: "MoD Annual Assessment", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Railways", shortCode: "MoR", color: "#DC2626", sector: Sector.INFRASTRUCTURE,
        departments: [
            {
                name: "Railway Board",
                schemes: [
                    {
                        name: "Vande Bharat & Network Expansion", description: "Semi-high-speed rail expansion and new Vande Bharat train manufacturing",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2019,
                        allocated: 520000, utilized: 468000, capPct: 80, revPct: 20,
                        output: { physTarget: 75, physAchieved: 62, unit: "train sets delivered", benTarget: 50000000, benAchieved: 41500000, timeliness: 78, quality: 92, geoDist: 72, dataSource: "Railway Board Production Report" },
                        outcome: { kpiName: "Passenger Satisfaction Index", kpiBaseline: 62, kpiCurrent: 78, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 80, beneficiaryReported: 82, attribution: 75, sustainability: 78, dataSource: "IRCTC Customer Survey", surveyYear: 2024 }
                    },
                    {
                        name: "Station Redevelopment & Safety", description: "World-class station development and safety enhancement across Indian Railways",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2020,
                        allocated: 330000, utilized: 287100, capPct: 70, revPct: 30,
                        output: { physTarget: 200, physAchieved: 174, unit: "stations redeveloped", benTarget: 100000000, benAchieved: 87000000, timeliness: 75, quality: 85, geoDist: 80, dataSource: "IRSDC Dashboard" },
                        outcome: { kpiName: "Railway Accident Rate (per M km)", kpiBaseline: 0.10, kpiCurrent: 0.04, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 88, beneficiaryReported: 75, attribution: 80, sustainability: 85, dataSource: "CRS Safety Report", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Road Transport & Highways", shortCode: "MoRTH", color: "#EA580C", sector: Sector.INFRASTRUCTURE,
        departments: [
            {
                name: "Dept. of Highways",
                schemes: [
                    {
                        name: "Bharatmala Pariyojana", description: "Major highway development programme connecting economic corridors and border areas",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2017,
                        allocated: 378000, utilized: 340200, capPct: 85, revPct: 15,
                        output: { physTarget: 12000, physAchieved: 10800, unit: "km highways built", benTarget: 200000000, benAchieved: 180000000, timeliness: 82, quality: 86, geoDist: 78, dataSource: "NHAI Project Tracker" },
                        outcome: { kpiName: "National Highway Density (km/1000 sq km)", kpiBaseline: 42, kpiCurrent: 48, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 80, beneficiaryReported: 78, attribution: 82, sustainability: 75, dataSource: "MoRTH Annual Report", surveyYear: 2024 }
                    },
                    {
                        name: "Road Safety Programme", description: "National road safety awareness, enforcement, and infrastructure improvements",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2021,
                        allocated: 200000, utilized: 176000, capPct: 60, revPct: 40,
                        output: { physTarget: 50000, physAchieved: 44000, unit: "black spots rectified", benTarget: 500000000, benAchieved: 440000000, timeliness: 80, quality: 78, geoDist: 82, dataSource: "MORTH Road Safety Cell" },
                        outcome: { kpiName: "Road Fatality Rate (per 100k population)", kpiBaseline: 11.5, kpiCurrent: 9.2, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 72, beneficiaryReported: 65, attribution: 60, sustainability: 70, dataSource: "NCRB Accidental Deaths Report", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Home Affairs", shortCode: "MHA", color: "#7C3AED", sector: Sector.OTHER,
        departments: [
            {
                name: "Dept. of Internal Security",
                schemes: [
                    {
                        name: "Safe City & CCTNS", description: "Crime and Criminal Tracking Network and safe city surveillance infrastructure",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2019,
                        allocated: 130000, utilized: 117000, capPct: 65, revPct: 35,
                        output: { physTarget: 500, physAchieved: 450, unit: "cities equipped", benTarget: 300000000, benAchieved: 270000000, timeliness: 82, quality: 80, geoDist: 75, dataSource: "MHA Smart Policing Report" },
                        outcome: { kpiName: "Crime Resolution Rate (%)", kpiBaseline: 42, kpiCurrent: 56, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 78, beneficiaryReported: 72, attribution: 68, sustainability: 75, dataSource: "NCRB Crime Statistics", surveyYear: 2024 }
                    },
                    {
                        name: "Border Security Modernization", description: "Comprehensive border management and surveillance modernization",
                        priorityCategory: PriorityCategory.INFRASTRUCTURE, launchYear: 2017,
                        allocated: 89000, utilized: 78320, capPct: 70, revPct: 30,
                        output: { physTarget: 2500, physAchieved: 2200, unit: "km border fenced/smart", benTarget: 50000000, benAchieved: 44000000, timeliness: 78, quality: 85, geoDist: 60, dataSource: "BSF/ITBP Annual Report" },
                        outcome: { kpiName: "Illegal Infiltration Incidents (reduction %)", kpiBaseline: 100, kpiCurrent: 62, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 82, beneficiaryReported: 70, attribution: 75, sustainability: 80, dataSource: "MHA Border Report", surveyYear: 2024 }
                    }
                ]
            }
        ]
    },
    {
        name: "Ministry of Rural Development", shortCode: "MoRD", color: "#059669", sector: Sector.OTHER,
        departments: [
            {
                name: "Dept. of Rural Development",
                schemes: [
                    {
                        name: "MGNREGA", description: "Mahatma Gandhi National Rural Employment Guarantee Act - right to work programme",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2006,
                        allocated: 480000, utilized: 432000, capPct: 10, revPct: 90,
                        output: { physTarget: 80000000, physAchieved: 72000000, unit: "person-days generated", benTarget: 60000000, benAchieved: 54000000, timeliness: 88, quality: 72, geoDist: 90, dataSource: "MGNREGA MIS Portal" },
                        outcome: { kpiName: "Rural Wage Growth Rate (%)", kpiBaseline: 3.2, kpiCurrent: 6.8, direction: KpiDirection.HIGHER_IS_BETTER, baselineVsCurrent: 80, beneficiaryReported: 75, attribution: 65, sustainability: 72, dataSource: "NSSO Labour Force Survey", surveyYear: 2024 }
                    },
                    {
                        name: "PM Awas Yojana - Gramin", description: "Rural housing scheme providing pucca houses to homeless and those in kutcha houses",
                        priorityCategory: PriorityCategory.SOCIAL_PROTECTION, launchYear: 2016,
                        allocated: 257000, utilized: 231300, capPct: 50, revPct: 50,
                        output: { physTarget: 3000000, physAchieved: 2700000, unit: "houses sanctioned", benTarget: 3000000, benAchieved: 2700000, timeliness: 82, quality: 80, geoDist: 85, dataSource: "PMAY-G Dashboard" },
                        outcome: { kpiName: "Rural Housing Shortage Reduction (%)", kpiBaseline: 100, kpiCurrent: 42, direction: KpiDirection.LOWER_IS_BETTER, baselineVsCurrent: 85, beneficiaryReported: 88, attribution: 80, sustainability: 78, dataSource: "Census Housing Data", surveyYear: 2024 }
                    }
                ]
            }
        ]
    }
];

async function main() {
    console.log("🧹 Cleaning existing data...");
    await prisma.feedbackVote.deleteMany();
    await prisma.feedbackItem.deleteMany();
    await prisma.schemeScore.deleteMany();
    await prisma.outcomeData.deleteMany();
    await prisma.outputData.deleteMany();
    await prisma.budgetAllocation.deleteMany();
    await prisma.uploadLog.deleteMany();
    await prisma.reallocPlan.deleteMany();
    await prisma.scheme.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();
    await prisma.ministry.deleteMany();

    console.log("🏛️  Seeding ministries, departments, schemes...");

    const createdSchemeIds: string[] = [];

    for (const mData of ministriesData) {
        const ministry = await prisma.ministry.create({
            data: {
                name: mData.name,
                shortCode: mData.shortCode,
                color: mData.color,
                description: `Government of India — ${mData.name}`,
                sector: mData.sector,
            }
        });
        console.log(`  ✅ Ministry: ${ministry.name}`);

        for (const dData of mData.departments) {
            const department = await prisma.department.create({
                data: {
                    name: dData.name,
                    ministryId: ministry.id,
                }
            });

            for (const sData of dData.schemes) {
                const capAlloc = sData.allocated * (sData.capPct / 100);
                const revAlloc = sData.allocated * (sData.revPct / 100);
                const capUtil = sData.utilized * (sData.capPct / 100);
                const revUtil = sData.utilized * (sData.revPct / 100);
                const surrendered = (sData.allocated - sData.utilized) * 0.3; // 30% of gap surrendered
                const suppDemands = sData.utilized / sData.allocated < 0.75 ? 2 : (sData.utilized / sData.allocated < 0.9 ? 1 : 0);

                // Quarter-wise expenditure: realistic distribution
                const q1Pct = 0.20, q2Pct = 0.25, q3Pct = 0.28, q4Pct = 0.27;
                const expQ1 = sData.utilized * q1Pct;
                const expQ2 = sData.utilized * q2Pct;
                const expQ3 = sData.utilized * q3Pct;
                const expQ4 = sData.utilized * q4Pct;

                const scheme = await prisma.scheme.create({
                    data: {
                        name: sData.name,
                        description: sData.description,
                        departmentId: department.id,
                        isActive: true,
                        launchYear: sData.launchYear,
                        priorityCategory: sData.priorityCategory,
                    }
                });
                createdSchemeIds.push(scheme.id);

                // Budget allocation (scheme-level)
                await prisma.budgetAllocation.create({
                    data: {
                        schemeId: scheme.id,
                        ministryId: ministry.id,
                        fiscalYear: FISCAL_YEAR,
                        allocated: capAlloc + revAlloc,
                        allocatedCapital: capAlloc,
                        allocatedRevenue: revAlloc,
                        utilized: capUtil + revUtil,
                        utilizedCapital: capUtil,
                        utilizedRevenue: revUtil,
                        expenditureQ1: expQ1,
                        expenditureQ2: expQ2,
                        expenditureQ3: expQ3,
                        expenditureQ4: expQ4,
                        surrendered: surrendered,
                        supplementaryDemands: suppDemands,
                    }
                });

                // Output data
                const od = sData.output;
                await prisma.outputData.create({
                    data: {
                        schemeId: scheme.id,
                        fiscalYear: FISCAL_YEAR,
                        physicalTargetValue: od.physTarget,
                        physicalAchievedValue: od.physAchieved,
                        physicalUnit: od.unit,
                        beneficiaryTarget: od.benTarget,
                        beneficiaryAchieved: od.benAchieved,
                        timelinessScore: od.timeliness,
                        qualityComplianceScore: od.quality,
                        geoDistributionIndex: od.geoDist,
                        dataSource: od.dataSource,
                    }
                });

                // Outcome data
                const oc = sData.outcome;
                await prisma.outcomeData.create({
                    data: {
                        schemeId: scheme.id,
                        fiscalYear: FISCAL_YEAR,
                        sectorKpiName: oc.kpiName,
                        sectorKpiBaseline: oc.kpiBaseline,
                        sectorKpiCurrent: oc.kpiCurrent,
                        sectorKpiDirection: oc.direction,
                        baselineVsCurrentIndex: oc.baselineVsCurrent,
                        beneficiaryReportedScore: oc.beneficiaryReported,
                        attributionScore: oc.attribution,
                        sustainabilityIndex: oc.sustainability,
                        dataSource: oc.dataSource,
                        surveyYear: oc.surveyYear,
                    }
                });

                // Compute scores
                const utilResult = computeUtilizationScore(sData.allocated, sData.utilized, capAlloc, capUtil, revAlloc, revUtil, surrendered, suppDemands);
                const outputResult = computeOutputScore(od.physTarget, od.physAchieved, od.benTarget, od.benAchieved, od.timeliness, od.quality, od.geoDist);
                const outcomeResult = computeOutcomeScore(oc.baselineVsCurrent, oc.beneficiaryReported, oc.attribution, oc.sustainability);
                const finalScore = computeFinalScore(utilResult.score, outputResult.score, outcomeResult.score);

                await prisma.schemeScore.create({
                    data: {
                        schemeId: scheme.id,
                        fiscalYear: FISCAL_YEAR,
                        utilizationScore: utilResult.score,
                        utilizationBreakdown: utilResult.breakdown,
                        outputScore: outputResult.score,
                        outputBreakdown: outputResult.breakdown,
                        outcomeScore: outcomeResult.score,
                        outcomeBreakdown: outcomeResult.breakdown,
                        finalScore: finalScore,
                        scoreVersion: "v1.0",
                        calculatedAt: new Date(),
                    }
                });

                console.log(`    📊 ${sData.name} — Final Score: ${finalScore}`);
            }
        }
    }

    // ========== USERS ==========
    console.log("\n👤 Seeding users...");
    // Get first two ministries for admin assignment
    const allMinistries = await prisma.ministry.findMany({ take: 4 });

    const _superAdmin = await prisma.user.create({
        data: {
            name: "Rajiv Kumar",
            email: "admin@rashtrakosh.gov.in",
            password: bcrypt.hashSync("Admin@123", 10), // hashed "Admin@123"
            role: UserRole.SUPER_ADMIN,
            membershipTier: MembershipTier.INSTITUTIONAL,
            institution: "NITI Aayog",
            credentialVerified: true,
        }
    });
    console.log("  ✅ Super Admin:", _superAdmin.name);

    const financeAdmin = await prisma.user.create({
        data: {
            name: "Priya Sharma",
            email: "priya.sharma@finance.gov.in",
            password: bcrypt.hashSync("Admin@123", 10),
            role: UserRole.MINISTRY_ADMIN,
            membershipTier: MembershipTier.INSTITUTIONAL,
            institution: "Ministry of Finance",
            ministryId: allMinistries[0]?.id,
            credentialVerified: true,
        }
    });
    console.log("  ✅ Ministry Admin (MoF): Priya Sharma");

    const healthAdmin = await prisma.user.create({
        data: {
            name: "Dr. Anand Mehta",
            email: "anand.mehta@health.gov.in",
            password: bcrypt.hashSync("Admin@123", 10),
            role: UserRole.MINISTRY_ADMIN,
            membershipTier: MembershipTier.INSTITUTIONAL,
            institution: "Ministry of Health & Family Welfare",
            ministryId: allMinistries[2]?.id,
            credentialVerified: true,
        }
    });
    console.log("  ✅ Ministry Admin (MoHFW): Dr. Anand Mehta");

    const expertUser = await prisma.user.create({
        data: {
            name: "Prof. Sunita Desai",
            email: "sunita.desai@iima.ac.in",
            password: bcrypt.hashSync("Admin@123", 10),
            role: UserRole.EXPERT_MEMBER,
            membershipTier: MembershipTier.EXPERT,
            institution: "IIM Ahmedabad",
            credentials: "https://linkedin.com/in/sunita-desai-professor",
            credentialVerified: true,
        }
    });
    console.log("  ✅ Expert Member: Prof. Sunita Desai");

    const generalUser = await prisma.user.create({
        data: {
            name: "Arjun Patel",
            email: "arjun.patel@gmail.com",
            password: bcrypt.hashSync("Admin@123", 10),
            role: UserRole.GENERAL_MEMBER,
            membershipTier: MembershipTier.GENERAL,
        }
    });
    console.log("  ✅ General Member:", generalUser.name);

    // ========== FEEDBACK ==========
    console.log("\n💬 Seeding feedback items...");
    const allSchemes = await prisma.scheme.findMany({ take: 16 });

    await prisma.feedbackItem.create({
        data: {
            title: "PM Gati Shakti exceeding connectivity targets in Northeast",
            body: "The multi-modal connectivity approach has significantly improved logistics in Assam and Meghalaya. Suggest expanding rail corridor funding by 20% in the next fiscal year.",
            category: FeedbackCategory.SCHEME_PERFORMANCE,
            schemeId: allSchemes[0]?.id,
            authorId: expertUser.id,
            status: FeedbackStatus.UNDER_REVIEW,
            weightedScore: 2.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "NEP Implementation needs urgent course correction",
            body: "Only 62% of targeted institutions have been reformed. The multi-disciplinary program adoption is lagging. Recommend a dedicated task force with monthly milestones.",
            category: FeedbackCategory.POLICY_SUGGESTION,
            schemeId: allSchemes.find(s => s.name === "NEP Implementation")?.id,
            authorId: expertUser.id,
            status: FeedbackStatus.NEW,
            weightedScore: 2.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Discrepancy in Mission Indradhanush coverage data",
            body: "The reported 28M vaccinations seems inflated when cross-referenced with state-level HMIS data. Suggest an independent audit of the cold chain infrastructure utilization.",
            category: FeedbackCategory.ANOMALY_FLAG,
            schemeId: allSchemes.find(s => s.name === "Mission Indradhanush")?.id,
            authorId: healthAdmin.id,
            status: FeedbackStatus.UNDER_REVIEW,
            adminNote: "Internal audit initiated. Awaiting state reports.",
            weightedScore: 3.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "Reallocate funds from Sovereign Green Bonds to PM-JAY",
            body: "Green Bonds has only utilized 73% of allocation. PM-JAY is oversubscribed with 27.6M treatments vs 30M target. A 15% reallocation would directly improve healthcare access.",
            category: FeedbackCategory.REALLOCATION_SUGGESTION,
            authorId: financeAdmin.id,
            status: FeedbackStatus.INCORPORATED,
            weightedScore: 3.0,
        }
    });

    await prisma.feedbackItem.create({
        data: {
            title: "PM Kisan portal crashes during payment cycles",
            body: "As a beneficiary farmer from Madhya Pradesh, I've noticed the PM Kisan portal becomes inaccessible for 2-3 days during each payment cycle. This affects 11 crore farmers.",
            category: FeedbackCategory.DATA_QUALITY,
            schemeId: allSchemes.find(s => s.name === "PM Kisan Samman Nidhi")?.id,
            authorId: generalUser.id,
            isAnonymous: false,
            status: FeedbackStatus.NEW,
            weightedScore: 1.0,
        }
    });
    console.log("  ✅ 5 feedback items created");

    // ========== SUMMARY ==========
    const schemeCount = await prisma.scheme.count();
    const scoreCount = await prisma.schemeScore.count();
    const userCount = await prisma.user.count();
    const feedbackCount = await prisma.feedbackItem.count();

    console.log("\n🎯 Seed Summary:");
    console.log(`   Ministries:   ${await prisma.ministry.count()}`);
    console.log(`   Departments:  ${await prisma.department.count()}`);
    console.log(`   Schemes:      ${schemeCount}`);
    console.log(`   Allocations:  ${await prisma.budgetAllocation.count()}`);
    console.log(`   Output Data:  ${await prisma.outputData.count()}`);
    console.log(`   Outcome Data: ${await prisma.outcomeData.count()}`);
    console.log(`   Scores:       ${scoreCount}`);
    console.log(`   Users:        ${userCount}`);
    console.log(`   Feedback:     ${feedbackCount}`);
    console.log("\n✅ Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
