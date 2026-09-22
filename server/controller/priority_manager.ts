import { ResourceRequest } from '../../src/types/orchestrator.js';

export interface PriorityEvaluation {
  base_priority: number;
  priority_score: number;
  effective_priority: number;
  deadline_urgency: number;
  waiting_time_score: number;
  workflow_impact: number;
  duration_penalty: number;
  aging_bonus: number;
  waiting_time_seconds: number;
  explanation: string;
}

export class PriorityManager {
  // Configurable weights as per hackathon specification
  private wDeadline = 0.35;
  private wWait = 0.25;
  private wImpact = 0.20;
  private wBase = 0.15;
  private wDuration = 0.05;
  private starvationThresholdSec = 15; // 15 seconds starvation threshold

  public calculatePriority(request: ResourceRequest, now: number = Date.now()): PriorityEvaluation {
    const waitingTimeSec = Math.max(0, Math.floor((now - request.created_at) / 1000));
    
    // 1. Deadline urgency: scale 0 to 10
    // Shorter remaining time -> higher urgency
    const elapsedRatio = Math.min(1.0, waitingTimeSec / Math.max(1, request.deadline_seconds));
    const deadlineUrgency = Math.min(10, Math.max(0, Number((elapsedRatio * 10).toFixed(2))));

    // 2. Waiting time score: 0 to 10
    // Scales linearly up to 20 seconds
    const waitingTimeScore = Math.min(10, Math.max(0, Number(((waitingTimeSec / 20) * 10).toFixed(2))));

    // 3. Workflow impact: already 0-10
    const workflowImpact = Math.min(10, Math.max(0, request.workflow_impact));

    // 4. Base priority: already 0-10
    const basePriority = Math.min(10, Math.max(0, request.base_priority));

    // 5. Duration penalty: longer tasks have slight penalty (0 to 10)
    const durationPenalty = Math.min(10, Math.max(0, Number(((request.estimated_duration / 10) * 10).toFixed(2))));

    // Raw calculated score
    const rawScore = 
      (this.wDeadline * deadlineUrgency) +
      (this.wWait * waitingTimeScore) +
      (this.wImpact * workflowImpact) +
      (this.wBase * basePriority) -
      (this.wDuration * durationPenalty);

    const priorityScore = Math.min(10, Math.max(0.5, Number(rawScore.toFixed(2))));

    // Starvation Prevention / Aging
    let agingBonus = 0;
    if (waitingTimeSec >= this.starvationThresholdSec) {
      // Significant boost after threshold
      agingBonus = 3.5 + (waitingTimeSec - this.starvationThresholdSec) * 0.25;
    } else {
      agingBonus = waitingTimeSec * 0.12;
    }
    agingBonus = Number(agingBonus.toFixed(2));

    const effectivePriority = Number((priorityScore + agingBonus).toFixed(2));

    // Human-readable explanation
    const reasons: string[] = [];
    if (waitingTimeSec >= this.starvationThresholdSec) {
      reasons.push(`Aging boost (+${agingBonus}) applied after waiting ${waitingTimeSec}s to prevent starvation`);
    } else if (waitingTimeSec > 5) {
      reasons.push(`Waiting time bonus (+${agingBonus}) accumulating`);
    }

    if (deadlineUrgency > 6) {
      reasons.push(`High deadline urgency (${deadlineUrgency}/10)`);
    }
    if (workflowImpact >= 7) {
      reasons.push(`Blocking critical downstream stages (impact: ${workflowImpact}/10)`);
    }
    if (reasons.length === 0) {
      reasons.push(`Standard priority with base level ${basePriority}`);
    }

    return {
      base_priority: basePriority,
      priority_score: priorityScore,
      effective_priority: effectivePriority,
      deadline_urgency: deadlineUrgency,
      waiting_time_score: waitingTimeScore,
      workflow_impact: workflowImpact,
      duration_penalty: durationPenalty,
      aging_bonus: agingBonus,
      waiting_time_seconds: waitingTimeSec,
      explanation: reasons.join('; ')
    };
  }
}
