import { ResourceRequest, QueueItem } from '../../src/types/orchestrator.js';
import { PriorityManager } from './priority_manager.js';
import { ResourceManager } from './resource_manager.js';

export class QueueManager {
  private queue: ResourceRequest[] = [];
  public starvationPromotionsCount = 0;
  public totalQueuePromotions = 0;

  constructor(
    private priorityManager: PriorityManager,
    private resourceManager: ResourceManager
  ) {}

  public reset(): void {
    this.queue = [];
    this.starvationPromotionsCount = 0;
    this.totalQueuePromotions = 0;
  }

  public enqueue(request: ResourceRequest): void {
    // Avoid duplicate enqueue for same request_id
    if (!this.queue.some(r => r.request_id === request.request_id)) {
      request.status = 'QUEUED';
      this.queue.push(request);
      this.syncQueueLengths();
    }
  }

  public remove(requestId: string): ResourceRequest | undefined {
    const idx = this.queue.findIndex(r => r.request_id === requestId);
    if (idx !== -1) {
      const [removed] = this.queue.splice(idx, 1);
      this.syncQueueLengths();
      return removed;
    }
    return undefined;
  }

  public removeWorkflow(workflowId: string): ResourceRequest[] {
    const removed: ResourceRequest[] = [];
    this.queue = this.queue.filter(r => {
      if (r.workflow_id === workflowId) {
        removed.push(r);
        return false;
      }
      return true;
    });
    this.syncQueueLengths();
    return removed;
  }

  public getQueueItems(): QueueItem[] {
    const now = Date.now();
    const evaluated = this.queue.map(req => {
      const evaluation = this.priorityManager.calculatePriority(req, now);
      const resource = this.resourceManager.getResource(req.resource_id);

      // Check if resource is completely used by other agents
      const isCompletelyUsed = resource ? resource.available_slots === 0 : true;
      let contentionMessage: string | undefined = undefined;
      let isStrongerUsing = false;

      if (isCompletelyUsed && resource) {
        // Check if any agent currently allocated on this resource is stronger
        const hasStronger = resource.active_allocations.some(
          alloc =>
            (alloc.priority_score && alloc.priority_score > evaluation.effective_priority) ||
            alloc.priority_tier === 'critical' ||
            alloc.workflow_id.includes('EMERG') ||
            alloc.workflow_id === 'WF001'
        );

        isStrongerUsing = hasStronger;
        if (hasStronger) {
          contentionMessage = "A stronger agent is using the resource. Please wait until it's free.";
        } else {
          contentionMessage = "Resources are completely used by other agents. Please wait for a while until resource is available.";
        }
      }

      const priorityReason = contentionMessage
        ? `${contentionMessage} (${evaluation.explanation})`
        : evaluation.explanation;

      return {
        request: req,
        priority_score: evaluation.priority_score,
        effective_priority: evaluation.effective_priority,
        waiting_time_seconds: evaluation.waiting_time_seconds,
        priority_reason: priorityReason,
        aging_bonus: evaluation.aging_bonus,
        contention_message: contentionMessage,
        stronger_agent_using: isStrongerUsing,
        priority_rank: 1
      };
    });

    // Sort descending by effective_priority
    evaluated.sort((a, b) => b.effective_priority - a.effective_priority);

    // Assign rank
    evaluated.forEach((item, index) => {
      item.priority_rank = index + 1;
    });

    return evaluated;
  }

  public peekNextForResource(resourceId: string): QueueItem | undefined {
    const all = this.getQueueItems();
    return all.find(item => item.request.resource_id === resourceId);
  }

  public popNextForResource(resourceId: string): QueueItem | undefined {
    const nextItem = this.peekNextForResource(resourceId);
    if (nextItem) {
      this.remove(nextItem.request.request_id);
      this.totalQueuePromotions++;

      if (nextItem.aging_bonus > 2.0 || nextItem.waiting_time_seconds >= 15) {
        this.starvationPromotionsCount++;
      }

      this.resourceManager.recordWaitTime(resourceId, nextItem.waiting_time_seconds);
      return nextItem;
    }
    return undefined;
  }

  private syncQueueLengths(): void {
    const counts: Record<string, number> = {};
    for (const req of this.queue) {
      counts[req.resource_id] = (counts[req.resource_id] || 0) + 1;
    }
    for (const res of this.resourceManager.getAllResources()) {
      this.resourceManager.updateQueueLength(res.resource_id, counts[res.resource_id] || 0);
    }
  }
}
