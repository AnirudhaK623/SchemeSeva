import {
  ControllerStatusResponse,
  UserProfile,
  Scheme,
  WorkflowInstance
} from '../types/orchestrator.js';

export async function fetchControllerStatus(): Promise<ControllerStatusResponse> {
  const res = await fetch('/api/controller/status');
  if (!res.ok) throw new Error('Failed to fetch controller status');
  return res.json();
}

export async function fetchSchemes(params?: { category?: string; state?: string; search?: string }): Promise<Scheme[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.state) query.set('state', params.state);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/schemes?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch schemes');
  return res.json();
}

export async function searchSchemes(query: string, profile?: UserProfile): Promise<{
  workflow_id: string;
  schemes: Scheme[];
  selected_scheme: Scheme;
  results: any;
}> {
  const res = await fetch('/api/schemes/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, profile })
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function analyzeProfile(profile: UserProfile, voiceInput?: string): Promise<any> {
  const res = await fetch('/api/profile/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, voiceInput })
  });
  if (!res.ok) throw new Error('Profile analysis failed');
  return res.json();
}

export async function startWorkflow(profile: UserProfile): Promise<{ workflow_id: string }> {
  const res = await fetch('/api/workflows/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile })
  });
  if (!res.ok) throw new Error('Failed to start workflow');
  return res.json();
}

export async function cancelWorkflow(workflowId: string, reason?: string): Promise<any> {
  const res = await fetch(`/api/workflows/${workflowId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('Failed to cancel workflow');
  return res.json();
}

export async function startConcurrencyDemo(): Promise<any> {
  const res = await fetch('/api/controller/demo/start', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start concurrency demo');
  return res.json();
}

export async function resetDemo(): Promise<any> {
  const res = await fetch('/api/controller/demo/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}

export async function runScenario(scenarioId: 'A' | 'B' | 'C' | 'D' | 'E'): Promise<any> {
  const res = await fetch(`/api/controller/scenarios/${scenarioId}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to run scenario ${scenarioId}`);
  return res.json();
}

export async function runAutomatedTestsApi(): Promise<{
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
  results: Array<{ id: number; title: string; passed: boolean; message: string }>;
}> {
  const res = await fetch('/api/tests/run');
  if (!res.ok) throw new Error('Failed to run automated tests');
  return res.json();
}

export async function releaseResourceManual(resourceId: string): Promise<any> {
  const res = await fetch(`/api/controller/resources/${resourceId}/release`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow_id: 'manual_admin', agent_id: 'dashboard' })
  });
  if (!res.ok) throw new Error('Failed to release resource');
  return res.json();
}
