import { PrismaClient, Sector, PriorityCategory } from "@prisma/client";
const prisma = new PrismaClient();

const DATA = [
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Rashtriya Krishi Vikas Yojna", "actuals_24_25": 7227.63, "re_25_26": 7000.00, "be_26_27": 8550.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "National Mission on Natural Farming", "actuals_24_25": 10.35, "re_25_26": 725.00, "be_26_27": 750.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Krishionnati Yojana", "actuals_24_25": 5513.92, "re_25_26": 6800.00, "be_26_27": 11200.00 },
  { "ministry": "Ayush", "scheme_name": "National AYUSH Mission", "actuals_24_25": 1081.85, "re_25_26": 780.96, "be_26_27": 1300.00 },
  { "ministry": "Food and Public Distribution", "scheme_name": "Assistance to States Agencies for Intra-State Movement of Foodgrains under NFSA", "actuals_24_25": 6945.24, "re_25_26": 6000.00, "be_26_27": 6500.00 },
  { "ministry": "Food and Public Distribution", "scheme_name": "Scheme for Modernization and Reforms through Technology in Public Distribution System (SMART-PDS)", "actuals_24_25": 40.86, "re_25_26": 60.00, "be_26_27": 77.00 },
  { "ministry": "Cooperation", "scheme_name": "Computerization of Primary Agricultural Credit Societies", "actuals_24_25": 130.53, "re_25_26": 150.00, "be_26_27": 364.00 },
  { "ministry": "Cooperation", "scheme_name": "Centrally Sponsored Project for Strengthening of Cooperatives through IT Interventions", "actuals_24_25": 21.16, "re_25_26": 25.00, "be_26_27": 26.00 },
  { "ministry": "School Education and Literacy", "scheme_name": "Samagra Shiksha", "actuals_24_25": 36288.22, "re_25_26": 38000.02, "be_26_27": 42100.02 },
  { "ministry": "School Education and Literacy", "scheme_name": "Pradhan Mantri Poshan Shakti Nirman (PM POSHAN)", "actuals_24_25": 9903.01, "re_25_26": 10600.00, "be_26_27": 12750.00 },
  { "ministry": "School Education and Literacy", "scheme_name": "Strengthening Teaching-Learning and Results for States (STARS)", "actuals_24_25": 843.44, "re_25_26": 500.00, "be_26_27": 500.00 },
  { "ministry": "School Education and Literacy", "scheme_name": "PM Schools for Rising India (PM SHRI)", "actuals_24_25": 3504.30, "re_25_26": 4500.00, "be_26_27": 7500.00 },
  { "ministry": "School Education and Literacy", "scheme_name": "New India Literacy Programme (NILP)", "actuals_24_25": 130.39, "re_25_26": 130.00, "be_26_27": 160.00 },
  { "ministry": "Higher Education", "scheme_name": "Pradhan Mantri Uchchatar Shiksha Abhiyan (PM-USHA)", "actuals_24_25": 300.84, "re_25_26": 800.00, "be_26_27": 1850.00 },
  { "ministry": "Environment, Forests and Climate Change", "scheme_name": "National Mission for a Green India", "actuals_24_25": 136.09, "re_25_26": 95.70, "be_26_27": 212.50 },
  { "ministry": "Environment, Forests and Climate Change", "scheme_name": "Conservation of Natural Resources and Ecosystems", "actuals_24_25": 24.69, "re_25_26": 30.48, "be_26_27": 34.06 },
  { "ministry": "Environment, Forests and Climate Change", "scheme_name": "Integrated Development of Wildlife Habitats", "actuals_24_25": 444.75, "re_25_26": 265.57, "be_26_27": 404.78 },
  { "ministry": "Transfers to States", "scheme_name": "Assistance to States for Public Health Infrastructure", "actuals_24_25": 0.0, "re_25_26": 699.00, "be_26_27": 4200.00 },
  { "ministry": "Fisheries", "scheme_name": "Pradhan Mantri Matsya Sampada Yojana (PMMSY)", "actuals_24_25": 878.55, "re_25_26": 1500.00, "be_26_27": 2500.00 },
  { "ministry": "Animal Husbandry and Dairying", "scheme_name": "Development Programmes", "actuals_24_25": 449.69, "re_25_26": 909.00, "be_26_27": 1043.15 },
  { "ministry": "Food Processing Industries", "scheme_name": "Prime Minister Formalization of Micro Food Processing Enterprises Scheme (PM FME)", "actuals_24_25": 1023.10, "re_25_26": 1499.80, "be_26_27": 1700.00 },
  { "ministry": "Health and Family Welfare", "scheme_name": "Flexible Pool for RCH & Health System Strengthening", "actuals_24_25": 31685.03, "re_25_26": 29867.26, "be_26_27": 31820.00 },
  { "ministry": "Health and Family Welfare", "scheme_name": "Infrastructure Maintenance", "actuals_24_25": 6997.59, "re_25_26": 7000.00, "be_26_27": 7350.00 },
  { "ministry": "Health and Family Welfare", "scheme_name": "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PMJAY)", "actuals_24_25": 7178.64, "re_25_26": 9000.00, "be_26_27": 9500.00 },
  { "ministry": "Health and Family Welfare", "scheme_name": "Tertiary Care Programme", "actuals_24_25": 287.72, "re_25_26": 295.00, "be_26_27": 490.00 },
  { "ministry": "Health and Family Welfare", "scheme_name": "Human Resources for Health and Medical Education", "actuals_24_25": 442.00, "re_25_26": 1630.00, "be_26_27": 1725.00 },
  { "ministry": "Health and Family Welfare", "scheme_name": "Pradhan Mantri Ayushman Bharat Health Infrastructure Mission (PMABHIM)", "actuals_24_25": 2086.34, "re_25_26": 2442.50, "be_26_27": 4200.00 },
  { "ministry": "Health and Family Welfare", "scheme_name": "Strengthening National Programme Management of the NRHM", "actuals_24_25": 206.72, "re_25_26": 232.81, "be_26_27": 220.00 },
  { "ministry": "Police", "scheme_name": "Modernisation of Police Forces", "actuals_24_25": 2860.24, "re_25_26": 3279.53, "be_26_27": 4061.34 },
  { "ministry": "Police", "scheme_name": "Border Area Development Program", "actuals_24_25": 86.41, "re_25_26": 20.00, "be_26_27": 0.06 },
  { "ministry": "Police", "scheme_name": "Scheme for Safety of Women (Safe City projects)", "actuals_24_25": 78.61, "re_25_26": 133.35, "be_26_27": 125.00 },
  { "ministry": "Police", "scheme_name": "Vibrant Villages Programme", "actuals_24_25": 205.83, "re_25_26": 445.83, "be_26_27": 350.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "PMAY-Urban", "actuals_24_25": 5815.43, "re_25_26": 7500.00, "be_26_27": 18625.05 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)", "actuals_24_25": 50.00, "re_25_26": 300.00, "be_26_27": 3000.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "Scheme for Industrial Housing", "actuals_24_25": 0.0, "re_25_26": 100.00, "be_26_27": 400.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "Deendayal Jan Aajeevika Yojana- Shehari - DJAY(S)", "actuals_24_25": 61.61, "re_25_26": 200.00, "be_26_27": 536.51 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "AMRUT (Atal Mission for Rejuvenation and Urban Transformation)", "actuals_24_25": 5513.16, "re_25_26": 7500.00, "be_26_27": 8000.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "City Investment to Innovate, Integrate and Sustain 2.0 (CITIIS 2.0)", "actuals_24_25": 94.25, "re_25_26": 50.00, "be_26_27": 300.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "National Urban Digital Mission (NUDM)", "actuals_24_25": 0.0, "re_25_26": 0.0, "be_26_27": 300.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "Swachh Bharat Mission (SBM) - Urban", "actuals_24_25": 1893.22, "re_25_26": 2000.00, "be_26_27": 2500.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "PM-eBus Sewa Scheme", "actuals_24_25": 477.02, "re_25_26": 300.00, "be_26_27": 500.00 },
  { "ministry": "Housing and Urban Affairs", "scheme_name": "Urban Challenge Fund", "actuals_24_25": 0.0, "re_25_26": 1000.00, "be_26_27": 10000.00 },
  { "ministry": "Water Resources", "scheme_name": "Pradhan Mantri Krishi Sinchai Yojna", "actuals_24_25": 6497.56, "re_25_26": 6371.60, "be_26_27": 6587.00 },
  { "ministry": "Water Resources", "scheme_name": "Flood Management and Border Areas Programme(FMBAP)", "actuals_24_25": 387.52, "re_25_26": 448.46, "be_26_27": 797.00 },
  { "ministry": "Water Resources", "scheme_name": "Irrigation Census", "actuals_24_25": 18.90, "re_25_26": 35.00, "be_26_27": 80.00 },
  { "ministry": "Water Resources", "scheme_name": "National River Conservation Plan -Other Basins", "actuals_24_25": 589.19, "re_25_26": 515.61, "be_26_27": 550.00 },
  { "ministry": "Water Resources", "scheme_name": "Interlinking of Rivers", "actuals_24_25": 2000.00, "re_25_26": 1808.29, "be_26_27": 1906.07 },
  { "ministry": "Water Resources", "scheme_name": "Polavaram Irrigation Project", "actuals_24_25": 5512.40, "re_25_26": 3017.20, "be_26_27": 3320.39 },
  { "ministry": "Water Resources", "scheme_name": "Modernization of Command Area Development and Water Management", "actuals_24_25": 0.0, "re_25_26": 550.00, "be_26_27": 550.00 },
  { "ministry": "Drinking Water and Sanitation", "scheme_name": "Jal Jeevan Mission (JJM) / National Rural Drinking Water Mission", "actuals_24_25": 22612.32, "re_25_26": 17000.00, "be_26_27": 67670.00 },
  { "ministry": "Drinking Water and Sanitation", "scheme_name": "SBM-Grameen", "actuals_24_25": 3210.63, "re_25_26": 6000.00, "be_26_27": 7192.00 },
  { "ministry": "Law and Justice", "scheme_name": "Infrastructure Facilities for Judiciary", "actuals_24_25": 1125.60, "re_25_26": 800.00, "be_26_27": 812.00 },
  { "ministry": "Law and Justice", "scheme_name": "Fast Track Special Courts", "actuals_24_25": 200.00, "re_25_26": 200.00, "be_26_27": 200.00 },
  { "ministry": "Minority Affairs", "scheme_name": "Pradhan Mantri Jan Vikas Karyakaram", "actuals_24_25": 938.00, "re_25_26": 1565.00, "be_26_27": 2000.00 },
  { "ministry": "Panchayati Raj", "scheme_name": "Rashtriya Gram Swaraj Abhiyan(RGSA)", "actuals_24_25": 764.12, "re_25_26": 850.00, "be_26_27": 1142.31 },
  { "ministry": "Rural Development", "scheme_name": "National Social Assistance Progamme", "actuals_24_25": 9652.01, "re_25_26": 9197.10, "be_26_27": 9671.00 },
  { "ministry": "Rural Development", "scheme_name": "Viksit Bharat-Guarantee for Rozgar and Ajeevika Mission (Gramin)-VB-G RAM G Scheme", "actuals_24_25": 0.0, "re_25_26": 0.0, "be_26_27": 95692.31 },
  { "ministry": "Rural Development", "scheme_name": "MGNREGA-Programme Component", "actuals_24_25": 85834.40, "re_25_26": 88000.00, "be_26_27": 30000.00 },
  { "ministry": "Rural Development", "scheme_name": "Pradhan Mantri Gram Sadak Yojna", "actuals_24_25": 17870.92, "re_25_26": 11000.00, "be_26_27": 19000.00 },
  { "ministry": "Rural Development", "scheme_name": "Deendayal Antyodaya Yojana-National Rural Livelihoods Mission (DAY-NRLM)", "actuals_24_25": 14705.30, "re_25_26": 16000.00, "be_26_27": 19200.00 },
  { "ministry": "Rural Development", "scheme_name": "Pradhan Mantri Awas Yojna (PMAY)- Rural", "actuals_24_25": 32326.57, "re_25_26": 32500.01, "be_26_27": 54916.70 },
  { "ministry": "Land Resources", "scheme_name": "Watershed Development Component-Pradhan Mantri Krishi Sinchai Yojna", "actuals_24_25": 2491.37, "re_25_26": 1500.00, "be_26_27": 2500.00 },
  { "ministry": "Skill Development", "scheme_name": "Pradhan Mantri Skilling and Employability Transformation through Upgraded ITIs (PM SETU)", "actuals_24_25": 0.0, "re_25_26": 0.0, "be_26_27": 6140.50 },
  { "ministry": "Social Justice and Empowerment", "scheme_name": "Post Matric Scholarship for SCs", "actuals_24_25": 5581.49, "re_25_26": 6000.00, "be_26_27": 6360.00 },
  { "ministry": "Social Justice and Empowerment", "scheme_name": "Pre Matric Scholarship for SCs and Others", "actuals_24_25": 461.66, "re_25_26": 577.96, "be_26_27": 577.96 },
  { "ministry": "Social Justice and Empowerment", "scheme_name": "Pradhan Mantri Anusuchit Jaati Abhyuday Yojana (PM AJAY)", "actuals_24_25": 736.28, "re_25_26": 1250.00, "be_26_27": 2140.00 },
  { "ministry": "Social Justice and Empowerment", "scheme_name": "Strengthening of Machinery for Enforcement of Protection of Civil Rights Act, 1995", "actuals_24_25": 495.19, "re_25_26": 468.00, "be_26_27": 550.00 },
  { "ministry": "Social Justice and Empowerment", "scheme_name": "PM Young Achievers Scholarship Award Scheme for Vibrant India (PM YASASVI)", "actuals_24_25": 1333.30, "re_25_26": 1500.00, "be_26_27": 2320.00 },
  { "ministry": "Social Justice and Empowerment", "scheme_name": "Atal Vayo Abhyuday Yojana (AVYAY)", "actuals_24_25": 146.13, "re_25_26": 230.00, "be_26_27": 355.00 },
  { "ministry": "Social Justice and Empowerment", "scheme_name": "National Action Plan for Drug Demand Reduction (NAPDDR)", "actuals_24_25": 268.32, "re_25_26": 420.00, "be_26_27": 333.00 },
  { "ministry": "Tourism", "scheme_name": "Safe Tourist Destination for Women", "actuals_24_25": 5.27, "re_25_26": 0.0, "be_26_27": 0.01 },
  { "ministry": "Tribal Affairs", "scheme_name": "Programme for Development of Scheduled Tribes (PM Vanbandhu Kalyan Yojna)", "actuals_24_25": 3603.50, "re_25_26": 4023.34, "be_26_27": 5700.01 },
  { "ministry": "Women and Child Development", "scheme_name": "Saksham Anganwadi and POSHAN 2.0", "actuals_24_25": 21014.02, "re_25_26": 20949.47, "be_26_27": 23100.00 },
  { "ministry": "Women and Child Development", "scheme_name": "Mission VATSALYA", "actuals_24_25": 1405.53, "re_25_26": 1100.00, "be_26_27": 1550.00 },
  { "ministry": "Women and Child Development", "scheme_name": "Mission Shakti", "actuals_24_25": 1834.75, "re_25_26": 2000.00, "be_26_27": 3605.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Crop Insurance Scheme", "actuals_24_25": 14473.46, "re_25_26": 12267.00, "be_26_27": 12200.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Fund for Innovation and Adoption of Technology (FIAT)", "actuals_24_25": 0.0, "re_25_26": 133.00, "be_26_27": 200.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Modified Interest Subvention Scheme (MISS)", "actuals_24_25": 22600.00, "re_25_26": 22600.00, "be_26_27": 22600.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Pradhan Mantri Annadata Aay Sanrakshan Yojna (PM-AASHA)", "actuals_24_25": 5437.99, "re_25_26": 6941.36, "be_26_27": 7200.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)", "actuals_24_25": 66121.20, "re_25_26": 63500.00, "be_26_27": 63500.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Pradhan Mantri Kisan Man Dhan Yojna", "actuals_24_25": 100.00, "re_25_26": 50.00, "be_26_27": 120.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Formation and Promotion of 10,000 Farmer Producer Organizations (FPOs)", "actuals_24_25": 474.24, "re_25_26": 584.00, "be_26_27": 500.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Agriculture Infrastructure Fund (AIF)", "actuals_24_25": 725.34, "re_25_26": 900.00, "be_26_27": 910.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "National Beekeeping Honey Mission (NBHM)", "actuals_24_25": 66.50, "re_25_26": 100.00, "be_26_27": 100.00 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "Blended Capital Support to Finance Startups for Agriculture", "actuals_24_25": 62.50, "re_25_26": 7.51, "be_26_27": 63.97 },
  { "ministry": "Agriculture and Farmers Welfare", "scheme_name": "NAMO DRONE DIDI", "actuals_24_25": 1.48, "re_25_26": 100.00, "be_26_27": 676.85 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Strengthening of Krishi Vigyan Kendras (KVKs)", "actuals_24_25": 234.73, "re_25_26": 182.23, "be_26_27": 210.00 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Agricultural Production and Post-Production Mechanization", "actuals_24_25": 91.16, "re_25_26": 89.00, "be_26_27": 96.50 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Natural Resource Management", "actuals_24_25": 247.85, "re_25_26": 198.09, "be_26_27": 232.05 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Crop Science for Food and Nutritional Security", "actuals_24_25": 894.23, "re_25_26": 965.46, "be_26_27": 969.50 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Horticultural Science Research", "actuals_24_25": 250.88, "re_25_26": 262.91, "be_26_27": 220.00 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Livestock Health and Production towards Nutritional Security", "actuals_24_25": 400.95, "re_25_26": 417.04, "be_26_27": 416.95 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Fisheries and Aquaculture for Sustainable Development", "actuals_24_25": 200.77, "re_25_26": 167.81, "be_26_27": 170.25 },
  { "ministry": "Agricultural Research and Education", "scheme_name": "Strengthening Agricultural Education, Management & Social Sciences", "actuals_24_25": 620.58, "re_25_26": 645.00, "be_26_27": 514.87 },
  { "ministry": "Atomic Energy", "scheme_name": "R&D projects of Bhabha Atomic Research Centre (BARC)", "actuals_24_25": 899.77, "re_25_26": 918.91, "be_26_27": 1800.00 },
  { "ministry": "Atomic Energy", "scheme_name": "R&D projects of Indira Gandhi Centre of Atomic Research (IGCAR)", "actuals_24_25": 81.58, "re_25_26": 67.86, "be_26_27": 226.00 },
  { "ministry": "Atomic Energy", "scheme_name": "R&D projects of Raja Ramanna Centre for Advanced Technology (RRCAT)", "actuals_24_25": 123.88, "re_25_26": 54.18, "be_26_27": 125.00 },
  { "ministry": "Atomic Energy", "scheme_name": "R&D projects of Atomic Minerals Directorate (AMDER)", "actuals_24_25": 100.51, "re_25_26": 145.00, "be_26_27": 169.58 },
  { "ministry": "Atomic Energy", "scheme_name": "Grants to other Institutions", "actuals_24_25": 84.98, "re_25_26": 90.00, "be_26_27": 90.00 },
  { "ministry": "Atomic Energy", "scheme_name": "Fuel Recycle Projects (NRB)", "actuals_24_25": 699.87, "re_25_26": 750.00, "be_26_27": 750.00 },
  { "ministry": "Atomic Energy", "scheme_name": "Housing Projects", "actuals_24_25": 135.35, "re_25_26": 100.00, "be_26_27": 150.00 },
  { "ministry": "Atomic Energy", "scheme_name": "Improvement/Modifications of Heavy water projects", "actuals_24_25": 34.61, "re_25_26": 35.00, "be_26_27": 40.00 },
  { "ministry": "Atomic Energy", "scheme_name": "Nuclear Power Projects", "actuals_24_25": 2244.34, "re_25_26": 1332.83, "be_26_27": 2500.00 },
  { "ministry": "Atomic Energy", "scheme_name": "Nuclear Fuel Fabrication Projects", "actuals_24_25": 707.85, "re_25_26": 531.33, "be_26_27": 175.65 },
  { "ministry": "Atomic Energy", "scheme_name": "R&D projects of Variable Energy Cyclotron Centre (VECC)", "actuals_24_25": 57.03, "re_25_26": 40.00, "be_26_27": 55.00 },
  { "ministry": "Atomic Energy", "scheme_name": "Research and Development Projects", "actuals_24_25": 1065.42, "re_25_26": 1200.00, "be_26_27": 1200.00 },
  { "ministry": "Atomic Energy", "scheme_name": "Fast Reactor Fuel Cycle Projects (FRFCF) Kalpakkam", "actuals_24_25": 476.88, "re_25_26": 450.00, "be_26_27": 600.00 },
  { "ministry": "Ayush", "scheme_name": "Information, Education and Communication", "actuals_24_25": 29.82, "re_25_26": 73.00, "be_26_27": 45.00 },
  { "ministry": "Ayush", "scheme_name": "Promotion of International Cooperation", "actuals_24_25": 103.86, "re_25_26": 142.75, "be_26_27": 156.00 },
  { "ministry": "Ayush", "scheme_name": "AYURGYAN", "actuals_24_25": 25.70, "re_25_26": 37.81, "be_26_27": 50.00 },
  { "ministry": "Ayush", "scheme_name": "Ayurswasthay Yojana", "actuals_24_25": 20.61, "re_25_26": 46.73, "be_26_27": 62.60 },
  { "ministry": "Ayush", "scheme_name": "AYUSH Oushadhi Gunvatta evum Uttpadan Samvardhan Yojana (AOGUSY)", "actuals_24_25": 13.92, "re_25_26": 17.75, "be_26_27": 27.00 },
  { "ministry": "Ayush", "scheme_name": "Central Sector Scheme for Conservation, Development of Medicinal Plants", "actuals_24_25": 40.00, "re_25_26": 35.00, "be_26_27": 65.00 },
  { "ministry": "Chemicals and Petrochemicals", "scheme_name": "New Schemes of Petrochemicals", "actuals_24_25": 33.49, "re_25_26": 45.50, "be_26_27": 52.50 },
  { "ministry": "Fertilisers", "scheme_name": "Urea Subsidy", "actuals_24_25": 117878.95, "re_25_26": 126475.40, "be_26_27": 116805.00 },
  { "ministry": "Fertilisers", "scheme_name": "Nutrient Based Subsidy", "actuals_24_25": 52238.92, "re_25_26": 60000.00, "be_26_27": 54000.00 },
  { "ministry": "Fertilisers", "scheme_name": "Policy on Promotion of Organic Fertilizers", "actuals_24_25": 32.56, "re_25_26": 108.00, "be_26_27": 90.00 },
  { "ministry": "Pharmaceuticals", "scheme_name": "National Institutes of Pharmaceutical Education and Research (NIPERs)", "actuals_24_25": 245.03, "re_25_26": 281.07, "be_26_27": 215.00 },
  { "ministry": "Pharmaceuticals", "scheme_name": "Jan Aushadhi Scheme", "actuals_24_25": 169.93, "re_25_26": 190.00, "be_26_27": 200.50 },
  { "ministry": "Pharmaceuticals", "scheme_name": "Development of Pharmaceutical Industry", "actuals_24_25": 37.32, "re_25_26": 936.92, "be_26_27": 967.84 },
  { "ministry": "Pharmaceuticals", "scheme_name": "Production Linked Incentive Schemes", "actuals_24_25": 2433.29, "re_25_26": 2492.71, "be_26_27": 2499.84 },
  { "ministry": "Pharmaceuticals", "scheme_name": "Promotion of Research and Innovation in Pharma Med-Tech (PRIP)", "actuals_24_25": 48.44, "re_25_26": 245.00, "be_26_27": 750.00 },
  { "ministry": "Pharmaceuticals", "scheme_name": "Strengthening of Medical Device Industry", "actuals_24_25": 3.32, "re_25_26": 177.09, "be_26_27": 124.17 }
];

