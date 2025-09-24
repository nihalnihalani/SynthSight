import { neo4jService } from '../config/neo4j';
import { 
  LLMInteraction, 
  AuditLogEntry, 
  FeedbackEntry, 
  AgentSettings, 
  DashboardStats 
} from '../types';

export class Neo4jService {
  // Helper method to generate unique IDs
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Helper method to convert Date to ISO string for Neo4j
  private dateToString(date: Date): string {
    return date.toISOString();
  }

  // Helper method to convert ISO string back to Date
  private stringToDate(dateString: string): Date {
    return new Date(dateString);
  }

  // Initialize database schema
  async initializeSchema(): Promise<void> {
    const session = neo4jService.getSession();
    if (!session) return;

    try {
      // Create constraints and indexes
      await session.run(`
        CREATE CONSTRAINT interaction_id IF NOT EXISTS 
        FOR (i:Interaction) REQUIRE i.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT audit_log_id IF NOT EXISTS 
        FOR (a:AuditLog) REQUIRE a.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT feedback_id IF NOT EXISTS 
        FOR (f:Feedback) REQUIRE f.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT settings_id IF NOT EXISTS 
        FOR (s:Settings) REQUIRE s.id IS UNIQUE
      `);

      // Create indexes for better performance
      await session.run(`
        CREATE INDEX interaction_timestamp IF NOT EXISTS 
        FOR (i:Interaction) ON (i.timestamp)
      `);
      
      await session.run(`
        CREATE INDEX audit_log_timestamp IF NOT EXISTS 
        FOR (a:AuditLog) ON (a.timestamp)
      `);

      console.log('Neo4j schema initialized successfully');
    } catch (error) {
      console.error('Error initializing Neo4j schema:', error);
    } finally {
      await session.close();
    }
  }

  // Interactions
  async saveInteraction(interaction: LLMInteraction): Promise<string> {
    const session = neo4jService.getSession();
    if (!session) {
      throw new Error('Neo4j not configured');
    }

    try {
      const id = interaction.id || this.generateId();
      const result = await session.run(`
        CREATE (i:Interaction {
          id: $id,
          timestamp: $timestamp,
          input: $input,
          output: $output,
          status: $status,
          severity: $severity,
          violations: $violations,
          agentActions: $agentActions,
          userFeedback: $userFeedback,
          llmSource: $llmSource,
          llmModel: $llmModel,
          llmError: $llmError
        })
        RETURN i.id as id
      `, {
        id,
        timestamp: this.dateToString(interaction.timestamp),
        input: interaction.input,
        output: interaction.output,
        status: interaction.status,
        severity: interaction.severity,
        violations: JSON.stringify(interaction.violations),
        agentActions: JSON.stringify(interaction.agentActions),
        userFeedback: interaction.userFeedback ? JSON.stringify({
          ...interaction.userFeedback,
          timestamp: this.dateToString(interaction.userFeedback.timestamp)
        }) : null,
        llmSource: interaction.llmSource || null,
        llmModel: interaction.llmModel || null,
        llmError: interaction.llmError || null
      });

      return result.records[0].get('id');
    } catch (error) {
      console.error('Error saving interaction:', error);
      throw new Error('Failed to save interaction');
    } finally {
      await session.close();
    }
  }

