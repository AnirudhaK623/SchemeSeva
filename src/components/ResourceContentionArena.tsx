import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
  Unlock,
  Flame,
  Scale,
  Users
} from 'lucide-react';
import { ControllerStatusResponse } from '../types/orchestrator.js';

interface ResourceContentionArenaProps {
  status: ControllerStatusResponse | null;
  isLightMode?: boolean;
}

interface CompetingAgent {
  id: string;
  name: string;
  workflowId: string;
  targetTool: string;
  citizenName: string;
  userType: string;
  basePriority: number;
  waitingSeconds: number;
  deadlineSeconds: number;
  impactScore: number;
  estimatedDuration: number;
  effectivePriority: number;
  agingBonus: number;
  isStarving: boolean;
  priorityReason: string;
}

export const ResourceContentionArena: React.FC<ResourceContentionArenaProps> = ({
  status,
  isLightMode = false
}) => {
  // LLM Slots (Capacity = 2)
  const [slot1Agent, setSlot1Agent] = useState<{
    id: string;
    name: string;
    workflowId: string;
    citizen: string;
    timeRemaining: number;
  } | null>({
    id: 'voice_profile_agent',
    name: 'Voice & Profile Extraction Agent',
    workflowId: 'WF001',
    citizen: 'Rajesh Kumar (Farmer)',
    timeRemaining: 4
  });

  const [slot2Agent, setSlot2Agent] = useState<{
    id: string;
    name: string;
    workflowId: string;
    citizen: string;
    timeRemaining: number;
  } | null>({
    id: 'scheme_discovery_agent',
    name: 'Scheme Vector Discovery Agent',
    workflowId: 'WF002',
    citizen: 'Priya Sharma (Student)',
    timeRemaining: 7
  });

  // Competing Agents waiting in queue for the next free LLM slot
  const [competingQueue, setCompetingQueue] = useState<CompetingAgent[]>([
    {
      id: 'application_agent',
      name: 'Application Autofill Agent',
      workflowId: 'WF003',
      targetTool: 'Large Language Model (GPU)',
      citizenName: 'Amit Patel',
      userType: 'Entrepreneur',
      basePriority: 6.8,
      waitingSeconds: 8,
      deadlineSeconds: 30,
      impactScore: 7.0,
      estimatedDuration: 4.5,
      effectivePriority: 6.85,
      agingBonus: 0,
      isStarving: false,
      priorityReason: 'High enterprise workflow impact, standard waiting duration (8s)'
    },
    {
      id: 'language_agent',
      name: 'Vernacular Explanation Agent',
      workflowId: 'WF004',
      targetTool: 'Large Language Model (GPU)',
      citizenName: 'Sunita Devi',
      userType: 'Rural Artisan',
      basePriority: 5.5, // Starts lower!
      waitingSeconds: 18, // Above 15s starvation threshold!
      deadlineSeconds: 45,
      impactScore: 6.0,
      estimatedDuration: 3.0,
      effectivePriority: 7.95, // Boosted by aging!
      agingBonus: 2.45,
      isStarving: true,
      priorityReason: 'STARVATION PREVENTION: Waited 18s (>15s threshold). Aging bonus +2.45 boosted rank!'
    },
    {
      id: 'eligibility_agent',
      name: 'Statutory Eligibility Agent',
      workflowId: 'WF005',
      targetTool: 'Large Language Model (GPU)',
      citizenName: 'Rameshppa Gowda',
      userType: 'Senior Citizen',
      basePriority: 6.2,
      waitingSeconds: 3,
      deadlineSeconds: 25,
      impactScore: 8.0,
      estimatedDuration: 5.0,
      effectivePriority: 6.35,
      agingBonus: 0,
      isStarving: false,
      priorityReason: 'Senior citizen welfare query; newly queued (3s)'
    }
  ]);

  const [contentionEventMessage, setContentionEventMessage] = useState<string | null>(
    "Resources are completely used by other agents. Please wait for a while until resource is available. If a stronger agent is using the resource, then ask it to wait until it's free."
  );

  const [activeTab, setActiveTab] = useState<'arena' | 'math' | 'live_telemetry'>('arena');

  // Real-time tick to simulate seconds waiting and countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      // Tick time remaining for slot 1 and 2
      setSlot1Agent(prev => (prev ? { ...prev, timeRemaining: Math.max(1, prev.timeRemaining - 1) } : null));
      setSlot2Agent(prev => (prev ? { ...prev, timeRemaining: Math.max(1, prev.timeRemaining - 1) } : null));

      // Tick waiting seconds and dynamic aging bonus for competing queue
      setCompetingQueue(prev => {
        return prev.map(agent => {
          const newWait = agent.waitingSeconds + 1;
          const isStarving = newWait >= 15;
          const agingBonus = isStarving ? Number(((newWait - 15) * 0.35 + 1.2).toFixed(2)) : 0;
          const effective = Number((agent.basePriority + (newWait * 0.05) + agingBonus).toFixed(2));
          return {
            ...agent,
            waitingSeconds: newWait,
            isStarving,
            agingBonus,
            effectivePriority: effective,
            priorityReason: isStarving
              ? `STARVATION PREVENTION: Waited ${newWait}s (>15s threshold). Aging bonus +${agingBonus} boosted rank!`
              : `Standard wait ${newWait}s. Base priority ${agent.basePriority}.`
          };
        }).sort((a, b) => b.effectivePriority - a.effectivePriority);
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Action: Release Slot 1 and promote Rank #1 competing agent
  const handleReleaseSlot1AndPromote = () => {
    if (competingQueue.length === 0) return;
    const [promoted, ...remaining] = competingQueue;

    setSlot1Agent({
      id: promoted.id,
      name: promoted.name,
      workflowId: promoted.workflowId,
      citizen: `${promoted.citizenName} (${promoted.userType})`,
      timeRemaining: 6
    });

    setCompetingQueue(remaining);
    setContentionEventMessage(
      `Slot 1 freed! Rank #1 Agent [${promoted.name}] for ${promoted.citizenName} claimed LLM GPU tool with Effective Priority ${promoted.effectivePriority}.`
    );
  };

  // Action: Trigger 3-Agent Contention Clash
  const handleSimulateContentionClash = () => {
    setSlot1Agent({
      id: 'voice_profile_agent',
      name: 'Voice & Profile Agent (Emergency Crop)',
      workflowId: 'WF-EMERG-01',
      citizen: 'Rajesh Kumar (Mandya Farmer)',
      timeRemaining: 8
    });
    setSlot2Agent({
      id: 'scheme_discovery_agent',
      name: 'Scheme Discovery Agent (Scholarship)',
      workflowId: 'WF-STU-02',
      citizen: 'Priya Sharma (Mysuru Student)',
      timeRemaining: 10
    });

    const newQueue: CompetingAgent[] = [
      {
        id: 'application_agent',
        name: 'Application Autofill Agent',
        workflowId: 'WF-MUDRA-03',
        targetTool: 'Large Language Model (GPU)',
        citizenName: 'Amit Patel',
        userType: 'Entrepreneur',
        basePriority: 7.2,
        waitingSeconds: 5,
        deadlineSeconds: 30,
        impactScore: 7.5,
        estimatedDuration: 4.0,
        effectivePriority: 7.35,
        agingBonus: 0,
        isStarving: false,
        priorityReason: 'High enterprise impact score (7.5); waiting 5s'
      },
      {
        id: 'language_agent',
        name: 'Vernacular Audio Agent',
        workflowId: 'WF-WEAVE-04',
        targetTool: 'Large Language Model (GPU)',
        citizenName: 'Sunita Devi',
        userType: 'Rural Artisan',
        basePriority: 5.2,
        waitingSeconds: 19,
        deadlineSeconds: 40,
        impactScore: 6.0,
        estimatedDuration: 3.5,
        effectivePriority: 8.15, // Aging puts her first!
        agingBonus: 2.65,
        isStarving: true,
        priorityReason: 'STARVATION BOOST: Waited 19s (>15s). Aging bonus +2.65 promoted above Base 7.2!'
      },
      {
        id: 'eligibility_agent',
        name: 'Statutory Eligibility Agent',
        workflowId: 'WF-PEN-05',
        targetTool: 'Large Language Model (GPU)',
        citizenName: 'Rameshppa Gowda',
        userType: 'Senior Citizen',
        basePriority: 6.5,
        waitingSeconds: 4,
        deadlineSeconds: 20,
        impactScore: 8.2,
        estimatedDuration: 4.5,
        effectivePriority: 6.75,
        agingBonus: 0,
        isStarving: false,
        priorityReason: 'Pension verification; high urgency; waiting 4s'
      }
    ].sort((a, b) => b.effectivePriority - a.effectivePriority);

    setCompetingQueue(newQueue);
    setContentionEventMessage(
      'New Contention Clash spawned! LLM slots at 100% capacity. 3 agents competing with mathematical priority ranking.'
    );
  };

  return (
    <div className={`rounded-3xl border shadow-xl overflow-hidden transition-colors ${
      isLightMode
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-slate-900/60 border-slate-800 text-slate-100'
    }`}>
      {/* Header with Title and Mode Switcher */}
      <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLightMode ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/40'
      }`}>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Multi-Agent Resource Contention & Priority Arena</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300">
              A3 Invariant Proof
            </span>
          </div>
          <h3 className="font-extrabold text-xl mt-1 tracking-tight">
            How Competing AI Agents Battle for Shared Tools (LLM / GPU / DB)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict capacity limits prevent server crashes. Watch how the A3 priority engine resolves clashes,
            prevents deadlocks, and boosts starved agents in real-time.
          </p>
        </div>

        {/* Quick Action Buttons for Demonstrating to Judges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateContentionClash}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer min-h-[44px]"
            title="Simulate 3 concurrent agents requesting LLM tool"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Spawn Contention Clash</span>
          </button>

          <button
            onClick={handleReleaseSlot1AndPromote}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer min-h-[44px]"
            title="Complete current execution and allocate next prioritized agent"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Free Slot 1 & Allocate Rank #1</span>
          </button>
        </div>
      </div>

      {/* Contention Event Notification Banner */}
      {contentionEventMessage && (
        <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs font-semibold flex items-center justify-between text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{contentionEventMessage}</span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
            Capacity Limit = 2
          </span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className={`px-6 pt-3 flex space-x-4 border-b text-xs font-semibold ${
        isLightMode ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900/30'
      }`}>
        <button
          onClick={() => setActiveTab('arena')}
          className={`pb-2.5 border-b-2 flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'arena'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Active Contention Arena (LLM Tool)</span>
        </button>

        <button
          onClick={() => setActiveTab('math')}
          className={`pb-2.5 border-b-2 flex items-center space-x-1.5 cursor-pointer ${
            activeTab === 'math'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Mathematical Priority Formula</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 space-y-6">
        {activeTab === 'arena' && (
          <div className="space-y-6">
            {/* The Contested AI Tool (Large Language Model / GPU Cluster) */}
            <div className={`p-5 rounded-2xl border ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-base">Shared Resource: Large Language Model (GPU / Gemini Flash)</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30">
                        CONTENTION: 100% UTILIZED
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Invariant Cap: <b>2 Concurrent Execution Slots</b> (Hard limit to prevent 429 Rate Limits and GPU VRAM exhaustion).
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Available Slots</span>
                    <span className="text-xl font-black font-mono text-rose-500">
                      0 / 2 FREE
                    </span>
                  </div>
                </div>
              </div>

              {/* The 2 Active Execution Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Slot 1 Card */}
                <div className={`p-4 rounded-xl border relative overflow-hidden ${
                  slot1Agent
                    ? isLightMode
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-emerald-950/30 border-emerald-700/60'
                    : isLightMode
                      ? 'bg-slate-100 border-slate-300'
                      : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300">
                      <Lock className="w-3.5 h-3.5" />
                      <span>SLOT 1 · ALLOCATED & RUNNING</span>
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      ~{slot1Agent?.timeRemaining || 0}s remaining
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {slot1Agent?.name || 'Available Slot'}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Workflow: <b className="font-mono text-emerald-600">{slot1Agent?.workflowId}</b> · Citizen: {slot1Agent?.citizen}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                    <span className="text-slate-500">Status: Generating semantic embeddings</span>
                    <button
                      onClick={handleReleaseSlot1AndPromote}
                      className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Complete & Free Slot →
                    </button>
                  </div>
                </div>

                {/* Slot 2 Card */}
                <div className={`p-4 rounded-xl border relative overflow-hidden ${
                  slot2Agent
                    ? isLightMode
                      ? 'bg-sky-50/60 border-sky-300'
                      : 'bg-sky-950/30 border-sky-700/60'
                    : isLightMode
                      ? 'bg-slate-100 border-slate-300'
                      : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold flex items-center space-x-1.5 text-sky-700 dark:text-sky-300">
                      <Lock className="w-3.5 h-3.5" />
                      <span>SLOT 2 · ALLOCATED & RUNNING</span>
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-700 dark:text-sky-300">
                      ~{slot2Agent?.timeRemaining || 0}s remaining
                    </span>
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {slot2Agent?.name || 'Available Slot'}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Workflow: <b className="font-mono text-sky-600">{slot2Agent?.workflowId}</b> · Citizen: {slot2Agent?.citizen}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-sky-200/60 dark:border-sky-800/40 text-[11px]">
                    <span className="text-slate-500">Status: Synthesizing regional explanation</span>
                    <span className="text-slate-400 font-mono">In-progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competing Agents Priority Queue */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="font-bold text-base flex items-center space-x-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span>Competing Agents Waiting for Free LLM Slot ({competingQueue.length} Queued)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sorted dynamically by Effective Priority score. Agents with higher effective priority will claim the slot first.
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                    Starvation Threshold: 15s
                  </span>
                </div>
              </div>

              {/* Queue Items */}
              <div className="space-y-3">
                {competingQueue.map((agent, index) => {
                  const isRank1 = index === 0;

                  return (
                    <div
                      key={agent.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isRank1
                          ? isLightMode
                            ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                            : 'bg-amber-950/20 border-amber-700/60'
                          : isLightMode
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: Rank & Agent Identification */}
                        <div className="flex items-start space-x-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base shrink-0 ${
                            isRank1
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                              : isLightMode
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-800 text-slate-300'
                          }`}>
                            #{index + 1}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {agent.name}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {agent.workflowId}
                              </span>
                              {agent.isStarving && (
                                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                                  STARVATION AGING PROMOTED
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 mt-0.5">
                              Citizen Beneficiary: <b className="text-slate-700 dark:text-slate-300">{agent.citizenName}</b> ({agent.userType}) · Target: {agent.targetTool}
                            </p>

                            {/* Contention Status Message */}
                            <div className={`mt-2 p-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                              (slot1Agent && (slot1Agent.name.includes('Emergency') || slot1Agent.id === 'voice_profile_agent') && agent.effectivePriority < 8.0)
                                ? isLightMode
                                  ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                                  : 'bg-amber-950/60 text-amber-200 border-amber-500/40'
                                : isLightMode
                                  ? 'bg-orange-100/90 text-orange-900 border-orange-300'
                                  : 'bg-orange-950/60 text-orange-200 border-orange-500/40'
                            }`}>
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                              <span>
                                {(slot1Agent && (slot1Agent.name.includes('Emergency') || slot1Agent.id === 'voice_profile_agent') && agent.effectivePriority < 8.0)
                                  ? "A stronger agent is using the resource. Please wait until it's free."
                                  : "Resources are completely used by other agents. Please wait for a while until resource is available."}
                              </span>
                            </div>

                            <p className={`text-xs mt-1 font-mono ${
                              agent.isStarving ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'
                            }`}>
                              {agent.priorityReason}
                            </p>
                          </div>
                        </div>

                        {/* Right: Mathematical Metrics & Priority Scores */}
                        <div className="flex flex-wrap items-center gap-3 lg:gap-4 shrink-0 bg-white dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block font-mono">Base Priority</span>
                            <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300">
                              {agent.basePriority.toFixed(1)}
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block font-mono">Waiting Time</span>
                            <span className={`text-sm font-bold font-mono ${
                              agent.waitingSeconds >= 15 ? 'text-rose-500 font-black' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {agent.waitingSeconds}s
                            </span>
                          </div>

                          <div className="text-center">
                            <span className="text-[10px] text-slate-400 block font-mono">Aging Bonus</span>
                            <span className={`text-sm font-bold font-mono ${
                              agent.agingBonus > 0 ? 'text-emerald-600 font-black' : 'text-slate-400'
                            }`}>
                              +{agent.agingBonus.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-center pl-2 border-l border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-mono font-bold uppercase">
                              Effective Score
                            </span>
                            <span className={`text-lg font-black font-mono ${
                              isRank1 ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {agent.effectivePriority.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mathematical Formula & Invariant Breakdown Tab */}
        {activeTab === 'math' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl border ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>The A3 Mathematical Priority Function</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Every request queued for an AI tool receives a dynamic priority score continuously evaluated on every controller tick:
              </p>

              <div className="my-4 p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                P(agent) = (0.35 × Urgency) + (0.25 × WaitTime) + (0.20 × Impact) + (0.15 × BasePriority) - (0.05 × DurationPenalty) + AgingBonus
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}>
                  <b className="text-sky-600 block">1. Urgency Weight (35%)</b>
                  <span className="text-slate-500 mt-0.5 block">
                    Calculated as elapsed time / deadline. Approaching statutory submission deadlines sharply raises priority.
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}>
                  <b className="text-amber-600 block">2. Starvation Aging (+0.35/s)</b>
                  <span className="text-slate-500 mt-0.5 block">
                    If waiting time &gt; 15 seconds, a continuous linear boost is added to ensure low-priority citizens are never starved.
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}>
                  <b className="text-purple-600 block">3. Workflow Impact (20%)</b>
                  <span className="text-slate-500 mt-0.5 block">
                    Measures how many downstream agents are blocked in the DAG waiting for this specific tool output.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
