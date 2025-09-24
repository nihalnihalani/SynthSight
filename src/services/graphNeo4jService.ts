import { neo4jService } from '../config/neo4j';
import { 
  LLMInteraction, 
  AuditLogEntry, 
  FeedbackEntry, 
  AgentSettings, 
  DashboardStats
} from '../types';

export class GraphNeo4jService {
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

  // Initialize database schema with proper graph structure
  async initializeSchema(): Promise<void> {
    const session = neo4jService.getSession();
    if (!session) return;

    try {
      // Create constraints for unique IDs
      await session.run(`
        CREATE CONSTRAINT interaction_id IF NOT EXISTS 
        FOR (i:Interaction) REQUIRE i.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT violation_id IF NOT EXISTS 
        FOR (v:Violation) REQUIRE v.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT agent_action_id IF NOT EXISTS 
        FOR (a:AgentAction) REQUIRE a.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT audit_log_id IF NOT EXISTS 
        FOR (al:AuditLog) REQUIRE al.id IS UNIQUE
      `);
      
      await session.run(`
        CREATE CONSTRAINT feedback_id IF NOT EXISTS 
        FOR (f:Feedback) REQUIRE f.id IS UNIQUE
      `);

      // Create indexes for better performance
      await session.run(`
        CREATE INDEX interaction_timestamp IF NOT EXISTS 
        FOR (i:Interaction) ON (i.timestamp)
      `);
      
      await session.run(`
        CREATE INDEX violation_severity IF NOT EXISTS 
        FOR (v:Violation) ON (v.severity)
      `);

      console.log('Graph Neo4j schema initialized successfully');
    } catch (error) {
      console.error('Error initializing Graph Neo4j schema:', error);
    } finally {
      await session.close();
    }
  }

  // Save interaction with proper graph relationships
  async saveInteraction(interaction: LLMInteraction): Promise<string> {
    const session = neo4jService.getSession();
    if (!session) {
      throw new Error('Neo4j not configured');
    }

    try {
      const id = interaction.id || this.generateId();
      
      // Create the main interaction node
      await session.run(`
        CREATE (i:Interaction {
          id: $id,
          timestamp: $timestamp,
          input: $input,
          output: $output,
          status: $status,
          severity: $severity,
          llmSource: $llmSource,
          llmModel: $llmModel,
          llmError: $llmError
        })
      `, {
        id,
        timestamp: this.dateToString(interaction.timestamp),
        input: interaction.input,
        output: interaction.output,
        status: interaction.status,
        severity: interaction.severity,
        llmSource: interaction.llmSource || null,
        llmModel: interaction.llmModel || null,
        llmError: interaction.llmError || null
      });

      // Create violation nodes and relationships
      for (const violation of interaction.violations) {
        const violationId = this.generateId();
        await session.run(`
          CREATE (v:Violation {
            id: $violationId,
            type: $type,
            description: $description,
            severity: $severity,
            confidence: $confidence,
            reason: $reason,
            location: $location,
            regulatoryFramework: $regulatoryFramework,
            complianceLevel: $complianceLevel
          })
          WITH v
          MATCH (i:Interaction {id: $interactionId})
          CREATE (i)-[:HAS_VIOLATION]->(v)
        `, {
          violationId,
          type: violation.type,
          description: violation.description,
          severity: violation.severity,
          confidence: violation.confidence,
          reason: violation.reason,
          location: violation.location || null,
          regulatoryFramework: violation.regulatoryFramework || null,
          complianceLevel: violation.complianceLevel || null,
          interactionId: id
        });
      }

      // Create agent action nodes and relationships
      for (const agentAction of interaction.agentActions) {
        const actionId = this.generateId();
        await session.run(`
          CREATE (a:AgentAction {
            id: $actionId,
            agentName: $agentName,
            action: $action,
            details: $details,
            timestamp: $timestamp
          })
          WITH a
          MATCH (i:Interaction {id: $interactionId})
          CREATE (i)-[:PROCESSED_BY]->(a)
        `, {
          actionId,
          agentName: agentAction.agentName,
          action: agentAction.action,
          details: agentAction.details,
          timestamp: this.dateToString(agentAction.timestamp),
          interactionId: id
        });

        // Create relationships between violations and agent actions
        if (interaction.violations.length > 0) {
          await session.run(`
            MATCH (i:Interaction {id: $interactionId})-[:HAS_VIOLATION]->(v:Violation)
            MATCH (i)-[:PROCESSED_BY]->(a:AgentAction {id: $actionId})
            CREATE (v)-[:TRIGGERED_ACTION]->(a)
          `, {
            interactionId: id,
            actionId
          });
        }
      }

      // Create user feedback node and relationship if exists
      if (interaction.userFeedback) {
        const feedbackId = this.generateId();
        await session.run(`
          CREATE (f:UserFeedback {
            id: $feedbackId,
            rating: $rating,
            comment: $comment,
            timestamp: $timestamp
          })
          WITH f
          MATCH (i:Interaction {id: $interactionId})
          CREATE (i)-[:HAS_FEEDBACK]->(f)
        `, {
          feedbackId,
          rating: interaction.userFeedback.rating,
          comment: interaction.userFeedback.comment || null,
          timestamp: this.dateToString(interaction.userFeedback.timestamp),
          interactionId: id
        });
      }

      return id;
    } catch (error) {
      console.error('Error saving interaction with graph relationships:', error);
      throw new Error('Failed to save interaction');
    } finally {
      await session.close();
    }
  }

