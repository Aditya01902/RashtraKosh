-- India Budget Seed Data generated from pipeline
-- Total Schemes processed: 6
-- Total Allocations inserted (3 years per scheme): 18
-- This script safely inserts ignoring duplicates or handling logic

INSERT INTO "Ministry" ("id", "name", "shortCode", "color", "sector", "createdAt", "updatedAt") VALUES
('c7d7f3bc89deb5f1c18021b270e9bab3', 'Ministry of Rural Development', 'MoRD', '#16a34a', 'AGRICULTURE', NOW(), NOW()),
('15de8078a75b1da007a422d14abe84c7', 'Ministry of Health and Family Welfare', 'MoHFW', '#dc2626', 'HEALTH', NOW(), NOW()),
('468b67b8a1fd0f925c4808f0179aa777', 'Ministry of Agriculture & Farmers Welfare', 'MoAFW', '#10b981', 'AGRICULTURE', NOW(), NOW()),
('acdd70ce52ba8e8ccff6b6bc88e99f35', 'Ministry of Jal Shakti', 'MoJS', '#2563eb', 'INFRASTRUCTURE', NOW(), NOW()),
('cb2b28134a89a2c6a98ddffb9025e86e', 'Ministry of Education', 'MoE', '#8b5cf6', 'EDUCATION', NOW(), NOW());

INSERT INTO "Department" ("id", "name", "ministryId", "createdAt", "updatedAt") VALUES
('a6f086ebd1611e2dcf8cda9314e78c61', 'Department of Rural Development', 'c7d7f3bc89deb5f1c18021b270e9bab3', NOW(), NOW()),
('5650733c5596cf2cc84d3c83da39b22a', 'Department of Health and Family Welfare', '15de8078a75b1da007a422d14abe84c7', NOW(), NOW()),
('c1d70b2db0e5197eb1980f0a4f4ff031', 'Department of Agriculture and Farmers Welfare', '468b67b8a1fd0f925c4808f0179aa777', NOW(), NOW()),
('9ae5629bf37f9d788320154b246ba801', 'Department of Drinking Water and Sanitation', 'acdd70ce52ba8e8ccff6b6bc88e99f35', NOW(), NOW()),
('96fadc611c4a09d79252386fec7bfcbd', 'Department of School Education and Literacy', 'cb2b28134a89a2c6a98ddffb9025e86e', NOW(), NOW());

