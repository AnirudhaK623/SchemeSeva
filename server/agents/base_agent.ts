import { AgentInfo, AgentStatus, ResourceRequest, DependencyPrediction } from '../../src/types/orchestrator.js';
import { A3RuntimeController } from '../controller/runtime_controller.js';

export abstract class BaseAgent {
  public agentId: string;
  public name: string;
  public workflowId: string;
  public status: AgentStatus = 'IDLE';
  public currentTask: string = 'Initialized';
  public currentResource: string | null = null;
  public predictedNextResource: string | null = null;
  public futureResource: string | null = null;
  public priorityScore: number = 5.0;
  public waitingTime: number = 0;
  public estimatedExecutionTime: number = 3;
  public progress: number = 0;
  public errorStatus: string | null = null;
  public startTime: number | null = null;
  public completionTime: number | null = null;

  constructor(
    agentId: string,
    name: string,
    workflowId: string,
    protected controller: A3RuntimeController
  ) {
    this.agentId = agentId;
    this.name = name;
    this.workflowId = workflowId;
  }

  public toJSON(): AgentInfo {
    return {
      agent_id: this.agentId,
      workflow_id: this.workflowId,
      name: this.name,
      status: this.status,
      current_task: this.currentTask,
      current_resource: this.currentResource,
      predicted_next_resource: this.predictedNextResource,
      future_resource: this.futureResource,
      priority_score: this.priorityScore,
      waiting_time: this.waitingTime,
      estimated_execution_time: this.estimatedExecutionTime,
      progress: this.progress,
      error_status: this.errorStatus,
      start_time: this.startTime,
      completion_time: this.completionTime
    };
  }

  protected updateState(partial: Partial<AgentInfo>): void {
    if (partial.status) this.status = partial.status;
    if (partial.current_task) this.currentTask = partial.current_task;
    if (partial.current_resource !== undefined) this.currentResource = partial.current_resource;
    if (partial.predicted_next_resource !== undefined) this.predictedNextResource = partial.predicted_next_resource;
    if (partial.future_resource !== undefined) this.futureResource = partial.future_resource;
    if (partial.priority_score !== undefined) this.priorityScore = partial.priority_score;
    if (partial.progress !== undefined) this.progress = partial.progress;
    if (partial.error_status !== undefined) this.errorStatus = partial.error_status;
    this.controller.notifyStateChange();
  }

  /**
   * Acquire a resource via the A3 Controller.
   * Awaits until allocation is granted (immediate, promoted from reservation, or dequeued).
   */
  protected async acquireResource(
    resourceId: string,
    estimatedDurationSec: number,
    basePriority: number = 5,
    workflowImpact: number = 7
  ): Promise<boolean> {
    this.startTime = this.startTime || Date.now();
    this.estimatedExecutionTime = estimatedDurationSec;
    this.updateState({
      status: 'REQUESTING_RESOURCE',
      current_task: `Requesting resource: ${resourceId}`,
      current_resource: null
    });

    // Update prediction for downstream pipeline
    const pred = this.controller.predictFutureDependencies(this.agentId, resourceId, this.workflowId);
    this.updateState({
      predicted_next_resource: pred.predicted_next_resource,
      future_resource: pred.future_resource
    });

    const request: ResourceRequest = {
      request_id: `REQ-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
      workflow_id: this.workflowId,
      agent_id: this.agentId,
      resource_id: resourceId,
      estimated_duration: estimatedDurationSec,
      deadline_seconds: 30,
      base_priority: basePriority,
      workflow_impact: workflowImpact,
      predicted_next_resources: pred.predicted_next_resource ? [pred.predicted_next_resource] : [],
      created_at: Date.now(),
      status: 'PENDING'
    };

    const allocated = await this.controller.requestResource(request, (allocatedResource) => {
      this.currentResource = allocatedResource;
      this.updateState({
        status: 'RUNNING',
        current_resource: allocatedResource,
        current_task: `Executing with allocated ${allocatedResource}`
      });
    });

    if (allocated) {
      this.currentResource = resourceId;
      this.updateState({
        status: 'RUNNING',
        current_resource: resourceId,
        current_task: `Running task with ${resourceId}`
      });
      return true;
    }

    return false;
  }

  protected async releaseResource(resourceId: string, durationSec: number = 1): Promise<void> {
    if (this.currentResource === resourceId) {
      await this.controller.releaseResource(resourceId, this.workflowId, this.agentId, durationSec);
      this.currentResource = null;
      this.updateState({
        current_resource: null,
        current_task: `Released ${resourceId}`
      });
    }
  }

  public abstract execute(input: any): Promise<any>;
}
