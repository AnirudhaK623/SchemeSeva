import React from 'react';
import { ResourceState } from '../../types/orchestrator.js';
import { Cpu, Database, Wrench, Clock, Activity, Unlock, AlertCircle } from 'lucide-react';
import { releaseResourceManual } from '../../services/api.js';

interface ResourceCardProps {
  resource: ResourceState;
  isLightMode?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isLightMode = false }) => {
  const getIcon = () => {
    switch (resource.type) {
      case 'model': return <Cpu className="w-4 h-4 text-sky-500" />;
      case 'database': return <Database className="w-4 h-4 text-emerald-500" />;
      case 'service': return <Wrench className="w-4 h-4 text-amber-500" />;
    }
  };

  const getTypeBadge = () => {
    switch (resource.type) {
      case 'model': return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20';
      case 'database': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      case 'service': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
    }
  };

  const handleManualRelease = async () => {
    try {
      await releaseResourceManual(resource.resource_id);
    } catch (e) {
      console.error(e);
    }
  };

  // Build slot markers
  const slots = [];
  for (let i = 0; i < resource.capacity; i++) {
    if (i < resource.allocated_slots) {
      slots.push({ status: 'ALLOCATED', label: 'Allocated' });
    } else if (i < resource.allocated_slots + resource.reserved_slots) {
      slots.push({ status: 'RESERVED', label: 'Reserved' });
    } else {
      slots.push({ status: 'AVAILABLE', label: 'Available' });
    }
  }

  const isFull = resource.available_slots === 0;

  return (
    <div
      id={`resource-${resource.resource_id}`}
      className={`rounded-2xl border p-4 transition-all duration-200 shadow-sm ${
        isFull
          ? isLightMode
            ? 'bg-amber-50/70 border-amber-300 shadow-amber-500/10'
            : 'bg-slate-900/90 border-amber-500/40 shadow-amber-500/5'
          : isLightMode
            ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
            : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg border ${
            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
          }`}>
            {getIcon()}
          </div>
          <div>
            <h4 className={`font-bold text-xs leading-tight ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
              {resource.name}
            </h4>
            <div className="text-[10px] font-mono text-slate-500">{resource.resource_id}</div>
          </div>
        </div>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getTypeBadge()}`}>
          {resource.type}
        </span>
      </div>

      {/* Utilization Metric Bar */}
      <div className="space-y-1.5 my-3">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-slate-500">Capacity Load:</span>
          <span className={`font-bold ${
            isFull
              ? 'text-rose-600 dark:text-rose-400'
              : (resource.utilization_percentage || 0) > 60
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {(resource.utilization_percentage || 0).toFixed(0)}%
          </span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-slate-100' : 'bg-slate-800'}`}>
          <div
            className={`h-full transition-all duration-300 ${
              isFull
                ? 'bg-rose-500'
                : (resource.utilization_percentage || 0) > 60
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, resource.utilization_percentage || 0)}%` }}
          />
        </div>
      </div>

      {/* Visual Slot Distribution */}
      <div className="my-2.5">
        <div className="text-[10px] text-slate-500 mb-1 flex justify-between font-mono">
          <span>Slots ({resource.capacity}):</span>
          <span>{resource.available_slots} free</span>
        </div>
        <div className="flex gap-1">
          {slots.map((s, idx) => (
            <div
              key={idx}
              title={`${s.label} slot #${idx + 1}`}
              className={`h-4 flex-1 rounded text-[9px] font-mono flex items-center justify-center font-bold transition-all ${
                s.status === 'ALLOCATED'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : s.status === 'RESERVED'
                    ? 'bg-purple-500 text-white shadow-xs'
                    : isLightMode
                      ? 'bg-slate-100 text-slate-400 border border-slate-200'
                      : 'bg-slate-800 text-slate-600 border border-slate-700/50'
              }`}
            >
              {s.status === 'ALLOCATED' ? 'A' : s.status === 'RESERVED' ? 'R' : '·'}
            </div>
          ))}
        </div>
      </div>

      {/* Contention Message Banner */}
      {isFull && (
        <div className={`my-2 p-2 rounded-xl border text-[11px] leading-snug font-medium flex items-start space-x-1.5 ${
          resource.stronger_agent_using
            ? isLightMode
              ? 'bg-amber-100/80 border-amber-300 text-amber-900'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : isLightMode
              ? 'bg-orange-100/80 border-orange-300 text-orange-900'
              : 'bg-orange-950/40 border-orange-500/40 text-orange-200'
        }`}>
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {resource.stronger_agent_using
              ? "A stronger agent is using the resource. Please wait until it's free."
              : "Resources are completely used by other agents. Please wait for a while until resource is available."}
          </span>
        </div>
      )}

      {/* Footer Info */}
      <div className={`pt-2.5 mt-2.5 border-t text-[10px] flex items-center justify-between font-mono ${
        isLightMode ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
      }`}>
        <span className="flex items-center space-x-1">
          <Activity className="w-3 h-3 text-slate-400" />
          <span>Used: {resource.allocated_slots}/{resource.capacity}</span>
        </span>
        {resource.allocated_slots > 0 && (
          <button
            onClick={handleManualRelease}
            title="Manual release slot (Admin override)"
            className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-0.5 cursor-pointer font-sans"
          >
            <Unlock className="w-2.5 h-2.5" />
            <span>Release</span>
          </button>
        )}
      </div>
    </div>
  );
};
