import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { A3RuntimeController } from './server/controller/runtime_controller.js';
import { MOCK_SCHEMES } from './server/data/schemes.js';
import { AGENT_DEPENDENCY_CHAINS, RESOURCE_NAMES } from './server/controller/dependency_predictor.js';
import { runAutomatedTests } from './server/tests/automated_tests.js';
import { UserProfile } from './src/types/orchestrator.js';

dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json());

// Initialize the central A3 Runtime Controller
const controller = new A3RuntimeController();

// WebSocket server setup
const wss = new WebSocketServer({ server, path: '/ws/runtime' });

wss.on('connection', (ws: WebSocket) => {
  // Send current state on connection
  try {
    ws.send(JSON.stringify({ type: 'STATUS_UPDATE', data: controller.getStatus() }));
  } catch (e) {
    console.error('Error sending initial WS message:', e);
  }

  ws.on('message', (msg: string) => {
    try {
      const parsed = JSON.parse(msg.toString());
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch {}
  });
});

// Broadcast state changes to all connected WebSocket clients
controller.subscribe((status) => {
  const payload = JSON.stringify({ type: 'STATUS_UPDATE', data: status });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('WS broadcast error:', err);
      }
    }
  }
});

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SchemeSeva A3 Runtime Controller',
    timestamp: new Date().toISOString()
  });
});

// 2. Profile endpoints
app.get('/api/profile/default', (req, res) => {
  const defaultProfile: UserProfile = {
    name: 'Rajesh Kumar',
    age: 38,
    gender: 'Male',
    state: 'Karnataka',
    district: 'Mandya',
    occupation: 'Farmer',
    annual_income: 180000,
    category: 'OBC',
    user_type: 'Farmer',
    preferred_language: 'Kannada',
    user_query: 'Agricultural crop loan, irrigation subsidy and PM-KISAN'
  };
  res.json(defaultProfile);
});

