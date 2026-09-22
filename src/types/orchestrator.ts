export type ResourceType = 'model' | 'database' | 'service';

export type AgentStatus =
  | 'IDLE'
  | 'REQUESTING_RESOURCE'
  | 'WAITING'
  | 'QUEUED'
  | 'RESERVED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export type WorkflowStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface ResourceDefinition {
  resource_id: string;
  name: string;
  capacity: number;
  type: ResourceType;
}

export interface ResourceState extends ResourceDefinition {
  allocated_slots: number;
  reserved_slots: number;
  available_slots: number;
  queue_length: number;
  utilization_percentage: number;
  average_waiting_time: number;
  average_execution_time: number;
  allocation_count: number;
  failure_count: number;
  active_allocations: Array<{
    workflow_id: string;
    agent_id: string;
    allocated_at: number;
    priority_tier?: 'high' | 'critical' | 'standard';
    priority_score?: number;
  }>;
  contention_message?: string;
  stronger_agent_using?: boolean;
}

export interface ResourceRequest {
  request_id: string;
  workflow_id: string;
  agent_id: string;
  resource_id: string;
  estimated_duration: number; // in seconds
  deadline_seconds: number;
  base_priority: number;
  workflow_impact: number;
  predicted_next_resources: string[];
  created_at: number;
  status: 'PENDING' | 'ALLOCATED' | 'QUEUED' | 'RESERVED' | 'RELEASED' | 'REJECTED';
}

export interface Reservation {
  reservation_id: string;
  workflow_id: string;
  agent_id: string;
  resource_id: string;
  status: 'ACTIVE' | 'PROMOTED' | 'RELEASED' | 'EXPIRED' | 'CANCELLED';
  creation_time: number;
  expected_usage_time: number;
  expiry_time: number;
  release_time?: number;
}

export interface QueueItem {
  request: ResourceRequest;
  priority_score: number;
  priority_rank: number;
  effective_priority: number;
  waiting_time_seconds: number;
  priority_reason: string;
  aging_bonus: number;
  contention_message?: string;
  stronger_agent_using?: boolean;
}

export interface DependencyPrediction {
  agent_id: string;
  workflow_id?: string;
  current_resource: string | null;
  predicted_next_resource: string | null;
  future_resource: string | null;
  confidence: number;
  reason: string;
  timestamp: number;
}

export interface AgentInfo {
  agent_id: string;
  workflow_id: string;
  name: string;
  status: AgentStatus;
  current_task: string;
  current_resource: string | null;
  predicted_next_resource: string | null;
  future_resource: string | null;
  priority_score: number;
  waiting_time: number;
  estimated_execution_time: number;
  progress: number;
  error_status: string | null;
  start_time: number | null;
  completion_time: number | null;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  state: string;
  district: string;
  occupation: string;
  annual_income: number;
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';
  user_type: 'Farmer' | 'Student' | 'Woman Entrepreneur' | 'Senior Citizen' | 'Rural Artisan' | 'Self-Employed' | 'Unemployed' | 'Person with Disability';
  preferred_language: 'English' | 'Kannada' | 'Hindi' | 'Malayalam';
  user_query?: string;
  phone?: string;
  email?: string;
  aadhaar_masked?: string;
  aadhaar_raw?: string;
  assigned_agent?: string;
  land_holding?: string;
  ration_card_no?: string;
  bank_account?: string;
  ifsc_code?: string;
  kutumba_id?: string;
}

export interface Scheme {
  scheme_id: string;
  name: string;
  category: string;
  description: string;
  state: string; // 'Central' or specific state e.g. 'Karnataka', 'All India'
  eligibility_rules: {
    min_age?: number;
    max_age?: number;
    max_income?: number;
    allowed_occupations?: string[];
    allowed_genders?: string[];
    allowed_states?: string[];
    allowed_categories?: string[];
    allowed_user_types?: string[];
  };
  benefits: string;
  required_documents: string[];
  application_url: string;
  keywords: string[];
  relevance_score?: number;
  match_reason?: string;
}

export interface EligibilityResult {
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'POSSIBLY_ELIGIBLE';
  rule_evaluations: Array<{
    rule: string;
    met: boolean | 'unknown';
    detail: string;
  }>;
  missing_information: string[];
  explanation: string;
}

export interface DocumentAnalysis {
  required_documents: string[];
  available_documents: string[];
  missing_documents: string[];
  verification_status: Record<string, 'VERIFIED' | 'MISSING' | 'PENDING' | 'FAILED'>;
}

export interface ApplicationDraft {
  form_id: string;
  scheme_id: string;
  applicant_name: string;
  fields: Record<string, any>;
  missing_fields: string[];
  validation_errors: string[];
  readiness_percentage: number;
  final_checklist: string[];
}

export interface LanguageExplanation {
  language: string;
  title: string;
  summary: string;
  eligibility_brief: string;
  next_steps: string[];
}

export interface WorkflowResults {
  profile?: UserProfile;
  intent?: string;
  missing_profile_info?: string[];
  schemes?: Scheme[];
  selected_scheme?: Scheme;
  eligibility?: EligibilityResult;
  documents?: DocumentAnalysis;
  application?: ApplicationDraft;
  explanations?: Record<string, LanguageExplanation>;
}

export interface WorkflowInstance {
  workflow_id: string;
  name: string;
  profile: UserProfile;
  current_stage_index: number;
  status: WorkflowStatus;
  agents: Record<string, AgentInfo>;
  results: WorkflowResults;
  created_at: number;
  updated_at: number;
  error?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  time_ms: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'CONTROLLER';
  message: string;
  workflow_id?: string;
  agent_id?: string;
  resource_id?: string;
  category: 'ALLOCATION' | 'RESERVATION' | 'QUEUE' | 'AGING' | 'PREDICTION' | 'FAILURE' | 'WORKFLOW' | 'CONTROLLER';
}

export interface RuntimeMetrics {
  total_workflows: number;
  active_workflows: number;
  completed_workflows: number;
  failed_workflows: number;
  queued_workflows: number;
  average_waiting_time: number;
  average_execution_time: number;
  prevented_over_allocations: number;
  successful_reservations: number;
  reservation_cancellations: number;
  queue_promotions: number;
  starvation_promotions: number;
  workflow_success_rate: number;
  resource_allocation_count: number;
  history_utilization: Array<{
    time: string;
    llm: number;
    vector_db: number;
    embedding_model: number;
    pdf_parser: number;
    overall: number;
  }>;
  history_queues: Array<{
    time: string;
    queued_count: number;
    active_count: number;
  }>;
}

export interface ControllerStatusResponse {
  resources: ResourceState[];
  queue: QueueItem[];
  reservations: Reservation[];
  predictions: DependencyPrediction[];
  active_workflows: WorkflowInstance[];
  logs: SystemLog[];
  metrics: RuntimeMetrics;
}
