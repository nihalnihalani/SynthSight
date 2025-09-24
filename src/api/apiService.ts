import { LLMInteraction, DashboardStats, AgentSettings, AuditLogEntry, FeedbackEntry } from '../types';
import { agents } from '../agents';
import { graphNeo4jDatabaseService } from '../services/graphNeo4jService';
import { mockApi } from './mockApi';
import { rateLimiter } from '../utils/rateLimiter';
import { InputSanitizer } from '../utils/inputSanitizer';
import { callOpenAI, isOpenAIConfigured } from '../lib/openaiAgent';

export class ApiService {
  private useNeo4j: boolean;

  constructor() {
    this.useNeo4j = graphNeo4jDatabaseService.isConfigured();
    
    console.log('🔧 ApiService constructor:', {
      useNeo4j: this.useNeo4j,
      neo4jConfigured: graphNeo4jDatabaseService.isConfigured()
    });
    
    if (!this.useNeo4j) {
      console.warn('⚠️ Neo4j not configured, falling back to mock API');
    } else {
      console.log('✅ Neo4j configured, initializing schema...');
      // Initialize Neo4j schema
      graphNeo4jDatabaseService.initializeSchema().catch(console.error);
    }
  }

  private getClientIdentifier(): string {
    // In a real app, this would be based on user ID or IP address
    // For demo purposes, we'll use a simple browser fingerprint
    return `client_${navigator.userAgent.slice(0, 50)}`;
  }

  async processPrompt(prompt: string): Promise<LLMInteraction> {
    const clientId = this.getClientIdentifier();
    
    // Rate limiting
    if (!rateLimiter.isAllowed(clientId)) {
      const resetTime = rateLimiter.getResetTime(clientId);
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`);
    }

    // Input sanitization
    const validation = InputSanitizer.validatePrompt(prompt);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.error}`);
    }

    const sanitizedPrompt = validation.sanitized!;

    // Generate LLM response using OpenAI
    let llmResult;
    if (isOpenAIConfigured()) {
      llmResult = await callOpenAI(sanitizedPrompt);
    } else {
      // If OpenAI is not configured, use a simple mock response
      llmResult = {
        response: 'I cannot provide a response as the AI service is not properly configured.',
        source: 'mock',
        model: 'mock-model',
        error: 'OpenAI API not configured'
      };
    }
    
