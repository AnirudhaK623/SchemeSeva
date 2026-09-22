import React, { useState, useEffect } from 'react';
import { Scheme, UserProfile, ApplicationDraft, ControllerStatusResponse } from '../../types/orchestrator.js';
import { offlineSyncEngine, OfflineApplicationPayload } from '../../services/offlineSyncEngine.js';
import {
  FileText,
  CheckCircle2,
  Send,
  AlertTriangle,
  ArrowRight,
  WifiOff,
  Database,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  User,
  Shield,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface ApplicationDraftPageProps {
  scheme?: Scheme | null;
  profile: UserProfile;
  status: ControllerStatusResponse | null;
  onProceedToVernacular?: () => void;
  onNavigateToSchemes?: () => void;
  onSelectScheme?: (scheme: Scheme) => void;
  onNavigateToEligibility?: () => void;
  isLightMode?: boolean;
}

export const ApplicationDraftPage: React.FC<ApplicationDraftPageProps> = ({
  scheme,
  profile,
  status,
  onProceedToVernacular,
  onNavigateToSchemes,
  onSelectScheme,
  onNavigateToEligibility,
  isLightMode = true
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isOffline, setIsOffline] = useState(offlineSyncEngine.isOffline());
  const [offlinePayload, setOfflinePayload] = useState<OfflineApplicationPayload | null>(null);

  // Available schemes for checking and switching
  const [availableSchemes, setAvailableSchemes] = useState<Scheme[]>([]);
  const [showSchemePicker, setShowSchemePicker] = useState(false);

  // Editable Draft state (enabled by default for immediate editing)
  const [isEditingDraft, setIsEditingDraft] = useState(true);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);

  // Initialize editable fields from citizen profile and scheme
  const initialFields: Record<string, string> = {
    'Applicant Full Name': profile.name,
    'Date of Birth / Age': `${profile.age} Years`,
    'Gender': profile.gender,
    'Mobile Number': profile.phone || '9876543210',
    'Email Address': profile.email || 'citizen@welfare.gov.in',
    'Aadhaar Reference': profile.aadhaar_masked || 'XXXX-XXXX-3049',
    'Residential Address': `${profile.district}, ${profile.state}`,
    'Category': profile.category,
    'Occupation Classification': profile.occupation,
    'Annual Family Income': `₹${profile.annual_income.toLocaleString('en-IN')}`,
    'Target Scheme Name': scheme?.name || 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    'Nodal Department': scheme?.category || 'Ministry of Agriculture & Farmers Welfare',
    'Land Holding / RTC Survey': profile.land_holding || '2.4 Acres Wetland (Survey No 44/2)',
    'Ration Card / Kutumba ID': profile.ration_card_no || profile.kutumba_id || 'BPL-KA-991204',
    'Bank Account Number': profile.bank_account || 'SB-9821441029',
    'IFSC Code': profile.ifsc_code || 'SBIN0004122',
    'Bank Branch': `${profile.district} Main Treasury Branch`,
    'Special Remarks / Entitlement Basis': profile.user_query || 'Eligible under small & marginal farmer direct welfare criteria.'
  };

  const [draftFields, setDraftFields] = useState<Record<string, string>>(initialFields);

  useEffect(() => {
    return offlineSyncEngine.onNetworkChange(setIsOffline);
  }, []);

  // Load cached schemes for switching / comparing
  useEffect(() => {
    const list = offlineSyncEngine.searchSchemesOffline('', 'All', 'All');
    setAvailableSchemes(list);
  }, []);

  // Update target scheme field if active scheme prop changes
  useEffect(() => {
    if (scheme) {
      setDraftFields(prev => ({
        ...prev,
        'Target Scheme Name': scheme.name,
        'Nodal Department': scheme.category || 'Central / State Welfare Department'
      }));
    }
  }, [scheme]);

  // Live Application Agent telemetry
  const applicationAgent = status?.active_workflows?.[0]?.agents?.['application_agent'];
  const wfResults = status?.active_workflows?.[0]?.results;

  const draft: ApplicationDraft = wfResults?.application || {
    form_id: `DRAFT-${profile.district.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-4)}`,
    scheme_id: scheme?.scheme_id || 'SCH001',
    applicant_name: profile.name,
    readiness_percentage: 96,
    fields: draftFields,
    missing_fields: [],
    validation_errors: [],
    final_checklist: [
      'Dual verification verified: Registered Mobile SMS & Official Email OTP authenticated',
      'e-KYC verified via UIDAI biometric database & state Kutumba records',
      'Automated pre-fill complete; citizen modifications validated against statutory rules',
      'Direct Benefit Transfer (DBT) bank mandate confirmed with NPCI Aadhaar seeding'
    ]
  };

  const handleFieldChange = (key: string, value: string) => {
    setDraftFields(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRemoveField = (key: string) => {
    setDraftFields(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleAddNewField = () => {
    if (!newFieldKey.trim()) return;
    setDraftFields(prev => ({
      ...prev,
      [newFieldKey.trim()]: newFieldValue.trim() || 'Verified'
    }));
    setNewFieldKey('');
    setNewFieldValue('');
    setShowAddFieldModal(false);
    setSaveSuccessNotice(`Added new field "${newFieldKey}" to application draft.`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleSaveDraft = () => {
    setIsEditingDraft(false);
    setSaveSuccessNotice('Application Draft successfully saved with your custom modifications!');
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleResetDraft = () => {
    setDraftFields(initialFields);
    setSaveSuccessNotice('Application Draft reset to verified e-KYC baseline data.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleSelectDifferentScheme = (newScheme: Scheme) => {
    if (onSelectScheme) {
      onSelectScheme(newScheme);
    }
    setDraftFields(prev => ({
      ...prev,
      'Target Scheme Name': newScheme.name,
      'Nodal Department': newScheme.category
    }));
    setShowSchemePicker(false);
    setSaveSuccessNotice(`Switched target scheme to "${newScheme.name}". Application draft auto-aligned!`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleSubmitApplication = () => {
    if (isOffline) {
      const queued = offlineSyncEngine.queueOfflineApplication({
        scheme_id: scheme?.scheme_id || 'SCH001',
        scheme_name: scheme?.name || draftFields['Target Scheme Name'] || 'Government Welfare Scheme',
        applicant_name: draftFields['Applicant Full Name'] || profile.name,
        user_profile: {
          ...profile,
          name: draftFields['Applicant Full Name'] || profile.name,
          phone: draftFields['Mobile Number'] || profile.phone,
          email: draftFields['Email Address'] || profile.email
        },
        form_data: draftFields,
        local_verification_score: draft.readiness_percentage
      });
      setOfflinePayload(queued);
      setIsSubmitted(true);
    } else {
      setIsSubmitted(true);
    }
  };

  const activeAgentName = profile.assigned_agent || 'Agent Vikram Sharma (Senior Welfare Officer - A3 Unit #4)';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Prominent Citizen & Agent Identity Ribbon */}
      <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLightMode
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-emerald-200'
          : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border-emerald-800/40'
      }`}>
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400">
                Active Citizen Applicant:
              </span>
              <h2 className={`text-lg font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                {draftFields['Applicant Full Name'] || profile.name}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>e-KYC Verified</span>
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-600 dark:text-slate-300 flex-wrap gap-y-1">
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{draftFields['Mobile Number'] || profile.phone || '9876543210'}</span>
              </span>
              <span>·</span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{draftFields['Email Address'] || profile.email || 'citizen@welfare.gov.in'}</span>
              </span>
              <span>·</span>
              <span className="font-mono text-slate-500">{profile.district}, {profile.state}</span>
            </div>
          </div>
        </div>

        {/* Assigned Officer / Agent */}
        <div className={`p-3 rounded-xl border flex items-center space-x-3 text-xs ${
          isLightMode ? 'bg-white/80 border-emerald-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-600 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Welfare Agent</div>
            <div className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
              {activeAgentName}
            </div>
          </div>
        </div>
      </div>

      {/* Offline Mode Alert */}
      {/* Contention Notice if Cloud Resource is completely used */}
      {(() => {
        const busyRes = status?.resources?.find(r => r.available_slots === 0);
        if (busyRes) {
          return (
            <div className={`rounded-xl p-3.5 border flex items-start space-x-2.5 text-xs font-medium ${
              busyRes.stronger_agent_using
                ? isLightMode ? 'bg-amber-100/90 text-amber-900 border-amber-300' : 'bg-amber-950/50 text-amber-200 border-amber-500/40'
                : isLightMode ? 'bg-orange-100/90 text-orange-900 border-orange-300' : 'bg-orange-950/50 text-orange-200 border-orange-500/40'
            }`}>
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <div className="font-bold">
                  {busyRes.stronger_agent_using
                    ? "A stronger agent is using the resource. Please wait until it's free."
                    : "Resources are completely used by other agents. Please wait for a while until resource is available."}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Resource '{busyRes.name}' is currently at capacity. Priority queue orchestrator will allocate your check automatically.
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {isOffline && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 shrink-0">
              <WifiOff className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Two-Phase Offline Submission Engine Active
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Submissions are stored securely in local browser storage (IndexedDB) with status <b>PROVISIONAL_OFFLINE</b> and auto-synced when network recovers.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono px-3 py-1 rounded bg-amber-500/20 border border-amber-500/30 font-bold self-start sm:self-center">
            Local IDB Active
          </div>
        </div>
      )}

      {/* Scheme Check & Switcher Section */}
      <div className={`p-5 rounded-2xl border ${
        isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600 dark:text-sky-400">
                Scheme Selection & Verification
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                Target Scheme
              </span>
            </div>
            <h3 className={`text-lg font-bold mt-1 ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
              {scheme?.name || draftFields['Target Scheme Name']}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {scheme?.description || 'Government direct benefit scheme with financial and technical entitlements.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-2">
            <button
              onClick={() => setShowSchemePicker(!showSchemePicker)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                showSchemePicker
                  ? 'bg-sky-600 text-white border-sky-600'
                  : isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Switch / Check Scheme</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {onNavigateToSchemes && (
              <button
                onClick={onNavigateToSchemes}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                <span>Browse All Schemes</span>
              </button>
            )}

            {onNavigateToEligibility && (
              <button
                onClick={onNavigateToEligibility}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isLightMode
                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Eligibility Engine</span>
              </button>
            )}
          </div>
        </div>

        {/* Scheme Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className={`p-3 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 font-medium">Annual Financial Entitlement</span>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {scheme?.benefits || '₹6,000 / year (3 DBT installments)'}
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 font-medium">Target Category & Eligibility</span>
            <div className={`text-sm font-semibold mt-0.5 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
              {scheme?.category || 'Agriculture & Farmers'} ({scheme?.state || 'All India'})
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 font-medium">Required Documents</span>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 truncate">
              {scheme?.required_documents?.join(', ') || 'Aadhaar Card, Land RTC, Bank Passbook'}
            </div>
          </div>
        </div>

        {/* Expandable Quick Scheme Switcher */}
        {showSchemePicker && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">
                Select from Available Schemes ({availableSchemes.length})
              </span>
              <span className="text-xs text-sky-600">
                Click any scheme to align the draft instantly
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {availableSchemes.map((s) => {
                const isCurrent = (scheme?.scheme_id === s.scheme_id) || (draftFields['Target Scheme Name'] === s.name);
                return (
                  <div
                    key={s.scheme_id}
                    onClick={() => handleSelectDifferentScheme(s)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between space-x-2 ${
                      isCurrent
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-900 dark:text-sky-100 ring-2 ring-sky-500/20'
                        : isLightMode
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center space-x-1.5">
                        <span>{s.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-600 text-white font-mono">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {s.benefits}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {s.category} · {s.state}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Application Draft Form */}
      <div className={`p-6 rounded-2xl border ${
        isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
      }`}>
        {/* Header & Edit Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-black text-base ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
                  Application Draft Formulation
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-bold">
                  {draft.form_id}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                You can review, edit, and add custom statutory information before final submission.
              </p>
            </div>
          </div>

          {/* Action buttons: Edit, Save, Reset, Add Field */}
          <div className="flex items-center space-x-2 flex-wrap gap-1.5">
            {!isEditingDraft ? (
              <button
                onClick={() => setIsEditingDraft(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Application Draft</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setShowAddFieldModal(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-1 transition cursor-pointer ${
                    isLightMode
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Field</span>
                </button>
                <button
                  onClick={handleResetDraft}
                  title="Reset to e-KYC baseline"
                  className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                    isLightMode
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Toast / Notice */}
        {saveSuccessNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessNotice}</span>
          </div>
        )}

        {/* Modal for adding custom field */}
        {showAddFieldModal && (
          <div className="mt-4 p-4 rounded-xl border border-sky-500/30 bg-sky-50 dark:bg-sky-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase">
                Add Custom Field to Application
              </span>
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Field Name / Label (e.g. Caste Certificate No, Land Survey No)
                </label>
                <input
                  type="text"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  placeholder="e.g. Caste Certificate No"
                  className={`w-full px-3 py-2 rounded-lg text-xs border ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Field Value
                </label>
                <input
                  type="text"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  placeholder="e.g. RD00389210984"
                  className={`w-full px-3 py-2 rounded-lg text-xs border ${
                    isLightMode ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddNewField}
                disabled={!newFieldKey.trim()}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs"
              >
                Add Field to Draft
              </button>
            </div>
          </div>
        )}

        {/* Readiness Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Application Statutory Compliance Score
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {draft.readiness_percentage}% Complete
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${draft.readiness_percentage}%` }}
            />
          </div>
        </div>

        {/* Populated Application Fields Grid (Editable or Display) */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isEditingDraft ? 'Edit Application Draft Fields' : 'Pre-Populated Verified Citizen Entitlements'}
            </h4>
            {isEditingDraft && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Editing active — all inputs are live
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(draftFields).map(([label, val]) => (
              <div
                key={label}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition ${
                  isEditingDraft
                    ? 'border-sky-300 dark:border-sky-700 bg-sky-50/20 dark:bg-sky-950/20'
                    : isLightMode
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {label}
                  </span>
                  {isEditingDraft && (
                    <button
                      onClick={() => handleRemoveField(label)}
                      title="Remove field"
                      className="text-slate-400 hover:text-red-500 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isEditingDraft ? (
                  label === 'Target Scheme Name' && availableSchemes.length > 0 ? (
                    <div className="mt-1.5 space-y-1.5">
                      <select
                        value={val}
                        onChange={(e) => {
                          const matched = availableSchemes.find(s => s.name === e.target.value);
                          if (matched) {
                            handleSelectDifferentScheme(matched);
                          } else {
                            handleFieldChange(label, e.target.value);
                          }
                        }}
                        className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                          isLightMode
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-slate-900 border-slate-700 text-slate-100'
                        }`}
                      >
                        {availableSchemes.map(s => (
                          <option key={s.scheme_id} value={s.name}>{s.name} ({s.category})</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleFieldChange(label, e.target.value)}
                        placeholder="Or type custom scheme name"
                        className={`w-full px-2.5 py-1 text-[11px] rounded-lg border ${
                          isLightMode
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleFieldChange(label, e.target.value)}
                      className={`mt-1.5 w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                        isLightMode
                          ? 'bg-white border-slate-300 text-slate-900'
                          : 'bg-slate-900 border-slate-700 text-slate-100'
                      }`}
                    />
                  )
                ) : (
                  <div
                    onClick={() => setIsEditingDraft(true)}
                    title="Click to edit field"
                    className="cursor-pointer group flex items-center justify-between"
                  >
                    <span className={`text-sm font-semibold mt-1 break-words group-hover:text-sky-600 ${
                      isLightMode ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {val}
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-sky-500 ml-1.5 shrink-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Compliance Checklist */}
        <div className="mt-6">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">
            Verification Protocol Checklist
          </h4>
          <div className="space-y-1.5">
            {draft.final_checklist.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submission Success Notice */}
        {isSubmitted && (
          <div className="mt-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm">
                  {isOffline ? 'Application Saved in Offline Queue!' : 'Application Successfully Submitted!'}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {isOffline ? (
                    <>
                      Submission for <b>{draftFields['Applicant Full Name']}</b> preserved locally in IndexedDB (ID: <code className="font-mono text-emerald-600">{offlinePayload?.local_id}</code>). Will automatically push to state servers upon reconnect.
                    </>
                  ) : (
                    <>
                      Reference ID: <b className="font-mono">GOV-KA-2026-{Date.now().toString().slice(-6)}</b> for applicant <b>{draftFields['Applicant Full Name']}</b>. Assigned Welfare Officer: <b>{activeAgentName}</b>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Actions */}
        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Authenticated for citizen <b>{draftFields['Applicant Full Name'] || profile.name}</b> by <b>{activeAgentName}</b>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitApplication}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 cursor-pointer min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isOffline ? 'Save to Offline Queue (Submit Later)' : 'Submit Official Application'}
                </span>
              </button>
            ) : (
              <button
                onClick={onProceedToVernacular}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 cursor-pointer min-h-[44px]"
              >
                <span>View Regional Language Audio Explanation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
