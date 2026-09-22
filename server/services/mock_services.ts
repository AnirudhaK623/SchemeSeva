import { UserProfile, Scheme, EligibilityResult, DocumentAnalysis, ApplicationDraft, LanguageExplanation } from '../../src/types/orchestrator.js';

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulated Speech-to-Text
export async function mockSpeechToText(audioDataOrText: string): Promise<string> {
  await sleep(400);
  if (audioDataOrText.length > 5 && !audioDataOrText.startsWith('data:')) {
    return audioDataOrText;
  }
  return 'I am a 32 year old small farmer from Karnataka looking for government agricultural support and crop assistance.';
}

// Simulated Embedding Generation
export async function mockGenerateEmbedding(text: string): Promise<number[]> {
  await sleep(350);
  const hash = Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array.from({ length: 8 }, (_, i) => Math.sin(hash + i));
}

// Simulated Vector Database Search
export async function mockVectorSearch(query: string, schemes: Scheme[], profile: UserProfile): Promise<Scheme[]> {
  await sleep(450);
  const qLower = (query + ' ' + (profile.occupation || '') + ' ' + (profile.user_type || '')).toLowerCase();
  
  const scored = schemes.map((s) => {
    let score = 0.4;
    // Check keywords
    for (const kw of s.keywords) {
      if (qLower.includes(kw.toLowerCase())) score += 0.2;
    }
    // Check category match
    if (s.category.toLowerCase().includes(profile.occupation.toLowerCase()) || 
        s.category.toLowerCase().includes(profile.user_type.toLowerCase())) {
      score += 0.25;
    }
    // State match
    if (s.state === 'All India' || s.state.toLowerCase() === profile.state.toLowerCase()) {
      score += 0.15;
    }
    // Cap score at 0.98
    const relevance = Math.min(0.98, Math.max(0.45, Number(score.toFixed(2))));
    return {
      ...s,
      relevance_score: relevance,
      match_reason: `Matches citizen profile (${profile.user_type}, ${profile.state}) and query objectives with strong alignment on ${s.category}.`
    };
  });

  return scored.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
}

// Simulated Rule Engine for Eligibility
export async function mockVerifyEligibility(scheme: Scheme, profile: UserProfile): Promise<EligibilityResult> {
  await sleep(400);
  const rules = scheme.eligibility_rules;
  const evaluations: EligibilityResult['rule_evaluations'] = [];
  const missing: string[] = [];
  let isEligible = true;

  // Age Check
  if (rules.min_age !== undefined) {
    const met = profile.age >= rules.min_age;
    evaluations.push({
      rule: `Minimum Age: ${rules.min_age} years`,
      met,
      detail: `Citizen age is ${profile.age} years (${met ? 'Satisfied' : 'Requirement not met'})`
    });
    if (!met) isEligible = false;
  }

  if (rules.max_age !== undefined) {
    const met = profile.age <= rules.max_age;
    evaluations.push({
      rule: `Maximum Age: ${rules.max_age} years`,
      met,
      detail: `Citizen age is ${profile.age} years (${met ? 'Satisfied' : 'Exceeds limit'})`
    });
    if (!met) isEligible = false;
  }

  // Income Check
  if (rules.max_income !== undefined) {
    const met = profile.annual_income <= rules.max_income;
    evaluations.push({
      rule: `Annual Income Ceiling: ₹${rules.max_income.toLocaleString('en-IN')}`,
      met,
      detail: `Declared income ₹${profile.annual_income.toLocaleString('en-IN')} (${met ? 'Satisfied' : 'Exceeds limit'})`
    });
    if (!met) isEligible = false;
  }

  // User type or occupation
  if (rules.allowed_user_types && rules.allowed_user_types.length > 0) {
    const met = rules.allowed_user_types.includes(profile.user_type);
    evaluations.push({
      rule: `Target Beneficiary Category: ${rules.allowed_user_types.join(', ')}`,
      met,
      detail: `Citizen category is '${profile.user_type}' (${met ? 'Eligible beneficiary' : 'Different category'})`
    });
    if (!met) isEligible = false;
  }

  // Gender Check
  if (rules.allowed_genders && rules.allowed_genders.length > 0) {
    const met = rules.allowed_genders.includes(profile.gender);
    evaluations.push({
      rule: `Eligible Gender: ${rules.allowed_genders.join(', ')}`,
      met,
      detail: `Applicant gender is ${profile.gender} (${met ? 'Satisfied' : 'Not eligible for this gender category'})`
    });
    if (!met) isEligible = false;
  }

  // Missing info check
  if (!profile.district) missing.push('District verification');
  if (!profile.category) missing.push('Social Category Certificate (Caste/EWS)');

  return {
    status: isEligible ? 'ELIGIBLE' : evaluations.some(e => e.met === true) ? 'POSSIBLY_ELIGIBLE' : 'NOT_ELIGIBLE',
    rule_evaluations: evaluations,
    missing_information: missing,
    explanation: isEligible 
      ? `Applicant ${profile.name} satisfies all primary eligibility criteria for ${scheme.name}, including age, income criteria, and beneficiary classification.`
      : `Applicant ${profile.name} does not meet all criteria for ${scheme.name}. Please review individual rule checks above.`
  };
}

