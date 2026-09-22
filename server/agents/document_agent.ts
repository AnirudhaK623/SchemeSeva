import { BaseAgent } from './base_agent.js';
import { Scheme, DocumentAnalysis } from '../../src/types/orchestrator.js';
import { mockAnalyzeDocuments } from '../services/mock_services.js';

export class DocumentAgent extends BaseAgent {
  constructor(workflowId: string, controller: any) {
    super('document_agent', 'Document Intelligence Agent', workflowId, controller);
  }

  public async execute(input: { scheme: Scheme; uploadedDocNames?: string[] }): Promise<DocumentAnalysis> {
    const { scheme, uploadedDocNames = [] } = input;
    this.startTime = Date.now();
    this.updateState({ status: 'RUNNING', progress: 10, current_task: 'Inspecting document requirements' });

    try {
      // Step 1: PDF Parser
      await this.acquireResource('pdf_parser', 1.5, 6, 7);
      this.updateState({ progress: 30, current_task: 'Parsing uploaded certificates and PDF attachments' });
      await new Promise(r => setTimeout(r, 700));
      await this.releaseResource('pdf_parser', 1.5);

      // Step 2: OCR Service
      await this.acquireResource('ocr_service', 1.8, 6, 7);
      this.updateState({ progress: 55, current_task: 'OCR extracting biometric stamps and text from scanned IDs' });
      await new Promise(r => setTimeout(r, 800));
      await this.releaseResource('ocr_service', 1.8);

      // Step 3: Document Database
      await this.acquireResource('document_db', 1.2, 5, 6);
      this.updateState({ progress: 75, current_task: 'Querying state repository for document schema verification' });
      const analysis = await mockAnalyzeDocuments(scheme, uploadedDocNames);
      await this.releaseResource('document_db', 1.2);

      // Step 4: LLM for validation cross-check
      await this.acquireResource('llm', 1.5, 7, 7);
      this.updateState({ progress: 90, current_task: 'LLM cross-referencing document validity vs scheme mandate' });
      await new Promise(r => setTimeout(r, 800));
      await this.releaseResource('llm', 1.5);

      this.completionTime = Date.now();
      this.updateState({
        status: 'COMPLETED',
        progress: 100,
        current_task: `Documents checked: ${analysis.available_documents.length}/${analysis.required_documents.length} verified`,
        predicted_next_resource: null,
        future_resource: null
      });

      return analysis;
    } catch (err: any) {
      this.errorStatus = err.message || 'Document intelligence processing failed';
      this.updateState({ status: 'FAILED', current_task: `Failed: ${this.errorStatus}` });
      throw err;
    }
  }
}
