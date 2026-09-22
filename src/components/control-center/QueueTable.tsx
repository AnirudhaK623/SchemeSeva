import React from 'react';
import { QueueItem } from '../../types/orchestrator.js';
import { Clock, ArrowUpRight, Hourglass, Shield, Info } from 'lucide-react';

interface QueueTableProps {
  queue: QueueItem[];
  isLightMode?: boolean;
}

export const QueueTable: React.FC<QueueTableProps> = ({ queue, isLightMode = false }) => {
  if (queue.length === 0) {
    return (
      <div className={`rounded-2xl border p-8 text-center shadow-sm ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-800'
      }`}>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Hourglass className="w-6 h-6 animate-pulse" />
        </div>
        <h5 className={`font-bold text-sm ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
          Priority Queue is Free & Clear
        </h5>
        <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
          All multi-agent welfare queries are processed immediately with zero contention or delay.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${
      isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
        isLightMode ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/80 border-slate-800'
      }`}>
        <div>
          <h4 className={`font-bold text-sm flex items-center space-x-2 ${
            isLightMode ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <span>Live Priority Queue</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono font-bold">
              {queue.length} citizen requests waiting
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by multi-factor score + aging starvation prevention boost
          </p>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Starvation Proofing Active</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className={`uppercase text-[10px] tracking-wider border-b ${
            isLightMode ? 'bg-slate-100/70 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
          }`}>
            <tr>
              <th className="py-2.5 px-4">Rank</th>
              <th className="py-2.5 px-4">Workflow & Agent</th>
              <th className="py-2.5 px-4">Target Resource</th>
              <th className="py-2.5 px-4">Base / Eff. Priority</th>
              <th className="py-2.5 px-4">Wait Time & Aging</th>
              <th className="py-2.5 px-4">Scheduler Rationale</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-mono ${
            isLightMode ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-300'
          }`}>
            {queue.map((item) => {
              const isStarving = item.waiting_time_seconds >= 15 || item.aging_bonus > 2.0;

              return (
                <tr
                  key={item.request.request_id}
                  className={`transition-colors ${
                    isStarving
                      ? isLightMode ? 'bg-amber-50/50' : 'bg-amber-500/10'
                      : isLightMode ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4 font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                      item.priority_rank === 1
                        ? 'bg-amber-500 text-slate-950'
                        : isLightMode ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{item.priority_rank}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-sky-600 dark:text-sky-400">{item.request.workflow_id}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{item.request.agent_id.replace(/_/g, ' ')}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                      isLightMode ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                    }`}>
                      {item.request.resource_id}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 line-through text-[11px]">{item.priority_score.toFixed(1)}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">{item.effective_priority.toFixed(1)}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.waiting_time_seconds}s</span>
                    </div>
                    {item.aging_bonus > 0 && (
                      <span className={`inline-block mt-0.5 text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${
                        isStarving
                          ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                      }`}>
                        Aging +{item.aging_bonus.toFixed(1)}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-sans text-[11px] max-w-sm">
                    <div className={`p-2 rounded-lg border text-xs font-semibold mb-1 ${
                      item.stronger_agent_using
                        ? isLightMode
                          ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                          : 'bg-amber-950/50 text-amber-200 border-amber-500/40'
                        : isLightMode
                          ? 'bg-orange-100/90 text-orange-900 border-orange-300'
                          : 'bg-orange-950/50 text-orange-200 border-orange-500/40'
                    }`}>
                      {item.stronger_agent_using
                        ? "A stronger agent is using the resource. Please wait until it's free."
                        : "Resources are completely used by other agents. Please wait for a while until resource is available."}
                    </div>
                    <div className="text-slate-500 text-[10px] leading-snug">
                      {item.priority_reason || 'Awaiting slot availability'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
