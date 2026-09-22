import { SystemLog } from '../../src/types/orchestrator.js';
import { ResourceManager } from './resource_manager.js';
import { ReservationManager } from './reservation_manager.js';
import { QueueManager } from './queue_manager.js';

export interface FailureRecoveryResult {
  recovered: boolean;
  released_resources: string[];
  cancelled_reservations: string[];
  removed_queue_items: number;
  recovery_action: string;
}

export class FailureManager {
  public totalFailuresRecovered = 0;

  constructor(
    private resourceManager: ResourceManager,
    private reservationManager: ReservationManager,
    private queueManager: QueueManager
  ) {}

  public recoverWorkflowFailure(
    workflowId: string,
    agentId: string,
    failedResourceId: string | null,
    reason: string
  ): FailureRecoveryResult {
    const releasedResources: string[] = [];

    // 1. Release any resources held across all resources by this workflow & agent
    for (const res of this.resourceManager.getAllResources()) {
      const isHeld = res.active_allocations.some(
        a => a.workflow_id === workflowId && a.agent_id === agentId
      );
      if (isHeld) {
        this.resourceManager.release(res.resource_id, workflowId, agentId);
        releasedResources.push(res.resource_id);
      }
    }

    if (failedResourceId && !releasedResources.includes(failedResourceId)) {
      this.resourceManager.release(failedResourceId, workflowId, agentId);
      this.resourceManager.recordFailure(failedResourceId);
      releasedResources.push(failedResourceId);
    }

    // 2. Cancel all reservations for this workflow
    const cancelledReservations = this.reservationManager
      .cancelWorkflowReservations(workflowId)
      .map(r => r.reservation_id);

    // 3. Remove queued requests
    const removedQueue = this.queueManager.removeWorkflow(workflowId);

    this.totalFailuresRecovered++;

    const recoveryAction = `Released [${releasedResources.join(', ') || 'none'}], cancelled reservations [${cancelledReservations.join(', ') || 'none'}], removed ${removedQueue.length} queued request(s). Deadlock avoided.`;

    return {
      recovered: true,
      released_resources: releasedResources,
      cancelled_reservations: cancelledReservations,
      removed_queue_items: removedQueue.length,
      recovery_action: recoveryAction
    };
  }
}
