import { UserProfile } from '../types/orchestrator.js';

export interface VerifiedCitizenRecord {
  id: string;
  name: string;
  aadhaar_masked: string;
  aadhaar_raw: string;
  phone: string;
  phone_masked: string;
  email: string;
  email_masked: string;
  assigned_agent: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  state: string;
  district: string;
  category: 'General' | 'OBC' | 'SC' | 'ST';
  user_type: UserProfile['user_type'];
  occupation: string;
  annual_income: number;
  preferred_language: 'Kannada' | 'Hindi' | 'English' | 'Malayalam';
  user_query: string;
  kutumba_id: string;
  ration_card_no: string;
  land_holding: string;
  bank_dbt_status: string;
  matched_schemes: {
    scheme_id: string;
    name: string;
    ministry: string;
    annual_benefit: string;
    match_score: number;
    description: string;
    key_entitlements: string[];
  }[];
}

export const VERIFIED_CITIZEN_DIRECTORY: VerifiedCitizenRecord[] = [
  {
    id: 'CITIZEN-001',
    name: 'Rajesh Kumar',
    aadhaar_raw: '541289213049',
    aadhaar_masked: 'XXXX-XXXX-3049',
    phone: '9876543210',
    phone_masked: 'XXXXXX3210',
    email: 'rajesh.kumar.mandya@gmail.com',
    email_masked: 'ra*****@gmail.com',
    assigned_agent: 'Agent Vikram Sharma (Senior Scheme Seva Officer - A3 Node #4)',
    age: 38,
    gender: 'Male',
    state: 'Karnataka',
    district: 'Mandya',
    category: 'OBC',
    user_type: 'Farmer',
    occupation: 'Small & Marginal Paddy Farmer (Wetland)',
    annual_income: 180000,
    preferred_language: 'Kannada',
    user_query: 'Looking for agricultural crop loan, drip irrigation subsidy and PM-KISAN installment',
    kutumba_id: 'KTB-KA-991204',
    ration_card_no: 'BPL-KA-991204',
    land_holding: '2.4 Acres Wetland (Survey No 44/2, Mandya Taluk)',
    bank_dbt_status: 'Active (Aadhaar Seeded with SBI Mandya Branch, IFSC: SBIN0004122)',
    matched_schemes: [
      {
        scheme_id: 'PM_KISAN',
        name: 'PM-KISAN Samman Nidhi',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        annual_benefit: '₹6,000 / year (3 installments of ₹2,000 directly via DBT)',
        match_score: 98,
        description: 'Direct income support for all landholding farmers across India.',
        key_entitlements: ['Direct DBT transfer to bank account', 'Quarterly financial buffer for seeds & fertilizer', 'Zero paperwork renewal']
      },
      {
        scheme_id: 'RAITHA_SIRI',
        name: 'Raitha Siri Scheme (Millet & Micro-Irrigation)',
        ministry: 'Government of Karnataka - Agriculture Department',
        annual_benefit: '₹10,000 / hectare incentive + 90% Drip Irrigation Subsidy',
        match_score: 95,
        description: 'State financial incentive for growing drought-tolerant crops and millet cultivation.',
        key_entitlements: ['₹10,000/ha direct cash assistance', '90% subsidy on micro-irrigation drip pipeline', 'Free soil health testing']
      },
      {
        scheme_id: 'PMFBY',
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        annual_benefit: 'Up to ₹1,20,000 comprehensive crop insurance coverage',
        match_score: 92,
        description: 'Financial support to farmers suffering crop loss/damage due to unforeseen weather events.',
        key_entitlements: ['Only 2% premium paid by farmer', 'Satellite-based post-harvest loss assessment', 'Direct claim settlement to bank']
      }
    ]
  },
  {
    id: 'CITIZEN-002',
    name: 'Priya Sharma',
    aadhaar_raw: '782345129901',
    aadhaar_masked: 'XXXX-XXXX-9901',
    phone: '9812345678',
    phone_masked: 'XXXXXX5678',
    email: 'priya.sharma.mysuru@gmail.com',
    email_masked: 'pr*****@gmail.com',
    assigned_agent: 'Agent Ananya Roy (Education & Student Welfare Officer - A3 Node #2)',
    age: 21,
    gender: 'Female',
    state: 'Karnataka',
    district: 'Mysuru',
    category: 'General',
    user_type: 'Student',
    occupation: 'Undergraduate College Student (B.Sc Agriculture)',
    annual_income: 95000,
    preferred_language: 'English',
    user_query: 'Seeking post-matric college scholarship, hostel fee concession and free student laptop scheme',
    kutumba_id: 'KTB-KA-441209',
    ration_card_no: 'APL-KA-441209',
    land_holding: 'None (Urban non-agricultural resident)',
    bank_dbt_status: 'Active (Aadhaar Seeded with Canara Bank, Mysuru University Campus)',
    matched_schemes: [
      {
        scheme_id: 'VIDYASIRI',
        name: 'Vidyasiri (Food & Accommodation Scheme)',
        ministry: 'Social Welfare Department, Karnataka',
        annual_benefit: '₹1,500 / month (₹15,000 academic year scholarship + free hostel mess)',
        match_score: 96,
        description: 'Post-matric scholarship and boarding allowance for rural students studying in urban colleges.',
        key_entitlements: ['Monthly hostel & food stipend', 'Tuition reimbursement', 'Free bus travel pass']
      },
      {
        scheme_id: 'LAPTOP_SCHEME',
        name: 'Free Laptop Scheme for Higher Education',
        ministry: 'Higher Education Department, Government of Karnataka',
        annual_benefit: 'High-performance laptop worth ₹38,000 for coursework & digital study',
        match_score: 94,
        description: 'Empowers first-generation college students with digital computing devices.',
        key_entitlements: ['Brand-new laptop with warranty', 'Pre-loaded e-learning modules', 'Zero out-of-pocket cost']
      }
    ]
  },
  {
    id: 'CITIZEN-003',
    name: 'Sunita Devi',
    aadhaar_raw: '319067891122',
    aadhaar_masked: 'XXXX-XXXX-1122',
    phone: '9823456789',
    phone_masked: 'XXXXXX6789',
    email: 'sunita.devi.raichur@gmail.com',
    email_masked: 'su*****@gmail.com',
    assigned_agent: 'Agent Meera Kulkarni (Women Empowerment & SHG Specialist - A3 Node #5)',
    age: 44,
    gender: 'Female',
    state: 'Karnataka',
    district: 'Raichur',
    category: 'SC',
    user_type: 'Rural Artisan',
    occupation: 'Handloom Weaver & Self-Help Group (SHG) Leader',
    annual_income: 110000,
    preferred_language: 'Kannada',
    user_query: 'Need working capital loan for handloom yarn machinery and Stree Shakti micro-credit assistance',
    kutumba_id: 'KTB-KA-118833',
    ration_card_no: 'AAY-KA-118833 (Antyodaya Anna)',
    land_holding: '0.5 Acre Homestead (Raichur Rural)',
    bank_dbt_status: 'Active (Aadhaar Seeded with Karnataka Gramin Bank, Raichur)',
    matched_schemes: [
      {
        scheme_id: 'PM_VISHWAKARMA',
        name: 'PM Vishwakarma Yojana (Traditional Artisans)',
        ministry: 'Ministry of Micro, Small and Medium Enterprises',
        annual_benefit: '₹15,000 Modern Tool-kit Grant + ₹3,00,000 Collateral-Free Loan @ 5% interest',
        match_score: 97,
        description: 'End-to-end support for traditional artisans and craftspeople.',
        key_entitlements: ['₹15,000 grant for modern machinery', 'Collateral-free enterprise loan at 5%', 'PM Vishwakarma Digital Certificate']
      },
      {
        scheme_id: 'GRUHA_LAKSHMI',
        name: 'Gruha Lakshmi Direct Cash Transfer',
        ministry: 'Department of Women & Child Development, Karnataka',
        annual_benefit: '₹24,000 / year (₹2,000 monthly direct financial assistance)',
        match_score: 99,
        description: 'Monthly DBT assistance for women heads of households in Karnataka.',
        key_entitlements: ['₹2,000 monthly DBT to bank account', 'Direct unconditional financial independence', 'No middlemen or physical queue']
      }
    ]
  },
  {
    id: 'CITIZEN-004',
    name: 'Amit Patel',
    aadhaar_raw: '665433447788',
    aadhaar_masked: 'XXXX-XXXX-7788',
    phone: '9834567890',
    phone_masked: 'XXXXXX7890',
    email: 'amit.patel.hubli@gmail.com',
    email_masked: 'am*****@gmail.com',
    assigned_agent: 'Agent Suresh Hegde (MSME & Rural Enterprise Officer - A3 Node #3)',
    age: 32,
    gender: 'Male',
    state: 'Karnataka',
    district: 'Hubballi',
    category: 'OBC',
    user_type: 'Self-Employed',
    occupation: 'Micro Food Processing Enterprise Owner (Spice Grinding Unit)',
    annual_income: 320000,
    preferred_language: 'English',
    user_query: 'Looking for PMMY Mudra loan for spice packaging machinery and state power subsidy',
    kutumba_id: 'KTB-KA-887711',
    ration_card_no: 'APL-KA-887711',
    land_holding: 'Leased industrial shed (Hubballi GIDC)',
    bank_dbt_status: 'Active (Aadhaar Seeded with Bank of Baroda, Hubballi Main Branch)',
    matched_schemes: [
      {
        scheme_id: 'PMMY_MUDRA',
        name: 'Pradhan Mantri Mudra Yojana (Kishore / Tarun)',
        ministry: 'Department of Financial Services, Ministry of Finance',
        annual_benefit: 'Up to ₹10,00,000 collateral-free business loan with subsidized interest',
        match_score: 95,
        description: 'Provides loans up to 10 lakhs to the non-corporate, non-farm small/micro enterprises.',
        key_entitlements: ['No collateral required', 'Tenure up to 5 years', 'Working capital overdraft support']
      },
      {
        scheme_id: 'PMFME',
        name: 'PM Formalisation of Micro Food Processing Enterprises (PMFME)',
        ministry: 'Ministry of Food Processing Industries',
        annual_benefit: '35% capital subsidy up to ₹10,00,000 for modern machinery',
        match_score: 93,
        description: 'Credit-linked capital subsidy for upgrading micro food processing units.',
        key_entitlements: ['35% capital expenditure subsidy', 'Brand & marketing packaging assistance', 'FSSAI compliance guidance']
      }
    ]
  }
];

