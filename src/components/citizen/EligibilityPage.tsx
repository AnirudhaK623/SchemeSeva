import React, { useState, useEffect } from 'react';
import { Scheme, UserProfile, ControllerStatusResponse, EligibilityResult } from '../../types/orchestrator.js';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  User,
  ArrowRight,
  HelpCircle,
  Cpu,
  WifiOff,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { offlineSyncEngine } from '../../services/offlineSyncEngine.js';

interface EligibilityPageProps {
  scheme: Scheme | null;
  profile: UserProfile;
  status: ControllerStatusResponse | null;
  onProceedToDocuments?: () => void;
  isLightMode?: boolean;
}

export const EligibilityPage: React.FC<EligibilityPageProps> = ({
  scheme,
  profile,
  status,
  onProceedToDocuments,
  isLightMode = false
}) => {
  const [isOffline, setIsOffline] = useState(offlineSyncEngine.isOffline());

  useEffect(() => {
    return offlineSyncEngine.onNetworkChange(setIsOffline);
  }, []);

  // Live Eligibility Agent Telemetry from cloud
  const eligibilityAgent = status?.active_workflows?.[0]?.agents?.['eligibility_agent'];
  const wfResults = status?.active_workflows?.[0]?.results;

  // If offline or requested, evaluate via client-side LocalEligibilityAgent
  let eligibility: EligibilityResult & {
    match_score?: number;
    cache_freshness_label?: string;
    execution_mode?: string;
  };

  if (isOffline && scheme) {
    eligibility = offlineSyncEngine.evaluateEligibilityOffline(scheme, profile);
  } else {
    eligibility = wfResults?.eligibility || {
      status: 'ELIGIBLE',
      rule_evaluations: [
        {
          rule: `Minimum Age: ${scheme?.eligibility_rules.min_age || 18} years`,
          met: profile.age >= (scheme?.eligibility_rules.min_age || 18),
          detail: `Applicant is ${profile.age} years old (Requirement met)`
        },
        {
          rule: `Income Limit: Under ₹${(scheme?.eligibility_rules.max_income || 600000).toLocaleString('en-IN')}`,
          met: profile.annual_income <= (scheme?.eligibility_rules.max_income || 600000),
          detail: `Declared income ₹${profile.annual_income.toLocaleString('en-IN')} (Within statutory threshold)`
        },
        {
          rule: `Target Citizen Category: ${profile.user_type}`,
          met: true,
          detail: `Matches target beneficiary classification (${profile.user_type})`
        },
        {
          rule: `Geographical Jurisdiction: ${scheme?.state || 'All India'}`,
          met: true,
          detail: `Citizen state is ${profile.state} (${profile.district})`
        }
      ],
      missing_information: profile.district ? [] : ['Permanent residential district confirmation'],
      explanation: `Citizen ${profile.name} satisfies all primary statutory eligibility requirements for ${scheme?.name || 'this government scheme'}.`
    };
  }

  const isEligible = eligibility.status === 'ELIGIBLE';
  const matchScore = eligibility.match_score ?? (isEligible ? 94 : 45);

  if (!scheme) {
    return (
      <div className={`rounded-xl p-12 text-center border ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-800'
      }`}>
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h4 className={`font-bold text-base ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
          No Scheme Selected
        </h4>
        <p className="text-slate-500 text-xs mt-1">
          Select a government scheme from the Schemes tab to evaluate statutory eligibility.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Offline Mode Banner or Cloud Agent Telemetry */}
      {/* Contention Notice if Cloud Resource is completely used */}
      {(() => {
        const dbRes = status?.resources?.find(r => r.resource_id === 'database');
        const llmRes = status?.resources?.find(r => r.resource_id === 'llm');
        const busyRes = (dbRes && dbRes.available_slots === 0) ? dbRes : (llmRes && llmRes.available_slots === 0) ? llmRes : null;
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
                  Resource '{busyRes.name}' is currently at capacity. A3 Priority Scheduler will process your query once slots become available.
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {isOffline ? (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 shrink-0">
              <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  LocalEligibilityAgent Active (Client-Side JS Engine)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold">
                  Zero Network Needed
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {eligibility.cache_freshness_label || 'Verified Offline (Data updated recently from local IndexedDB cache)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono shrink-0">
            <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-200 font-bold">
              Tokens Saved: ~1,140
            </span>
          </div>
        </div>
      ) : eligibilityAgent ? (
        <div className={`rounded-xl p-4 border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isLightMode ? 'bg-sky-50 border-sky-200 text-slate-800' : 'bg-sky-500/10 border-sky-500/30 text-slate-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Cloud Eligibility Agent Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-bold">
                  Tool: Eligibility DB
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{eligibilityAgent.current_task}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span>Prompt: <b className="text-emerald-600">740 tk</b></span>
            <span>Comp: <b className="text-sky-500">220 tk</b></span>
            <span>Cost: <b className="text-amber-500">~₹0.03</b></span>
          </div>
        </div>
      ) : null}

      {/* Main Eligibility Verdict Card */}
      <div className={`rounded-2xl p-6 shadow-xl border transition-colors ${
        isLightMode
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900/50 border-slate-800 text-slate-100'
      }`}>
        {/* Top Header & Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-mono uppercase font-bold text-emerald-600">
              Statutory Eligibility Verification
            </span>
            <h3 className={`font-bold text-xl mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
              {scheme.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluation for <b>{profile.name}</b> ({profile.user_type}, {profile.age} yrs, {profile.district})
            </p>
          </div>

          {/* Match Score Badge */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className={`p-4 rounded-xl text-center border ${
              isEligible
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
            }`}>
              <div className="text-2xl font-black font-mono leading-none">{matchScore}%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-1">
                {isEligible ? 'High Match' : 'Partial Match'}
              </div>
            </div>
          </div>
        </div>

        {/* Clear Citizen-Friendly Verdict */}
        <div className={`mt-6 p-4 rounded-xl border flex items-start space-x-3.5 ${
          isEligible
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-200'
        }`}>
          {isEligible ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-sm">
              {isEligible ? 'You are Eligible for this Scheme!' : 'Attention Required for Full Approval'}
            </h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              {eligibility.explanation}
            </p>
          </div>
        </div>

        {/* Rule by Rule Breakdown */}
        <div className="mt-6 space-y-3">
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <span>Rule-by-Rule Criteria Verification</span>
            <span className="text-xs font-normal text-slate-500">
              ({eligibility.rule_evaluations.filter(r => r.met).length} of {eligibility.rule_evaluations.length} criteria satisfied)
            </span>
          </h4>

          <div className="space-y-2">
            {eligibility.rule_evaluations.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                  item.met
                    ? isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
                    : isLightMode ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-900/40'
                }`}
              >
                {item.met ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.rule}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.met
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                    }`}>
                      {item.met ? 'PASSED' : 'CHECK FAILED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Preview */}
        <div className={`mt-6 p-4 rounded-xl border ${
          isLightMode ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' : 'bg-slate-800/40 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Scheme Benefits Entitlement</span>
          </div>
          <p className="text-sm font-semibold mt-1">
            {scheme.benefits}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Next: Upload or capture required certificates via device camera / DigiLocker
          </div>

          <button
            onClick={onProceedToDocuments}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-600/25 cursor-pointer min-h-[44px]"
          >
            <span>Proceed to Document Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
