import React, { useState } from 'react';
import { ControllerStatusResponse } from '../types/orchestrator.js';
import { ResourceCard } from './control-center/ResourceCard.js';
import { QueueTable } from './control-center/QueueTable.js';
import { ReservationTable } from './control-center/ReservationTable.js';
import { PredictionPanel } from './control-center/PredictionPanel.js';
import { SystemLogViewer } from './control-center/SystemLogViewer.js';
import { ResourceContentionArena } from './ResourceContentionArena.js';
import {
  Cpu,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Filter,
  CheckCircle2,
  Activity,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { startConcurrencyDemo, resetDemo, runScenario } from '../services/api.js';

interface ControlCenterPageProps {
  status: ControllerStatusResponse | null;
  isLightMode?: boolean;
}

export const ControlCenterPage: React.FC<ControlCenterPageProps> = ({ status, isLightMode = true }) => {
  const [isSurgeRunning, setIsSurgeRunning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showExplainer, setShowExplainer] = useState(true);
  const [resourceFilter, setResourceFilter] = useState<'ALL' | 'MODEL' | 'DATABASE' | 'SERVICE'>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const resources = status?.resources || [];
  const queue = status?.queue || [];
  const reservations = status?.reservations || [];
  const predictions = status?.predictions || [];
  const logs = status?.logs || [];
  const metrics = status?.metrics;

  const filteredResources = resourceFilter === 'ALL'
    ? resources
    : resources.filter((r) => {
        if (resourceFilter === 'MODEL') return r.type === 'model';
        if (resourceFilter === 'DATABASE') return r.type === 'database';
        if (resourceFilter === 'SERVICE') return r.type === 'service';
        return true;
      });

  const handleRunSurge = async () => {
    try {
      setIsSurgeRunning(true);
      setActionNotice('Launching 4 simultaneous citizen requests (Farmer, Artisan, Student, Senior) to stress-test priority queuing...');
      await startConcurrencyDemo();
      setTimeout(() => {
        setIsSurgeRunning(false);
        setActionNotice('4-Citizen Concurrency Rush active! Watch resources allocate, queue rank items, and aging prevent starvation.');
        setTimeout(() => setActionNotice(null), 6000);
      }, 1000);
    } catch (e) {
      setIsSurgeRunning(false);
      setActionNotice('Failed to start concurrency demo. Dev server might be reconnecting.');
    }
  };

  const handleRunEmergency = async () => {
    try {
      setActionNotice('Injecting High-Priority Emergency Flood Relief Workflow (Scenario A)...');
      await runScenario('A');
      setTimeout(() => {
        setActionNotice('Emergency Flood Relief request promoted to top of queue via statutory priority boost!');
        setTimeout(() => setActionNotice(null), 5000);
      }, 1000);
    } catch (e) {
      setActionNotice('Failed to trigger emergency scenario.');
    }
  };

  const handleResetOrchestrator = async () => {
    try {
      setIsResetting(true);
      setActionNotice('Resetting A3 Orchestrator state and clearing all locks...');
      await resetDemo();
      setTimeout(() => {
        setIsResetting(false);
        setActionNotice('A3 Orchestrator reset to clean baseline.');
        setTimeout(() => setActionNotice(null), 4000);
      }, 800);
    } catch (e) {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. USER-FRIENDLY A3 ORCHESTRATOR HEADER & LIVE INTERACTION BAR */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isLightMode
          ? 'bg-gradient-to-r from-emerald-50 via-sky-50 to-indigo-50 border-emerald-200 text-slate-800'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                A3 Autonomous Agent Architecture · Control Center
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                100% Operational
              </span>
            </div>
            <h2 className="text-xl font-black mt-1">
              Multi-Agent Resource Orchestration & Fair Scheduling
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Monitors and coordinates 6 welfare agents sharing 10 scarce computational tools (LLM tokens, OCR vision, Kutumba registries, DigiLocker). Guarantees zero citizen request drops through dynamic priority ranking and aging boosts.
            </p>
          </div>

          {/* Quick Evaluator Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunSurge}
              disabled={isSurgeRunning}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer min-h-[40px]"
            >
              <Zap className="w-4 h-4" />
              <span>{isSurgeRunning ? 'Dispatching 4 Citizens...' : 'Trigger 4-Citizen Surge'}</span>
            </button>

            <button
              onClick={handleRunEmergency}
              className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-600/20 cursor-pointer min-h-[40px]"
            >
              <Flame className="w-4 h-4" />
              <span>Simulate Urgent Relief</span>
            </button>

            <button
              onClick={handleResetOrchestrator}
              disabled={isResetting}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer min-h-[40px] ${
                isLightMode
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Friendly Explainer Drawer Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showExplainer ? 'Hide Orchestrator Guide' : 'What is the A3 Control Center? (Click to Learn)'}</span>
            {showExplainer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[11px] text-slate-500 font-mono">
            Scheduler Cycle: 200ms · Aging Factor: +0.5 / 5s
          </span>
        </div>

        {/* Friendly Explainer Drawer Content */}
        {showExplainer && (
          <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className={`p-3.5 rounded-xl border ${
              isLightMode ? 'bg-white/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="font-bold flex items-center space-x-1.5 text-sky-600 dark:text-sky-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span>1. Multi-Agent Concurrency</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                When hundreds of citizens access welfare schemes simultaneously, shared tools (like LLM quota) can saturate. A3 queues and balances calls across 10 managed resources.
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              isLightMode ? 'bg-white/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="font-bold flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Starvation Prevention</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Rural and low-bandwidth requests accumulate an "Aging Bonus" every 5 seconds. This guarantees that urgent citizen queries are never permanently blocked by background tasks.
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              isLightMode ? 'bg-white/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="font-bold flex items-center space-x-1.5 text-purple-600 dark:text-purple-400 mb-1">
                <Layers className="w-4 h-4" />
                <span>3. Proactive Reservations</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                The controller predicts what tool an agent will need next (e.g. Document Agent needing OCR) and reserves capacity ahead of time, eliminating mid-workflow stalls.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. REALTIME KPI RIBBON (HIGH CONTRAST & ADAPTIVE) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`rounded-2xl border p-4 flex items-center space-x-3.5 shadow-sm transition-all ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Active Workflows</div>
            <div className={`text-2xl font-black font-mono ${isLightMode ? 'text-slate-900' : 'text-slate-100'}`}>
              {metrics?.active_workflows || 0}
            </div>
            <div className="text-[10px] text-slate-400">Citizen journeys executing</div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 flex items-center space-x-3.5 shadow-sm transition-all ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Active Reservations</div>
            <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
              {reservations.filter((r) => r.status === 'ACTIVE' || r.status === 'PROMOTED').length}
            </div>
            <div className="text-[10px] text-slate-400">Guarded upcoming slots</div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 flex items-center space-x-3.5 shadow-sm transition-all ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Queued Requests</div>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {queue.length}
            </div>
            <div className="text-[10px] text-slate-400">Awaiting capacity slot</div>
          </div>
        </div>

        <div className={`rounded-2xl border p-4 flex items-center space-x-3.5 shadow-sm transition-all ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Starvation Preventions</div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {metrics?.starvation_promotions || 0}
            </div>
            <div className="text-[10px] text-slate-400">Rural aging promotions</div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-AGENT RESOURCE CONTENTION & SCHEDULING ARENA */}
      <ResourceContentionArena status={status} isLightMode={isLightMode} />

      {/* 4. 10 HETEROGENEOUS MANAGED RESOURCES WITH CATEGORY FILTER */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
          <div>
            <h3 className={`font-black text-base flex items-center space-x-2 ${
              isLightMode ? 'text-slate-900' : 'text-slate-100'
            }`}>
              <Cpu className="w-5 h-5 text-sky-600" />
              <span>Heterogeneous Managed AI Resources & Service Capacities</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Capacity invariants enforced by ResourceManager. (e.g. LLM slots: max 2 parallel instances).
            </p>
          </div>

          {/* Resource Filter Chips */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setResourceFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                resourceFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              All (10)
            </button>
            <button
              onClick={() => setResourceFilter('MODEL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                resourceFilter === 'MODEL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              AI & Models
            </button>
            <button
              onClick={() => setResourceFilter('DATABASE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                resourceFilter === 'DATABASE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Databases
            </button>
            <button
              onClick={() => setResourceFilter('SERVICE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                resourceFilter === 'SERVICE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Services
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 mt-5">
          {filteredResources.map((res) => (
            <ResourceCard key={res.resource_id} resource={res} isLightMode={isLightMode} />
          ))}
        </div>
      </div>

      {/* 5. LIVE PRIORITY QUEUE & ADVANCE RESERVATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QueueTable queue={queue} isLightMode={isLightMode} />
        <ReservationTable reservations={reservations} isLightMode={isLightMode} />
      </div>

      {/* 6. DEPENDENCY PREDICTION ENGINE */}
      <PredictionPanel predictions={predictions} isLightMode={isLightMode} />

      {/* 7. CONTROLLER RUNTIME EVENT LOG STREAM */}
      <SystemLogViewer logs={logs} isLightMode={isLightMode} />
    </div>
  );
};