  async getInteractions(limitCount: number = 50): Promise<LLMInteraction[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (i:Interaction)
        RETURN i
        ORDER BY i.timestamp DESC
        LIMIT $limit
      `, { limit: limitCount });

      return result.records.map(record => {
        const node = record.get('i').properties;
        const userFeedback = node.userFeedback ? JSON.parse(node.userFeedback) : undefined;
        
        return {
          id: node.id,
          timestamp: this.stringToDate(node.timestamp),
          input: node.input,
          output: node.output,
          status: node.status,
          severity: node.severity,
          violations: JSON.parse(node.violations || '[]'),
          agentActions: JSON.parse(node.agentActions || '[]').map((action: any) => ({
            ...action,
            timestamp: this.stringToDate(action.timestamp)
          })),
          userFeedback: userFeedback ? {
            ...userFeedback,
            timestamp: this.stringToDate(userFeedback.timestamp)
          } : undefined,
          llmSource: node.llmSource,
          llmModel: node.llmModel,
          llmError: node.llmError
        } as LLMInteraction;
      });
    } catch (error) {
      console.error('Error fetching interactions:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  async updateInteraction(id: string, updates: Partial<LLMInteraction>): Promise<void> {
    const session = neo4jService.getSession();
    if (!session) {
      throw new Error('Neo4j not configured');
    }

    try {
      const setClause = Object.keys(updates)
        .filter(key => updates[key as keyof LLMInteraction] !== undefined)
        .map(key => {
          if (key === 'timestamp' || (key === 'userFeedback' && updates.userFeedback)) {
            return `i.${key} = $${key}`;
          }
          if (key === 'violations' || key === 'agentActions') {
            return `i.${key} = $${key}`;
          }
          return `i.${key} = $${key}`;
        })
        .join(', ');

      if (!setClause) return;

      const params: any = { id };
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof LLMInteraction];
        if (value !== undefined) {
          if (key === 'timestamp') {
            params[key] = this.dateToString(value as Date);
          } else if (key === 'userFeedback' && value) {
            params[key] = JSON.stringify({
              ...(value as any),
              timestamp: this.dateToString((value as any).timestamp)
            });
          } else if (key === 'violations' || key === 'agentActions') {
            params[key] = JSON.stringify(value);
          } else {
            params[key] = value;
          }
        }
      });

      await session.run(`
        MATCH (i:Interaction {id: $id})
        SET ${setClause}
      `, params);
    } catch (error) {
      console.error('Error updating interaction:', error);
      throw new Error('Failed to update interaction');
    } finally {
      await session.close();
    }
  }

  // Audit Logs
  async saveAuditLog(auditLog: AuditLogEntry): Promise<string> {
    const session = neo4jService.getSession();
    if (!session) {
      throw new Error('Neo4j not configured');
    }

    try {
      const id = auditLog.id || this.generateId();
      await session.run(`
        CREATE (a:AuditLog {
          id: $id,
          timestamp: $timestamp,
          agentName: $agentName,
          action: $action,
          violationType: $violationType,
          severity: $severity,
          interactionId: $interactionId,
          details: $details
        })
      `, {
        id,
        timestamp: this.dateToString(auditLog.timestamp),
        agentName: auditLog.agentName,
        action: auditLog.action,
        violationType: auditLog.violationType || null,
        severity: auditLog.severity || null,
        interactionId: auditLog.interactionId,
        details: auditLog.details
      });

      return id;
    } catch (error) {
      console.error('Error saving audit log:', error);
      throw new Error('Failed to save audit log');
    } finally {
      await session.close();
    }
  }

  async getAuditLogs(limitCount: number = 100): Promise<AuditLogEntry[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (a:AuditLog)
        RETURN a
        ORDER BY a.timestamp DESC
        LIMIT $limit
      `, { limit: limitCount });