async function main() {
    console.log("LOG: Final Mass Ingestion starting...");
    let count = 0;
    for (const item of DATA) {
        try {
            const m = await prisma.ministry.upsert({
                where: { name: item.ministry },
                update: {},
                create: { name: item.ministry, shortCode: (item.ministry.substring(0,3) + Math.random().toString(36).substring(2,5)).toUpperCase(), color: "#3b82f6", sector: "OTHER" }
            });
            const d = await prisma.department.upsert({
                where: { name_ministryId: { name: item.ministry, ministryId: m.id } },
                update: {},
                create: { name: item.ministry, ministryId: m.id }
            });
            
            // Scheme
            let s = await prisma.scheme.findFirst({ where: { name: { equals: item.scheme_name, mode: 'insensitive' } } });
            if (!s) {
                s = await prisma.scheme.create({
                    data: { name: item.scheme_name, departmentId: d.id, priorityCategory: "SOCIAL_PROTECTION" }
                });
                count++;
            }

            // Allocations (24-25, 25-26, 26-27)
            const map = [
                { fy: "2024-25", BE: 0, util: item.actuals_24_25, RE: 0 },
                { fy: "2025-26", BE: 0, util: 0, RE: item.re_25_26 },
                { fy: "2026-27", BE: item.be_26_27, util: 0, RE: 0 }
            ];

            for (const y of map) {
                if (y.BE === 0 && y.util === 0 && y.RE === 0) continue;
                await prisma.budgetAllocation.upsert({
                    where: { schemeId_fiscalYear: { schemeId: s.id, fiscalYear: y.fy } },
                    update: { allocated: y.BE || undefined, utilized: y.util || undefined, revisedEstimate: y.RE || undefined },
                    create: { 
                        schemeId: s.id, fiscalYear: y.fy, 
                        allocated: y.BE, utilized: y.util, revisedEstimate: y.RE,
                        allocatedCapital: 0, allocatedRevenue: 0, utilizedCapital: 0, utilizedRevenue: 0,
                        expenditureQ1: 0, expenditureQ2: 0, expenditureQ3: 0, expenditureQ4: 0, surrendered: 0
                    }
                });
            }
        } catch (e) {}
    }
    console.log(`LOG: Ingested ${count} new valid schemes.`);

    // Cleanup phase: "Delete the ones whose expenditure was not available"
    console.log("LOG: Cleanup started...");
    const all = await prisma.scheme.findMany({ include: { budgetAllocations: true } });
    let removed = 0;
    for (const scheme of all) {
        const hasSomeExp = scheme.budgetAllocations.some(b => Number(b.utilized) > 0);
        if (!hasSomeExp) {
            console.log(`LOG: Removing ${scheme.name} - Zero expenditure.`);
            await prisma.scheme.delete({ where: { id: scheme.id } });
            removed++;
        }
    }
    console.log(`LOG: Cleaned up ${removed} entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
