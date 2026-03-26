import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
const prisma = new PrismaClient();

const DATA = [
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Pradhan Mantri Kisan Samman Nidhi (PM – KISAN)",
    "fy": "2026-27",
    "BE": 63500,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Modified Interest Subvention Scheme (MISS)",
    "fy": "2026-27",
    "BE": 22600,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Crop Insurance Scheme",
    "fy": "2026-27",
    "BE": 12200,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Rashtriya Krishi Vikas Yojana",
    "fy": "2026-27",
    "BE": 8550,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Krishionnati Yojana",
    "fy": "2026-27",
    "BE": 11200,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Formation and Promotion of 10,000 Farmer Producer Organization (FPOs)",
    "fy": "2026-27",
    "BE": 500,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Agriculture Infrastructure Fund",
    "fy": "2026-27",
    "BE": 910,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Pradhan Mantri Annadata Aay Sanrakshan Yojana (PM-AASHA) Scheme",
    "fy": "2026-27",
    "BE": 7200,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "National Mission on Natural Farming (NMNF)",
    "fy": "2026-27",
    "BE": 750,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmer’s Welfare",
    "department": "Department of Agriculture and Farmer’s Welfare",
    "scheme": "Namo Drone Didi",
    "fy": "2026-27",
    "BE": 676.85,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmers Welfare",
    "department": "Department of Agricultural Research and Education",
    "scheme": "Crop Science for Food and Nutritional Security",
    "fy": "2026-27",
    "BE": 969.5,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Agriculture and Farmers Welfare",
    "department": "Department of Agricultural Research and Education",
    "scheme": "Strengthening, Agricultural Education, Management and Social Sciences",
    "fy": "2026-27",
    "BE": 514.87,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Ayush",
    "department": "NA",
    "scheme": "National Ayush Mission",
    "fy": "2026-27",
    "BE": 1300,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Chemical and Fertilizers",
    "department": "Department of Fertilizers",
    "scheme": "Urea Subsidy",
    "fy": "2026-27",
    "BE": 116805,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Chemical and Fertilizers",
    "department": "Department of Fertilizers",
    "scheme": "Nutrient Based Subsidy",
    "fy": "2026-27",
    "BE": 54000,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Chemicals and Fertilizers",
    "department": "Department of Pharmaceuticals",
    "scheme": "Production Linked Incentives Schemes",
    "fy": "2026-27",
    "BE": 2499.84,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Chemicals and Fertilizers",
    "department": "Department of Pharmaceuticals",
    "scheme": "Development of Pharmaceutical Industry",
    "fy": "2026-27",
    "BE": 967.84,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Chemicals and Fertilizers",
    "department": "Department of Pharmaceuticals",
    "scheme": "Promotion of Research and Innovation in Pharma-Med Tech (PRIP)",
    "fy": "2026-27",
    "BE": 750,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Civil Aviation",
    "department": "NA",
    "scheme": "Regional Connectivity Scheme-Modified UDAN",
    "fy": "2026-27",
    "BE": 550,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Coal",
    "department": "NA",
    "scheme": "Exploration of Coal and Lignite",
    "fy": "2026-27",
    "BE": 755,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Coal",
    "department": "NA",
    "scheme": "Scheme for Promotion of Coal/Lignite Gasification",
    "fy": "2026-27",
    "BE": 3525,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Commerce and Industry",
    "department": "Department of Commerce",
    "scheme": "Export Promotion Mission",
    "fy": "2026-27",
    "BE": 2300,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Commerce and Industry",
    "department": "Department for Promotion of Industry and Internal Trade",
    "scheme": "National Industrial Corridor Development and Implementation Trust (NICDIT)",
    "fy": "2026-27",
    "BE": 3000,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Commerce and Industry",
    "department": "Department for Promotion of Industry and Internal Trade",
    "scheme": "Fund of Funds",
    "fy": "2026-27",
    "BE": 1200,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Commerce and Industry",
    "department": "Department for Promotion of Industry and Internal Trade",
    "scheme": "Production Linked Incentive (PLI) Scheme for White Goods",
    "fy": "2026-27",
    "BE": 1003.54,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Commerce and Industry",
    "department": "Department for Promotion of Industry and Internal Trade",
    "scheme": "Refund of central and integrated GST to NE/Himalayan units",
    "fy": "2026-27",
    "BE": 724.21,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Communications",
    "department": "Department Of Posts",
    "scheme": "IT Modernization Project 2.0",
    "fy": "2026-27",
    "BE": 759,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Communications",
    "department": "Department of Telecommunications",
    "scheme": "Domestic Industry Incentivisation Scheme (PLI)",
    "fy": "2026-27",
    "BE": 1989.72,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Communications",
    "department": "Department of Telecommunications",
    "scheme": "Bharatnet Project",
    "fy": "2026-27",
    "BE": 24000,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Consumer Affairs, Food and Public Distribution",
    "department": "Department of Consumer Affairs",
    "scheme": "Price Stabilization Fund",
    "fy": "2026-27",
    "BE": 4100,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Consumer Affairs, Food and Public Distribution",
    "department": "Department of Food and Public Distribution",
    "scheme": "Pradhan Mantri Garib Kalyan Ann Yojana (PMGKAY)",
    "fy": "2026-27",
    "BE": 227429,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Consumer Affairs, Food and Public Distribution",
    "department": "Department of Food and Public Distribution",
    "scheme": "Assistance to States for movement under NFSA",
    "fy": "2026-27",
    "BE": 6500,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Consumer Affairs, Food and Public Distribution",
    "department": "Department of Food and Public Distribution",
    "scheme": "Scheme for extending financial assistance to sugar mills",
    "fy": "2026-27",
    "BE": 600,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Corporate Affairs",
    "department": "NA",
    "scheme": "New Internship Programme",
    "fy": "2026-27",
    "BE": 4788.45,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Development of North East Region",
    "department": "NA",
    "scheme": "Prime Minister's Development Initiative for North East Region (PM-DevINE)",
    "fy": "2026-27",
    "BE": 2306,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Development of North East Region",
    "department": "NA",
    "scheme": "North East Special Infrastructure Development Scheme (NESIDS)",
    "fy": "2026-27",
    "BE": 2500,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Development of North East Region",
    "department": "NA",
    "scheme": "Schemes of North East Council",
    "fy": "2026-27",
    "BE": 825,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Earth Sciences",
    "department": "NA",
    "scheme": "Deep Ocean Mission (DOM)",
    "fy": "2026-27",
    "BE": 625,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Earth Sciences",
    "department": "NA",
    "scheme": "Mission Mausam (MM)",
    "fy": "2026-27",
    "BE": 1342.29,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Earth Sciences",
    "department": "NA",
    "scheme": "Prithvi Vigyan (PRITHVI)",
    "fy": "2026-27",
    "BE": 800,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education & Literacy",
    "scheme": "Pradhan Mantri Poshan Shakti Nirman (PM POSHAN)",
    "fy": "2026-27",
    "BE": 12750,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education & Literacy",
    "scheme": "Samagra Shiksha",
    "fy": "2026-27",
    "BE": 42100.02,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education & Literacy",
    "scheme": "PM Schools for Rising India (PM SHRI)",
    "fy": "2026-27",
    "BE": 7500,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education & Literacy",
    "scheme": "Strengthening Teacher-Learning and Results for States (STARS)",
    "fy": "2026-27",
    "BE": 500,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "National Apprenticeship Training Scheme (NATS)",
    "fy": "2026-27",
    "BE": 1250,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "Pradhan Mantri Uchchatar Shiksha Abhiyan (PM USHA)",
    "fy": "2026-27",
    "BE": 1850,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "PM Research Fellowship",
    "fy": "2026-27",
    "BE": 600,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "PM Uchchatar Shiksha Protsahan (PM-USP) Yojna",
    "fy": "2026-27",
    "BE": 1560,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "World Class Institutions",
    "fy": "2026-27",
    "BE": 900,
    "RE": null,
    "Actuals": null
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "National Mission in Education Through ICT",
    "fy": "2026-27",
    "BE": 650,
    "RE": null,
    "Actuals": null
  }
];