// Simulated Document Intelligence Agent Service
export async function mockAnalyzeDocuments(scheme: Scheme, uploadedNames: string[] = []): Promise<DocumentAnalysis> {
  await sleep(450);
  const required = scheme.required_documents;
  const available: string[] = [];
  const missing: string[] = [];
  const status: Record<string, 'VERIFIED' | 'MISSING' | 'PENDING'> = {};

  // Standard verified set (e.g. Aadhaar is usually verified)
  required.forEach((doc, idx) => {
    const hasUploaded = uploadedNames.some(u => u.toLowerCase().includes(doc.toLowerCase().split(' ')[0]));
    if (idx === 0 || hasUploaded) {
      available.push(doc);
      status[doc] = 'VERIFIED';
    } else if (idx === 1 && uploadedNames.length > 0) {
      available.push(doc);
      status[doc] = 'VERIFIED';
    } else {
      missing.push(doc);
      status[doc] = 'MISSING';
    }
  });

  return {
    required_documents: required,
    available_documents: available,
    missing_documents: missing,
    verification_status: status
  };
}

// Simulated Application Assistance
export async function mockPrepareApplication(scheme: Scheme, profile: UserProfile, docAnalysis: DocumentAnalysis): Promise<ApplicationDraft> {
  await sleep(400);
  const missingFields: string[] = [];
  if (!profile.annual_income) missingFields.push('Annual Income Certificate Number');
  if (!profile.district) missingFields.push('Permanent Residential District');

  const totalDocs = docAnalysis.required_documents.length;
  const verifiedDocs = docAnalysis.available_documents.length;
  const docScore = totalDocs > 0 ? (verifiedDocs / totalDocs) * 50 : 50;
  const profileScore = missingFields.length === 0 ? 50 : 35;
  const readiness = Math.round(docScore + profileScore);

  return {
    form_id: `FORM-${scheme.scheme_id}-${Date.now().toString().slice(-4)}`,
    scheme_id: scheme.scheme_id,
    applicant_name: profile.name,
    fields: {
      fullName: profile.name,
      age: profile.age,
      gender: profile.gender,
      state: profile.state,
      district: profile.district || 'Mandya',
      occupation: profile.occupation,
      annualIncome: `₹${profile.annual_income.toLocaleString('en-IN')}`,
      beneficiaryCategory: profile.category,
      schemeName: scheme.name,
      nodalDepartment: scheme.category,
      accountStatus: 'Aadhaar-Seeded DBT Account Ready'
    },
    missing_fields: missingFields,
    validation_errors: missingFields.length > 0 ? [`Missing ${missingFields.length} mandatory documentation fields`] : [],
    readiness_percentage: readiness,
    final_checklist: [
      'Self-attested identity proof (Aadhaar)',
      'Active DBT-enabled savings bank passbook',
      'Recent passport-sized photograph',
      'Scheme-specific certification / Land or Business documents'
    ]
  };
}

