import { BaseAgent } from './base_agent.js';
import { UserProfile, Scheme, EligibilityResult } from '../../src/types/orchestrator.js';
import { mockVerifyEligibility } from '../services/mock_services.js';

export class EligibilityAgent extends BaseAgent {
  constructor(workflowId: string, controller: any) {
    super('eligibility_agent', 'Eligibility Verification Agent', workflowId, controller);
  }

  public async execute(input: { scheme: Scheme; profile: UserProfile }): Promise<EligibilityResult> {
    const { scheme, profile } = input;
    this.startTime = Date.now();
    this.updateState({ status: 'RUNNING', progress: 10, current_task: `Evaluating criteria for ${scheme.name}` });

    try {
      // Step 1: Eligibility Database
      await this.acquireResource('eligibility_db', 1.2, 7, 8);
      this.updateState({ progress: 40, current_task: 'Retrieving official government eligibility rules and thresholds' });
      const result = await mockVerifyEligibility(scheme, profile);
      await this.releaseResource('eligibility_db', 1.2);

      // Step 2: LLM for contextual exception & explanation formulation
      await this.acquireResource('llm', 1.8, 7, 7);
      this.updateState({ progress: 80, current_task: 'LLM formulating detailed decision explanation' });
      await new Promise(r => setTimeout(r, 900));
      await this.releaseResource('llm', 1.8);

      this.completionTime = Date.now();
      this.updateState({
        status: 'COMPLETED',
        progress: 100,
        current_task: `Verification completed: ${result.status}`,
        predicted_next_resource: null,
        future_resource: null
      });

      return result;
    } catch (err: any) {
      this.errorStatus = err.message || 'Eligibility verification failed';
      this.updateState({ status: 'FAILED', current_task: `Failed: ${this.errorStatus}` });
      throw err;
    }
  }
}
