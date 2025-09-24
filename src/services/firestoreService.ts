import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  LLMInteraction, 
  AuditLogEntry, 
  FeedbackEntry, 
  AgentSettings, 
  DashboardStats 
} from '../types';

export class FirestoreService {
  // Collections
  private readonly INTERACTIONS_COLLECTION = 'interactions';
  private readonly AUDIT_LOGS_COLLECTION = 'auditLogs';
  private readonly FEEDBACK_COLLECTION = 'feedback';
  private readonly SETTINGS_COLLECTION = 'settings';
  private readonly SETTINGS_DOC_ID = 'agentSettings';

  // Helper method to clean objects for Firestore
  private cleanObjectForFirestore(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }
    
    if (obj instanceof Date) {
      return Timestamp.fromDate(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObjectForFirestore(item));
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.cleanObjectForFirestore(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  // Interactions
  async saveInteraction(interaction: LLMInteraction): Promise<string> {
    try {
      const interactionData = this.cleanObjectForFirestore(interaction);

      const docRef = await addDoc(collection(db, this.INTERACTIONS_COLLECTION), interactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving interaction:', error);
      throw new Error('Failed to save interaction');
    }
  }

  async getInteractions(limitCount: number = 50): Promise<LLMInteraction[]> {
    try {
      const q = query(
        collection(db, this.INTERACTIONS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return this.convertInteractionsSnapshot(querySnapshot);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      return [];
    }
  }

  async updateInteraction(id: string, updates: Partial<LLMInteraction>): Promise<void> {
    try {
      const docRef = doc(db, this.INTERACTIONS_COLLECTION, id);
      const updateData = this.cleanObjectForFirestore(updates);

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating interaction:', error);
      throw new Error('Failed to update interaction');
    }
  }

  // Audit Logs
  async saveAuditLog(auditLog: AuditLogEntry): Promise<string> {
    try {
      const auditLogData = this.cleanObjectForFirestore(auditLog);

      const docRef = await addDoc(collection(db, this.AUDIT_LOGS_COLLECTION), auditLogData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving audit log:', error);
      throw new Error('Failed to save audit log');
    }
  }

  async getAuditLogs(limitCount: number = 100): Promise<AuditLogEntry[]> {
    try {
      const q = query(
        collection(db, this.AUDIT_LOGS_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp.toDate()
        } as AuditLogEntry;
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  // Feedback
  async saveFeedback(feedback: FeedbackEntry): Promise<string> {
    try {
      const feedbackData = this.cleanObjectForFirestore(feedback);

      const docRef = await addDoc(collection(db, this.FEEDBACK_COLLECTION), feedbackData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw new Error('Failed to save feedback');
    }
  }

  async getFeedback(limitCount: number = 100): Promise<FeedbackEntry[]> {
    try {
      const q = query(
        collection(db, this.FEEDBACK_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp.toDate()
        } as FeedbackEntry;
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return [];
    }
  }

  // Settings
  async saveSettings(settings: AgentSettings): Promise<void> {
    try {
      const docRef = doc(db, this.SETTINGS_COLLECTION, this.SETTINGS_DOC_ID);
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  async getSettings(): Promise<AgentSettings> {
    try {
      const docRef = doc(db, this.SETTINGS_COLLECTION, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as AgentSettings;
      } else {
        // Return default settings if none exist
        const defaultSettings: AgentSettings = {
          policyEnforcer: { enabled: true },
          verifier: { enabled: true },
          auditLogger: { enabled: true },
          responseAgent: { enabled: true },
          feedbackAgent: { enabled: true },
          severityThreshold: 7.0
        };
        
        // Save default settings
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
    }
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [interactions, auditLogs] = await Promise.all([
        this.getInteractions(1000), // Get more for accurate stats
        this.getAuditLogs(1000)
      ]);

      const total = interactions.length;
      const flagged = interactions.filter(i => i.status === 'blocked').length;
      
      const severitySum = interactions.reduce((sum, i) => {
        const severityValue = { low: 1, medium: 2, high: 3, critical: 4 }[i.severity];
        return sum + severityValue;
      }, 0);

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

      const agentActionCounts = auditLogs.reduce((counts, log) => {
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
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return {
        totalInteractions: 0,
        flaggedInteractions: 0,
        averageSeverity: 0,
        topViolations: [],
        agentActivity: []
      };
    }
  }

  // Helper method to convert Firestore timestamps
  private convertInteractionsSnapshot(querySnapshot: QuerySnapshot<DocumentData>): LLMInteraction[] {
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        timestamp: data.timestamp.toDate(),
        agentActions: data.agentActions?.map((action: any) => ({
          ...action,
          timestamp: action.timestamp.toDate()
        })) || [],
        userFeedback: data.userFeedback ? {
          ...data.userFeedback,
          timestamp: data.userFeedback.timestamp.toDate()
        } : undefined
      } as LLMInteraction;
    });
  }

  // Utility methods for filtering
  async getInteractionsByStatus(status: string, limitCount: number = 50): Promise<LLMInteraction[]> {
    try {
      const q = query(
        collection(db, this.INTERACTIONS_COLLECTION),
        where('status', '==', status),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return this.convertInteractionsSnapshot(querySnapshot);
    } catch (error) {
      console.error('Error fetching interactions by status:', error);
      return [];
    }
  }

  async getInteractionsBySeverity(severity: string, limitCount: number = 50): Promise<LLMInteraction[]> {
    try {
      const q = query(
        collection(db, this.INTERACTIONS_COLLECTION),
        where('severity', '==', severity),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return this.convertInteractionsSnapshot(querySnapshot);
    } catch (error) {
      console.error('Error fetching interactions by severity:', error);
      return [];
    }
  }

  // Check if Firebase is configured
  isConfigured(): boolean {
    return !!(
      import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID
    );
  }
}

export const firestoreService = new FirestoreService();