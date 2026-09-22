import { BaseAgent } from './base_agent.js';
import { Scheme, UserProfile, DocumentAnalysis, ApplicationDraft } from '../../src/types/orchestrator.js';
import { mockPrepareApplication } from '../services/mock_services.js';

export class ApplicationAgent extends BaseAgent {
  constructor(workflowId: string, controller: any) {
    super('application_agent', 'Application Assistance Agent', workflowId, controller);
  }

  public async execute(input: { scheme: Scheme; profile: UserProfile; docAnalysis: DocumentAnalysis }): Promise<ApplicationDraft> {
    const { scheme, profile, docAnalysis } = input;
    this.startTime = Date.now();
    this.updateState({ status: 'RUNNING', progress: 10, current_task: 'Preparing application dossier' });

    try {
      // Step 1: Document Database
      await this.acquireResource('document_db', 1.2, 6, 7);
      this.updateState({ progress: 35, current_task: 'Aggregating verified KYC records from Document Database' });
      await new Promise(r => setTimeout(r, 600));
      await this.releaseResource('document_db', 1.2);

      // Step 2: Form Validation Service
      await this.acquireResource('form_validation', 1.5, 7, 8);
      this.updateState({ progress: 65, current_task: 'Validating mandatory fields against portal schema' });
      const draft = await mockPrepareApplication(scheme, profile, docAnalysis);
      await this.releaseResource('form_validation', 1.5);

      // Step 3: LLM for personalized checklist synthesis
      await this.acquireResource('llm', 1.8, 7, 7);
      this.updateState({ progress: 90, current_task: 'LLM compiling step-by-step submission package' });
      await new Promise(r => setTimeout(r, 900));
      await this.releaseResource('llm', 1.8);

      this.completionTime = Date.now();
      this.updateState({
        status: 'COMPLETED',
        progress: 100,
        current_task: `Application draft ready (${draft.readiness_percentage}% readiness)`,
        predicted_next_resource: null,
        future_resource: null
      });

      return draft;
    } catch (err: any) {
      this.errorStatus = err.message || 'Application assistance failed';
      this.updateState({ status: 'FAILED', current_task: `Failed: ${this.errorStatus}` });
      throw err;
    }
  }
}
