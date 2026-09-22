import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ControllerStatusResponse } from '../types/orchestrator.js';
import { Layers, Info, CheckCircle2, Clock, Bookmark, AlertCircle, Play } from 'lucide-react';

interface ServiceGraphViewProps {
  status: ControllerStatusResponse | null;
}

export const ServiceGraphView: React.FC<ServiceGraphViewProps> = ({ status }) => {
  // Build nodes and edges dynamically based on controller status
  const { nodes, edges } = useMemo(() => {
    if (!status) return { nodes: [], edges: [] };

    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    // Map active allocations & reservations
    const allocatedResources = new Set<string>();
    const reservedResources = new Set<string>();
    const queuedResources = new Set<string>();

    for (const r of status.resources) {
      if (r.allocated_slots > 0) allocatedResources.add(r.resource_id);
      if (r.reserved_slots > 0) reservedResources.add(r.resource_id);
      if (r.queue_length > 0) queuedResources.add(r.resource_id);
    }

    // Identify active agents from active workflows
    const activeAgentStates: Record<string, { status: string; current_resource?: string | null; predicted?: string | null }> = {};
    for (const wf of status.active_workflows) {
      for (const [agentId, a] of Object.entries(wf.agents)) {
        if (a.status !== 'IDLE' && a.status !== 'COMPLETED') {
          activeAgentStates[agentId] = {
            status: a.status,
            current_resource: a.current_resource,
            predicted: a.predicted_next_resource
          };
        }
      }
    }

    // 1. Six Agent Nodes on Left Column (x: 50)
    const agentConfigs = [
      { id: 'voice_profile_agent', label: '1. Voice & Profile Agent', y: 40 },
      { id: 'scheme_discovery_agent', label: '2. Scheme Discovery Agent', y: 150 },
      { id: 'eligibility_agent', label: '3. Eligibility Agent', y: 260 },
      { id: 'document_agent', label: '4. Document Intelligence Agent', y: 370 },
      { id: 'application_agent', label: '5. Application Assistance Agent', y: 480 },
      { id: 'explanation_agent', label: '6. Local Language Agent', y: 590 }
    ];

    agentConfigs.forEach((ag) => {
      const liveState = activeAgentStates[ag.id];
      const isRunning = liveState && (liveState.status === 'RUNNING' || liveState.status === 'REQUESTING_RESOURCE');
      const isQueued = liveState && liveState.status === 'QUEUED';

      nodeList.push({
        id: ag.id,
        position: { x: 50, y: ag.y },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        data: {
          label: (
            <div className="text-left font-sans">
              <div className="font-bold text-xs text-white">{ag.label}</div>
              <div className="text-[10px] mt-0.5 flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-sky-400 animate-pulse' :
                  isQueued ? 'bg-amber-400 animate-ping' :
                  'bg-slate-600'
                }`} />
                <span className={isRunning ? 'text-sky-300 font-semibold' : isQueued ? 'text-amber-300' : 'text-slate-400'}>
                  {liveState ? liveState.status : 'Standby / Ready'}
                </span>
              </div>
            </div>
          )
        },
        style: {
          background: isRunning ? 'rgba(14, 165, 233, 0.15)' : isQueued ? 'rgba(245, 158, 11, 0.15)' : '#0f172a',
          border: isRunning ? '2px solid #38bdf8' : isQueued ? '2px solid #fbbf24' : '1px solid #334155',
          borderRadius: '10px',
          padding: '10px 14px',
          width: 220,
          boxShadow: isRunning ? '0 0 15px rgba(56, 189, 248, 0.3)' : undefined
        }
      });
    });

    // 2. Resource Nodes on Right Column (x: 480)
    const resourceConfigs = [
      { id: 'speech_to_text', label: 'Speech-to-Text', cap: 1, y: 30 },
      { id: 'embedding_model', label: 'Embedding Model', cap: 1, y: 110 },
      { id: 'vector_db', label: 'Vector Database', cap: 1, y: 190 },
      { id: 'eligibility_db', label: 'Eligibility DB', cap: 2, y: 270 },
      { id: 'pdf_parser', label: 'PDF Parser', cap: 2, y: 350 },
      { id: 'ocr_service', label: 'OCR Service', cap: 1, y: 430 },
      { id: 'document_db', label: 'Document DB', cap: 2, y: 510 },
      { id: 'form_validation', label: 'Form Validation', cap: 2, y: 590 },
      { id: 'translation_model', label: 'Translation Model', cap: 1, y: 670 },
      { id: 'llm', label: 'Large Language Model (LLM)', cap: 2, y: 750, isHub: true }
    ];

    resourceConfigs.forEach((res) => {
      const isAllocated = allocatedResources.has(res.id);
      const isReserved = reservedResources.has(res.id);
      const isQueued = queuedResources.has(res.id);

      const rState = status.resources.find(r => r.resource_id === res.id);
      const allocCount = rState?.allocated_slots || 0;
      const resCount = rState?.reserved_slots || 0;

      nodeList.push({
        id: `res-${res.id}`,
        position: { x: res.isHub ? 520 : 500, y: res.y },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        data: {
          label: (
            <div className="text-left font-sans">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{res.label}</span>
                <span className="text-[10px] font-mono text-slate-400">Cap: {res.cap}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                <span className={isAllocated ? 'text-sky-400 font-bold' : ''}>
                  Alloc: {allocCount}/{res.cap}
                </span>
                {resCount > 0 && (
                  <span className="text-purple-400 font-bold">
                    Res: {resCount}
                  </span>
                )}
                {isQueued && (
                  <span className="text-amber-400 font-bold">
                    Q: {rState?.queue_length}
                  </span>
                )}
              </div>
            </div>
          )
        },
        style: {
          background: isAllocated ? 'rgba(14, 165, 233, 0.18)' : isReserved ? 'rgba(168, 85, 247, 0.18)' : '#0f172a',
          border: isAllocated ? '2px solid #38bdf8' : isReserved ? '2px solid #c084fc' : isQueued ? '2px solid #f59e0b' : '1px solid #334155',
          borderRadius: '10px',
          padding: '10px 14px',
          width: res.isHub ? 240 : 210,
          boxShadow: isAllocated ? '0 0 15px rgba(56, 189, 248, 0.3)' : isReserved ? '0 0 15px rgba(192, 132, 252, 0.3)' : undefined
        }
      });
    });

    // 3. Edges mapping Agent Dependencies to Resources
    const dependencyMap: Array<{ agent: string; resource: string; label?: string }> = [
      // Voice & Profile
      { agent: 'voice_profile_agent', resource: 'speech_to_text' },
      { agent: 'voice_profile_agent', resource: 'llm' },
      { agent: 'voice_profile_agent', resource: 'translation_model' },

      // Scheme Discovery
      { agent: 'scheme_discovery_agent', resource: 'embedding_model' },
      { agent: 'scheme_discovery_agent', resource: 'vector_db' },
      { agent: 'scheme_discovery_agent', resource: 'llm' },

      // Eligibility
      { agent: 'eligibility_agent', resource: 'eligibility_db' },
      { agent: 'eligibility_agent', resource: 'llm' },

      // Document Intelligence
      { agent: 'document_agent', resource: 'pdf_parser' },
      { agent: 'document_agent', resource: 'ocr_service' },
      { agent: 'document_agent', resource: 'document_db' },
      { agent: 'document_agent', resource: 'llm' },

      // Application Assistance
      { agent: 'application_agent', resource: 'document_db' },
      { agent: 'application_agent', resource: 'form_validation' },
      { agent: 'application_agent', resource: 'llm' },

      // Local Language
      { agent: 'explanation_agent', resource: 'translation_model' },
      { agent: 'explanation_agent', resource: 'llm' }
    ];

    dependencyMap.forEach((dep, idx) => {
      const liveAgent = activeAgentStates[dep.agent];
      const isCurrentlyActive = liveAgent && liveAgent.current_resource === dep.resource;
      const isPredicted = liveAgent && liveAgent.predicted === dep.resource;

      edgeList.push({
        id: `e-${dep.agent}-${dep.resource}-${idx}`,
        source: dep.agent,
        target: `res-${dep.resource}`,
        animated: isCurrentlyActive || isPredicted,
        style: {
          stroke: isCurrentlyActive ? '#38bdf8' : isPredicted ? '#c084fc' : '#334155',
          strokeWidth: isCurrentlyActive ? 3 : isPredicted ? 2 : 1,
          opacity: isCurrentlyActive || isPredicted ? 1.0 : 0.4
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCurrentlyActive ? '#38bdf8' : isPredicted ? '#c084fc' : '#475569'
        }
      });
    });

    return { nodes: nodeList, edges: edgeList };
  }, [status]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[760px]">
      {/* Header with Legend */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              Runtime Service-Graph Dependency Topology
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300">
              React Flow Live Graph
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual map of agents, tools, capacity slots, and active dynamic reservations
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-300">
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>Running / Allocated</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Reserved</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Queued</span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span>Available / Idle</span>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 w-full h-full bg-slate-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          colorMode="dark"
          minZoom={0.6}
          maxZoom={1.4}
        >
          <Background color="#1e293b" gap={16} size={1} />
          <Controls className="bg-slate-900 border-slate-800 fill-slate-200" />
          <MiniMap
            nodeColor={(node) => {
              if (node.id.startsWith('res-')) return '#0284c7';
              return '#475569';
            }}
            className="bg-slate-900 border-slate-800 rounded-lg overflow-hidden"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
