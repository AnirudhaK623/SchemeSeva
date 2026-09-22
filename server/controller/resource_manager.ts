import { ResourceDefinition, ResourceState } from '../../src/types/orchestrator.js';

export const INITIAL_RESOURCES: ResourceDefinition[] = [
  { resource_id: 'llm', name: 'Large Language Model', capacity: 2, type: 'model' },
  { resource_id: 'vector_db', name: 'Vector Database', capacity: 1, type: 'database' },
  { resource_id: 'speech_to_text', name: 'Speech-to-Text Service', capacity: 1, type: 'model' },
  { resource_id: 'embedding_model', name: 'Embedding Model', capacity: 1, type: 'model' },
  { resource_id: 'translation_model', name: 'Translation Model', capacity: 1, type: 'model' },
  { resource_id: 'pdf_parser', name: 'PDF Parser', capacity: 2, type: 'service' },
  { resource_id: 'ocr_service', name: 'OCR Service', capacity: 1, type: 'service' },
  { resource_id: 'eligibility_db', name: 'Eligibility Database', capacity: 2, type: 'database' },
  { resource_id: 'document_db', name: 'Document Database', capacity: 2, type: 'database' },
  { resource_id: 'form_validation', name: 'Form Validation Service', capacity: 2, type: 'service' },
];

export class ResourceManager {
  private resources: Map<string, ResourceState> = new Map();
  public preventedOverAllocations: number = 0;
  public totalAllocations: number = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.resources.clear();
    this.preventedOverAllocations = 0;
    this.totalAllocations = 0;

    for (const def of INITIAL_RESOURCES) {
      this.resources.set(def.resource_id, {
        ...def,
        allocated_slots: 0,
        reserved_slots: 0,
        available_slots: def.capacity,
        queue_length: 0,
        utilization_percentage: 0,
        average_waiting_time: 0,
        average_execution_time: 0,
        allocation_count: 0,
        failure_count: 0,
        active_allocations: []
      });
    }
  }

  public getResource(resourceId: string): ResourceState | undefined {
    return this.resources.get(resourceId);
  }

  public getAllResources(): ResourceState[] {
    return Array.from(this.resources.values());
  }

  public updateQueueLength(resourceId: string, length: number): void {
    const res = this.resources.get(resourceId);
    if (res) {
      res.queue_length = length;
    }
  }

  /**
   * Capacity invariant check:
   * allocated_slots + reserved_slots <= capacity
   */
  public canAllocate(resourceId: string, isFromReservation: boolean = false): boolean {
    const res = this.resources.get(resourceId);
    if (!res) return false;

    if (isFromReservation) {
      // It was already counted in reserved_slots, so converting reservation -> allocation does not increase sum
      return res.allocated_slots < res.capacity;
    }

    const currentUsed = res.allocated_slots + res.reserved_slots;
    if (currentUsed >= res.capacity) {
      this.preventedOverAllocations++;
      return false;
    }
    return true;
  }

  public canReserve(resourceId: string): boolean {
    const res = this.resources.get(resourceId);
    if (!res) return false;
    return (res.allocated_slots + res.reserved_slots) < res.capacity;
  }

  public allocate(
    resourceId: string,
    workflowId: string,
    agentId: string,
    isFromReservation: boolean = false,
    priorityScore: number = 6.0,
    priorityTier: 'high' | 'critical' | 'standard' = 'standard'
  ): boolean {
    const res = this.resources.get(resourceId);
    if (!res) return false;

    if (!this.canAllocate(resourceId, isFromReservation)) {
      return false;
    }

    if (isFromReservation) {
      res.reserved_slots = Math.max(0, res.reserved_slots - 1);
    }

    res.allocated_slots++;
    res.available_slots = Math.max(0, res.capacity - (res.allocated_slots + res.reserved_slots));
    res.allocation_count++;
    this.totalAllocations++;
    res.utilization_percentage = Math.round(((res.allocated_slots + res.reserved_slots) / res.capacity) * 100);

    res.active_allocations.push({
      workflow_id: workflowId,
      agent_id: agentId,
      allocated_at: Date.now(),
      priority_score: priorityScore,
      priority_tier: priorityTier
    });

    this.updateContentionStatus(resourceId);
    return true;
  }

  public updateContentionStatus(resourceId: string, requestingPriority: number = 6.0): void {
    const res = this.resources.get(resourceId);
    if (!res) return;

    if (res.available_slots === 0) {
      // Check if any active allocation is a stronger agent
      const hasStrongerAgent = res.active_allocations.some(
        alloc =>
          (alloc.priority_score && alloc.priority_score > requestingPriority) ||
          alloc.priority_tier === 'critical' ||
          alloc.workflow_id.includes('EMERG') ||
          alloc.workflow_id === 'WF001'
      );

      res.stronger_agent_using = hasStrongerAgent;
      if (hasStrongerAgent) {
        res.contention_message = "A stronger agent is using the resource. Please wait until it's free.";
      } else {
        res.contention_message = "Resources are completely used by other agents. Please wait for a while until resource is available.";
      }
    } else {
      res.contention_message = undefined;
      res.stronger_agent_using = false;
    }
  }

  public addReservationSlot(resourceId: string): boolean {
    const res = this.resources.get(resourceId);
    if (!res) return false;

    if (!this.canReserve(resourceId)) {
      return false;
    }

    res.reserved_slots++;
    res.available_slots = Math.max(0, res.capacity - (res.allocated_slots + res.reserved_slots));
    res.utilization_percentage = Math.round(((res.allocated_slots + res.reserved_slots) / res.capacity) * 100);
    return true;
  }

  public removeReservationSlot(resourceId: string): void {
    const res = this.resources.get(resourceId);
    if (!res) return;

    res.reserved_slots = Math.max(0, res.reserved_slots - 1);
    res.available_slots = Math.max(0, res.capacity - (res.allocated_slots + res.reserved_slots));
    res.utilization_percentage = Math.round(((res.allocated_slots + res.reserved_slots) / res.capacity) * 100);
  }

  public release(resourceId: string, workflowId: string, agentId: string, executionDurationSec: number = 0): boolean {
    const res = this.resources.get(resourceId);
    if (!res) return false;

    const initialLen = res.active_allocations.length;
    res.active_allocations = res.active_allocations.filter(
      a => !(a.workflow_id === workflowId && a.agent_id === agentId)
    );

    if (res.active_allocations.length < initialLen || res.allocated_slots > 0) {
      res.allocated_slots = Math.max(0, res.allocated_slots - 1);
    }

    res.available_slots = Math.max(0, res.capacity - (res.allocated_slots + res.reserved_slots));
    res.utilization_percentage = Math.round(((res.allocated_slots + res.reserved_slots) / res.capacity) * 100);
    this.updateContentionStatus(resourceId);

    if (executionDurationSec > 0) {
      if (res.average_execution_time === 0) {
        res.average_execution_time = executionDurationSec;
      } else {
        res.average_execution_time = Number(((res.average_execution_time * 0.7) + (executionDurationSec * 0.3)).toFixed(1));
      }
    }

    return true;
  }

  public recordFailure(resourceId: string): void {
    const res = this.resources.get(resourceId);
    if (res) {
      res.failure_count++;
    }
  }

  public recordWaitTime(resourceId: string, waitSec: number): void {
    const res = this.resources.get(resourceId);
    if (res) {
      if (res.average_waiting_time === 0) {
        res.average_waiting_time = waitSec;
      } else {
        res.average_waiting_time = Number(((res.average_waiting_time * 0.7) + (waitSec * 0.3)).toFixed(1));
      }
    }
  }
}
