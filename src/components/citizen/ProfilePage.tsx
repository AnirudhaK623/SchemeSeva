import React, { useState, useEffect } from 'react';
import { UserProfile, ControllerStatusResponse } from '../../types/orchestrator.js';
import {
  VERIFIED_CITIZEN_DIRECTORY,
  VerifiedCitizenRecord,
  requestCitizenOtp,
  verifyCitizenOtp,
  maskPhone,
  maskEmail,
  maskAadhaar
} from '../../data/citizenDirectory.js';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  User,
  KeyRound,
  RefreshCw,
  Building,
  Sparkles,
  Lock,
  ArrowRight,
  Mic,
  Check,
  Clock,
  Edit3,
  UserPlus,
  Save,
  RotateCcw,
  Smartphone,
  Inbox,
  Shield,
  Send,
  Settings,
  SendHorizontal
} from 'lucide-react';
import { sendOtpEmail, getEmailJsConfig, saveEmailJsConfig } from '../../services/emailService.js';

interface ProfilePageProps {
  status: ControllerStatusResponse | null;
  onProfileSubmitted?: (profile: UserProfile) => void;
  onNavigateToSchemes?: () => void;
  isLightMode?: boolean;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  status,
  onProfileSubmitted,
  onNavigateToSchemes,
  isLightMode = true
}) => {
  // Mode: Preset from Directory vs. Custom Citizen
  const [profileMode, setProfileMode] = useState<'preset' | 'custom'>('preset');

  // Selected Directory Citizen (default Rajesh Kumar)
  const [selectedDirectoryCitizen, setSelectedDirectoryCitizen] = useState<VerifiedCitizenRecord>(
    VERIFIED_CITIZEN_DIRECTORY[0]
  );

  // Authentication & Contact Information State
  const [inputPhone, setInputPhone] = useState(VERIFIED_CITIZEN_DIRECTORY[0].phone);
  const [inputEmail, setInputEmail] = useState(VERIFIED_CITIZEN_DIRECTORY[0].email);
  const [inputAadhaar, setInputAadhaar] = useState(VERIFIED_CITIZEN_DIRECTORY[0].aadhaar_raw);

  // Custom Citizen inputs (when user wants to enter their own profile)
  const [customName, setCustomName] = useState('Sinchana Holla');
  const [customPhone, setCustomPhone] = useState('9845012345');
  const [customEmail, setCustomEmail] = useState('hollasinchana@gmail.com');
  const [customAadhaar, setCustomAadhaar] = useState('987654321098');
  const [customAge, setCustomAge] = useState(28);
  const [customGender, setCustomGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [customState, setCustomState] = useState('Karnataka');
  const [customDistrict, setCustomDistrict] = useState('Bengaluru Urban');
  const [customOccupation, setCustomOccupation] = useState('Woman Tech Entrepreneur & Rural Innovator');
  const [customAnnualIncome, setCustomAnnualIncome] = useState(240000);
  const [customCategory, setCustomCategory] = useState<'General' | 'OBC' | 'SC' | 'ST'>('OBC');
  const [customUserType, setCustomUserType] = useState<UserProfile['user_type']>('Woman Entrepreneur');
  const [customLanguage, setCustomLanguage] = useState<'Kannada' | 'Hindi' | 'English' | 'Malayalam'>('Kannada');
  const [customQuery, setCustomQuery] = useState('Looking for state startup grants, micro-credit subsidies, and women empowerment schemes');
  const [customLandHolding, setCustomLandHolding] = useState('0.8 Acre Agricultural Homestead (Bengaluru Rural)');
  const [customRationCard, setCustomRationCard] = useState('APL-KA-990812');
  const [customAssignedAgent, setCustomAssignedAgent] = useState('Agent Vikram Sharma (Senior Welfare Officer - A3 Unit #4)');

  // Inline editing state for active profile
  const [isEditingActiveProfile, setIsEditingActiveProfile] = useState(false);

  // OTP State (Dual Channel: SMS + Email)
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTxnId, setOtpTxnId] = useState('');
  const [demoPhoneOtp, setDemoPhoneOtp] = useState('582914');
  const [demoEmailOtp, setDemoEmailOtp] = useState('834192');
  const [enteredPhoneOtp, setEnteredPhoneOtp] = useState('');
  const [enteredEmailOtp, setEnteredEmailOtp] = useState('');
  const [phoneSmsPreview, setPhoneSmsPreview] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  const [otpTimer, setOtpTimer] = useState(120);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isIdentityVerified, setIsIdentityVerified] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessNotice, setOtpSuccessNotice] = useState<string | null>(null);

  // EmailJS Outbound Configuration & Status
  const [emailJsConfig, setEmailJsConfig] = useState(getEmailJsConfig());
  const [showEmailJsModal, setShowEmailJsModal] = useState(false);
  const [emailJsServiceIdInput, setEmailJsServiceIdInput] = useState(emailJsConfig.serviceId);
  const [emailJsTemplateIdInput, setEmailJsTemplateIdInput] = useState(emailJsConfig.templateId);
  const [emailJsPublicKeyInput, setEmailJsPublicKeyInput] = useState(emailJsConfig.publicKey);
  const [emailJsNotice, setEmailJsNotice] = useState<string | null>(null);

  // Active Profile Data (synchronized across app)
  const [profile, setProfile] = useState<UserProfile>({
    name: VERIFIED_CITIZEN_DIRECTORY[0].name,
    age: VERIFIED_CITIZEN_DIRECTORY[0].age,
    gender: VERIFIED_CITIZEN_DIRECTORY[0].gender,
    state: VERIFIED_CITIZEN_DIRECTORY[0].state,
    district: VERIFIED_CITIZEN_DIRECTORY[0].district,
    occupation: VERIFIED_CITIZEN_DIRECTORY[0].occupation,
    annual_income: VERIFIED_CITIZEN_DIRECTORY[0].annual_income,
    category: VERIFIED_CITIZEN_DIRECTORY[0].category,
    user_type: VERIFIED_CITIZEN_DIRECTORY[0].user_type,
    preferred_language: VERIFIED_CITIZEN_DIRECTORY[0].preferred_language,
    user_query: VERIFIED_CITIZEN_DIRECTORY[0].user_query,
    phone: VERIFIED_CITIZEN_DIRECTORY[0].phone,
    email: VERIFIED_CITIZEN_DIRECTORY[0].email,
    aadhaar_masked: VERIFIED_CITIZEN_DIRECTORY[0].aadhaar_masked,
    assigned_agent: VERIFIED_CITIZEN_DIRECTORY[0].assigned_agent,
    land_holding: VERIFIED_CITIZEN_DIRECTORY[0].land_holding,
    ration_card_no: VERIFIED_CITIZEN_DIRECTORY[0].ration_card_no,
    kutumba_id: VERIFIED_CITIZEN_DIRECTORY[0].kutumba_id
  });

  // Workflow Execution State
  const [isRecording, setIsRecording] = useState(false);
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [workflowStep, setWorkflowStep] = useState<number>(0);
  const [workflowProgress, setWorkflowProgress] = useState<number>(0);
  const [workflowResults, setWorkflowResults] = useState<any | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  // Handle switching citizen from the official registry
  const handleSelectCitizenPreset = (citizen: VerifiedCitizenRecord) => {
    setProfileMode('preset');
    setSelectedDirectoryCitizen(citizen);
    setInputPhone(citizen.phone);
    setInputEmail(citizen.email);
    setInputAadhaar(citizen.aadhaar_raw);
    setIsOtpSent(false);
    setEnteredPhoneOtp('');
    setEnteredEmailOtp('');
    setOtpError(null);
    setOtpSuccessNotice(null);
    setIsIdentityVerified(true);
    setPhoneVerified(true);
    setEmailVerified(true);
    setWorkflowResults(null);
    setWorkflowStep(0);
    setWorkflowProgress(0);

    const updatedProfile: UserProfile = {
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

    setProfile(updatedProfile);
    if (onProfileSubmitted) {
      onProfileSubmitted(updatedProfile);
    }
  };

  // Step 1: Request Dual OTP (sent to both Phone and Email)
  const handleRequestDualOtp = () => {
    setOtpError(null);
    setOtpSuccessNotice(null);

    const phoneToVerify = profileMode === 'custom' ? customPhone : inputPhone;
    const emailToVerify = profileMode === 'custom' ? customEmail : inputEmail;
    const aadhaarToVerify = profileMode === 'custom' ? customAadhaar : inputAadhaar;

    const customCitizenPayload = profileMode === 'custom' ? {
      name: customName,
      phone: customPhone,
      email: customEmail,
      aadhaar_raw: customAadhaar,
      age: customAge,
      gender: customGender,
      state: customState,
      district: customDistrict,
      occupation: customOccupation,
      annual_income: customAnnualIncome,
      category: customCategory,
      user_type: customUserType,
      preferred_language: customLanguage,
      user_query: customQuery,
      land_holding: customLandHolding,
      ration_card_no: customRationCard,
      assigned_agent: customAssignedAgent
    } : undefined;

    const res = requestCitizenOtp(phoneToVerify, aadhaarToVerify, emailToVerify, customCitizenPayload);
    if (!res.success) {
      setOtpError(res.message);
      return;
    }

    setIsOtpSent(true);
    setOtpTxnId(res.txnId);
    setDemoPhoneOtp(res.demoOtp);
    setDemoEmailOtp(res.demoEmailOtp);
    setPhoneSmsPreview(res.phoneSmsPreview);
    setEmailPreview(res.emailPreview);
    setOtpTimer(120);
    setOtpSuccessNotice(res.message);

    // Dispatch live email OTP via EmailJS (@emailjs/browser)
    const recipientName = profileMode === 'custom' ? customName : selectedDirectoryCitizen.name;
    const assignedAgentName = profileMode === 'custom' ? customAssignedAgent : selectedDirectoryCitizen.assigned_agent;

    sendOtpEmail({
      to_name: recipientName,
      to_email: emailToVerify,
      otp_code: res.demoEmailOtp,
      assigned_agent: assignedAgentName
    }).then((emailRes) => {
      if (emailRes.provider === 'emailjs' && emailRes.sent) {
        setEmailJsNotice(`EmailJS: Live email OTP dispatched to ${emailToVerify}!`);
      } else {
        setEmailJsNotice(emailRes.message);
      }
    }).catch((err) => {
      console.warn('EmailJS outbound dispatch:', err);
    });
  };

  const handleSaveEmailJsSettings = () => {
    saveEmailJsConfig(emailJsServiceIdInput, emailJsTemplateIdInput, emailJsPublicKeyInput);
    const updated = getEmailJsConfig();
    setEmailJsConfig(updated);
    setShowEmailJsModal(false);
    setEmailJsNotice(
      updated.isConfigured
        ? 'EmailJS credentials saved! Live outbound email delivery is active.'
        : 'EmailJS credentials cleared. Sandbox mode active.'
    );
    setTimeout(() => setEmailJsNotice(null), 4000);
  };

  // Step 2: Verify Dual OTP
  const handleVerifyDualOtp = () => {
    if (!enteredPhoneOtp || enteredPhoneOtp.length < 4) {
      setOtpError('Please enter the 6-digit SMS OTP sent to your registered mobile phone.');
      return;
    }

    if (!enteredEmailOtp || enteredEmailOtp.length < 4) {
      setOtpError('Please enter the 6-digit Verification OTP sent to your email address.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    setTimeout(() => {
      const res = verifyCitizenOtp(otpTxnId, enteredPhoneOtp, enteredEmailOtp);
      setIsVerifyingOtp(false);

      if (!res.success) {
        setOtpError(res.message);
        return;
      }

      setIsIdentityVerified(true);
      setPhoneVerified(true);
      setEmailVerified(true);
      setIsOtpSent(false);
      setOtpSuccessNotice(res.message);

      if (res.citizen) {
        setSelectedDirectoryCitizen(res.citizen);
      }
      if (res.profile) {
        setProfile(res.profile);
        if (onProfileSubmitted) {
          onProfileSubmitted(res.profile);
        }
      }
    }, 600);
  };

  // Autofill both OTPs for instant testing
  const handleAutofillBothOtps = () => {
    setEnteredPhoneOtp(demoPhoneOtp);
    setEnteredEmailOtp(demoEmailOtp);
  };

  // Handle saving customized citizen profile directly
  const handleSaveCustomProfile = () => {
    const customCitizen: VerifiedCitizenRecord = {
      id: `CUSTOM-${Date.now().toString().slice(-4)}`,
      name: customName,
      aadhaar_raw: customAadhaar,
      aadhaar_masked: maskAadhaar(customAadhaar),
      phone: customPhone,
      phone_masked: maskPhone(customPhone),
      email: customEmail,
      email_masked: maskEmail(customEmail),
      assigned_agent: customAssignedAgent,
      age: customAge,
      gender: customGender,
      state: customState,
      district: customDistrict,
      category: customCategory,
      user_type: customUserType,
      occupation: customOccupation,
      annual_income: customAnnualIncome,
      preferred_language: customLanguage,
      user_query: customQuery,
      kutumba_id: `KTB-KA-${Date.now().toString().slice(-6)}`,
      ration_card_no: customRationCard,
      land_holding: customLandHolding,
      bank_dbt_status: 'Active (Direct Benefit Transfer Seeded via Aadhaar)',
      matched_schemes: VERIFIED_CITIZEN_DIRECTORY[0].matched_schemes
    };

    setSelectedDirectoryCitizen(customCitizen);
    setInputPhone(customPhone);
    setInputEmail(customEmail);
    setInputAadhaar(customAadhaar);

    const updatedProfile: UserProfile = {
      name: customName,
      age: customAge,
      gender: customGender,
      state: customState,
      district: customDistrict,
      occupation: customOccupation,
      annual_income: customAnnualIncome,
      category: customCategory,
      user_type: customUserType,
      preferred_language: customLanguage,
      user_query: customQuery,
      phone: customPhone,
      email: customEmail,
      aadhaar_masked: maskAadhaar(customAadhaar),
      assigned_agent: customAssignedAgent,
      land_holding: customLandHolding,
      ration_card_no: customRationCard,
      kutumba_id: customCitizen.kutumba_id
    };

    setProfile(updatedProfile);
    setIsEditingActiveProfile(false);
    setIsIdentityVerified(true);
    setPhoneVerified(true);
    setEmailVerified(true);
    setOtpSuccessNotice(`Citizen profile updated for ${customName}! Details synchronized across the application.`);
    setTimeout(() => setOtpSuccessNotice(null), 4000);

    if (onProfileSubmitted) {
      onProfileSubmitted(updatedProfile);
    }
  };

  // Step 3: Trigger Multi-Agent Workflow Execution in the UI
  const handleRunWorkflow = async () => {
    setIsExecutingWorkflow(true);
    setWorkflowResults(null);
    setWorkflowStep(1);
    setWorkflowProgress(15);

    // Step 1: Voice & Profile Ingestion
    await new Promise((r) => setTimeout(r, 600));
    setWorkflowStep(2);
    setWorkflowProgress(35);

    // Step 2: Scheme Discovery
    await new Promise((r) => setTimeout(r, 700));
    setWorkflowStep(3);
    setWorkflowProgress(60);

    // Step 3: Statutory Eligibility
    await new Promise((r) => setTimeout(r, 700));
    setWorkflowStep(4);
    setWorkflowProgress(80);

    // Step 4: Document Verification & Application Autofill
    await new Promise((r) => setTimeout(r, 600));
    setWorkflowStep(5);
    setWorkflowProgress(95);

    // Step 5: Vernacular Summary
    await new Promise((r) => setTimeout(r, 500));
    setWorkflowStep(6);
    setWorkflowProgress(100);

    // Finished
    setIsExecutingWorkflow(false);
    setWorkflowResults({
      matchedSchemes: selectedDirectoryCitizen.matched_schemes,
      citizen: selectedDirectoryCitizen
    });

    if (onProfileSubmitted) {
      onProfileSubmitted(profile);
    }
  };

  const handleSimulateVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setProfile((prev) => ({
        ...prev,
        user_query: `I am ${profile.name}, a ${profile.age}-year-old ${profile.occupation} in ${profile.district}, Karnataka. I need financial assistance, subsidies, and government welfare benefits.`
      }));
    }, 1200);
  };

  const activeAgent = profile.assigned_agent || 'Agent Vikram Sharma (Senior Welfare Officer - A3 Unit #4)';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* 1. HIGH-VISIBILITY CITIZEN & AGENT IDENTITY HERO */}
      <div className={`p-6 rounded-3xl border shadow-md relative overflow-hidden ${
        isLightMode
          ? 'bg-gradient-to-r from-emerald-50 via-sky-50 to-teal-50 border-emerald-200 text-slate-800'
          : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border-emerald-800/40 text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Person / Citizen Details */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400">
                  Citizen Applicant / Person:
                </span>
                <h1 className={`text-2xl font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                  {profile.name}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Citizen</span>
                </span>
              </div>

              <div className="flex items-center space-x-4 mt-2 text-xs text-slate-600 dark:text-slate-300 flex-wrap gap-y-1">
                <span className="flex items-center space-x-1 font-mono font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{profile.phone || inputPhone}</span>
                  {phoneVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                </span>
                <span>·</span>
                <span className="flex items-center space-x-1 font-mono font-medium">
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  <span>{profile.email || inputEmail}</span>
                  {emailVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                </span>
                <span>·</span>
                <span className="font-mono text-slate-500">
                  Aadhaar: {profile.aadhaar_masked || 'XXXX-XXXX-3049'}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Welfare Officer / Agent */}
          <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 shrink-0 ${
            isLightMode ? 'bg-white/90 border-emerald-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-600 flex items-center justify-center shrink-0 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                Assigned SevaMitra Welfare Agent
              </div>
              <div className={`font-black text-sm mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                {activeAgent}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center space-x-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>A3 Rural Node #4 · Mandya Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Use Registry Presets OR Put In Own Details */}
      <div className={`p-5 rounded-2xl border shadow-sm ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <h3 className="font-bold text-base flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Citizen Identity Management</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an official state registry citizen, or enter your own custom citizen profile details:
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => { setProfileMode('preset'); setIsEditingActiveProfile(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                profileMode === 'preset'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              State Registry Presets (4)
            </button>
            <button
              onClick={() => { setProfileMode('custom'); setIsEditingActiveProfile(true); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                profileMode === 'custom'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enter Custom Citizen</span>
            </button>
          </div>
        </div>

        {/* Option A: Preset Citizen Selector */}
        {profileMode === 'preset' && (
          <div className="mt-4 space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase">
              Select Sample Verified Citizen from Database:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {VERIFIED_CITIZEN_DIRECTORY.map((c) => {
                const isSelected = selectedDirectoryCitizen.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCitizenPreset(c)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                      isSelected
                        ? isLightMode
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                        : isLightMode
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {c.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                      {c.user_type} ({c.district})
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {c.email}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      +91 {c.phone}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Option B: Custom Citizen Profile Input Form */}
        {(profileMode === 'custom' || isEditingActiveProfile) && (
          <div className="mt-4 p-5 rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50/30 dark:bg-sky-950/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-200 dark:border-sky-800">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <h4 className="font-bold text-sm text-sky-900 dark:text-sky-200">
                  Custom Citizen Profile Formulation (Input Your Own Data)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                All fields will be verified with Phone & Email OTP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Citizen Full Name *
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sinchana Holla"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-sky-500 font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number (for SMS OTP) *
                </label>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-sky-500 font-mono font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (for Email OTP) *
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. hollasinchana@gmail.com"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-sky-500 font-mono font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Aadhaar Number (12 digits) *
                </label>
                <input
                  type="text"
                  value={customAadhaar}
                  onChange={(e) => setCustomAadhaar(e.target.value)}
                  placeholder="12-digit Aadhaar number"
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-sky-500 font-mono font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Age & Gender
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={customAge}
                    onChange={(e) => setCustomAge(Number(e.target.value))}
                    className={`w-20 px-3 py-2 text-xs rounded-xl border font-semibold ${
                      isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                  <select
                    value={customGender}
                    onChange={(e) => setCustomGender(e.target.value as any)}
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border font-semibold ${
                      isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State & District
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="District"
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border font-semibold ${
                      isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                  <input
                    type="text"
                    value={customState}
                    onChange={(e) => setCustomState(e.target.value)}
                    placeholder="State"
                    className={`w-28 px-3 py-2 text-xs rounded-xl border font-semibold ${
                      isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Socio-Economic Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="OBC">OBC (Other Backward Classes)</option>
                  <option value="General">General</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target User Classification
                </label>
                <select
                  value={customUserType}
                  onChange={(e) => setCustomUserType(e.target.value as any)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="Farmer">Farmer</option>
                  <option value="Woman Entrepreneur">Woman Entrepreneur</option>
                  <option value="Student">Student</option>
                  <option value="Rural Artisan">Rural Artisan</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                  <option value="Person with Disability">Person with Disability</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Certified Annual Family Income (₹)
                </label>
                <input
                  type="number"
                  value={customAnnualIncome}
                  onChange={(e) => setCustomAnnualIncome(Number(e.target.value))}
                  className={`w-full px-3 py-2 text-xs rounded-xl border font-mono font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Occupation Details
                </label>
                <input
                  type="text"
                  value={customOccupation}
                  onChange={(e) => setCustomOccupation(e.target.value)}
                  placeholder="e.g. Handloom Artisan, Micro Enterprise Owner"
                  className={`w-full px-3 py-2 text-xs rounded-xl border font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Land Holding / RTC Survey
                </label>
                <input
                  type="text"
                  value={customLandHolding}
                  onChange={(e) => setCustomLandHolding(e.target.value)}
                  placeholder="e.g. 1.5 Acre Dryland / None"
                  className={`w-full px-3 py-2 text-xs rounded-xl border font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Welfare Agent
                </label>
                <input
                  type="text"
                  value={customAssignedAgent}
                  onChange={(e) => setCustomAssignedAgent(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border font-semibold ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Citizen Welfare Inquiry / Specific Scheme Need
              </label>
              <textarea
                rows={2}
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-medium ${
                  isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                }`}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleSaveCustomProfile}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Activate Custom Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. DUAL OTP AUTHENTICATION ENGINE (PHONE SMS + EMAIL) */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                Dual-Channel e-KYC Verification (Phone SMS + Email)
              </h3>
              <p className="text-xs text-slate-500">
                OTP security verification will transmit codes to both your registered mobile phone and email address.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>UIDAI & Kutumba Gateway</span>
            </span>
          </div>
        </div>

        {/* Input Row for Verification Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {/* Phone Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Registered Mobile Phone</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-500">
                +91
              </span>
              <input
                type="tel"
                value={profileMode === 'custom' ? customPhone : inputPhone}
                onChange={(e) => {
                  if (profileMode === 'custom') setCustomPhone(e.target.value);
                  else setInputPhone(e.target.value);
                }}
                placeholder="10-digit mobile number"
                className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 ${
                  isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800/80 border-slate-700 text-slate-100'
                }`}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              SMS OTP sent via government telecom gateway.
            </span>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Mail className="w-4 h-4 text-sky-600" />
              <span>Registered Email Address</span>
            </label>
            <input
              type="email"
              value={profileMode === 'custom' ? customEmail : inputEmail}
              onChange={(e) => {
                if (profileMode === 'custom') setCustomEmail(e.target.value);
                else setInputEmail(e.target.value);
              }}
              placeholder="e.g. citizen@welfare.gov.in"
              className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 ${
                isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800/80 border-slate-700 text-slate-100'
              }`}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Official email OTP confirmation.
            </span>
          </div>

          {/* Aadhaar Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Aadhaar UIDAI Reference</span>
            </label>
            <input
              type="text"
              value={profileMode === 'custom' ? customAadhaar : inputAadhaar}
              onChange={(e) => {
                if (profileMode === 'custom') setCustomAadhaar(e.target.value);
                else setInputAadhaar(e.target.value);
              }}
              placeholder="12-digit Aadhaar number"
              className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 ${
                isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800/80 border-slate-700 text-slate-100'
              }`}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              UIDAI cross-verified for identity integrity.
            </span>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRequestDualOtp}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
          >
            <Send className="w-4 h-4" />
            <span>Send OTP to Mobile & Email</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmailJsModal(true)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer min-h-[44px] ${
              emailJsConfig.isConfigured
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-300'
                : isLightMode
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Configure outbound EmailJS credentials for live delivery"
          >
            <Settings className="w-3.5 h-3.5 text-sky-600" />
            <span>EmailJS Outbound</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              emailJsConfig.isConfigured ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {emailJsConfig.isConfigured ? 'Live Outbound' : 'Sandbox Ready'}
            </span>
          </button>

          {isIdentityVerified && (
            <span className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Citizen Identity Authenticated via e-KYC</span>
            </span>
          )}
        </div>

        {/* EmailJS Notice */}
        {emailJsNotice && (
          <div className="mt-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-800 dark:text-sky-300 text-xs font-semibold flex items-center space-x-2">
            <Mail className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{emailJsNotice}</span>
          </div>
        )}

        {/* EmailJS Configuration Modal */}
        {showEmailJsModal && (
          <div className="mt-4 p-5 rounded-2xl border border-sky-500/30 bg-sky-50/70 dark:bg-sky-950/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-sky-200 dark:border-sky-800">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-600" />
                <h4 className="font-bold text-sm text-sky-950 dark:text-sky-100">
                  EmailJS Configuration (@emailjs/browser)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailJsModal(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-bold"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              By default, SchemeSeva generates and renders simulated OTP codes on screen in transparent sandbox mode. To dispatch <b>real emails</b> to citizens using your EmailJS account, enter your keys below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Service ID
                </label>
                <input
                  type="text"
                  value={emailJsServiceIdInput}
                  onChange={(e) => setEmailJsServiceIdInput(e.target.value)}
                  placeholder="e.g. service_xxxxxxx"
                  className={`w-full px-3 py-2 text-xs rounded-lg border font-mono ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Template ID
                </label>
                <input
                  type="text"
                  value={emailJsTemplateIdInput}
                  onChange={(e) => setEmailJsTemplateIdInput(e.target.value)}
                  placeholder="e.g. template_xxxxxxx"
                  className={`w-full px-3 py-2 text-xs rounded-lg border font-mono ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Public Key (User ID)
                </label>
                <input
                  type="text"
                  value={emailJsPublicKeyInput}
                  onChange={(e) => setEmailJsPublicKeyInput(e.target.value)}
                  placeholder="e.g. pub_xxxxxxx"
                  className={`w-full px-3 py-2 text-xs rounded-lg border font-mono ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-sky-200 dark:border-sky-800">
              <span className="text-[11px] text-slate-500 font-mono">
                {emailJsConfig.isConfigured
                  ? 'Status: Ready for live outbound SMTP dispatch via EmailJS'
                  : 'Status: Sandbox active (instant on-screen code preview)'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmailJsServiceIdInput('');
                    setEmailJsTemplateIdInput('');
                    setEmailJsPublicKeyInput('');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Clear Keys
                </button>
                <button
                  type="button"
                  onClick={handleSaveEmailJsSettings}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Save EmailJS Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts & Notifications */}
        {otpError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <b className="block">Verification Notification:</b>
              <span>{otpError}</span>
            </div>
          </div>
        )}

        {otpSuccessNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{otpSuccessNotice}</span>
          </div>
        )}

        {/* VISIBLE INCOMING OTP NOTIFICATIONS & INPUT BOX */}
        {isOtpSent && (
          <div className={`mt-6 p-5 rounded-2xl border ${
            isLightMode ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-900 border-amber-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-200 dark:border-slate-800 gap-2">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Dual Verification Codes Dispatched
                </h4>
              </div>
              <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                Codes Expire in: {otpTimer}s
              </div>
            </div>

            {/* Simulated Live Incoming Alerts so citizen sees OTP on Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
              {/* Phone SMS Notification Card */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                    <span>Incoming SMS Notification</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 font-bold">
                    Mobile SMS
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {phoneSmsPreview}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">Mobile OTP: <b className="font-mono text-emerald-600 font-bold">{demoPhoneOtp}</b></span>
                  <button
                    type="button"
                    onClick={() => setEnteredPhoneOtp(demoPhoneOtp)}
                    className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Paste to Input
                  </button>
                </div>
              </div>

              {/* Email Inbox Delivery Card */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-700 dark:text-sky-400">
                    <Inbox className="w-4 h-4" />
                    <span>Incoming Email Notification</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-700 font-bold">
                    Email Inbox
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {emailPreview}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">Email OTP: <b className="font-mono text-sky-600 font-bold">{demoEmailOtp}</b></span>
                  <button
                    type="button"
                    onClick={() => setEnteredEmailOtp(demoEmailOtp)}
                    className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                  >
                    Paste to Input
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs for Phone OTP and Email OTP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enter 6-Digit Phone SMS OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredPhoneOtp}
                  onChange={(e) => setEnteredPhoneOtp(e.target.value)}
                  placeholder="e.g. 582914"
                  className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-widest font-black focus:ring-2 focus:ring-emerald-500 ${
                    isLightMode ? 'bg-white border-amber-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enter 6-Digit Email OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredEmailOtp}
                  onChange={(e) => setEnteredEmailOtp(e.target.value)}
                  placeholder="e.g. 834192"
                  className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-widest font-black focus:ring-2 focus:ring-sky-500 ${
                    isLightMode ? 'bg-white border-amber-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>

            {/* Verification & Autofill Actions */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleAutofillBothOtps}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer min-h-[44px]"
              >
                Autofill Both Codes ({demoPhoneOtp} / {demoEmailOtp})
              </button>

              <button
                type="button"
                onClick={handleVerifyDualOtp}
                disabled={isVerifyingOtp}
                className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer min-h-[44px]"
              >
                {isVerifyingOtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify Dual Codes & Retrieve Official Records</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. COMPREHENSIVE CITIZEN PROFILE DOSSIER */}
        {isIdentityVerified && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs uppercase font-mono font-bold text-emerald-600">
                  Step 2 · Official Verified Citizen Profile
                </span>
                <h4 className="font-bold text-base mt-0.5">
                  Demographic, Statutory & Land Records Dossier
                </h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
                  Kutumba ID: {selectedDirectoryCitizen.kutumba_id}
                </span>
                <button
                  onClick={() => setIsEditingActiveProfile(!isEditingActiveProfile)}
                  className="px-2.5 py-1 rounded text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditingActiveProfile ? 'Close Edit' : 'Edit Details'}</span>
                </button>
              </div>
            </div>

            {/* Verified Details Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className={`p-3.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Citizen Full Name</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {profile.name} ({profile.gender}, {profile.age} yrs)
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Contact Information</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  📱 +91 {profile.phone || inputPhone}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block truncate">
                  📧 {profile.email || inputEmail}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Residential Jurisdiction</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {profile.district}, {profile.state}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Category & Classification</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {profile.category} · {profile.user_type}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Certified Annual Family Income</span>
                <span className="text-sm font-bold font-mono text-emerald-600 mt-0.5 block">
                  ₹{profile.annual_income.toLocaleString('en-IN')} / year
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Assigned Welfare Officer</span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5 block">
                  {activeAgent}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Ration Card Registration</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {profile.ration_card_no || selectedDirectoryCitizen.ration_card_no}
                </span>
              </div>

              <div className={`p-3.5 rounded-xl border sm:col-span-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
              }`}>
                <span className="text-[11px] text-slate-500 block">Land Holding Record (RTC / Revenue Dept)</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {profile.land_holding || selectedDirectoryCitizen.land_holding}
                </span>
              </div>
            </div>

            {/* Direct Benefit Transfer (DBT) Status */}
            <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
              isLightMode ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' : 'bg-slate-800/40 border-slate-800 text-slate-200'
            }`}>
              <Building className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Direct Benefit Transfer (DBT) Status: </span>
                <span>{selectedDirectoryCitizen.bank_dbt_status}</span>
              </div>
            </div>

            {/* Citizen Intent / Query */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Citizen Need / Welfare Inquiry</span>
                <button
                  type="button"
                  onClick={handleSimulateVoice}
                  className="text-xs text-emerald-600 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isRecording ? 'Listening...' : 'Speak in Regional Language'}</span>
                </button>
              </label>
              <textarea
                rows={2}
                value={profile.user_query}
                onChange={(e) => setProfile({ ...profile, user_query: e.target.value })}
                className={`w-full p-3 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 ${
                  isLightMode ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800/60 border-slate-700 text-slate-100'
                }`}
              />
            </div>

            {/* Run Multi-Agent Workflow CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                Orchestrates 6 A3 agents: Voice intake, vector discovery, statutory eligibility, OCR check, and regional translation.
              </div>

              <button
                type="button"
                onClick={handleRunWorkflow}
                disabled={isExecutingWorkflow}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer min-h-[44px]"
              >
                {isExecutingWorkflow ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Multi-Agent Workflow ({workflowProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Profile & Run Multi-Agent Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Interactive Multi-Agent Workflow Stepper in UI */}
      {(isExecutingWorkflow || workflowStep > 0) && (
        <div className={`p-6 rounded-3xl border shadow-xl transition-colors ${
          isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/60 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-emerald-600">
                Live Orchestration Telemetry
              </span>
              <h3 className="font-extrabold text-lg mt-0.5">
                Active Multi-Agent Execution Pipeline
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-emerald-600">
              Pipeline Completion: {workflowProgress}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600 h-full transition-all duration-500"
              style={{ width: `${workflowProgress}%` }}
            />
          </div>

          {/* 6 Agents Pipeline Visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-6">
            <div className={`p-3.5 rounded-xl border transition-all ${
              workflowStep >= 1
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">Agent 1: Voice & Profile</span>
                {workflowStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : workflowStep === 1 ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <h5 className="font-bold text-xs mt-1">Profile & Speech Intake</h5>
              <div className="text-[11px] text-slate-500 mt-1">Citizen: {profile.name}</div>
            </div>

            <div className={`p-3.5 rounded-xl border transition-all ${
              workflowStep >= 2
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">Agent 2: Discovery</span>
                {workflowStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : workflowStep === 2 ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <h5 className="font-bold text-xs mt-1">Semantic Vector Search</h5>
              <div className="text-[11px] text-slate-500 mt-1">Tool: Vector DB + Embeddings (890 tk)</div>
            </div>

            <div className={`p-3.5 rounded-xl border transition-all ${
              workflowStep >= 3
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">Agent 3: Eligibility</span>
                {workflowStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : workflowStep === 3 ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <h5 className="font-bold text-xs mt-1">Statutory Rule Matching</h5>
              <div className="text-[11px] text-slate-500 mt-1">Tool: Eligibility Rules Engine (740 tk)</div>
            </div>

            <div className={`p-3.5 rounded-xl border transition-all ${
              workflowStep >= 4
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">Agent 4: Document Intel</span>
                {workflowStep > 4 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : workflowStep === 4 ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <h5 className="font-bold text-xs mt-1">OCR Certificate Check</h5>
              <div className="text-[11px] text-slate-500 mt-1">Tool: OCR Vision Service (950 tk)</div>
            </div>

            <div className={`p-3.5 rounded-xl border transition-all ${
              workflowStep >= 5
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">Agent 5: Application</span>
                {workflowStep > 5 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : workflowStep === 5 ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <h5 className="font-bold text-xs mt-1">Government Form Autofill</h5>
              <div className="text-[11px] text-slate-500 mt-1">Officer: {activeAgent}</div>
            </div>

            <div className={`p-3.5 rounded-xl border transition-all ${
              workflowStep >= 6
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold">Agent 6: Vernacular</span>
                {workflowStep >= 6 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <h5 className="font-bold text-xs mt-1">Regional Audio Summary</h5>
              <div className="text-[11px] text-slate-500 mt-1">Language: {profile.preferred_language}</div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Matched Welfare Schemes Results */}
      {workflowResults && (
        <div className={`p-6 rounded-3xl border shadow-xl transition-colors animate-in fade-in slide-in-from-bottom-4 ${
          isLightMode ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900/60 border-slate-800 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-emerald-600">
                Eligible Schemes Result Delivered
              </span>
              <h3 className="font-black text-xl mt-0.5">
                Matched Entitlements for {profile.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated for {profile.occupation} ({profile.user_type}), income ₹{profile.annual_income.toLocaleString('en-IN')}, and {profile.district} residency.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs">
                {selectedDirectoryCitizen.matched_schemes.length} Schemes Matched
              </span>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            {selectedDirectoryCitizen.matched_schemes.map((scheme, idx) => (
              <div
                key={scheme.scheme_id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLightMode
                    ? 'bg-slate-50 hover:bg-emerald-50/30 border-slate-200 hover:border-emerald-300'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        {scheme.ministry}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Scheme #{idx + 1}
                      </span>
                    </div>

                    <h4 className="font-bold text-base mt-1.5 text-slate-900 dark:text-slate-100">
                      {scheme.name}
                    </h4>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Match Score</span>
                      <span className="text-lg font-black font-mono text-emerald-600">
                        {scheme.match_score}%
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {scheme.description}
                </p>

                <div className={`mt-3 p-3 rounded-xl border text-xs ${
                  isLightMode ? 'bg-white border-emerald-200 text-slate-800' : 'bg-slate-900/60 border-emerald-800/50 text-slate-200'
                }`}>
                  <b className="text-emerald-600 font-bold">Annual Entitlement Benefit: </b>
                  <span>{scheme.annual_benefit}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {scheme.key_entitlements.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Pre-authenticated through DigiLocker & Kutumba ID
                  </span>

                  <button
                    onClick={onNavigateToSchemes}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
                  >
                    <span>Proceed to Application Draft</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