  // Get interactions with their graph relationships
  async getInteractions(limitCount: number = 50): Promise<LLMInteraction[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (i:Interaction)
        OPTIONAL MATCH (i)-[:HAS_VIOLATION]->(v:Violation)
        OPTIONAL MATCH (i)-[:PROCESSED_BY]->(a:AgentAction)
        OPTIONAL MATCH (i)-[:HAS_FEEDBACK]->(f:UserFeedback)
        RETURN i, 
               collect(DISTINCT v) as violations,
               collect(DISTINCT a) as agentActions,
               f as userFeedback
        ORDER BY i.timestamp DESC
        LIMIT $limit
      `, { limit: limitCount });

      return result.records.map(record => {
        const interaction = record.get('i').properties;
        const violations = record.get('violations').map((v: any) => v?.properties).filter(Boolean);
        const agentActions = record.get('agentActions').map((a: any) => a?.properties).filter(Boolean);
        const userFeedback = record.get('userFeedback')?.properties;
        
        return {
          id: interaction.id,
          timestamp: this.stringToDate(interaction.timestamp),
          input: interaction.input,
          output: interaction.output,
          status: interaction.status,
          severity: interaction.severity,
          violations: violations.map((v: any) => ({
            type: v.type,
            description: v.description,
            severity: v.severity,
            confidence: v.confidence,
            reason: v.reason,
            location: v.location,
            regulatoryFramework: v.regulatoryFramework,
            complianceLevel: v.complianceLevel
          })),
          agentActions: agentActions.map((a: any) => ({
            agentName: a.agentName,
            action: a.action,
            details: a.details,
            timestamp: this.stringToDate(a.timestamp)
          })),
          userFeedback: userFeedback ? {
            rating: userFeedback.rating,
            comment: userFeedback.comment,
            timestamp: this.stringToDate(userFeedback.timestamp)
          } : undefined,
          llmSource: interaction.llmSource,
          llmModel: interaction.llmModel,
          llmError: interaction.llmError
        } as LLMInteraction;
      });
    } catch (error) {
      console.error('Error fetching interactions with relationships:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Get graph data for visualization (nodes and relationships)
  async getGraphData(): Promise<{ nodes: any[], links: any[] }> {
    const session = neo4jService.getSession();
    if (!session) return { nodes: [], links: [] };

    try {
      // Get all nodes
      const nodesResult = await session.run(`
        MATCH (n)
        RETURN n, labels(n)[0] as type, id(n) as nodeId
      `);

      const nodes = nodesResult.records.map(record => {
        const node = record.get('n').properties;
        const type = record.get('type');
        const nodeId = record.get('nodeId');
        
        return {
          id: nodeId.toString(), // Convert Neo4j Integer to string
          label: node.id || node.agentName || node.type || 'Node',
          type: type,
          properties: node,
          color: this.getNodeColor(type),
          size: this.getNodeSize(type, node)
        };
      });

      // Get all relationships
      const linksResult = await session.run(`
        MATCH (a)-[r]->(b)
        RETURN id(a) as sourceId, id(b) as targetId, type(r) as relType, r as relationship
      `);

      const links = linksResult.records.map(record => ({
        source: record.get('sourceId').toString(), // Convert Neo4j Integer to string
        target: record.get('targetId').toString(), // Convert Neo4j Integer to string
        type: record.get('relType'),
        properties: record.get('relationship').properties
      }));

      return { nodes, links };
    } catch (error) {
      console.error('Error fetching graph data:', error);
      return { nodes: [], links: [] };
    } finally {
      await session.close();
    }
  }

  private getNodeColor(type: string): string {
    const colors = {
      'Interaction': '#4A90E2',
      'Violation': '#E74C3C',
      'AgentAction': '#2ECC71',
      'UserFeedback': '#F39C12',
      'AuditLog': '#9B59B6'
    };
    return colors[type as keyof typeof colors] || '#95A5A6';
  }

  private getNodeSize(type: string, properties: any): number {
    if (type === 'Violation') {
      return Math.max(10, (properties.severity || 5) * 2);
    }
    return type === 'Interaction' ? 15 : 10;
  }

  // Additional methods for audit logs, feedback, etc. with proper relationships
  async saveAuditLog(auditLog: AuditLogEntry): Promise<string> {
    const session = neo4jService.getSession();
    if (!session) throw new Error('Neo4j not configured');

    try {
      const id = auditLog.id || this.generateId();
      
      await session.run(`
        CREATE (al:AuditLog {
          id: $id,
          timestamp: $timestamp,
          agentName: $agentName,
          action: $action,
          violationType: $violationType,
          severity: $severity,
          details: $details
        })
        WITH al
        MATCH (i:Interaction {id: $interactionId})
        CREATE (al)-[:AUDITS]->(i)
      `, {
        id,
        timestamp: this.dateToString(auditLog.timestamp),
        agentName: auditLog.agentName,
        action: auditLog.action,
        violationType: auditLog.violationType || null,
        severity: auditLog.severity || null,
        details: auditLog.details,
        interactionId: auditLog.interactionId
      });

      return id;
    } catch (error) {
      console.error('Error saving audit log:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get audit logs with relationships
  async getAuditLogs(limitCount: number = 50): Promise<AuditLogEntry[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (al:AuditLog)
        OPTIONAL MATCH (al)-[:AUDITS]->(i:Interaction)
        RETURN al, i.id as interactionId
        ORDER BY al.timestamp DESC
        LIMIT $limit
      `, { limit: limitCount });