app.post('/api/profile/analyze', async (req, res) => {
  try {
    const profile: UserProfile = req.body.profile || req.body;
    const voiceInput: string | undefined = req.body.voiceInput;
    const wfId = `WF-PROF-${Date.now().toString().slice(-4)}`;

    const wf = await controller.runFullCitizenWorkflow(wfId, profile, 0);
    res.json({ workflow_id: wf.workflow_id, results: wf.results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Schemes endpoints
app.get('/api/schemes', (req, res) => {
  const { category, state, search } = req.query;
  let list = [...MOCK_SCHEMES];

  if (category) {
    list = list.filter(s => s.category.toLowerCase().includes(String(category).toLowerCase()));
  }
  if (state && state !== 'All') {
    list = list.filter(s => s.state === 'All India' || s.state.toLowerCase() === String(state).toLowerCase());
  }
  if (search) {
    const sTerm = String(search).toLowerCase();
    list = list.filter(s =>
      s.name.toLowerCase().includes(sTerm) ||
      s.description.toLowerCase().includes(sTerm) ||
      s.keywords.some(k => k.toLowerCase().includes(sTerm))
    );
  }

  res.json(list);
});

app.get('/api/schemes/:scheme_id', (req, res) => {
  const scheme = MOCK_SCHEMES.find(s => s.scheme_id === req.params.scheme_id);
  if (!scheme) {
    res.status(404).json({ error: 'Scheme not found' });
    return;
  }
  res.json(scheme);
});

app.post('/api/schemes/search', async (req, res) => {
  try {
    const { query, profile } = req.body;
    const wfId = `WF-SCH-${Date.now().toString().slice(-4)}`;
    const userProfile: UserProfile = profile || {
      name: 'Citizen Applicant',
      age: 30,
      gender: 'Male',
      state: 'Karnataka',
      district: 'Mandya',
      occupation: 'Farmer',
      annual_income: 200000,
      category: 'General',
      user_type: 'Farmer',
      preferred_language: 'English',
      user_query: query
    };

    const wf = await controller.runFullCitizenWorkflow(wfId, userProfile, 0);
    res.json({
      workflow_id: wf.workflow_id,
      schemes: wf.results.schemes || MOCK_SCHEMES.slice(0, 5),
      selected_scheme: wf.results.selected_scheme,
      results: wf.results
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Workflows endpoints
app.post('/api/workflows/start', async (req, res) => {
  try {
    const { profile, initial_delay_ms } = req.body;
    if (!profile) {
      res.status(400).json({ error: 'profile payload required' });
      return;
    }
    const wfId = `WF-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 90 + 10)}`;
    // Run asynchronously in background
    controller.runFullCitizenWorkflow(wfId, profile, initial_delay_ms || 0).catch(console.error);

    res.json({
      message: 'Workflow started',
      workflow_id: wfId
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workflows', (req, res) => {
  const status = controller.getStatus();
  res.json(status.active_workflows);
});

app.get('/api/workflows/:workflow_id', (req, res) => {
  const wf = controller.getWorkflow(req.params.workflow_id);
  if (!wf) {
    res.status(404).json({ error: 'Workflow not found' });
    return;
  }
  res.json(wf);
});

app.post('/api/workflows/:workflow_id/cancel', (req, res) => {
  controller.cancelWorkflow(req.params.workflow_id, req.body.reason || 'User cancelled via API');
  res.json({ message: `Workflow ${req.params.workflow_id} cancelled` });
});

// 5. Agents endpoints
app.get('/api/agents', (req, res) => {
  const status = controller.getStatus();
  const allAgents: Record<string, any> = {};
  for (const wf of status.active_workflows) {
    for (const [id, a] of Object.entries(wf.agents)) {
      allAgents[id] = a;
    }
  }
  res.json(allAgents);
});

app.get('/api/agents/:agent_id', (req, res) => {
  const chain = AGENT_DEPENDENCY_CHAINS[req.params.agent_id];
  if (!chain) {
    res.status(404).json({ error: 'Agent not found in registry' });
    return;
  }
  res.json({
    agent_id: req.params.agent_id,
    dependency_chain: chain,
    resource_names: chain.map(r => RESOURCE_NAMES[r] || r)
  });
});

// 6. Resources endpoints
app.get('/api/resources', (req, res) => {
  res.json(controller.resourceManager.getAllResources());
});

app.get('/api/resources/:resource_id', (req, res) => {
  const r = controller.resourceManager.getResource(req.params.resource_id);
  if (!r) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  res.json(r);
});

// 7. Controller endpoints
app.get('/api/controller/status', (req, res) => {
  res.json(controller.getStatus());
});

app.get('/api/controller/queue', (req, res) => {
  res.json(controller.queueManager.getQueueItems());
});

app.get('/api/controller/reservations', (req, res) => {
  res.json(controller.reservationManager.getAllReservations());
});

app.get('/api/controller/dependency-graph', (req, res) => {
  res.json({
    chains: AGENT_DEPENDENCY_CHAINS,
    resources: RESOURCE_NAMES,
    active_allocations: controller.resourceManager.getAllResources().map(r => ({
      resource_id: r.resource_id,
      name: r.name,
      capacity: r.capacity,
      allocated: r.allocated_slots,
      reserved: r.reserved_slots,
      available: r.available_slots,
      queue_length: r.queue_length
    }))
  });
});

app.get('/api/controller/predictions', (req, res) => {
  const status = controller.getStatus();
  res.json(status.predictions);
});

// 8. Demo & Scenario triggers
app.post('/api/controller/demo/start', (req, res) => {
  controller.startFourUserConcurrencyDemo().catch(console.error);
  res.json({ message: '4-User A3 Concurrency Demo initiated' });
});

app.post('/api/controller/demo/reset', (req, res) => {
  controller.reset();
  res.json({ message: 'A3 Controller state reset successfully' });
});

app.post('/api/controller/scenarios/:scenario_id', async (req, res) => {
  const scenId = req.params.scenario_id.toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
  if (!['A', 'B', 'C', 'D', 'E'].includes(scenId)) {
    res.status(400).json({ error: 'Invalid scenario id. Must be A, B, C, D, or E' });
    return;
  }
  const result = await controller.runScenario(scenId);
  res.json(result);
});

app.post('/api/controller/resources/:resource_id/release', async (req, res) => {
  const { workflow_id, agent_id } = req.body;
  await controller.releaseResource(req.params.resource_id, workflow_id || 'manual', agent_id || 'admin', 1);
  res.json({ message: `Resource ${req.params.resource_id} released` });
});

// 9. Automated Tests runner
app.get('/api/tests/run', async (req, res) => {
  try {
    const testResults = await runAutomatedTests();
    const passedCount = testResults.filter(t => t.passed).length;
    res.json({
      total: testResults.length,
      passed: passedCount,
      failed: testResults.length - passedCount,
      all_passed: passedCount === testResults.length,
      results: testResults
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Logs & Metrics
app.get('/api/logs', (req, res) => {
  const status = controller.getStatus();
  res.json(status.logs);
});

app.get('/api/metrics', (req, res) => {
  const status = controller.getStatus();
  res.json(status.metrics);
});

// 11. Citizen e-KYC & Anti-Impersonation OTP API
app.post('/api/citizen/otp/send', (req, res) => {
  const { phone, aadhaar } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '');
  const cleanAadhaar = String(aadhaar || '').replace(/\D/g, '');

  if (cleanPhone.length < 10) {
    res.status(400).json({
      success: false,
      message: 'Invalid phone number. 10 digits required.'
    });
    return;
  }

  const txnId = `TXN-UIDAI-${Date.now().toString().slice(-6)}`;
  res.json({
    success: true,
    txnId,
    demoOtp: '582914',
    message: `OTP sent to mobile +91-${cleanPhone.slice(0, 2)}XXXXXX${cleanPhone.slice(-2)} via UIDAI Gateway.`
  });
});

app.post('/api/citizen/otp/verify', (req, res) => {
  const { txnId, otp } = req.body;
  if (otp === '582914' || otp === '123456') {
    res.json({
      success: true,
      message: 'Identity verified successfully via e-KYC.'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid OTP entered. Please use demo OTP 582914.'
    });
  }
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`SchemeSeva server running on http://0.0.0.0:${PORT}`);
    console.log(`WebSocket endpoint live at ws://0.0.0.0:${PORT}/ws/runtime`);
  });
}

start().catch(console.error);
