import { A3RuntimeController } from '../controller/runtime_controller.js';
import { ResourceRequest } from '../../src/types/orchestrator.js';

export interface TestResult {
  id: number;
  title: string;
  passed: boolean;
  message: string;
  details?: any;
}

export async function runAutomatedTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const controller = new A3RuntimeController();

  // Test 1: Resource capacity is never exceeded
  try {
    controller.reset();
    const rm = controller.resourceManager;
    const can1 = rm.allocate('llm', 'WF-T1', 'agent1');
    const can2 = rm.allocate('llm', 'WF-T2', 'agent2');
    const can3 = rm.allocate('llm', 'WF-T3', 'agent3'); // LLM cap is 2

    const passed = can1 === true && can2 === true && can3 === false;
    results.push({
      id: 1,
      title: 'Resource capacity is never exceeded',
      passed,
      message: passed
        ? 'Passed: LLM accepted exactly 2 allocations (cap=2) and rejected 3rd attempt'
        : 'Failed: LLM exceeded capacity'
    });
  } catch (err: any) {
    results.push({ id: 1, title: 'Resource capacity is never exceeded', passed: false, message: err.message });
  }

  // Test 2: Allocated plus reserved never exceeds capacity
  try {
    controller.reset();
    const rm = controller.resourceManager;
    const canAlloc = rm.allocate('vector_db', 'WF-T2', 'agent1'); // cap = 1
    const canRes = rm.addReservationSlot('vector_db'); // Should fail because allocated(1) + reserved(0) = cap(1)

    const passed = canAlloc === true && canRes === false;
    results.push({
      id: 2,
      title: 'Allocated plus reserved never exceeds capacity',
      passed,
      message: passed
        ? 'Passed: (allocated + reserved <= capacity) strictly enforced'
        : 'Failed: Reservation breached capacity invariant'
    });
  } catch (err: any) {
    results.push({ id: 2, title: 'Allocated plus reserved never exceeds capacity', passed: false, message: err.message });
  }

  // Test 3: Queued workflows are eventually promoted
  try {
    controller.reset();
    const rm = controller.resourceManager;
    const qm = controller.queueManager;

    // Allocate single slot on vector_db (cap=1)
    rm.allocate('vector_db', 'WF-HOLDER', 'agent1');

    // Queue second request
    const qReq: ResourceRequest = {
      request_id: 'REQ-T3-WAIT',
      workflow_id: 'WF-PROMOTEE',
      agent_id: 'scheme_discovery_agent',
      resource_id: 'vector_db',
      estimated_duration: 2,
      deadline_seconds: 30,
      base_priority: 8,
      workflow_impact: 8,
      predicted_next_resources: [],
      created_at: Date.now() - 5000,
      status: 'PENDING'
    };
    qm.enqueue(qReq);

    // Release holder
    rm.release('vector_db', 'WF-HOLDER', 'agent1');
    const promoted = qm.popNextForResource('vector_db');

    const passed = promoted !== undefined && promoted.request.workflow_id === 'WF-PROMOTEE';
    results.push({
      id: 3,
      title: 'Queued workflows are eventually promoted',
      passed,
      message: passed
        ? 'Passed: Queued request successfully popped and promoted upon slot release'
        : 'Failed: Queue item not promoted'
    });
  } catch (err: any) {
    results.push({ id: 3, title: 'Queued workflows are eventually promoted', passed: false, message: err.message });
  }

  // Test 4: Aging increases waiting workflow priority (Starvation Prevention)
  try {
    controller.reset();
    const pm = controller.priorityManager;
    const now = Date.now();

    const freshReq: ResourceRequest = {
      request_id: 'REQ-FRESH',
      workflow_id: 'WF-FRESH',
      agent_id: 'agent1',
      resource_id: 'llm',
      estimated_duration: 3,
      deadline_seconds: 30,
      base_priority: 3,
      workflow_impact: 4,
      predicted_next_resources: [],
      created_at: now,
      status: 'PENDING'
    };

    const agedReq: ResourceRequest = {
      ...freshReq,
      request_id: 'REQ-AGED',
      workflow_id: 'WF-AGED',
      created_at: now - 20000 // 20s old (> 15s threshold)
    };

    const evalFresh = pm.calculatePriority(freshReq, now);
    const evalAged = pm.calculatePriority(agedReq, now);

    const passed = evalAged.effective_priority > evalFresh.effective_priority && evalAged.aging_bonus > 0;
    results.push({
      id: 4,
      title: 'Aging increases waiting workflow priority',
      passed,
      message: passed
        ? `Passed: Aging bonus (+${evalAged.aging_bonus}) raised effective priority from ${evalFresh.effective_priority} to ${evalAged.effective_priority}`
        : 'Failed: Aging did not elevate priority'
    });
  } catch (err: any) {
    results.push({ id: 4, title: 'Aging increases waiting workflow priority', passed: false, message: err.message });
  }

  // Test 5: Resources are released after success
  try {
    controller.reset();
    const rm = controller.resourceManager;
    rm.allocate('pdf_parser', 'WF-T5', 'agent1');
    const allocBefore = rm.getResource('pdf_parser')?.allocated_slots || 0;
    rm.release('pdf_parser', 'WF-T5', 'agent1', 2);
    const allocAfter = rm.getResource('pdf_parser')?.allocated_slots || 0;

    const passed = allocBefore === 1 && allocAfter === 0;
    results.push({
      id: 5,
      title: 'Resources are released after success',
      passed,
      message: passed ? 'Passed: Resource slot decremented and returned to pool' : 'Failed: Slot not released'
    });
  } catch (err: any) {
    results.push({ id: 5, title: 'Resources are released after success', passed: false, message: err.message });
  }

  // Test 6: Resources are released after failure
  try {
    controller.reset();
    const rm = controller.resourceManager;
    const fm = controller.failureManager;

    rm.allocate('speech_to_text', 'WF-FAIL', 'voice_agent');
    const recovery = fm.recoverWorkflowFailure('WF-FAIL', 'voice_agent', 'speech_to_text', 'Audio pipe error');
    const remainingAlloc = rm.getResource('speech_to_text')?.allocated_slots || 0;

    const passed = recovery.recovered && remainingAlloc === 0;
    results.push({
      id: 6,
      title: 'Resources are released after failure',
      passed,
      message: passed ? 'Passed: Failure manager cleared all held allocations and reported recovery' : 'Failed: Failure lockup'
    });
  } catch (err: any) {
    results.push({ id: 6, title: 'Resources are released after failure', passed: false, message: err.message });
  }

  // Test 7: Four-user concurrency demo configuration check
  try {
    controller.reset();
    const llmCap = controller.resourceManager.getResource('llm')?.capacity;
    const passed = llmCap === 2;
    results.push({
      id: 7,
      title: 'Four-user concurrency demo configuration',
      passed,
      message: passed
        ? 'Passed: LLM capacity set to 2; ready to arbitrate 4 concurrent competing workflows'
        : 'Failed: LLM capacity not equal to 2'
    });
  } catch (err: any) {
    results.push({ id: 7, title: 'Four-user concurrency demo configuration', passed: false, message: err.message });
  }

  // Test 8: Future dependencies are correctly predicted
  try {
    controller.reset();
    const dp = controller.dependencyPredictor;
    const pred = dp.predictDependencies('scheme_discovery_agent', 'embedding_model');

    const passed = pred.predicted_next_resource === 'vector_db' && pred.future_resource === 'llm' && pred.confidence > 0.8;
    results.push({
      id: 8,
      title: 'Future dependencies are correctly predicted',
      passed,
      message: passed
        ? `Passed: Scheme Discovery on embedding_model accurately predicts next=[${pred.predicted_next_resource}] and future=[${pred.future_resource}] (conf: ${Math.round(pred.confidence * 100)}%)`
        : 'Failed: Incorrect dependency graph prediction'
    });
  } catch (err: any) {
    results.push({ id: 8, title: 'Future dependencies are correctly predicted', passed: false, message: err.message });
  }

  // Test 9: Duplicate reservations are prevented
  try {
    controller.reset();
    const resM = controller.reservationManager;
    const r1 = resM.createReservation('WF-DUP', 'agent1', 'llm', 5);
    const r2 = resM.createReservation('WF-DUP', 'agent1', 'llm', 5);

    const passed = r1 !== null && r2 !== null && r1.reservation_id === r2.reservation_id;
    results.push({
      id: 9,
      title: 'Duplicate reservations are prevented',
      passed,
      message: passed ? 'Passed: Re-requesting reservation returned existing active reservation without double-claiming slots' : 'Failed'
    });
  } catch (err: any) {
    results.push({ id: 9, title: 'Duplicate reservations are prevented', passed: false, message: err.message });
  }

  // Test 10: Cancelled workflows release resources
  try {
    controller.reset();
    const rm = controller.resourceManager;
    rm.allocate('ocr_service', 'WF-CANCEL-TEST', 'doc_agent');
    controller.cancelWorkflow('WF-CANCEL-TEST', 'User stopped process');
    const allocated = rm.getResource('ocr_service')?.allocated_slots || 0;

    const passed = allocated === 0;
    results.push({
      id: 10,
      title: 'Cancelled workflows release resources',
      passed,
      message: passed ? 'Passed: Cancelled workflow freed OCR service slot back to 0' : 'Failed'
    });
  } catch (err: any) {
    results.push({ id: 10, title: 'Cancelled workflows release resources', passed: false, message: err.message });
  }

  // Test 11: Independent workflows can execute concurrently
  try {
    controller.reset();
    const rm = controller.resourceManager;
    const a1 = rm.allocate('speech_to_text', 'WF-1', 'agent1');
    const a2 = rm.allocate('vector_db', 'WF-2', 'agent2');
    const a3 = rm.allocate('pdf_parser', 'WF-3', 'agent3');

    const passed = a1 && a2 && a3;
    results.push({
      id: 11,
      title: 'Independent workflows can execute concurrently',
      passed,
      message: passed ? 'Passed: Non-conflicting workflows safely acquired independent tools in parallel' : 'Failed'
    });
  } catch (err: any) {
    results.push({ id: 11, title: 'Independent workflows can execute concurrently', passed: false, message: err.message });
  }

  // Test 12: Failed workflows do not permanently block resources
  try {
    controller.reset();
    const rm = controller.resourceManager;
    const fm = controller.failureManager;

    rm.allocate('translation_model', 'WF-CRASH', 'agent1');
    fm.recoverWorkflowFailure('WF-CRASH', 'agent1', 'translation_model', 'Timeout error');

    // Verify next workflow can immediately allocate
    const nextCanAlloc = rm.allocate('translation_model', 'WF-NEXT', 'agent2');

    const passed = nextCanAlloc === true;
    results.push({
      id: 12,
      title: 'Failed workflows do not permanently block resources',
      passed,
      message: passed ? 'Passed: Next workflow acquired translation_model immediately after previous failure cleanup' : 'Failed'
    });
  } catch (err: any) {
    results.push({ id: 12, title: 'Failed workflows do not permanently block resources', passed: false, message: err.message });
  }

  return results;
}
