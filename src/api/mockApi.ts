import { LLMInteraction, DashboardStats, AgentSettings, AuditLogEntry, FeedbackEntry } from '../types';
import { agents } from '../agents';
import { callGroq } from '../lib/groqAgent';

class MockApiService {
  private interactions: LLMInteraction[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private feedbackEntries: FeedbackEntry[] = [];
  private settings: AgentSettings = {
    policyEnforcer: { enabled: true },
    verifier: { enabled: true },
    auditLogger: { enabled: true },
    responseAgent: { enabled: true },
    feedbackAgent: { enabled: true },
    severityThreshold: 7.0
  };

  async processPrompt(prompt: string): Promise<LLMInteraction> {
    // Generate LLM response using Groq
    const llmResult = await callGroq(prompt);
    
    const interaction: LLMInteraction = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      input: prompt,
      output: llmResult.response,
      status: 'pending',
      severity: 'low',
      violations: [],
      agentActions: [],
      llmSource: llmResult.source,
      llmModel: llmResult.model,
      llmError: llmResult.error
    };

    // Process through agents
    if (this.settings.policyEnforcer.enabled) {
      const policyActions = await agents.policyEnforcer.process(interaction);
      interaction.agentActions.push(...policyActions);
    }

    // Update violations and status
    if (interaction.agentActions.some(action => action.action === 'flag')) {
      interaction.violations = this.extractViolations(llmResult.response);
      
      // Check if any violation exceeds threshold
      const maxSeverity = Math.max(...interaction.violations.map(v => v.severity), 0);
      interaction.status = maxSeverity >= this.settings.severityThreshold ? 'blocked' : 'pending';
      interaction.severity = this.mapSeverityToCategory(maxSeverity);
    } else {
      interaction.status = 'approved';
      interaction.severity = 'low';
    }

    // Process through verifier if enabled and high severity
    if (this.settings.verifier.enabled && interaction.violations.some(v => v.severity >= 7)) {
      const verifierActions = await agents.verifier.process(interaction);
      interaction.agentActions.push(...verifierActions);
      
      // Re-evaluate status after verifier adds potential violations
      if (interaction.violations.length > 0) {
        const maxSeverity = Math.max(...interaction.violations.map(v => v.severity), 0);
        interaction.status = maxSeverity >= this.settings.severityThreshold ? 'blocked' : 'pending';
        interaction.severity = this.mapSeverityToCategory(maxSeverity);
      }
    }

    // Process through other agents
    if (this.settings.auditLogger.enabled) {
      const auditActions = await agents.auditLogger.process(interaction);
      interaction.agentActions.push(...auditActions);
    }

    if (this.settings.responseAgent.enabled) {
      const responseActions = await agents.responseAgent.process(interaction);
      interaction.agentActions.push(...responseActions);
    }

    if (this.settings.feedbackAgent.enabled) {
      const feedbackActions = await agents.feedbackAgent.process(interaction);
      interaction.agentActions.push(...feedbackActions);
    }

    // Log all agent actions to audit logs after processing
    this.logAllAgentActions(interaction);

    this.interactions.push(interaction);
    return interaction;
  }

  async getInteractions(): Promise<LLMInteraction[]> {
    return [...this.interactions].reverse();
  }

  private logAllAgentActions(interaction: LLMInteraction): void {
    for (const action of interaction.agentActions) {
      const logEntry: AuditLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: action.timestamp,
        agentName: action.agentName,
        action: action.action,
        interactionId: interaction.id,
        details: action.details
      };
      this.auditLogs.push(logEntry);
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const total = this.interactions.length;
    const flagged = this.interactions.filter(i => i.status === 'blocked').length;
    const severitySum = this.interactions.reduce((sum, i) => {
      const severityValue = { low: 1, medium: 2, high: 3, critical: 4 }[i.severity];
      return sum + severityValue;
    }, 0);

    const violationCounts = this.interactions.reduce((counts, interaction) => {
      interaction.violations.forEach(violation => {
        counts[violation.type] = (counts[violation.type] || 0) + 1;
      });
      return counts;
    }, {} as Record<string, number>);

    const topViolations = Object.entries(violationCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const agentActionCounts = this.auditLogs.reduce((counts, log) => {
      counts[log.agentName] = (counts[log.agentName] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const agentActivity = Object.entries(agentActionCounts)
      .map(([agent, actions]) => ({ agent, actions }))
      .sort((a, b) => b.actions - a.actions);

    return {
      totalInteractions: total,
      flaggedInteractions: flagged,
      averageSeverity: total > 0 ? severitySum / total : 0,
      topViolations,
      agentActivity
    };
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return [...this.auditLogs].reverse();
  }

  async getFeedbackEntries(): Promise<FeedbackEntry[]> {
    return [...this.feedbackEntries].reverse();
  }

  async getSettings(): Promise<AgentSettings> {
    return { ...this.settings };
  }

  async updateSettings(newSettings: AgentSettings): Promise<void> {
    this.settings = { ...newSettings };
    
    // Update agent enabled states
    agents.policyEnforcer.enabled = newSettings.policyEnforcer.enabled;
    agents.verifier.enabled = newSettings.verifier.enabled;
    agents.auditLogger.enabled = newSettings.auditLogger.enabled;
    agents.responseAgent.enabled = newSettings.responseAgent.enabled;
    agents.feedbackAgent.enabled = newSettings.feedbackAgent.enabled;
  }

  async submitFeedback(interactionId: string, rating: 'positive' | 'negative' | 'flag', comment?: string): Promise<void> {
    const feedback: FeedbackEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      interactionId,
      rating,
      comment
    };

    this.feedbackEntries.push(feedback);

    // Update interaction with feedback
    const interaction = this.interactions.find(i => i.id === interactionId);
    if (interaction) {
      interaction.userFeedback = {
        rating,
        comment,
        timestamp: new Date()
      };
    }
  }

  private mapSeverityToCategory(severity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (severity >= 9) return 'critical';
    if (severity >= 7) return 'high';
    if (severity >= 5) return 'medium';
    return 'low';
  }

  private extractViolations(response: string) {
    const violations = [];
    const responseLower = response.toLowerCase();

    // PII detection
    if (responseLower.includes('john doe') || responseLower.includes('@email.com') || responseLower.includes('555-')) {
      violations.push({
        type: 'pii' as const,
        description: 'Personal information detected in response',
        severity: 8.5,
        confidence: 0.9,
        reason: 'Response contains email addresses, phone numbers, or medical record IDs'
      });
    }

    // Bias detection
    if (responseLower.includes('obviously') || responseLower.includes('everyone knows')) {
      violations.push({
        type: 'bias' as const,
        description: 'Biased language detected',
        severity: 5.8,
        confidence: 0.8,
        reason: 'Response contains language that may reflect unfair bias or assumptions'
      });
    }

    return violations;
  }
}

export const mockApi = new MockApiService();