      return result.records.map(record => {
        const auditLog = record.get('al').properties;
        return {
          id: auditLog.id,
          timestamp: this.stringToDate(auditLog.timestamp),
          agentName: auditLog.agentName,
          action: auditLog.action,
          violationType: auditLog.violationType,
          severity: auditLog.severity,
          interactionId: record.get('interactionId') || auditLog.interactionId,
          details: auditLog.details
        } as AuditLogEntry;
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Get feedback entries
  async getFeedback(limitCount: number = 50): Promise<FeedbackEntry[]> {
    const session = neo4jService.getSession();
    if (!session) return [];

    try {
      const result = await session.run(`
        MATCH (f:UserFeedback)
        OPTIONAL MATCH (i:Interaction)-[:HAS_FEEDBACK]->(f)
        RETURN f, i.id as interactionId
        ORDER BY f.timestamp DESC
        LIMIT $limit
      `, { limit: limitCount });

      return result.records.map(record => {
        const feedback = record.get('f').properties;
        return {
          id: feedback.id,
          timestamp: this.stringToDate(feedback.timestamp),
          interactionId: record.get('interactionId'),
          rating: feedback.rating,
          comment: feedback.comment
        } as FeedbackEntry;
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Save feedback with relationships
  async saveFeedback(feedback: FeedbackEntry): Promise<string> {
    const session = neo4jService.getSession();
    if (!session) throw new Error('Neo4j not configured');

    try {
      const id = feedback.id || this.generateId();
      
      await session.run(`
        CREATE (f:Feedback {
          id: $id,
          timestamp: $timestamp,
          rating: $rating,
          comment: $comment
        })
        WITH f
        MATCH (i:Interaction {id: $interactionId})
        CREATE (i)-[:HAS_FEEDBACK]->(f)
      `, {
        id,
        timestamp: this.dateToString(feedback.timestamp),
        rating: feedback.rating,
        comment: feedback.comment || null,
        interactionId: feedback.interactionId
      });

      return id;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get settings (simplified for now)
  async getSettings(): Promise<AgentSettings> {
    // For now, return default settings
    // In a full implementation, this would be stored in Neo4j as well
    return {
      policyEnforcer: { enabled: true },
      verifier: { enabled: true },
      auditLogger: { enabled: true },
      responseAgent: { enabled: true },
      feedbackAgent: { enabled: true },
      severityThreshold: 7.0
    };
  }

  // Save settings (simplified for now)
  async saveSettings(settings: AgentSettings): Promise<void> {
    // For now, just log the settings
    // In a full implementation, this would be stored in Neo4j
    console.log('Settings saved:', settings);
  }

  // Update interaction with additional data
  async updateInteraction(id: string, updates: Partial<LLMInteraction>): Promise<void> {
    const session = neo4jService.getSession();
    if (!session) throw new Error('Neo4j not configured');

    try {
      if (updates.userFeedback) {
        await session.run(`
          MATCH (i:Interaction {id: $id})
          CREATE (f:UserFeedback {
            id: $feedbackId,
            rating: $rating,
            comment: $comment,
            timestamp: $timestamp
          })
          CREATE (i)-[:HAS_FEEDBACK]->(f)
        `, {
          id,
          feedbackId: this.generateId(),
          rating: updates.userFeedback.rating,
          comment: updates.userFeedback.comment || null,
          timestamp: this.dateToString(updates.userFeedback.timestamp)
        });
      }
    } catch (error) {
      console.error('Error updating interaction:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Check if Neo4j is configured
  isConfigured(): boolean {
    return neo4jService.isConfigured();
  }

  // Get dashboard stats using graph queries
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
      // Get total interactions and flagged interactions
      const statsResult = await session.run(`
        MATCH (i:Interaction)
        OPTIONAL MATCH (i)-[:HAS_VIOLATION]->(v:Violation)
        RETURN 
          count(DISTINCT i) as totalInteractions,
          count(DISTINCT CASE WHEN v IS NOT NULL THEN i END) as flaggedInteractions,
          avg(CASE WHEN v IS NOT NULL THEN v.severity END) as avgSeverity
      `);

      const stats = statsResult.records[0];
      const totalInteractions = stats.get('totalInteractions').toNumber();
      const flaggedInteractions = stats.get('flaggedInteractions').toNumber();
      const averageSeverity = stats.get('avgSeverity') || 0;

      // Get top violations
      const violationsResult = await session.run(`
        MATCH (v:Violation)
        RETURN v.type as type, count(v) as count
        ORDER BY count DESC
        LIMIT 5
      `);

      const topViolations = violationsResult.records.map(record => ({
        type: record.get('type'),
        count: record.get('count').toNumber()
      }));

      // Get agent activity
      const agentResult = await session.run(`
        MATCH (a:AgentAction)
        RETURN a.agentName as agent, count(a) as actions
        ORDER BY actions DESC
      `);

      const agentActivity = agentResult.records.map(record => ({
        agent: record.get('agent'),
        actions: record.get('actions').toNumber()
      }));

      return {
        totalInteractions,
        flaggedInteractions,
        averageSeverity: Number(averageSeverity.toFixed(2)),
        topViolations,
        agentActivity
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
}

export const graphNeo4jDatabaseService = new GraphNeo4jService();
