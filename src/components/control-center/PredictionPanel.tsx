import React from 'react';
import { DependencyPrediction } from '../../types/orchestrator.js';
import { Sparkles, HelpCircle, Layers, ArrowRight } from 'lucide-react';

interface PredictionPanelProps {
  predictions: DependencyPrediction[];
  isLightMode?: boolean;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ predictions, isLightMode = false }) => {
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm p-5 ${
      isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Header with Transparency Notice */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b gap-2 ${
        isLightMode ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className={`font-bold text-sm ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
              Dependency Prediction Engine
            </h4>
            <span className="text-[10px] bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
              Predictive Allocation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 italic">
            “Rule-based prototype; predicts downstream tool and model dependencies before execution.”
          </p>
        </div>
        <div className={`text-[11px] px-3 py-1 rounded-xl border flex items-center space-x-1.5 ${
          isLightMode ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Locks upcoming resources so workflows don't freeze mid-execution</span>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="mt-4 space-y-3">
        {predictions.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Start a citizen workflow or click "Run 4-Citizen Concurrency Rush" above to trigger real-time dependency predictions.
          </div>
        ) : (
          predictions.slice(0, 5).map((pred, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition ${
                isLightMode
                  ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
                    {pred.workflow_id || 'Active Workflow'}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>
                    {pred.agent_id.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {Math.round(pred.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              {/* Resource Chain visual */}
              <div className="flex items-center space-x-2 overflow-x-auto text-[11px] font-mono pt-1">
                <span className="text-slate-500">Predicted Next:</span>
                {pred.predicted_next_resource && (
                  <span
                    className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                      isLightMode
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    {pred.predicted_next_resource}
                  </span>
                )}
                {pred.future_resource && (
                  <>
                    <span className="text-slate-400">→</span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[11px] font-bold ${
                        isLightMode
                          ? 'bg-white border-slate-200 text-slate-800'
                          : 'bg-slate-900 border-slate-700 text-slate-200'
                      }`}
                    >
                      {pred.future_resource}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
