import React, { useState } from 'react';
import { SystemLog } from '../../types/orchestrator.js';
import { Terminal, Filter, ArrowDown } from 'lucide-react';

interface SystemLogViewerProps {
  logs: SystemLog[];
  isLightMode?: boolean;
}

export const SystemLogViewer: React.FC<SystemLogViewerProps> = ({ logs, isLightMode = false }) => {
  const [filter, setFilter] = useState<string>('ALL');

  const categories = ['ALL', 'ALLOCATION', 'RESERVATION', 'QUEUE', 'AGING', 'PREDICTION', 'FAILURE', 'WORKFLOW'];

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.category === filter);

  const getBadgeColor = (category: SystemLog['category']) => {
    switch (category) {
      case 'ALLOCATION': return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
      case 'RESERVATION': return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'QUEUE': return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'AGING': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'PREDICTION': return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
      case 'FAILURE': return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'WORKFLOW': return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-300';
    }
  };

  const getLevelDot = (level: SystemLog['level']) => {
    switch (level) {
      case 'SUCCESS': return 'bg-emerald-500';
      case 'WARN': return 'bg-amber-500';
      case 'ERROR': return 'bg-rose-500';
      case 'CONTROLLER': return 'bg-purple-500';
      default: return 'bg-sky-500';
    }
  };

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${
      isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
    }`}>
      {/* Header with category filters */}
      <div className={`p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
        isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-600" />
          <h4 className={`font-bold text-sm font-mono ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
            A3 Controller Runtime Event Stream
          </h4>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
            isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
          }`}>
            {filtered.length} entries
          </span>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-[10px]">
          <span className="text-slate-400 mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-0.5" />
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-1 rounded font-mono font-bold transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isLightMode
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className={`h-64 overflow-y-auto p-4 font-mono text-[11px] space-y-1.5 ${
        isLightMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-950 text-slate-200'
      }`}>
        {filtered.length === 0 ? (
          <div className="text-slate-600 text-center py-10 font-sans">
            No runtime events recorded for this category yet.
          </div>
        ) : (
          filtered.slice(-80).map((log, index) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            return (
              <div
                key={index}
                className="flex items-start space-x-2 py-0.5 hover:bg-slate-900/80 px-1 rounded transition"
              >
                <span className="text-slate-500 shrink-0 select-none text-[10px]">{timeStr}</span>
                <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${getLevelDot(log.level)}`} />
                <span className={`text-[9px] px-1.5 rounded border uppercase shrink-0 font-bold ${getBadgeColor(log.category)}`}>
                  {log.category}
                </span>
                {log.workflow_id && (
                  <span className="text-sky-400 shrink-0 font-bold">[{log.workflow_id}]</span>
                )}
                <span className="text-slate-300 break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
