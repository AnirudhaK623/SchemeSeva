import { BaseAgent } from './base_agent.js';
import { Scheme, UserProfile, LanguageExplanation } from '../../src/types/orchestrator.js';
import { mockGenerateExplanations } from '../services/mock_services.js';

export class ExplanationAgent extends BaseAgent {
  constructor(workflowId: string, controller: any) {
    super('explanation_agent', 'Local Language Explanation Agent', workflowId, controller);
  }

  public async execute(input: { scheme: Scheme; profile: UserProfile }): Promise<Record<string, LanguageExplanation>> {
    const { scheme, profile } = input;
    this.startTime = Date.now();
    this.updateState({ status: 'RUNNING', progress: 10, current_task: 'Synthesizing multi-lingual explanations' });

    try {
      // Step 1: Translation Model
      await this.acquireResource('translation_model', 1.8, 6, 7);
      this.updateState({ progress: 45, current_task: 'Translating scheme rules into Kannada, Hindi, and Malayalam' });
      const explanations = await mockGenerateExplanations(scheme, profile);
      await this.releaseResource('translation_model', 1.8);

      // Step 2: LLM for simplified vernacular citizen guidance
      await this.acquireResource('llm', 1.6, 7, 7);
      this.updateState({ progress: 85, current_task: 'LLM polishing simplified regional instructions for citizen' });
      await new Promise(r => setTimeout(r, 800));
      await this.releaseResource('llm', 1.6);

      this.completionTime = Date.now();
      this.updateState({
        status: 'COMPLETED',
        progress: 100,
        current_task: 'Localized citizen explanations ready across 4 languages',
        predicted_next_resource: null,
        future_resource: null
      });

      return explanations;
    } catch (err: any) {
      this.errorStatus = err.message || 'Local language explanation failed';
      this.updateState({ status: 'FAILED', current_task: `Failed: ${this.errorStatus}` });
      throw err;
    }
  }
}
