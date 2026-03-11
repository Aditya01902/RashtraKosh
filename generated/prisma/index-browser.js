
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */
Prisma.prismaVersion = {
  client: "6.4.1",
  engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.MinistryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  shortCode: 'shortCode',
  color: 'color',
  description: 'description',
  sector: 'sector',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  ministryId: 'ministryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SchemeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  departmentId: 'departmentId',
  isActive: 'isActive',
  launchYear: 'launchYear',
  priorityCategory: 'priorityCategory',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BudgetAllocationScalarFieldEnum = {
  id: 'id',
  schemeId: 'schemeId',
  ministryId: 'ministryId',
  fiscalYear: 'fiscalYear',
  allocated: 'allocated',
  allocatedCapital: 'allocatedCapital',
  allocatedRevenue: 'allocatedRevenue',
  utilized: 'utilized',
  utilizedCapital: 'utilizedCapital',
  utilizedRevenue: 'utilizedRevenue',
  expenditureQ1: 'expenditureQ1',
  expenditureQ2: 'expenditureQ2',
  expenditureQ3: 'expenditureQ3',
  expenditureQ4: 'expenditureQ4',
  surrendered: 'surrendered',
  supplementaryDemands: 'supplementaryDemands',
  revisedEstimate: 'revisedEstimate',
  anomalyFlag: 'anomalyFlag',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OutputDataScalarFieldEnum = {
  id: 'id',
  schemeId: 'schemeId',
  fiscalYear: 'fiscalYear',
  physicalTargetValue: 'physicalTargetValue',
  physicalAchievedValue: 'physicalAchievedValue',
  physicalUnit: 'physicalUnit',
  beneficiaryTarget: 'beneficiaryTarget',
  beneficiaryAchieved: 'beneficiaryAchieved',
  timelinessScore: 'timelinessScore',
  qualityComplianceScore: 'qualityComplianceScore',
  geoDistributionIndex: 'geoDistributionIndex',
  dataSource: 'dataSource',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OutcomeDataScalarFieldEnum = {
  id: 'id',
  schemeId: 'schemeId',
  fiscalYear: 'fiscalYear',
  sectorKpiName: 'sectorKpiName',
  sectorKpiBaseline: 'sectorKpiBaseline',
  sectorKpiCurrent: 'sectorKpiCurrent',
  sectorKpiDirection: 'sectorKpiDirection',
  baselineVsCurrentIndex: 'baselineVsCurrentIndex',
  beneficiaryReportedScore: 'beneficiaryReportedScore',
  attributionScore: 'attributionScore',
  sustainabilityIndex: 'sustainabilityIndex',
  dataSource: 'dataSource',
  surveyYear: 'surveyYear',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SchemeScoreScalarFieldEnum = {
  id: 'id',
  schemeId: 'schemeId',
  fiscalYear: 'fiscalYear',
  utilizationScore: 'utilizationScore',
  utilizationBreakdown: 'utilizationBreakdown',
  outputScore: 'outputScore',
  outputBreakdown: 'outputBreakdown',
  outcomeScore: 'outcomeScore',
  outcomeBreakdown: 'outcomeBreakdown',
  finalScore: 'finalScore',
  aiInsight: 'aiInsight',
  scoreVersion: 'scoreVersion',
  calculatedAt: 'calculatedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  password: 'password',
  role: 'role',
  membershipTier: 'membershipTier',
  institution: 'institution',
  credentials: 'credentials',
  credentialVerified: 'credentialVerified',
  ministryId: 'ministryId',
  image: 'image',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeedbackItemScalarFieldEnum = {
  id: 'id',
  title: 'title',
  body: 'body',
  category: 'category',
  schemeId: 'schemeId',
  authorId: 'authorId',
  isAnonymous: 'isAnonymous',
  status: 'status',
  adminNote: 'adminNote',
  weightedScore: 'weightedScore',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeedbackVoteScalarFieldEnum = {
  id: 'id',
  feedbackItemId: 'feedbackItemId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.UploadLogScalarFieldEnum = {
  id: 'id',
  uploadedBy: 'uploadedBy',
  fileName: 'fileName',
  fiscalYear: 'fiscalYear',
  rowsTotal: 'rowsTotal',
  rowsValid: 'rowsValid',
  rowsRejected: 'rowsRejected',
  validationErrors: 'validationErrors',
  status: 'status',
  committedAt: 'committedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReallocPlanScalarFieldEnum = {
  id: 'id',
  fiscalYear: 'fiscalYear',
  createdBy: 'createdBy',
  status: 'status',
  totalCapitalReallocated: 'totalCapitalReallocated',
  totalRevenueReallocated: 'totalRevenueReallocated',
  planData: 'planData',
  submittedAt: 'submittedAt',
  approvedAt: 'approvedAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Sector = exports.$Enums.Sector = {
  FINANCE: 'FINANCE',
  EDUCATION: 'EDUCATION',
  HEALTH: 'HEALTH',
  AGRICULTURE: 'AGRICULTURE',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  DEFENCE: 'DEFENCE',
  OTHER: 'OTHER'
};

exports.PriorityCategory = exports.$Enums.PriorityCategory = {
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  SOCIAL_PROTECTION: 'SOCIAL_PROTECTION',
  HUMAN_CAPITAL: 'HUMAN_CAPITAL',
  ENVIRONMENT: 'ENVIRONMENT',
  ADMINISTRATIVE: 'ADMINISTRATIVE'
};

exports.KpiDirection = exports.$Enums.KpiDirection = {
  HIGHER_IS_BETTER: 'HIGHER_IS_BETTER',
  LOWER_IS_BETTER: 'LOWER_IS_BETTER'
};

exports.UserRole = exports.$Enums.UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MINISTRY_ADMIN: 'MINISTRY_ADMIN',
  ANALYST: 'ANALYST',
  EXPERT_MEMBER: 'EXPERT_MEMBER',
  GENERAL_MEMBER: 'GENERAL_MEMBER'
};

exports.MembershipTier = exports.$Enums.MembershipTier = {
  NONE: 'NONE',
  GENERAL: 'GENERAL',
  EXPERT: 'EXPERT',
  INSTITUTIONAL: 'INSTITUTIONAL'
};

exports.FeedbackCategory = exports.$Enums.FeedbackCategory = {
  SCHEME_PERFORMANCE: 'SCHEME_PERFORMANCE',
  POLICY_SUGGESTION: 'POLICY_SUGGESTION',
  ANOMALY_FLAG: 'ANOMALY_FLAG',
  REALLOCATION_SUGGESTION: 'REALLOCATION_SUGGESTION',
  DATA_QUALITY: 'DATA_QUALITY'
};

exports.FeedbackStatus = exports.$Enums.FeedbackStatus = {
  NEW: 'NEW',
  UNDER_REVIEW: 'UNDER_REVIEW',
  INCORPORATED: 'INCORPORATED',
  ARCHIVED: 'ARCHIVED'
};

exports.UploadStatus = exports.$Enums.UploadStatus = {
  UPLOADED: 'UPLOADED',
  VALIDATED: 'VALIDATED',
  COMMITTED: 'COMMITTED',
  FAILED: 'FAILED'
};

exports.PlanStatus = exports.$Enums.PlanStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.Prisma.ModelName = {
  Ministry: 'Ministry',
  Department: 'Department',
  Scheme: 'Scheme',
  BudgetAllocation: 'BudgetAllocation',
  OutputData: 'OutputData',
  OutcomeData: 'OutcomeData',
  SchemeScore: 'SchemeScore',
  User: 'User',
  FeedbackItem: 'FeedbackItem',
  FeedbackVote: 'FeedbackVote',
  UploadLog: 'UploadLog',
  ReallocPlan: 'ReallocPlan',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
