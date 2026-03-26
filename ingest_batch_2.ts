import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DATA = [
  {
    "ministry": "Ministry of Environment, Forests and Climate Change",
    "department": "NA",
    "scheme": "Control of Pollution (CS)",
    "fy": "2026-27",
    "BE": 1091
  },
  {
    "ministry": "Ministry of Health and Family Welfare",
    "department": "Department of Health and Family Welfare",
    "scheme": "Flexible Pool for RCH & Health System Strengthening, National Health Programme and National Urban Health Mission (CSS)",
    "fy": "2026-27",
    "BE": 31820
  },
  {
    "ministry": "Ministry of Health and Family Welfare",
    "department": "Department of Health and Family Welfare",
    "scheme": "Ayushman Bharat – Pradhan Mantri Jan Arogya Yojana (PMJAY) (CSS)",
    "fy": "2026-27",
    "BE": 9500
  },
  {
    "ministry": "Ministry of Health and Family Welfare",
    "department": "Department of Health and Family Welfare",
    "scheme": "Human Resources for Health and Medical Education (CSS)",
    "fy": "2026-27",
    "BE": 1725
  },
  {
    "ministry": "Ministry of Health and Family Welfare",
    "department": "Department of Health and Family Welfare",
    "scheme": "Pradhan Mantri Ayushman Bharat Health Infrastructure Mission (PMABHIM) (CS+CSS)",
    "fy": "2026-27",
    "BE": 4770
  },
  {
    "ministry": "Ministry of Health and Family Welfare",
    "department": "Department of Health and Family Welfare",
    "scheme": "National AIDS and STD Control Programme (CS)",
    "fy": "2026-27",
    "BE": 3477
  },
  {
    "ministry": "Ministry of Health and Family Welfare",
    "department": "Department of Health and Family Welfare",
    "scheme": "Pradhan Mantri Swasthya Suraksha Yojana (CS)",
    "fy": "2026-27",
    "BE": 2005
  },
  {
    "ministry": "Ministry of Health and Family Welfare",
    "department": "Department of Health and Family Welfare",
    "scheme": "Family Welfare Scheme (CS)",
    "fy": "2026-27",
    "BE": 643.46
  },
  {
    "ministry": "Ministry of Home Affairs",
    "department": "NA",
    "scheme": "Freedom Fighters (Pension and other benefits) (CS)",
    "fy": "2026-27",
    "BE": 589.97
  },
  {
    "ministry": "Ministry of Home Affairs",
    "department": "Department of Police",
    "scheme": "Police Infrastructure (CS)",
    "fy": "2026-27",
    "BE": 5393.37
  },
  {
    "ministry": "Ministry of Home Affairs",
    "department": "Department of Police",
    "scheme": "Inter-Operable Criminal Justice System (ICJS) (CS)",
    "fy": "2026-27",
    "BE": 550
  },
  {
    "ministry": "Ministry of Home Affairs",
    "department": "Department of Police",
    "scheme": "Scheme for Safety of Women (CS)",
    "fy": "2026-27",
    "BE": 889.05
  },
  {
    "ministry": "Ministry of New and Renewable Energy",
    "department": "NA",
    "scheme": "Solar Power (Grid) (CS)",
    "fy": "2026-27",
    "BE": 1775
  },
  {
    "ministry": "Ministry of New and Renewable Energy",
    "department": "NA",
    "scheme": "PM Surya Ghar: Muft Bijli Yojana (PMSG: MBY) (CS)",
    "fy": "2026-27",
    "BE": 22000
  },
  {
    "ministry": "Ministry of New and Renewable Energy",
    "department": "NA",
    "scheme": "PM-Kisan Urja Suraksha Evam Utthaan Mahabhiyan (KUSUM) (CS)",
    "fy": "2026-27",
    "BE": 5000
  },
  {
    "ministry": "Ministry of New and Renewable Energy",
    "department": "NA",
    "scheme": "Green Energy Corridor (CS)",
    "fy": "2026-27",
    "BE": 599.99
  },
  {
    "ministry": "Ministry of New and Renewable Energy",
    "department": "NA",
    "scheme": "National Green Hydrogen Mission (CS)",
    "fy": "2026-27",
    "BE": 600
  },
  {
    "ministry": "Ministry of New and Renewable Energy",
    "department": "NA",
    "scheme": "Programme for Wind and other Renewable Energy: Wind Power-Grid (CS)",
    "fy": "2026-27",
    "BE": 500
  },
  {
    "ministry": "Ministry of New and Renewable Energy",
    "department": "NA",
    "scheme": "Solar Energy: Interest Payment and Issuing Expenses on the Bond (CS)",
    "fy": "2026-27",
    "BE": 1764.35
  },
  {
    "ministry": "Ministry of Power",
    "department": "NA",
    "scheme": "Reform Linked Distribution Scheme (CS)",
    "fy": "2026-27",
    "BE": 18000
  },
  {
    "ministry": "Ministry of Power",
    "department": "NA",
    "scheme": "Strengthening of Power System (CS)",
    "fy": "2026-27",
    "BE": 969.11
  },
  {
    "ministry": "Ministry of Power",
    "department": "NA",
    "scheme": "Power System Development Fund (CS)",
    "fy": "2026-27",
    "BE": 1102.62
  },
  {
    "ministry": "Ministry of Power",
    "department": "NA",
    "scheme": "Viability Gap Funding for Development of Battery Energy Storage System (CS)",
    "fy": "2026-27",
    "BE": 1000
  },
  {
    "ministry": "Ministry of Rural Development",
    "department": "Department of Rural Development",
    "scheme": "Pradhan Mantri Awas Yojana – Grameen (PMAY-G) (CSS)",
    "fy": "2026-27",
    "BE": 54916.7
  },
  {
    "ministry": "Ministry of Rural Development",
    "department": "Department of Rural Development",
    "scheme": "Pradhan Mantri Gram Sadak Yojana (PMGSY) (CSS)",
    "fy": "2026-27",
    "BE": 19000
  },
  {
    "ministry": "Ministry of Rural Development",
    "department": "Department of Rural Development",
    "scheme": "Deendayal Antyodaya Yojana-National Rural Livelihood Mission (DAY-NRLM) (CSS)",
    "fy": "2026-27",
    "BE": 19200
  },
  {
    "ministry": "Ministry of Rural Development",
    "department": "Department of Rural Development",
    "scheme": "National Social Assistance Programme (NSAP) (CSS)",
    "fy": "2026-27",
    "BE": 9671
  },
  {
    "ministry": "Ministry of Rural Development",
    "department": "Department of Rural Development",
    "scheme": "VB-G-RAM-G (CSS)",
    "fy": "2026-27",
    "BE": 125692.31
  },
  {
    "ministry": "Ministry of Rural Development",
    "department": "Department of Land Resources",
    "scheme": "Watershed Development Component -Pradhan Mantri Krishi Sinchai Yojana (CSS)",
    "fy": "2026-27",
    "BE": 2500
  },
  {
    "ministry": "Ministry of Earth Sciences",
    "department": "NA",
    "scheme": "Deep Ocean Mission (DOM) (CS)",
    "fy": "2026-27",
    "BE": 625
  },
  {
    "ministry": "Ministry of Earth Sciences",
    "department": "NA",
    "scheme": "Mission Mausam (MM) (CS)",
    "fy": "2026-27",
    "BE": 1342.29
  },
  {
    "ministry": "Ministry of Earth Sciences",
    "department": "NA",
    "scheme": "Prithvi Vigyan (PRITHVI) (CS)",
    "fy": "2026-27",
    "BE": 800
  },
  {
    "ministry": "Ministry of Development of North Eastern Region",
    "department": "NA",
    "scheme": "Prime Minister's Development Initiative for North East Region (PM-DevINE) (CS)",
    "fy": "2026-27",
    "BE": 2306
  },
  {
    "ministry": "Ministry of Development of North Eastern Region",
    "department": "NA",
    "scheme": "North East Special Infrastructure Development Scheme (NESIDS) (CS)",
    "fy": "2026-27",
    "BE": 2500
  },
  {
    "ministry": "Ministry of Development of North Eastern Region",
    "department": "NA",
    "scheme": "Schemes of North East Council (CS)",
    "fy": "2026-27",
    "BE": 825
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education and Literacy",
    "scheme": "Pradhan Mantri Poshan Shakti Nirman (PM POSHAN) (CSS)",
    "fy": "2026-27",
    "BE": 12750
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education and Literacy",
    "scheme": "Samagra Shiksha (CSS)",
    "fy": "2026-27",
    "BE": 42100.02
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education and Literacy",
    "scheme": "PM Schools for Rising India (PM SHRI) (CSS)",
    "fy": "2026-27",
    "BE": 7500
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of School Education and Literacy",
    "scheme": "Strengthening Teacher-Learning and Results for States (STARS) (CSS)",
    "fy": "2026-27",
    "BE": 500
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "National Apprenticeship Training Scheme (NATS) (CS)",
    "fy": "2026-27",
    "BE": 1250
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "Pradhan Mantri Uchchatar Shiksha Abhiyan (PM USHA) (CSS)",
    "fy": "2026-27",
    "BE": 1850
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "PM Research Fellowship (CS)",
    "fy": "2026-27",
    "BE": 600
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "PM Uchchatar Shiksha Protsahan (PM-USP) Yojna (CS)",
    "fy": "2026-27",
    "BE": 1560
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "World Class Institutions (CS)",
    "fy": "2026-27",
    "BE": 900
  },
  {
    "ministry": "Ministry of Education",
    "department": "Department of Higher Education",
    "scheme": "National Mission in Education Through ICT (CS)",
    "fy": "2026-27",
    "BE": 650
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "Electronics Components Manufacturing Scheme (ECMS) (CS)",
    "fy": "2026-27",
    "BE": 500
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "Modified Programme for Development of Semiconductor and Display Manufacturing Ecosystem in India (CS)",
    "fy": "2026-27",
    "BE": 8000
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "Promotion of Electronics and IT HW Manufacturing (MSIPS, EDF and Manufacturing Clusters) (CS)",
    "fy": "2026-27",
    "BE": 720
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "R and D in IT/Electronics/CCBT (CS)",
    "fy": "2026-27",
    "BE": 1248.33
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "Electronic Governance (CS)",
    "fy": "2026-27",
    "BE": 628.18
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "Capacity Building and Skill Development Scheme (CS)",
    "fy": "2026-27",
    "BE": 600
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "Cyber Security Projects (CS)",
    "fy": "2026-27",
    "BE": 790
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "IndiaAI Mission (CS)",
    "fy": "2026-27",
    "BE": 1000
  },
  {
    "ministry": "Ministry of Electronics and Information Technology",
    "department": "NA",
    "scheme": "National Knowledge Network (NKN) (CS)",
    "fy": "2026-27",
    "BE": 665
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "MRTS (Mass Rapid Transit System) and Metro Projects (CS)",
    "fy": "2026-27",
    "BE": 30940
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "Pradhan Mantri Awas Yojana-Urban (PMAY-U) 2.0 (CSS)",
    "fy": "2026-27",
    "BE": 21625.05
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "Atal Mission for Rejuvenation and Urban Transformation (AMRUT 2.0) (CSS)",
    "fy": "2026-27",
    "BE": 8000
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "Swachh Bharat Mission (SBM)- Urban (CSS)",
    "fy": "2026-27",
    "BE": 2500
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "Residential (CS)",
    "fy": "2026-27",
    "BE": 1150
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "Non- Residential (CS)",
    "fy": "2026-27",
    "BE": 4000
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "PM-eBus Sewa (CSS)",
    "fy": "2026-27",
    "BE": 500
  },
  {
    "ministry": "Ministry of Housing and Urban Affairs",
    "department": "NA",
    "scheme": "PM-SVANIDHI- Pradhan Mantri Street Vendors AtmaNirbhar Nidhi (CS)",
    "fy": "2026-27",
    "BE": 900
  }
];