export interface OtpSession {
  txnId: string;
  phone: string;
  email: string;
  aadhaar: string;
  generatedPhoneOtp: string;
  generatedEmailOtp: string;
  citizen: VerifiedCitizenRecord | null;
  expiresAt: number;
}

// In-memory OTP store for simulated verification
const activeOtpSessions = new Map<string, OtpSession>();

// Mask helpers
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'c******@domain.com';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user.slice(0, 2)}*****@${domain}`;
}

export function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 6) return 'XXXXXX';
  return `XXXXXX${clean.slice(-4)}`;
}

export function maskAadhaar(aadhaar: string): string {
  const clean = aadhaar.replace(/\D/g, '');
  if (clean.length < 4) return 'XXXX-XXXX-XXXX';
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

export function requestCitizenOtp(
  inputPhone: string,
  inputAadhaar: string,
  inputEmail?: string,
  customCitizen?: Partial<VerifiedCitizenRecord>
): {
  success: boolean;
  txnId: string;
  message: string;
  demoOtp: string;
  demoEmailOtp: string;
  phoneSmsPreview: string;
  emailPreview: string;
  citizenMatch?: VerifiedCitizenRecord;
  error?: string;
} {
  const cleanPhone = (inputPhone || '').replace(/\D/g, '');
  const cleanAadhaar = (inputAadhaar || '').replace(/\D/g, '');
  const email = (inputEmail || '').trim() || (customCitizen?.email || 'citizen@welfare.gov.in');

  if (cleanPhone.length < 10) {
    return {
      success: false,
      txnId: '',
      message: 'Invalid phone number. Please enter a valid 10-digit mobile number.',
      demoOtp: '',
      demoEmailOtp: '',
      phoneSmsPreview: '',
      emailPreview: '',
      error: 'PHONE_INVALID'
    };
  }

  // Look for matching citizen in registry
  let matchedCitizen = VERIFIED_CITIZEN_DIRECTORY.find(c => {
    const matchPhone = c.phone === cleanPhone || c.phone.endsWith(cleanPhone.slice(-6));
    const matchAadhaar = cleanAadhaar ? (c.aadhaar_raw === cleanAadhaar || c.aadhaar_raw.endsWith(cleanAadhaar.slice(-4))) : false;
    const matchEmail = email && c.email.toLowerCase() === email.toLowerCase();
    return matchPhone || matchAadhaar || matchEmail;
  });

  // If user provided a custom citizen definition, build/adopt it
  if (customCitizen && customCitizen.name) {
    matchedCitizen = {
      id: customCitizen.id || `CUSTOM-${Date.now().toString().slice(-4)}`,
      name: customCitizen.name,
      aadhaar_raw: cleanAadhaar || '987654321098',
      aadhaar_masked: maskAadhaar(cleanAadhaar || '987654321098'),
      phone: cleanPhone,
      phone_masked: maskPhone(cleanPhone),
      email: email,
      email_masked: maskEmail(email),
      assigned_agent: customCitizen.assigned_agent || 'Agent Vikram Sharma (Senior Welfare Officer - A3 Unit #4)',
      age: customCitizen.age || 35,
      gender: customCitizen.gender || 'Male',
      state: customCitizen.state || 'Karnataka',
      district: customCitizen.district || 'Bengaluru Urban',
      category: customCitizen.category || 'OBC',
      user_type: customCitizen.user_type || 'Farmer',
      occupation: customCitizen.occupation || 'Farmer / Producer',
      annual_income: customCitizen.annual_income || 200000,
      preferred_language: customCitizen.preferred_language || 'Kannada',
      user_query: customCitizen.user_query || 'Applying for central and state welfare assistance',
      kutumba_id: customCitizen.kutumba_id || `KTB-KA-${Date.now().toString().slice(-6)}`,
      ration_card_no: customCitizen.ration_card_no || `BPL-KA-${Date.now().toString().slice(-6)}`,
      land_holding: customCitizen.land_holding || '2 Acres Cultivable Land',
      bank_dbt_status: customCitizen.bank_dbt_status || 'Active DBT Linked Account',
      matched_schemes: customCitizen.matched_schemes || VERIFIED_CITIZEN_DIRECTORY[0].matched_schemes
    };
  }

  // Generate 6-digit OTPs
  const demoPhoneOtp = '582914';
  const demoEmailOtp = '834192';
  const txnId = `TXN-UIDAI-${Date.now().toString().slice(-6)}`;
  const expiresAt = Date.now() + 180 * 1000; // 3 minutes

  const activeCitizen = matchedCitizen || {
    ...VERIFIED_CITIZEN_DIRECTORY[0],
    name: customCitizen?.name || VERIFIED_CITIZEN_DIRECTORY[0].name,
    phone: cleanPhone,
    phone_masked: maskPhone(cleanPhone),
    email: email,
    email_masked: maskEmail(email)
  };

  activeOtpSessions.set(txnId, {
    txnId,
    phone: cleanPhone,
    email: email,
    aadhaar: cleanAadhaar,
    generatedPhoneOtp: demoPhoneOtp,
    generatedEmailOtp: demoEmailOtp,
    citizen: activeCitizen,
    expiresAt
  });

  const phoneSmsPreview = `[SevaSindhu / UIDAI] Your verification code is ${demoPhoneOtp}. Do not share with anyone. Valid for 3 mins. Ref: ${txnId}`;
  const emailPreview = `[Government Welfare e-KYC] Verification Code: ${demoEmailOtp} for applicant ${activeCitizen.name}. Link: https://schemeseva.gov.in`;

  return {
    success: true,
    txnId,
    message: `Dual OTP dispatched! SMS sent to ${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)} and Email sent to ${maskEmail(email)}.`,
    demoOtp: demoPhoneOtp,
    demoEmailOtp: demoEmailOtp,
    phoneSmsPreview,
    emailPreview,
    citizenMatch: activeCitizen
  };
}