// Simulated Multi-Language Explanations
export async function mockGenerateExplanations(scheme: Scheme, profile: UserProfile): Promise<Record<string, LanguageExplanation>> {
  await sleep(350);
  return {
    English: {
      language: 'English',
      title: `${scheme.name} - Summary & Next Steps`,
      summary: `You are eligible for ${scheme.name}. This central program provides ${scheme.benefits} to support your livelihood as a ${profile.user_type} in ${profile.state}.`,
      eligibility_brief: `Eligibility verified for ${profile.name} (Age: ${profile.age}, Income: ₹${profile.annual_income.toLocaleString('en-IN')}).`,
      next_steps: [
        'Collect verified documents from the Document Intelligence tab.',
        'Review the auto-generated application draft.',
        `Submit directly on official portal: ${scheme.application_url}`,
        'Keep registration reference number safe for DBT transfer tracking.'
      ]
    },
    Kannada: {
      language: 'Kannada',
      title: `${scheme.name} - ವಿವರಣೆ ಮತ್ತು ಮುಂದಿನ ಹಂತಗಳು`,
      summary: `ನೀವು ${scheme.name} ಯೋಜನೆಗೆ ಅರ್ಹರಾಗಿದ್ದೀರಿ. ಈ ಯೋಜನೆಯು ${profile.state} ರಾಜ್ಯದ ${profile.user_type} ಆಗಿರುವ ನಿಮಗೆ ${scheme.benefits} ಸೌಲಭ್ಯವನ್ನು ನೇರ ಡಿಬಿಟಿ ಮೂಲಕ ತಲುಪಿಸುತ್ತದೆ.`,
      eligibility_brief: `${profile.name} ಅವರ ವಯಸ್ಸು (${profile.age}) ಮತ್ತು ಆದಾಯ ನಿಯಮಗಳು ಪೂರ್ಣವಾಗಿ ದೃಢೀಕರಿಸಲ್ಪಟ್ಟಿವೆ.`,
      next_steps: [
        'ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧವಾಗಿಟ್ಟುಕೊಳ್ಳಿ (ಆಧಾರ್, ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್).',
        'ಸಿದ್ಧಪಡಿಸಿದ ಅರ್ಜಿ ನಮೂನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
        `ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ: ${scheme.application_url}`,
        'ಅರ್ಜಿ ಸಂಖ್ಯೆಯನ್ನು ಮುಂದಿನ ವಿಚಾರಣೆಗಾಗಿ ಸುರಕ್ಷಿತವಾಗಿಡಿ.'
      ]
    },
    Hindi: {
      language: 'Hindi',
      title: `${scheme.name} - संक्षिप्त विवरण एवं आवेदन निर्देश`,
      summary: `आप ${scheme.name} के लिए पात्र हैं। यह सरकारी योजना ${profile.state} में आपके ${profile.user_type} के रूप में ${scheme.benefits} की प्रत्यक्ष सहायता प्रदान करती है।`,
      eligibility_brief: `${profile.name} के लिए पात्रता मानदंड (आयु: ${profile.age}, वार्षिक आय: ₹${profile.annual_income.toLocaleString('en-IN')}) सफलतापूर्वक सत्यापित हो चुके हैं।`,
      next_steps: [
        'दस्तावेज़ सूची के अनुसार आधार कार्ड और बैंक पासबुक सत्यापित करें।',
        'तैयार आवेदन पत्र की जाँच करें।',
        `आधिकारिक पोर्टल पर सीधे आवेदन करें: ${scheme.application_url}`,
        'डीबीटी स्थिति ट्रैकिंग के लिए आवेदन संदर्भ संख्या संभाल कर रखें।'
      ]
    },
    Malayalam: {
      language: 'Malayalam',
      title: `${scheme.name} - സംഗ്രഹം & അടുത്ത ഘട്ടങ്ങൾ`,
      summary: `നിങ്ങൾ ${scheme.name} പദ്ധതിക്ക് അർഹരാണ്. ഈ പദ്ധതി വഴി ${profile.state} ലെ ${profile.user_type} ആയ നിങ്ങൾക്ക് ${scheme.benefits} ആനുകൂല്യം നേരിട്ട് ലഭ്യമാക്കുന്നു.`,
      eligibility_brief: `${profile.name} ന് ആവശ്യമായ മാനദണ്ഡങ്ങൾ (പ്രായം: ${profile.age}, വാർഷിക വരുമാനം: ₹${profile.annual_income.toLocaleString('en-IN')}) പരിശോധിച്ചു ഉറപ്പാക്കി.`,
      next_steps: [
        'ആവശ്യമായ രേഖകൾ ശേഖരിച്ചു പരിശോധിക്കുക.',
        'തയ്യാറാക്കിയ അപേക്ഷാ ഫോം പൂർണ്ണമായി വിലയിരുത്തുക.',
        `ഔദ്യോഗിക പോർട്ടലിൽ അപേക്ഷ സമർപ്പിക്കുക: ${scheme.application_url}`,
        'അപേക്ഷാ റഫറൻസ് നമ്പർ സൂക്ഷിക്കുക.'
      ]
    }
  };
}