    const interaction: LLMInteraction = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      input: sanitizedPrompt,
      output: llmResult.response,
      status: 'pending',
      severity: 'low',
      violations: [],
      agentActions: [],
      llmSource: llmResult.source as 'openai' | 'mock' | 'fallback',
      llmModel: llmResult.model,
      llmError: llmResult.error
    };

    // Get current settings
    const settings = await this.getSettings();

    // Process through agents
    if (settings.policyEnforcer.enabled) {
      const policyActions = await agents.policyEnforcer.process(interaction);
      interaction.agentActions.push(...policyActions);
    }

    // Update violations and status based on agent actions
    if (interaction.agentActions.some(action => action.action === 'flag' || action.action === 'block')) {
      // Don't override violations already detected by PolicyEnforcer
      // Only add additional violations from response analysis if none exist
      if (interaction.violations.length === 0) {
        interaction.violations = this.extractViolations(llmResult.response);
      }
      
      // Check if any violation exceeds threshold or if blocked by agent
      const maxSeverity = Math.max(...interaction.violations.map(v => v.severity), 0);
      const isBlocked = interaction.agentActions.some(action => action.action === 'block');
      
      interaction.status = isBlocked || maxSeverity >= settings.severityThreshold ? 'blocked' : 'pending';
      interaction.severity = this.mapSeverityToCategory(maxSeverity);
    } else {
      interaction.status = 'approved';
      interaction.severity = 'low';
    }

    // Process through verifier if enabled and high severity
    if (settings.verifier.enabled && interaction.violations.some(v => v.severity >= 7)) {
      const verifierActions = await agents.verifier.process(interaction);
      interaction.agentActions.push(...verifierActions);
      
      // Re-evaluate status after verifier adds potential violations
      if (interaction.violations.length > 0) {
        const maxSeverity = Math.max(...interaction.violations.map(v => v.severity), 0);
        interaction.status = maxSeverity >= settings.severityThreshold ? 'blocked' : 'pending';
        interaction.severity = this.mapSeverityToCategory(maxSeverity);
      }
    }

    // Process through other agents
    if (settings.auditLogger.enabled) {
      const auditActions = await agents.auditLogger.process(interaction);
      interaction.agentActions.push(...auditActions);
    }

    if (settings.responseAgent.enabled) {
      const responseActions = await agents.responseAgent.process(interaction);
      interaction.agentActions.push(...responseActions);
    }

    if (settings.feedbackAgent.enabled) {
      const feedbackActions = await agents.feedbackAgent.process(interaction);
      interaction.agentActions.push(...feedbackActions);
    }

    // Log all agent actions to audit logs after processing
    await this.logAllAgentActions(interaction);
    // Save interaction
    if (this.useNeo4j) {
      try {
        console.log('🔄 Attempting to save to Neo4j...', { id: interaction.id, input: interaction.input.substring(0, 50) });
        const neo4jId = await graphNeo4jDatabaseService.saveInteraction(interaction);
        interaction.id = neo4jId;
        console.log('✅ Successfully saved to Neo4j:', neo4jId);
      } catch (error) {
        console.error('❌ Failed to save to Neo4j, using mock API:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Error details:', errorMessage, errorStack);
        // Don't fallback to mock API - throw the error so we can see what's wrong
        throw new Error(`Neo4j save failed: ${errorMessage}`);
      }
    } else {
      console.warn('⚠️ Neo4j not configured, using mock API');
      return await mockApi.processPrompt(prompt);
    }

    return interaction;
  }

  private async logAllAgentActions(interaction: LLMInteraction): Promise<void> {
    if (!this.useNeo4j) return;

    try {
      for (const action of interaction.agentActions) {
        const logEntry: AuditLogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: action.timestamp,
          agentName: action.agentName,
          action: action.action,
          interactionId: interaction.id,
          details: action.details
        };
        await graphNeo4jDatabaseService.saveAuditLog(logEntry);
      }
    } catch (error) {
      console.error('Failed to log agent actions to Neo4j:', error);
    }
  }

  async getInteractions(): Promise<LLMInteraction[]> {
    if (this.useNeo4j) {
      try {
        console.log('🔄 Fetching interactions from Neo4j...');
        const interactions = await graphNeo4jDatabaseService.getInteractions();
        console.log(`✅ Retrieved ${interactions.length} interactions from Neo4j`);
        return interactions;
      } catch (error) {
        console.error('❌ Failed to fetch from Neo4j, using mock API:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error details:', errorMessage);
        return await mockApi.getInteractions();
      }
    } else {
      console.warn('⚠️ Neo4j not configured, using mock API for getInteractions');
      return await mockApi.getInteractions();
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    if (this.useNeo4j) {
      try {
        return await graphNeo4jDatabaseService.getDashboardStats();
      } catch (error) {
        console.error('Failed to fetch stats from Neo4j, using mock API:', error);
        return await mockApi.getDashboardStats();
      }
    }
    return await mockApi.getDashboardStats();
  }

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    if (this.useNeo4j) {
      try {
        return await graphNeo4jDatabaseService.getAuditLogs();
      } catch (error) {
        console.error('Failed to fetch audit logs from Neo4j, using mock API:', error);
        return await mockApi.getAuditLogs();
      }
    }
    return await mockApi.getAuditLogs();
  }

  async getFeedbackEntries(): Promise<FeedbackEntry[]> {
    if (this.useNeo4j) {
      try {
        return await graphNeo4jDatabaseService.getFeedback();
      } catch (error) {
        console.error('Failed to fetch feedback from Neo4j, using mock API:', error);
        return await mockApi.getFeedbackEntries();
      }
    }
    return await mockApi.getFeedbackEntries();
  }

  async getSettings(): Promise<AgentSettings> {
    if (this.useNeo4j) {
      try {
        return await graphNeo4jDatabaseService.getSettings();
      } catch (error) {
        console.error('Failed to fetch settings from Neo4j, using mock API:', error);
        return await mockApi.getSettings();
      }
    }
    return await mockApi.getSettings();
  }

  async updateSettings(newSettings: AgentSettings): Promise<void> {
    if (this.useNeo4j) {
      try {
        await graphNeo4jDatabaseService.saveSettings(newSettings);
      } catch (error) {
        console.error('Failed to save settings to Neo4j, using mock API:', error);
        await mockApi.updateSettings(newSettings);
        return;
      }
    } else {
      await mockApi.updateSettings(newSettings);
    }
    
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

    if (this.useNeo4j) {
      try {
        await graphNeo4jDatabaseService.saveFeedback(feedback);
        
        // Update interaction with feedback
        const interactions = await graphNeo4jDatabaseService.getInteractions();
        const interaction = interactions.find((i: LLMInteraction) => i.id === interactionId);
        if (interaction) {
          await graphNeo4jDatabaseService.updateInteraction(interactionId, {
            userFeedback: {
              rating: rating === 'flag' ? 'report' : rating,
              comment,
              timestamp: new Date()
            }
          });
        }
      } catch (error) {
        console.error('Failed to save feedback to Neo4j, using mock API:', error);
        await mockApi.submitFeedback(interactionId, rating, comment);
      }
    } else {
      await mockApi.submitFeedback(interactionId, rating, comment);
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

  // Get graph data for visualization
  async getGraphData(): Promise<{ nodes: any[], links: any[] }> {
    if (this.useNeo4j) {
      try {
        return await graphNeo4jDatabaseService.getGraphData();
      } catch (error) {
        console.error('Failed to fetch graph data from Neo4j:', error);
        return { nodes: [], links: [] };
      }
    }
    return { nodes: [], links: [] };
  }

  isNeo4jConfigured(): boolean {
    return this.useNeo4j;
  }
}

export const apiService = new ApiService();