async function main() {
    let count = 0;
    for (const item of DATA) {
        try {
            const m = await prisma.ministry.upsert({
                where: { name: item.ministry },
                update: {},
                create: { name: item.ministry, shortCode: item.ministry.substring(0,5).toUpperCase(), color: "#3b82f6", sector: Sector.OTHER }
            });
            const d = await prisma.department.upsert({
                where: { name_ministryId: { name: item.department, ministryId: m.id } },
                update: {},
                create: { name: item.department, ministryId: m.id }
            });
            const s = await prisma.scheme.upsert({
                where: { id: "TMP_" + count }, // Use something unique or find first
                update: {},
                create: { name: item.scheme, departmentId: d.id, priorityCategory: PriorityCategory.SOCIAL_PROTECTION }
            }).catch(async () => {
                 return await prisma.scheme.create({
                    data: { name: item.scheme, departmentId: d.id, priorityCategory: PriorityCategory.SOCIAL_PROTECTION }
                 });
            });

            await prisma.budgetAllocation.upsert({
                where: { schemeId_fiscalYear: { schemeId: s.id, fiscalYear: item.fy } },
                update: { allocated: item.BE },
                create: { 
                    schemeId: s.id, fiscalYear: item.fy, 
                    allocated: item.BE, utilized: 0,
                    allocatedCapital: 0, allocatedRevenue: 0, utilizedCapital: 0, utilizedRevenue: 0,
                    expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                }
            });
            count++;
        } catch (e) {}
    }
    console.log(`Ingested ${count} schemes (Partial)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
