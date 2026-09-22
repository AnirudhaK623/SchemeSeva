import { DependencyPrediction } from '../../src/types/orchestrator.js';

export const AGENT_DEPENDENCY_CHAINS: Record<string, string[]> = {
  voice_profile_agent: ['speech_to_text', 'llm', 'translation_model'],
  scheme_discovery_agent: ['embedding_model', 'vector_db', 'llm'],
  eligibility_agent: ['eligibility_db', 'llm'],
  document_agent: ['pdf_parser', 'ocr_service', 'document_db', 'llm'],
  application_agent: ['document_db', 'form_validation', 'llm'],
  explanation_agent: ['translation_model', 'llm'],
};

export const RESOURCE_NAMES: Record<string, string> = {
  llm: 'Large Language Model',
  vector_db: 'Vector Database',
  speech_to_text: 'Speech-to-Text Service',
  embedding_model: 'Embedding Model',
  translation_model: 'Translation Model',
  pdf_parser: 'PDF Parser',
  ocr_service: 'OCR Service',
  eligibility_db: 'Eligibility Database',
  document_db: 'Document Database',
  form_validation: 'Form Validation Service',
};

export class DependencyPredictor {
  /**
   * Rule-based future dependency prediction
   * Inspects current agent, current resource, completed stages, and agent dependency graph.
   */
  public predictDependencies(
    agentId: string,
    currentResource: string | null,
    workflowId?: string
  ): DependencyPrediction {
    const chain = AGENT_DEPENDENCY_CHAINS[agentId] || [];

    if (!currentResource) {
      const firstRes = chain[0] || null;
      const secondRes = chain[1] || null;
      return {
        agent_id: agentId,
        workflow_id: workflowId,
        current_resource: null,
        predicted_next_resource: firstRes,
        future_resource: secondRes,
        confidence: 0.98,
        reason: firstRes
          ? `Initial workflow stage for ${agentId.replace(/_/g, ' ')} begins with ${RESOURCE_NAMES[firstRes] || firstRes}.`
          : 'Agent has completed all dependency stages.',
        timestamp: Date.now()
      };
    }

    const currentIndex = chain.indexOf(currentResource);
    if (currentIndex === -1) {
      return {
        agent_id: agentId,
        workflow_id: workflowId,
        current_resource: currentResource,
        predicted_next_resource: null,
        future_resource: null,
        confidence: 0.60,
        reason: `Resource ${currentResource} is an ad-hoc dependency outside the standard canonical chain.`,
        timestamp: Date.now()
      };
    }

    const nextRes = currentIndex + 1 < chain.length ? chain[currentIndex + 1] : null;
    const futureRes = currentIndex + 2 < chain.length ? chain[currentIndex + 2] : null;

    let confidence = 0.95;
    let reason = '';

    if (agentId === 'scheme_discovery_agent') {
      if (currentResource === 'embedding_model') {
        reason = 'The scheme discovery workflow queries the vector database after embedding generation and then uses the LLM to summarize matching schemes.';
      } else if (currentResource === 'vector_db') {
        reason = 'Vector similarity retrieval completed; synthesis and matching explanation require the LLM next.';
      } else {
        confidence = 0.99;
        reason = 'Final LLM synthesis stage reached; no downstream resource dependencies remain for this agent.';
      }
    } else if (agentId === 'document_agent') {
      if (currentResource === 'pdf_parser') {
        reason = 'Parsed PDF stream will be piped into the OCR Service for scanned image extraction before document DB indexing.';
      } else if (currentResource === 'ocr_service') {
        reason = 'OCR text extracted; storing document embeddings in Document Database prior to LLM verification.';
      } else if (currentResource === 'document_db') {
        reason = 'Document record retrieved; LLM will execute cross-verification of certificate criteria.';
      } else {
        reason = 'Document verification completed.';
      }
    } else if (agentId === 'voice_profile_agent') {
      if (currentResource === 'speech_to_text') {
        reason = 'Audio transcription stream requires LLM intent extraction and structured entity normalization.';
      } else if (currentResource === 'llm') {
        reason = 'User intent extracted; localized translation model required if citizen preferred vernacular language.';
      } else {
        reason = 'Voice profile normalization concluded.';
      }
    } else if (agentId === 'eligibility_agent') {
      if (currentResource === 'eligibility_db') {
        reason = 'Rule table loaded from Eligibility DB; LLM evaluation required for complex contextual criteria.';
      } else {
        reason = 'Eligibility determination complete.';
      }
    } else if (agentId === 'application_agent') {
      if (currentResource === 'document_db') {
        reason = 'Verified applicant documents fetched; invoking Form Validation Service to check mandatory fields.';
      } else if (currentResource === 'form_validation') {
        reason = 'Form fields pre-validated; LLM generating application checklist and draft submission payload.';
      } else {
        reason = 'Application package readiness verified.';
      }
    } else {
      if (nextRes) {
        reason = `Sequential pipeline progression from ${RESOURCE_NAMES[currentResource] || currentResource} to ${RESOURCE_NAMES[nextRes] || nextRes}.`;
      } else {
        reason = `Agent pipeline reached terminal stage.`;
      }
    }

    return {
      agent_id: agentId,
      workflow_id: workflowId,
      current_resource: currentResource,
      predicted_next_resource: nextRes,
      future_resource: futureRes,
      confidence,
      reason,
      timestamp: Date.now()
    };
  }
}
