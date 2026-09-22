import React, { useState } from 'react';
import { runAutomatedTestsApi } from '../services/api.js';
import { CheckCircle2, XCircle, Play, X, ShieldCheck, Loader2, Sparkles } from 'lucide-react';

interface AutomatedTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomatedTestsModal: React.FC<AutomatedTestsModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testReport, setTestReport] = useState<{
    total: number;
    passed: number;
    failed: number;
    all_passed: boolean;
    results: Array<{ id: number; title: string; passed: boolean; message: string }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const data = await runAutomatedTestsApi();
      setTestReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <span>Automated Controller Test Suite (12 Invariants)</span>
                {testReport && testReport.all_passed && (
                  <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full">
                    12/12 PASSED
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Rigorous verification of capacity limits, starvation aging, reservations & recovery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3 font-mono text-xs flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {!testReport && !isRunning && (
            <div className="py-12 text-center">
              <Sparkles className="w-10 h-10 text-sky-400 mx-auto mb-3 animate-bounce" />
              <h4 className="text-slate-200 font-bold text-sm">Ready to Execute Test Suite</h4>
              <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto font-sans">
                Click below to run the 12 automated verification scenarios against the live A3 Runtime Controller.
              </p>
              <button
                onClick={handleRunTests}
                className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center space-x-2 mx-auto cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run 12/12 Verification Tests</span>
              </button>
            </div>
          )}

          {isRunning && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-400 mx-auto animate-spin" />
              <p className="text-slate-300 font-sans text-xs">
                Executing concurrency stress tests and capacity invariant assertions...
              </p>
            </div>
          )}

          {testReport && !isRunning && (
            <div className="space-y-2.5">
              {testReport.results.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                    r.passed
                      ? 'bg-slate-950/60 border-emerald-500/25 hover:border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-slate-200 text-xs font-sans">
                        Test {r.id}: {r.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{r.message}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    r.passed
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {r.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-sans">
            {testReport ? `${testReport.passed}/${testReport.total} test cases passed successfully` : '12 Automated Invariants'}
          </div>

          <div className="flex space-x-2">
            {testReport && (
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Rerun Tests
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
