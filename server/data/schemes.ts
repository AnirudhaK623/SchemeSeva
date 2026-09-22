import { Scheme } from '../../src/types/orchestrator.js';

export const MOCK_SCHEMES: Scheme[] = [
  {
    scheme_id: 'SCH001',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Agriculture & Farmers',
    description: 'Central sector scheme providing income support of Rs. 6,000 per year in three equal installments to all landholding farmer families across India.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      max_income: 600000,
      allowed_occupations: ['Farmer', 'Agricultural Laborer', 'Cultivator', 'Self-Employed'],
      allowed_user_types: ['Farmer', 'Rural Artisan'],
      allowed_states: ['All India', 'Karnataka', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Tamil Nadu', 'Kerala']
    },
    benefits: 'Rs. 6,000 per year directly transferred to bank accounts in 3 four-monthly tranches.',
    required_documents: ['Aadhaar Card', 'Land Ownership Record / Record of Rights (RoR)', 'Active Bank Passbook', 'Mobile linked with Aadhaar'],
    application_url: 'https://pmkisan.gov.in',
    keywords: ['farmer', 'agriculture', 'land', 'subsidy', 'cash transfer', 'kisan', 'crop']
  },
  {
    scheme_id: 'SCH002',
    name: 'PM MUDRA Yojana (Shishu, Kishore, Tarun)',
    category: 'Small Business & Entrepreneurship',
    description: 'Provides collateral-free institutional credit up to Rs. 10 Lakhs to micro and small business enterprises for manufacturing, processing, trading or service sector activities.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      max_age: 65,
      allowed_occupations: ['Self-Employed', 'Artisan', 'Shopkeeper', 'Small Manufacturer', 'Service Provider'],
      allowed_user_types: ['Woman Entrepreneur', 'Self-Employed', 'Rural Artisan']
    },
    benefits: 'Collateral-free loans: Shishu (up to Rs. 50,000), Kishore (Rs. 50,000 to Rs. 5 Lakhs), Tarun (Rs. 5 Lakhs to Rs. 10 Lakhs) at subsidized interest rates.',
    required_documents: ['Aadhaar Card', 'PAN Card', 'Business Proof / Udyam Registration', '6-Month Bank Statement', 'Quotation for Machinery/Stock'],
    application_url: 'https://www.mudra.org.in',
    keywords: ['business', 'loan', 'credit', 'startup', 'shop', 'artisan', 'mudra', 'micro enterprise']
  },
  {
    scheme_id: 'SCH003',
    name: 'National Scholarship Scheme for Higher Education',
    category: 'Students & Education',
    description: 'Merit-cum-means financial scholarship for deserving students pursuing undergraduate and postgraduate degree courses from recognized colleges and universities.',
    state: 'All India',
    eligibility_rules: {
      min_age: 16,
      max_age: 28,
      max_income: 350000,
      allowed_user_types: ['Student'],
      allowed_categories: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority']
    },
    benefits: 'Up to Rs. 20,000 per annum for tuition fees, living stipend, and books allowance.',
    required_documents: ['College Enrollment / Bonafide Certificate', '10th & 12th Marksheets', 'Family Income Certificate', 'Aadhaar Card', 'Bank Passbook'],
    application_url: 'https://scholarships.gov.in',
    keywords: ['student', 'scholarship', 'college', 'tuition', 'education', 'merit', 'university']
  },
  {
    scheme_id: 'SCH004',
    name: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    category: 'Women & Child Development',
    description: 'Maternity benefit cash incentive program provided to pregnant women and lactating mothers for health checkups, institutional delivery, and nutritional care.',
    state: 'All India',
    eligibility_rules: {
      min_age: 19,
      max_age: 45,
      allowed_genders: ['Female'],
      max_income: 500000,
      allowed_user_types: ['Woman Entrepreneur', 'Self-Employed', 'Unemployed', 'Rural Artisan']
    },
    benefits: 'Direct cash assistance of Rs. 5,000 in two installments for first child, plus Rs. 6,000 bonus if the second child is a girl.',
    required_documents: ['MCP Mother & Child Protection Card', 'Aadhaar Card of Mother and Spouse', 'Bank Passbook in Mother\'s Name', 'Identity Proof'],
    application_url: 'https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana',
    keywords: ['women', 'mother', 'maternity', 'pregnancy', 'child', 'nutrition', 'cash assistance']
  },
  {
    scheme_id: 'SCH005',
    name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    category: 'Senior Citizens & Social Welfare',
    description: 'Non-contributory monthly old age social security pension provided to senior citizens living below or near the poverty threshold.',
    state: 'All India',
    eligibility_rules: {
      min_age: 60,
      max_income: 200000,
      allowed_user_types: ['Senior Citizen', 'Unemployed']
    },
    benefits: 'Monthly direct pension of Rs. 1,000 to Rs. 2,500 depending on state matching funds.',
    required_documents: ['Age Proof / Birth Certificate or Aadhaar', 'BPL / Antyodaya Ration Card', 'Income Certificate', 'Bank Account Details'],
    application_url: 'https://nsap.nic.in',
    keywords: ['senior citizen', 'pension', 'old age', 'elderly', 'welfare', 'social security', 'bpl']
  },
  {
    scheme_id: 'SCH006',
    name: 'Divyangjan Swavalamban & ADIP Scheme',
    category: 'Persons with Disabilities',
    description: 'Provides free assistive technological aids, motorized tricycles, hearing instruments, and concessional business loans to persons with disabilities (benchmark disability 40%+).',
    state: 'All India',
    eligibility_rules: {
      min_age: 5,
      allowed_user_types: ['Person with Disability'],
      max_income: 400000
    },
    benefits: 'Free high-tech aids & appliances (hearing aids, prosthetic limbs, motorized wheelchairs) and loans up to Rs. 5 Lakhs at 5% concessional interest.',
    required_documents: ['Unique Disability ID (UDID) Card', 'Disability Medical Certificate (40%+)', 'Income Certificate', 'Aadhaar Card'],
    application_url: 'https://disabilityaffairs.gov.in',
    keywords: ['disability', 'divyangjan', 'wheelchair', 'assistive aid', 'udid', 'hearing aid', 'prosthetic']
  },
  {
    scheme_id: 'SCH007',
    name: 'Pradhan Mantri Awas Yojana (PMAY - Gramin)',
    category: 'Rural Housing & Welfare',
    description: 'Provides financial housing assistance to homeless families and households living in kutcha/dilapidated homes for construction of permanent pucca houses with clean toilet.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      max_income: 300000,
      allowed_user_types: ['Farmer', 'Rural Artisan', 'Unemployed', 'Person with Disability', 'Woman Entrepreneur']
    },
    benefits: 'Direct financial assistance of Rs. 1,20,000 (plain areas) and Rs. 1,30,000 (hilly/difficult areas) plus 90 days MGNREGA wages and Swachh Bharat toilet grant.',
    required_documents: ['Aadhaar Card', 'Ration Card (SECC Listed)', 'Land Title or Patta certificate', 'Bank Passbook', 'Affidavit of not owning pucca house'],
    application_url: 'https://pmayg.nic.in',
    keywords: ['housing', 'pucca house', 'rural', 'shelter', 'home', 'construction', 'pmay', 'gramin']
  },
  {
    scheme_id: 'SCH008',
    name: 'Stand-Up India Scheme for Women & SC/ST',
    category: 'Women & SC/ST Entrepreneurship',
    description: 'Facilitates bank loans between Rs. 10 Lakhs and Rs. 1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch for greenfield enterprises.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      allowed_categories: ['SC', 'ST', 'General', 'OBC', 'EWS'],
      allowed_user_types: ['Woman Entrepreneur'],
      allowed_occupations: ['Self-Employed', 'Small Manufacturer', 'Service Provider']
    },
    benefits: 'Composite bank loan from Rs. 10 Lakh to Rs. 1 Crore covering up to 75% of project costs with handholding support.',
    required_documents: ['Identity Proof (Aadhaar/PAN)', 'Caste Certificate (if SC/ST)', 'Project Report / Business Proposal', 'Pollution Clearance (if required)', 'Company Registration'],
    application_url: 'https://www.standupmitra.in',
    keywords: ['women entrepreneur', 'greenfield enterprise', 'startup', 'sc st loan', 'crore loan', 'manufacturing']
  },
  {
    scheme_id: 'SCH009',
    name: 'PMEGP (Prime Minister\'s Employment Generation Programme)',
    category: 'Employment & Rural Artisans',
    description: 'Credit-linked subsidy programme to generate self-employment opportunities through establishment of micro-enterprises in non-farm sectors by rural artisans and youth.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      allowed_user_types: ['Rural Artisan', 'Self-Employed', 'Unemployed'],
      max_income: 600000
    },
    benefits: 'Government subsidy of 25% to 35% on project cost up to Rs. 50 Lakhs for manufacturing units and Rs. 20 Lakhs for service units.',
    required_documents: ['Aadhaar Card', 'Project Report / DPR', 'Educational Qualification Certificate (8th pass minimum)', 'EDP Training Certificate', 'Caste Certificate (if applicable)'],
    application_url: 'https://www.kviconline.gov.in/pmegpeportal',
    keywords: ['artisan', 'employment', 'khadi', 'micro enterprise', 'subsidy', 'manufacturing', 'self employed']
  },
  {
    scheme_id: 'SCH010',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    category: 'Agriculture & Crop Insurance',
    description: 'Comprehensive risk insurance coverage against yield losses due to non-preventable natural risks (drought, flood, pests, cyclone) from pre-sowing to post-harvest.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      allowed_occupations: ['Farmer', 'Cultivator', 'Tenant Farmer'],
      allowed_user_types: ['Farmer']
    },
    benefits: 'Ultra-low premium: 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops with remaining premium subsidized 100% by government.',
    required_documents: ['Land Record (RoR/Patta/Khasra)', 'Sowing Certificate / Crop Declaration', 'Bank Account Passbook', 'Aadhaar Card'],
    application_url: 'https://pmfby.gov.in',
    keywords: ['crop insurance', 'kharif', 'rabi', 'drought', 'flood', 'farmer', 'fasal bima']
  },
  {
    scheme_id: 'SCH011',
    name: 'PM SVANidhi (Micro-Credit for Street Vendors)',
    category: 'Urban Livelihoods & Vendors',
    description: 'Special micro-credit facility providing affordable working capital loans to urban and peri-urban street vendors to resume their livelihoods.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      allowed_occupations: ['Street Vendor', 'Hawker', 'Cart Seller', 'Artisan', 'Self-Employed'],
      allowed_user_types: ['Self-Employed', 'Rural Artisan']
    },
    benefits: 'Working capital loan starting at Rs. 10,000 (1st tranche), escalating to Rs. 20,000 (2nd) and Rs. 50,000 (3rd tranche) with 7% interest subsidy on timely repayment.',
    required_documents: ['Vending Certificate / Urban Local Body ID Card', 'Letter of Recommendation from Town Vending Committee', 'Aadhaar Card', 'Bank Account details'],
    application_url: 'https://pmsvanidhi.mohua.gov.in',
    keywords: ['street vendor', 'hawker', 'working capital', 'svanidhi', 'urban poor', 'small loan']
  },
  {
    scheme_id: 'SCH012',
    name: 'Karnataka Raitha Siri & Krishi Yantra Dhare',
    category: 'State Agriculture (Karnataka)',
    description: 'State assistance for minor millet growers and subsidized custom hire center agricultural farm machinery for small & marginal farmers in Karnataka.',
    state: 'Karnataka',
    eligibility_rules: {
      min_age: 18,
      allowed_states: ['Karnataka'],
      allowed_occupations: ['Farmer', 'Cultivator'],
      allowed_user_types: ['Farmer']
    },
    benefits: 'Direct cash incentive of Rs. 10,000 per hectare for cultivating minor millets, plus 50% to 90% subsidy on tractor equipment rental.',
    required_documents: ['RTC Pahani Land Record', 'Karnataka Farmer ID (FRUITS ID)', 'Aadhaar Card', 'Aadhaar Seeded Bank Account'],
    application_url: 'https://fruits.karnataka.gov.in',
    keywords: ['karnataka', 'millet', 'raitha siri', 'tractor hire', 'fruits id', 'farmer subsidy']
  },
  {
    scheme_id: 'SCH013',
    name: 'Atal Pension Yojana (APY)',
    category: 'Pension & Social Security',
    description: 'Guaranteed pension scheme for workers in the unorganized sector to build a retirement corpus with minimum guaranteed monthly pension upon reaching age 60.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      max_age: 40,
      allowed_user_types: ['Self-Employed', 'Farmer', 'Rural Artisan', 'Unemployed', 'Woman Entrepreneur']
    },
    benefits: 'Guaranteed monthly lifelong pension of Rs. 1,000, Rs. 2,000, Rs. 3,000, Rs. 4,000, or Rs. 5,000 per month starting at 60 years of age.',
    required_documents: ['Savings Bank Account with Auto-Debit facility', 'Aadhaar Card', 'Nominee Details', 'Mobile Number'],
    application_url: 'https://www.npscra.nsdl.co.in/atal-pension-yojana.php',
    keywords: ['pension', 'atal pension', 'unorganized sector', 'retirement', 'monthly pension', 'social security']
  },
  {
    scheme_id: 'SCH014',
    name: 'PM Vidyalaxmi Education Loan Portal Scheme',
    category: 'Students & Higher Education',
    description: 'First-of-its-kind portal for students seeking educational loans across all nationalized banks with unified single-window loan application and government interest subsidy.',
    state: 'All India',
    eligibility_rules: {
      min_age: 17,
      max_age: 35,
      allowed_user_types: ['Student'],
      max_income: 800000
    },
    benefits: 'Loans up to Rs. 7.5 Lakhs without third-party guarantee or collateral, and full interest subsidy during moratorium period for families earning up to Rs. 4.5 Lakhs.',
    required_documents: ['College Admission Offer Letter', 'Fee Structure from Institution', 'Class 10, 12, Graduation Marksheets', 'Parent/Guardian Income Proof', 'KYC Documents'],
    application_url: 'https://www.vidyalakshmi.co.in',
    keywords: ['education loan', 'student loan', 'higher studies', 'interest subsidy', 'college fee', 'vidyalaxmi']
  },
  {
    scheme_id: 'SCH015',
    name: 'Mahila Samman Savings Certificate & PM Ujjwala 2.0',
    category: 'Women & Clean Energy',
    description: 'Dual initiative offering high-yield guaranteed savings for women (7.5% p.a.) coupled with 100% free LPG gas connection and first cylinder refill for rural BPL households.',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      allowed_genders: ['Female'],
      allowed_user_types: ['Woman Entrepreneur', 'Rural Artisan', 'Farmer', 'Unemployed'],
      max_income: 300000
    },
    benefits: '7.5% interest on fixed deposits up to Rs. 2 Lakhs with partial withdrawal option + 100% free LPG connection with stove and first cylinder deposit waive-off.',
    required_documents: ['Aadhaar Card of Woman head of family', 'Ration card with family tree', 'Bank Passbook', 'Declaration of no existing LPG connection'],
    application_url: 'https://www.pmuy.gov.in',
    keywords: ['women savings', 'ujjwala', 'lpg gas', 'clean cooking', 'mahila samman', 'interest bonus']
  },
  {
    scheme_id: 'SCH016',
    name: 'PM Vishwakarma Scheme for Traditional Artisans',
    category: 'Rural Artisans & Craftsmen',
    description: 'Comprehensive holistic support for traditional artisans and craftspeople spanning 18 trades (blacksmiths, weavers, carpenters, sculptors, tailors, cobblers).',
    state: 'All India',
    eligibility_rules: {
      min_age: 18,
      allowed_occupations: ['Artisan', 'Carpenter', 'Blacksmith', 'Tailor', 'Mason', 'Potter', 'Sculptor', 'Cobbler', 'Weaver'],
      allowed_user_types: ['Rural Artisan', 'Self-Employed']
    },
    benefits: 'PM Vishwakarma Certificate & ID, basic & advanced skill training with Rs. 500/day stipend, modern toolkit incentive of Rs. 15,000, and collateral-free enterprise loan up to Rs. 3 Lakhs at 5% interest.',
    required_documents: ['Aadhaar Card', 'Mobile linked with Aadhaar', 'Bank Account Details', 'Ration Card', 'Trade Verification by Gram Panchayat'],
    application_url: 'https://pmvishwakarma.gov.in',
    keywords: ['vishwakarma', 'artisan', 'craftsman', 'carpenter', 'blacksmith', 'tailor', 'tool kit incentive', 'craft']
  }
];