      return result.records.map(record => {
        const node = record.get('a').properties;
        return {
          id: node.id,
          timestamp: this.stringToDate(node.timestamp),
          agentName: node.agentName,
          action: node.action,
          violationType: node.violationType,
          severity: node.severity,
          interactionId: node.interactionId,
          details: node.details
        } as AuditLogEntry;
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Feedback
  async saveFeedback(feedback: FeedbackEntry): Promise<string> {
    const session = neo4jService.getSession();
    if (!session) {
      throw new Error('Neo4j not configured');
    }

    try {
      const id = feedback.id || this.generateId();
      await session.run(`
        CREATE (f:Feedback {
          id: $id,
          timestamp: $timestamp,
          interactionId: $interactionId,
          rating: $rating,
          comment: $comment
        })
      `, {
        id,
        timestamp: this.dateToString(feedback.timestamp),
        interactionId: feedback.interactionId,
        rating: feedback.rating,
        comment: feedback.comment || null
      });

      return id;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw new Error('Failed to save feedback');
    } finally {
      await session.close();
    }
  }

  async getFeedback(limitCount: number = 100): Promise<FeedbackEntry[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (f:Feedback)
        RETURN f
        ORDER BY f.timestamp DESC
        LIMIT $limit
      `, { limit: limitCount });

      return result.records.map(record => {
        const node = record.get('f').properties;
        return {
          id: node.id,
          timestamp: this.stringToDate(node.timestamp),
          interactionId: node.interactionId,
          rating: node.rating,
          comment: node.comment
        } as FeedbackEntry;
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Settings
  async saveSettings(settings: AgentSettings): Promise<void> {
    const session = neo4jService.getSession();
    if (!session) {
      throw new Error('Neo4j not configured');
    }

    try {
      await session.run(`
        MERGE (s:Settings {id: 'agentSettings'})
        SET s.policyEnforcer = $policyEnforcer,
            s.verifier = $verifier,
            s.auditLogger = $auditLogger,
            s.responseAgent = $responseAgent,
            s.feedbackAgent = $feedbackAgent,
            s.severityThreshold = $severityThreshold,
            s.updatedAt = $updatedAt
      `, {
        policyEnforcer: JSON.stringify(settings.policyEnforcer),
        verifier: JSON.stringify(settings.verifier),
        auditLogger: JSON.stringify(settings.auditLogger),
        responseAgent: JSON.stringify(settings.responseAgent),
        feedbackAgent: JSON.stringify(settings.feedbackAgent),
        severityThreshold: settings.severityThreshold,
        updatedAt: this.dateToString(new Date())
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    } finally {
      await session.close();
    }
  }

  async getSettings(): Promise<AgentSettings> {
    const session = neo4jService.getSession();
    if (!session) {
      // Return default settings if Neo4j not configured
      return {
        policyEnforcer: { enabled: true },
        verifier: { enabled: true },
        auditLogger: { enabled: true },
        responseAgent: { enabled: true },
        feedbackAgent: { enabled: true },
        severityThreshold: 7.0
      };
    }

    try {
      const result = await session.run(`
        MATCH (s:Settings {id: 'agentSettings'})
        RETURN s
      `);

      if (result.records.length > 0) {
        const node = result.records[0].get('s').properties;
        return {
          policyEnforcer: JSON.parse(node.policyEnforcer),
          verifier: JSON.parse(node.verifier),
          auditLogger: JSON.parse(node.auditLogger),
          responseAgent: JSON.parse(node.responseAgent),
          feedbackAgent: JSON.parse(node.feedbackAgent),
          severityThreshold: node.severityThreshold
        };
      } else {
        // Create and return default settings
        const defaultSettings: AgentSettings = {
          policyEnforcer: { enabled: true },
          verifier: { enabled: true },
          auditLogger: { enabled: true },
          responseAgent: { enabled: true },
          feedbackAgent: { enabled: true },
          severityThreshold: 7.0
        };
        
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings on error
      return {
        policyEnforcer: { enabled: true },
        verifier: { enabled: true },
        auditLogger: { enabled: true },
        responseAgent: { enabled: true },
        feedbackAgent: { enabled: true },
        severityThreshold: 7.0
      };
    } finally {
      await session.close();
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const session = neo4jService.getSession();
    if (!session) {
      return {
        totalInteractions: 0,
        flaggedInteractions: 0,
        averageSeverity: 0,
        topViolations: [],
        agentActivity: []
      };
    }

    try {
      // Get basic stats
      const statsResult = await session.run(`
        MATCH (i:Interaction)
        RETURN 
          count(i) as total,
          count(CASE WHEN i.status = 'blocked' THEN 1 END) as flagged,
          avg(CASE 
            WHEN i.severity = 'low' THEN 1 
            WHEN i.severity = 'medium' THEN 2 
            WHEN i.severity = 'high' THEN 3 
            WHEN i.severity = 'critical' THEN 4 
            ELSE 0 
          END) as avgSeverity
      `);

      // Get agent activity
      const agentResult = await session.run(`
        MATCH (a:AuditLog)
        RETURN a.agentName as agent, count(a) as actions
        ORDER BY actions DESC
      `);

      const stats = statsResult.records[0];
      const total = stats.get('total').toNumber();
      const flagged = stats.get('flagged').toNumber();
      const avgSeverity = stats.get('avgSeverity') || 0;

      const agentActivity = agentResult.records.map(record => ({
        agent: record.get('agent'),
        actions: record.get('actions').toNumber()
      }));

      // Get top violations (this is more complex with Neo4j, so we'll simulate it)
      const interactions = await this.getInteractions(1000);
      const violationCounts = interactions.reduce((counts, interaction) => {
        interaction.violations.forEach(violation => {
          counts[violation.type] = (counts[violation.type] || 0) + 1;
        });
        return counts;
      }, {} as Record<string, number>);

      const topViolations = Object.entries(violationCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalInteractions: total,
        flaggedInteractions: flagged,
        averageSeverity: avgSeverity,
        topViolations,
        agentActivity
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return {
        totalInteractions: 0,
        flaggedInteractions: 0,
        averageSeverity: 0,
        topViolations: [],
        agentActivity: []
      };
    } finally {
      await session.close();
    }
  }

  // Utility methods for filtering
  async getInteractionsByStatus(status: string, limitCount: number = 50): Promise<LLMInteraction[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (i:Interaction {status: $status})
        RETURN i
        ORDER BY i.timestamp DESC
        LIMIT $limit
      `, { status, limit: limitCount });

      return result.records.map(record => {
        const node = record.get('i').properties;
        const userFeedback = node.userFeedback ? JSON.parse(node.userFeedback) : undefined;
        
        return {
          id: node.id,
          timestamp: this.stringToDate(node.timestamp),
          input: node.input,
          output: node.output,
          status: node.status,
          severity: node.severity,
          violations: JSON.parse(node.violations || '[]'),
          agentActions: JSON.parse(node.agentActions || '[]').map((action: any) => ({
            ...action,
            timestamp: this.stringToDate(action.timestamp)
          })),
          userFeedback: userFeedback ? {
            ...userFeedback,
            timestamp: this.stringToDate(userFeedback.timestamp)
          } : undefined,
          llmSource: node.llmSource,
          llmModel: node.llmModel,
          llmError: node.llmError
        } as LLMInteraction;
      });
    } catch (error) {
      console.error('Error fetching interactions by status:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  async getInteractionsBySeverity(severity: string, limitCount: number = 50): Promise<LLMInteraction[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (i:Interaction {severity: $severity})
        RETURN i
        ORDER BY i.timestamp DESC
        LIMIT $limit
      `, { severity, limit: limitCount });

      return result.records.map(record => {
        const node = record.get('i').properties;
        const userFeedback = node.userFeedback ? JSON.parse(node.userFeedback) : undefined;
        
        return {
          id: node.id,
          timestamp: this.stringToDate(node.timestamp),
          input: node.input,
          output: node.output,
          status: node.status,
          severity: node.severity,
          violations: JSON.parse(node.violations || '[]'),
          agentActions: JSON.parse(node.agentActions || '[]').map((action: any) => ({
            ...action,
            timestamp: this.stringToDate(action.timestamp)
          })),
          userFeedback: userFeedback ? {
            ...userFeedback,
            timestamp: this.stringToDate(userFeedback.timestamp)
          } : undefined,
          llmSource: node.llmSource,
          llmModel: node.llmModel,
          llmError: node.llmError
        } as LLMInteraction;
      });
    } catch (error) {
      console.error('Error fetching interactions by severity:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Check if Neo4j is configured
  isConfigured(): boolean {
    return neo4jService.isConfigured();
  }
}

export const neo4jDatabaseService = new Neo4jService();