async function main() {
    console.log("LOG: Starting batch 2 ingestion...");
    let count = 0;
    for (const item of DATA) {
        try {
            const m = await prisma.ministry.upsert({
                where: { name: item.ministry },
                update: {},
                create: { 
                    name: item.ministry, 
                    shortCode: (item.ministry.substring(0,3) + count + Math.random().toString(36).substring(2,5)).toUpperCase(), 
                    color: "#3b82f6", 
                    sector: "OTHER" 
                }
            });
            const dInput = item.department === "NA" ? item.ministry : item.department;
            const d = await prisma.department.upsert({
                where: { name_ministryId: { name: dInput, ministryId: m.id } },
                update: {},
                create: { name: dInput, ministryId: m.id }
            });
            const s = await prisma.scheme.create({
                data: { name: item.scheme, departmentId: d.id, priorityCategory: "SOCIAL_PROTECTION" }
            });

            await prisma.budgetAllocation.create({
                data: { 
                    schemeId: s.id, fiscalYear: item.fy, 
                    allocated: item.BE, utilized: 0,
                    allocatedCapital: 0, allocatedRevenue: 0, utilizedCapital: 0, utilizedRevenue: 0,
                    expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                }
            });
            count++;
            if (count % 10 === 0) console.log(`LOG: Ingested ${count}...`);
        } catch (e: any) {
            console.error(`Error ingesting ${item.scheme}:`, e.message);
        }
    }
    console.log(`LOG: Ingested ${count} schemes in Batch 2.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
