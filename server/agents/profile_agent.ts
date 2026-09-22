import { BaseAgent } from './base_agent.js';
import { UserProfile } from '../../src/types/orchestrator.js';
import { mockSpeechToText } from '../services/mock_services.js';

export class ProfileAgent extends BaseAgent {
  constructor(workflowId: string, controller: any) {
    super('voice_profile_agent', 'Voice and Profile Agent', workflowId, controller);
  }

  public async execute(input: { profile: UserProfile; voiceInput?: string }): Promise<any> {
    const { profile, voiceInput } = input;
    this.startTime = Date.now();
    this.updateState({ status: 'RUNNING', progress: 10, current_task: 'Starting Profile Ingestion' });

    try {
      // Step 1: Speech-to-Text if voiceInput present
      if (voiceInput) {
        await this.acquireResource('speech_to_text', 1.5, 6, 7);
        this.updateState({ progress: 25, current_task: 'Transcribing speech audio stream' });
        const transcript = await mockSpeechToText(voiceInput);
        await this.releaseResource('speech_to_text', 1.5);
        profile.user_query = transcript;
      }

      // Step 2: LLM for intent extraction & profile structure validation
      await this.acquireResource('llm', 2.0, 7, 8);
      this.updateState({ progress: 60, current_task: 'LLM extracting citizen intent and normalizing profile' });
      await new Promise(r => setTimeout(r, 1200));
      await this.releaseResource('llm', 2.0);

      // Step 3: Translation model if vernacular preferred
      if (profile.preferred_language && profile.preferred_language !== 'English') {
        await this.acquireResource('translation_model', 1.2, 5, 5);
        this.updateState({ progress: 85, current_task: `Normalizing vernacular prompts into ${profile.preferred_language}` });
        await new Promise(r => setTimeout(r, 800));
        await this.releaseResource('translation_model', 1.2);
      }

      this.completionTime = Date.now();
      this.updateState({
        status: 'COMPLETED',
        progress: 100,
        current_task: 'Profile processing completed successfully',
        predicted_next_resource: null,
        future_resource: null
      });

      return {
        profile,
        intent: profile.user_query || `Seeking agricultural and welfare schemes in ${profile.state}`,
        missing_profile_info: profile.district ? [] : ['District verification required']
      };
    } catch (err: any) {
      this.errorStatus = err.message || 'Profile ingestion failed';
      this.updateState({ status: 'FAILED', current_task: `Failed: ${this.errorStatus}` });
      throw err;
    }
  }
}
