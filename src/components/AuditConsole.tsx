import React, { useState, useEffect } from 'react';
import { offlineSyncEngine, AuditLogEvent, AuditEventType } from '../services/offlineSyncEngine.js';
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  Trash2,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface AuditConsoleProps {
  isLightMode?: boolean;
}

export const AuditConsole: React.FC<AuditConsoleProps> = ({ isLightMode = false }) => {
  const [logs, setLogs] = useState<AuditLogEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  useEffect(() => {
    // Initial load
    setLogs(offlineSyncEngine.getAuditLogs());

    // Subscription
    const unsub = offlineSyncEngine.onAuditLog((newEvent) => {
      setLogs(prev => [newEvent, ...prev].slice(0, 100));
    });

    return unsub;
  }, []);

  const handleClear = () => {
    offlineSyncEngine.clearAuditLogs();
    setLogs([]);
  };

  const getEventBadge = (type: AuditEventType) => {
    switch (type) {
      case 'NETWORK_OFFLINE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">[NETWORK_OFFLINE]</span>;
      case 'NETWORK_ONLINE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">[NETWORK_ONLINE]</span>;
      case 'LOCAL_AGENT_EVALUATE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">[LOCAL_AGENT_EVALUATE]</span>;
      case 'QUEUE_ITEM_SAVED':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">[QUEUE_ITEM_SAVED]</span>;
      case 'AUTO_SYNC_RECOVERY_COMPLETE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">[AUTO_SYNC_RECOVERY_COMPLETE]</span>;
      case 'CACHE_DELTA_UPDATE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">[CACHE_DELTA_UPDATE]</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">[{type}]</span>;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'OFFLINE') return log.type === 'NETWORK_OFFLINE' || log.type === 'NETWORK_ONLINE';
    if (selectedFilter === 'AGENT') return log.type === 'LOCAL_AGENT_EVALUATE';
    if (selectedFilter === 'SYNC') return log.type === 'QUEUE_ITEM_SAVED' || log.type === 'AUTO_SYNC_RECOVERY_COMPLETE';
    return true;
  });

  return (
    <div
      id="offline-audit-console"
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 shadow-2xl border-t ${
        isLightMode
          ? 'bg-white/95 border-slate-300 text-slate-900 shadow-slate-300/50'
          : 'bg-slate-950/95 border-slate-800 text-slate-200 shadow-black/80'
      } backdrop-blur-md`}
    >
      {/* Console Top Header Bar */}
      <div className={`px-4 py-2 flex items-center justify-between border-b ${
        isLightMode ? 'border-slate-200 bg-slate-100/80' : 'border-slate-800/80 bg-slate-900/60'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs uppercase tracking-wider font-mono">
              A3 Offline Sync & Recovery Audit Console
            </span>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
            isLightMode ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
          }`}>
            {logs.length} Events Logged
          </span>
        </div>

        {/* Filter buttons & Toggles */}
        <div className="flex items-center space-x-2">
          {isExpanded && (
            <div className="hidden sm:flex items-center space-x-1 text-xs">
              {['ALL', 'OFFLINE', 'AGENT', 'SYNC'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedFilter === filter
                      ? isLightMode
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-emerald-500 text-slate-950 font-bold'
                      : isLightMode
                        ? 'text-slate-600 hover:bg-slate-200'
                        : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}

              <button
                onClick={handleClear}
                className={`p-1 rounded text-xs transition-colors ml-2 ${
                  isLightMode ? 'text-slate-500 hover:text-rose-600 hover:bg-slate-200' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                }`}
                title="Clear Audit Feed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded text-xs transition-colors flex items-center space-x-1 ${
              isLightMode ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
            title={isExpanded ? 'Minimize Console' : 'Expand Console'}
          >
            <span className="text-[10px] font-mono hidden md:inline">
              {isExpanded ? 'Minimize' : 'View Audit Stream'}
            </span>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Console Log Body */}
      {isExpanded && (
        <div className="max-h-52 overflow-y-auto font-mono text-xs p-3 space-y-1.5 divide-y divide-slate-800/40">
          {filteredLogs.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              No audit events logged yet. Toggle &ldquo;Simulate Network Disconnect&rdquo; in top bar to test offline evaluation and queue sync!
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="pt-1.5 first:pt-0 flex items-start space-x-2.5">
                <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div className="shrink-0">{getEventBadge(log.type)}</div>
                <div className="flex-1 break-all">
                  <span className={isLightMode ? 'text-slate-800 font-medium' : 'text-slate-200'}>
                    {log.message}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
