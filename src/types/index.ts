export interface LLMInteraction {
  id: string;
  timestamp: Date;
  input: string;
  output: string;
  status: 'approved' | 'blocked' | 'pending';
  severity: 'low' | 'medium' | 'high' | 'critical';
  violations: Violation[];
  agentActions: AgentAction[];
  userFeedback?: UserFeedback;
  llmSource?: 'openai' | 'mock' | 'fallback';
  llmModel?: string;
  llmError?: string;
}

export interface Violation {
  type: 'pii' | 'hallucination' | 'bias' | 'misinformation' | 'hate_speech' | 'compliance' | 'gdpr' | 'fisma' | 'eu_ai_act' | 'dsa' | 'nis2' | 'iso_42001' | 'ieee_ethics' | 'violence';
  description: string;
  severity: number; // 0-10 scale
  confidence: number;
  reason: string;
  location?: string;
  regulatoryFramework?: string;
  complianceLevel?: 'low' | 'medium' | 'high' | 'critical';
  remediationSteps?: string[];
}

export interface AgentAction {
  agentName: string;
  action: 'flag' | 'approve' | 'suggest' | 'log' | 'block';
  description?: string;
  details: string;
  timestamp: Date;
  severity?: number;
  confidence?: number;
  complianceLevel?: 'low' | 'medium' | 'high' | 'critical';
  remediationSteps?: string[];
}

export interface UserFeedback {
  rating: 'positive' | 'negative' | 'report';
  comment?: string;
  timestamp: Date;
}

export interface Agent {
  name: string;
  type: 'policy' | 'audit' | 'response' | 'feedback' | 'verifier';
  enabled: boolean;
  process: (interaction: LLMInteraction) => Promise<AgentAction[]>;
}

export interface AgentSettings {
  policyEnforcer: { enabled: boolean };
  verifier: { enabled: boolean };
  auditLogger: { enabled: boolean };
  responseAgent: { enabled: boolean };
  feedbackAgent: { enabled: boolean };
  severityThreshold: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  agentName: string;
  action: string;
  violationType?: string;
  severity?: number;
  interactionId: string;
  details: string;
}

export interface FeedbackEntry {
  id: string;
  timestamp: Date;
  interactionId: string;
  rating: 'positive' | 'negative' | 'flag' | 'report';
  comment?: string;
}

export interface DashboardStats {
  totalInteractions: number;
  flaggedInteractions: number;
  averageSeverity: number;
  topViolations: Array<{ type: string; count: number }>;
  agentActivity: Array<{ agent: string; actions: number }>;
}