INSERT INTO "Scheme" ("id", "name", "departmentId", "isActive", "priorityCategory", "createdAt", "updatedAt") VALUES
('d4acb65bfe5c34bbdd7eccf6d51199ab', 'Mahatma Gandhi National Rural Employment Guarantee Program (MGNREGA)', 'a6f086ebd1611e2dcf8cda9314e78c61', true, 'SOCIAL_PROTECTION', NOW(), NOW()),
('eef1414b5d68aef8795e22d096b44fd8', 'Pradhan Mantri Awas Yojana (PMAY) - Rural', 'a6f086ebd1611e2dcf8cda9314e78c61', true, 'INFRASTRUCTURE', NOW(), NOW()),
('619c819b2295be95b1f5dbc890b13e38', 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PMJAY)', '5650733c5596cf2cc84d3c83da39b22a', true, 'HUMAN_CAPITAL', NOW(), NOW()),
('e21cd58edf18a89174d111a150c80bbb', 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', 'c1d70b2db0e5197eb1980f0a4f4ff031', true, 'SOCIAL_PROTECTION', NOW(), NOW()),
('2256755cfb20a4b63ac2cd93e3acd8c3', 'Jal Jeevan Mission (JJM) / National Rural Drinking Water Mission', '9ae5629bf37f9d788320154b246ba801', true, 'INFRASTRUCTURE', NOW(), NOW()),
('51afaf95b382f1afad9e7e8ff443bfa5', 'Samagra Shiksha', '96fadc611c4a09d79252386fec7bfcbd', true, 'HUMAN_CAPITAL', NOW(), NOW());

INSERT INTO "BudgetAllocation" ("id", "schemeId", "ministryId", "fiscalYear", "allocated", "allocatedCapital", "allocatedRevenue", "utilized", "utilizedCapital", "utilizedRevenue", "expenditureQ1", "expenditureQ2", "expenditureQ3", "expenditureQ4", "surrendered", "supplementaryDemands", "anomalyFlag", "createdAt", "updatedAt") VALUES
('55839928f3a784c47173008854b6455c', 'd4acb65bfe5c34bbdd7eccf6d51199ab', 'c7d7f3bc89deb5f1c18021b270e9bab3', '2022-23', 36567.00, 7313.40, 29253.60, 31990.28, 6398.06, 25592.22, 7997.57, 7997.57, 7997.57, 7997.57, 4576.72, 1, true, NOW(), NOW()),
('47b40ca1c3837225141e6dbeb1f12bf0', 'd4acb65bfe5c34bbdd7eccf6d51199ab', 'c7d7f3bc89deb5f1c18021b270e9bab3', '2023-24', 38395.35, 7679.07, 30716.28, 32864.49, 6572.90, 26291.59, 8216.12, 8216.12, 8216.12, 8216.12, 5530.86, 2, false, NOW(), NOW()),
('446cdc29c5106a4f451df400df05e2ca', 'd4acb65bfe5c34bbdd7eccf6d51199ab', 'c7d7f3bc89deb5f1c18021b270e9bab3', '2024-25', 40223.70, 8044.74, 32178.96, 20111.85, 4022.37, 16089.48, 5027.96, 5027.96, 5027.96, 5027.96, 20111.85, 1, false, NOW(), NOW()),
('1636e79b766b3c52fd5dee3a75d4a782', 'eef1414b5d68aef8795e22d096b44fd8', 'c7d7f3bc89deb5f1c18021b270e9bab3', '2022-23', 35104.00, 7020.80, 28083.20, 30899.51, 6179.90, 24719.61, 7724.88, 7724.88, 7724.88, 7724.88, 4204.49, 1, false, NOW(), NOW()),
('7cb32b0c4b4a1f1f8857aecadbde7665', 'eef1414b5d68aef8795e22d096b44fd8', 'c7d7f3bc89deb5f1c18021b270e9bab3', '2023-24', 36859.20, 7371.84, 29487.36, 32681.00, 6536.20, 26144.80, 8170.25, 8170.25, 8170.25, 8170.25, 4178.20, 1, true, NOW(), NOW()),
('22e72a4f02ff242c5a7a4bc83e29dce7', 'eef1414b5d68aef8795e22d096b44fd8', 'c7d7f3bc89deb5f1c18021b270e9bab3', '2024-25', 38614.40, 7722.88, 30891.52, 19307.20, 3861.44, 15445.76, 4826.80, 4826.80, 4826.80, 4826.80, 19307.20, 0, false, NOW(), NOW()),
('314562b59556910ac3ec4058a5642fae', '619c819b2295be95b1f5dbc890b13e38', '15de8078a75b1da007a422d14abe84c7', '2022-23', 50436.00, 10087.20, 40348.80, 44168.38, 8833.68, 35334.71, 11042.10, 11042.10, 11042.10, 11042.10, 6267.62, 1, false, NOW(), NOW()),
('a01cc58e471dd852f43d912ba6bab16f', '619c819b2295be95b1f5dbc890b13e38', '15de8078a75b1da007a422d14abe84c7', '2023-24', 52957.80, 10591.56, 42366.24, 48070.18, 9614.04, 38456.15, 12017.55, 12017.55, 12017.55, 12017.55, 4887.62, 1, false, NOW(), NOW()),
('3cd927122ca15e3d25ab0679158399e2', '619c819b2295be95b1f5dbc890b13e38', '15de8078a75b1da007a422d14abe84c7', '2024-25', 55479.60, 11095.92, 44383.68, 27739.80, 5547.96, 22191.84, 6934.95, 6934.95, 6934.95, 6934.95, 27739.80, 2, false, NOW(), NOW()),
('391e0998f15cad69ae5e51ce844237e8', 'e21cd58edf18a89174d111a150c80bbb', '468b67b8a1fd0f925c4808f0179aa777', '2022-23', 16234.00, 3246.80, 12987.20, 14884.70, 2976.94, 11907.76, 3721.17, 3721.17, 3721.17, 3721.17, 1349.30, 0, false, NOW(), NOW()),
('0a85dc4b799cbc31cdbd67517302eeb9', 'e21cd58edf18a89174d111a150c80bbb', '468b67b8a1fd0f925c4808f0179aa777', '2023-24', 17045.70, 3409.14, 13636.56, 15104.16, 3020.83, 12083.33, 3776.04, 3776.04, 3776.04, 3776.04, 1941.54, 2, false, NOW(), NOW()),
('b3f63fd41822fb8689bb4eb3d8137327', 'e21cd58edf18a89174d111a150c80bbb', '468b67b8a1fd0f925c4808f0179aa777', '2024-25', 17857.40, 3571.48, 14285.92, 8928.70, 1785.74, 7142.96, 2232.18, 2232.18, 2232.18, 2232.18, 8928.70, 2, false, NOW(), NOW()),
('f3096e9e338782c3e95d2fa97280413d', '2256755cfb20a4b63ac2cd93e3acd8c3', 'acdd70ce52ba8e8ccff6b6bc88e99f35', '2022-23', 44220.00, 8844.00, 35376.00, 38355.08, 7671.02, 30684.06, 9588.77, 9588.77, 9588.77, 9588.77, 5864.92, 0, false, NOW(), NOW()),
('0540049c894fb066453dbab20257fd5b', '2256755cfb20a4b63ac2cd93e3acd8c3', 'acdd70ce52ba8e8ccff6b6bc88e99f35', '2023-24', 46431.00, 9286.20, 37144.80, 41892.11, 8378.42, 33513.69, 10473.03, 10473.03, 10473.03, 10473.03, 4538.89, 0, false, NOW(), NOW()),
('3f4d5d40defb7457d40ff1b5880df03c', '2256755cfb20a4b63ac2cd93e3acd8c3', 'acdd70ce52ba8e8ccff6b6bc88e99f35', '2024-25', 48642.00, 9728.40, 38913.60, 24321.00, 4864.20, 19456.80, 6080.25, 6080.25, 6080.25, 6080.25, 24321.00, 1, false, NOW(), NOW()),
('b5c1e462b9cb887ec0cc9a7810b48892', '51afaf95b382f1afad9e7e8ff443bfa5', 'cb2b28134a89a2c6a98ddffb9025e86e', '2022-23', 44821.00, 8964.20, 35856.80, 38813.75, 7762.75, 31051.00, 9703.44, 9703.44, 9703.44, 9703.44, 6007.25, 0, false, NOW(), NOW()),
('703ac57b54c5f292fe0101df99d3311d', '51afaf95b382f1afad9e7e8ff443bfa5', 'cb2b28134a89a2c6a98ddffb9025e86e', '2023-24', 47062.05, 9412.41, 37649.64, 42313.34, 8462.67, 33850.67, 10578.33, 10578.33, 10578.33, 10578.33, 4748.71, 2, false, NOW(), NOW()),
('ee8b0d792c5cf245f915cd2705d9045c', '51afaf95b382f1afad9e7e8ff443bfa5', 'cb2b28134a89a2c6a98ddffb9025e86e', '2024-25', 49303.10, 9860.62, 39442.48, 24651.55, 4930.31, 19721.24, 6162.89, 6162.89, 6162.89, 6162.89, 24651.55, 1, false, NOW(), NOW());

