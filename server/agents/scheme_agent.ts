import { BaseAgent } from './base_agent.js';
import { UserProfile, Scheme } from '../../src/types/orchestrator.js';
import { MOCK_SCHEMES } from '../data/schemes.js';
import { mockGenerateEmbedding, mockVectorSearch } from '../services/mock_services.js';

export class SchemeAgent extends BaseAgent {
  constructor(workflowId: string, controller: any) {
    super('scheme_discovery_agent', 'Scheme Discovery Agent', workflowId, controller);
  }

  public async execute(input: { profile: UserProfile; query?: string }): Promise<Scheme[]> {
    const { profile, query } = input;
    this.startTime = Date.now();
    this.updateState({ status: 'RUNNING', progress: 10, current_task: 'Initiating Semantic Scheme Search' });

    try {
      // Step 1: Embedding Model
      await this.acquireResource('embedding_model', 1.5, 7, 9);
      this.updateState({ progress: 30, current_task: 'Generating citizen query vector embeddings' });
      const q = query || profile.user_query || `${profile.user_type} ${profile.occupation} ${profile.state}`;
      await mockGenerateEmbedding(q);
      await this.releaseResource('embedding_model', 1.5);

      // Step 2: Vector Database
      await this.acquireResource('vector_db', 2.0, 8, 9);
      this.updateState({ progress: 65, current_task: 'Querying vector index for relevant government schemes' });
      const matched = await mockVectorSearch(q, MOCK_SCHEMES, profile);
      await this.releaseResource('vector_db', 2.0);

      // Step 3: LLM for ranking synthesis and relevance justification
      await this.acquireResource('llm', 2.0, 7, 8);
      this.updateState({ progress: 85, current_task: 'LLM formulating match reasoning and rank re-scoring' });
      await new Promise(r => setTimeout(r, 1000));
      await this.releaseResource('llm', 2.0);

      this.completionTime = Date.now();
      this.updateState({
        status: 'COMPLETED',
        progress: 100,
        current_task: `Identified ${matched.length} eligible/relevant schemes`,
        predicted_next_resource: null,
        future_resource: null
      });

      return matched;
    } catch (err: any) {
      this.errorStatus = err.message || 'Scheme discovery failed';
      this.updateState({ status: 'FAILED', current_task: `Failed: ${this.errorStatus}` });
      throw err;
    }
  }
}
