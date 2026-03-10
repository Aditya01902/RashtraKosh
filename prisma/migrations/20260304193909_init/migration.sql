-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('FINANCE', 'EDUCATION', 'HEALTH', 'AGRICULTURE', 'INFRASTRUCTURE', 'DEFENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "PriorityCategory" AS ENUM ('INFRASTRUCTURE', 'SOCIAL_PROTECTION', 'HUMAN_CAPITAL', 'ENVIRONMENT', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "KpiDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'MINISTRY_ADMIN', 'ANALYST', 'EXPERT_MEMBER', 'GENERAL_MEMBER');

-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('NONE', 'GENERAL', 'EXPERT', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('SCHEME_PERFORMANCE', 'POLICY_SUGGESTION', 'ANOMALY_FLAG', 'REALLOCATION_SUGGESTION', 'DATA_QUALITY');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'UNDER_REVIEW', 'INCORPORATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('UPLOADED', 'VALIDATED', 'COMMITTED', 'FAILED');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Ministry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "description" TEXT,
    "sector" "Sector" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ministry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "launchYear" INTEGER,
    "priorityCategory" "PriorityCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAllocation" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT,
    "ministryId" TEXT,
    "fiscalYear" TEXT NOT NULL,
    "allocated" DECIMAL(18,2) NOT NULL,
    "allocatedCapital" DECIMAL(18,2) NOT NULL,
    "allocatedRevenue" DECIMAL(18,2) NOT NULL,
    "utilized" DECIMAL(18,2) NOT NULL,
    "utilizedCapital" DECIMAL(18,2) NOT NULL,
    "utilizedRevenue" DECIMAL(18,2) NOT NULL,
    "expenditureQ1" DECIMAL(18,2) NOT NULL,
    "expenditureQ2" DECIMAL(18,2) NOT NULL,
    "expenditureQ3" DECIMAL(18,2) NOT NULL,
    "expenditureQ4" DECIMAL(18,2) NOT NULL,
    "surrendered" DECIMAL(18,2) NOT NULL,
    "supplementaryDemands" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutputData" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "physicalTargetValue" DECIMAL(18,2) NOT NULL,
    "physicalAchievedValue" DECIMAL(18,2) NOT NULL,
    "physicalUnit" TEXT NOT NULL,
    "beneficiaryTarget" INTEGER NOT NULL,
    "beneficiaryAchieved" INTEGER NOT NULL,
    "timelinessScore" DECIMAL(5,2) NOT NULL,
    "qualityComplianceScore" DECIMAL(5,2) NOT NULL,
    "geoDistributionIndex" DECIMAL(5,2) NOT NULL,
    "dataSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutputData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutcomeData" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "sectorKpiName" TEXT NOT NULL,
    "sectorKpiBaseline" DECIMAL(18,2) NOT NULL,
    "sectorKpiCurrent" DECIMAL(18,2) NOT NULL,
    "sectorKpiDirection" "KpiDirection" NOT NULL,
    "baselineVsCurrentIndex" DECIMAL(5,2) NOT NULL,
    "beneficiaryReportedScore" DECIMAL(5,2) NOT NULL,
    "attributionScore" DECIMAL(5,2) NOT NULL,
    "sustainabilityIndex" DECIMAL(5,2) NOT NULL,
    "dataSource" TEXT,
    "surveyYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutcomeData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeScore" (
    "id" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "utilizationScore" DECIMAL(5,2) NOT NULL,
    "utilizationBreakdown" JSONB NOT NULL,
    "outputScore" DECIMAL(5,2) NOT NULL,
    "outputBreakdown" JSONB NOT NULL,
    "outcomeScore" DECIMAL(5,2) NOT NULL,
    "outcomeBreakdown" JSONB NOT NULL,
    "finalScore" DECIMAL(5,2) NOT NULL,
    "scoreVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'GENERAL_MEMBER',
    "membershipTier" "MembershipTier" NOT NULL DEFAULT 'NONE',
    "institution" TEXT,
    "credentials" TEXT,
    "credentialVerified" BOOLEAN NOT NULL DEFAULT false,
    "ministryId" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "schemeId" TEXT,
    "authorId" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "weightedScore" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackVote" (
    "id" TEXT NOT NULL,
    "feedbackItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadLog" (
    "id" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "rowsTotal" INTEGER NOT NULL,
    "rowsValid" INTEGER NOT NULL,
    "rowsRejected" INTEGER NOT NULL,
    "validationErrors" JSONB NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'UPLOADED',
    "committedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReallocPlan" (
    "id" TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "totalCapitalReallocated" DECIMAL(18,2) NOT NULL,
    "totalRevenueReallocated" DECIMAL(18,2) NOT NULL,
    "planData" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReallocPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ministry_name_key" ON "Ministry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ministry_shortCode_key" ON "Ministry"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_ministryId_key" ON "Department"("name", "ministryId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetAllocation_schemeId_fiscalYear_key" ON "BudgetAllocation"("schemeId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "OutputData_schemeId_fiscalYear_key" ON "OutputData"("schemeId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "OutcomeData_schemeId_fiscalYear_key" ON "OutcomeData"("schemeId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeScore_schemeId_fiscalYear_key" ON "SchemeScore"("schemeId", "fiscalYear");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackVote_feedbackItemId_userId_key" ON "FeedbackVote"("feedbackItemId", "userId");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scheme" ADD CONSTRAINT "Scheme_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation" ADD CONSTRAINT "BudgetAllocation_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputData" ADD CONSTRAINT "OutputData_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutcomeData" ADD CONSTRAINT "OutcomeData_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeScore" ADD CONSTRAINT "SchemeScore_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackItem" ADD CONSTRAINT "FeedbackItem_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "Scheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackItem" ADD CONSTRAINT "FeedbackItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackVote" ADD CONSTRAINT "FeedbackVote_feedbackItemId_fkey" FOREIGN KEY ("feedbackItemId") REFERENCES "FeedbackItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackVote" ADD CONSTRAINT "FeedbackVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadLog" ADD CONSTRAINT "UploadLog_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReallocPlan" ADD CONSTRAINT "ReallocPlan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
