import React from 'react';
import { ControllerStatusResponse, AgentStatus } from '../types/orchestrator.js';
import {
  Mic,
  Search,
  CheckCircle2,
  FileCheck,
  FileSpreadsheet,
  Languages,
  Clock,
  Cpu,
  ArrowRight,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface AgentDashboardProps {
  status: ControllerStatusResponse | null;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ status }) => {
  const activeWorkflows = status?.active_workflows || [];

  // Default definitions for the 6 agents
  const agentDefs = [
    {
      id: 'voice_profile_agent',
      name: 'Voice and Profile Agent',
      icon: Mic,
      description: 'Ingests voice/text queries, extracts citizen profile & intent',
      chain: ['speech_to_text', 'llm', 'translation_model']
    },
    {
      id: 'scheme_discovery_agent',
      name: 'Scheme Discovery Agent',
      icon: Search,
      description: 'Vector embeddings, semantic search, and match justification',
      chain: ['embedding_model', 'vector_db', 'llm']
    },
    {
      id: 'eligibility_agent',
      name: 'Eligibility Verification Agent',
      icon: CheckCircle2,
      description: 'Rule-by-rule eligibility matching against government criteria',
      chain: ['eligibility_db', 'llm']
    },
    {
      id: 'document_agent',
      name: 'Document Intelligence Agent',
      icon: FileCheck,
      description: 'PDF parsing, OCR extraction, and document certificate check',
      chain: ['pdf_parser', 'ocr_service', 'document_db', 'llm']
    },
    {
      id: 'application_agent',
      name: 'Application Assistance Agent',
      icon: FileSpreadsheet,
      description: 'Pre-fills application drafts, validates fields, readiness %',
      chain: ['document_db', 'form_validation', 'llm']
    },
    {
      id: 'explanation_agent',
      name: 'Local Language Explanation Agent',
      icon: Languages,
      description: 'Explains schemes in English, Kannada, Hindi, and Malayalam',
      chain: ['translation_model', 'llm']
    }
  ];

  // Helper to find the latest active agent instance across workflows
  const getLatestAgentInfo = (agentId: string) => {
    // Check running workflows first
    for (const wf of activeWorkflows) {
      if (wf.agents && wf.agents[agentId]) {
        return { info: wf.agents[agentId], workflow: wf };
      }
    }
    return null;
  };

  const getStatusBadge = (agentStatus: AgentStatus) => {
    switch (agentStatus) {
      case 'RUNNING':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse';
      case 'QUEUED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'RESERVED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'WAITING':
      case 'REQUESTING_RESOURCE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'FAILED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 4-User Concurrency Workflows Overview Bar */}
      {activeWorkflows.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Active Citizen Workflows ({activeWorkflows.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              LLM Capacity Invariant: Max 2 active allocations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeWorkflows.map((wf) => {
              const completedCount = Object.values(wf.agents).filter(a => a.status === 'COMPLETED').length;
              const overallProgress = Math.round((completedCount / 6) * 100);

              return (
                <div
                  key={wf.workflow_id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-sky-400">{wf.workflow_id}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                      wf.status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      wf.status === 'RUNNING' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {wf.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 truncate">{wf.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{wf.profile.occupation} · {wf.profile.state}</div>

                  {/* Stage Progress */}
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Stage {wf.current_stage_index}/6</span>
                      <span className="font-mono">{overallProgress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6 AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentDefs.map((agent) => {
          const Icon = agent.icon;
          const live = getLatestAgentInfo(agent.id);
          const currentStatus: AgentStatus = live?.info.status || 'IDLE';

          return (
            <div
              key={agent.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sky-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{agent.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{agent.description}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between my-3 py-1.5 px-2.5 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400">Status:</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(currentStatus)}`}>
                    {currentStatus}
                  </span>
                </div>

                {/* Current Task */}
                <div className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50 mb-3 min-h-[50px] flex items-center">
                  <span className="text-slate-400 font-sans mr-1 font-semibold">Task:</span>
                  <span className="text-slate-200">
                    {live?.info.current_task || 'Awaiting dispatch...'}
                  </span>
                </div>

                {/* Contention / Waiting Banner if Queued or Waiting */}
                {(currentStatus === 'QUEUED' || currentStatus === 'WAITING' || currentStatus === 'REQUESTING_RESOURCE') && (
                  <div className="mb-3 p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-medium text-amber-300 flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                    <span>
                      {live?.info.current_task?.includes('stronger')
                        ? "A stronger agent is using the resource. Please wait until it's free."
                        : "Resources are completely used by other agents. Please wait for a while until resource is available."}
                    </span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span>Progress</span>
                    <span>{live?.info.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${live?.info.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Resource Routing Telemetry */}
                <div className="space-y-1.5 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Active Resource:</span>
                    <span className={`font-bold ${live?.info.current_resource ? 'text-sky-400' : 'text-slate-500'}`}>
                      {live?.info.current_resource || 'None'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Predicted Next:</span>
                    <span className={`font-bold ${live?.info.predicted_next_resource ? 'text-purple-400' : 'text-slate-500'}`}>
                      {live?.info.predicted_next_resource || 'None'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Future Lookahead:</span>
                    <span className={`font-bold ${live?.info.future_resource ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {live?.info.future_resource || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer with Canonical Chain */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Dependency Chain:</span>
                <div className="flex items-center space-x-1 font-mono">
                  {agent.chain.map((c, i) => (
                    <span key={i} className="text-slate-300">
                      {c.split('_')[0]}
                      {i < agent.chain.length - 1 && <span className="text-slate-600 ml-1">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
