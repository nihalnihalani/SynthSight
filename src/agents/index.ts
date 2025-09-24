import { PolicyEnforcerAgent } from './PolicyEnforcerAgent';
import { AuditLoggerAgent } from './AuditLoggerAgent';
import { ResponseAgent } from './ResponseAgent';
import { FeedbackAgent } from './FeedbackAgent';
import { VerifierAgent } from './VerifierAgent';

export const agents = {
  policyEnforcer: new PolicyEnforcerAgent(),
  auditLogger: new AuditLoggerAgent(),
  responseAgent: new ResponseAgent(),
  feedbackAgent: new FeedbackAgent(),
  verifier: new VerifierAgent()
};

export * from './PolicyEnforcerAgent';
export * from './AuditLoggerAgent';
export * from './ResponseAgent';
export * from './FeedbackAgent';
export * from './VerifierAgent';