export function verifyCitizenOtp(
  txnId: string,
  enteredPhoneOtp: string,
  enteredEmailOtp?: string
): {
  success: boolean;
  message: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  citizen?: VerifiedCitizenRecord;
  profile?: UserProfile;
} {
  const session = activeOtpSessions.get(txnId);

  // Standard demo codes accepted for testing
  const validPhoneCodes = ['582914', '123456', session?.generatedPhoneOtp].filter(Boolean);
  const validEmailCodes = ['834192', '123456', session?.generatedEmailOtp].filter(Boolean);

  const phoneMatch = validPhoneCodes.includes(enteredPhoneOtp.trim());
  const emailMatch = !enteredEmailOtp || validEmailCodes.includes(enteredEmailOtp.trim());

  if (!session && !phoneMatch && !emailMatch) {
    return {
      success: false,
      message: 'OTP session expired or invalid. Please request a new OTP.'
    };
  }

  if (!phoneMatch) {
    return {
      success: false,
      message: 'Incorrect Phone SMS OTP. Please check the SMS sent to your mobile.'
    };
  }

  if (enteredEmailOtp && !emailMatch) {
    return {
      success: false,
      message: 'Incorrect Email OTP. Please check your inbox or spam folder.'
    };
  }

  const citizen = session?.citizen || VERIFIED_CITIZEN_DIRECTORY[0];

  const profile: UserProfile = {
    name: citizen.name,
    age: citizen.age,
    gender: citizen.gender,
    state: citizen.state,
    district: citizen.district,
    occupation: citizen.occupation,
    annual_income: citizen.annual_income,
    category: citizen.category,
    user_type: citizen.user_type,
    preferred_language: citizen.preferred_language,
    user_query: citizen.user_query,
    phone: citizen.phone,
    email: citizen.email,
    aadhaar_masked: citizen.aadhaar_masked,
    assigned_agent: citizen.assigned_agent,
    land_holding: citizen.land_holding,
    ration_card_no: citizen.ration_card_no,
    kutumba_id: citizen.kutumba_id
  };

  return {
    success: true,
    message: `e-KYC Identity Verified! Phone & Email authenticated for ${citizen.name} (Assigned Officer: ${citizen.assigned_agent}).`,
    phoneVerified: true,
    emailVerified: true,
    citizen,
    profile
  };
}
