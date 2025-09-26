export interface CompanyGuideline {
  id: string;
  name: string;
  content: string;
  dataTypes: string[];
  rules: ComplianceRule[];
  thresholds: ThresholdSettings;
  uploadDate: Date;
  lastUpdated: Date;
  extractedRules: {
    dataClassification: string[];
    privacyRequirements: string[];
    accessControls: string[];
    retentionPolicies: string[];
    qualityStandards: string[];
    securityMeasures: string[];
  };
}

export interface ComplianceRule {
  id: string;
  type: 'data_handling' | 'privacy' | 'retention' | 'access_control' | 'classification';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  conditions: string[];
  actions: string[];
}

export interface ThresholdSettings {
  overallCompliance: number; // 0-100
  dataQuality: number;
  privacyCompliance: number;
  retentionCompliance: number;
  accessControlCompliance: number;
  classificationAccuracy: number;
}

export interface DataEvaluationResult {
  dataType: string;
  complianceScore: number;
  violations: ComplianceViolation[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  anomalies: Anomaly[];
}

export interface ComplianceViolation {
  ruleId: string;
  ruleType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  suggestedAction: string;
}

export interface Anomaly {
  id: string;
  type: 'data_quality' | 'privacy_breach' | 'access_violation' | 'retention_issue' | 'classification_error';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  affectedData: string[];
  visualizationType: 'chart' | 'table' | 'heatmap' | 'timeline' | 'network' | 'scatter';
  metrics: Record<string, any>;
}

export class CompanyGuidelinesService {
  private guidelines: CompanyGuideline[] = [];
  private agentTuningData: Map<string, any> = new Map();

  async processCompanyGuidelines(file: File): Promise<CompanyGuideline> {
    try {
      const content = await this.readFileAsText(file);
      const processedGuidelines = await this.analyzeGuidelines(content, file.name);
      
      this.guidelines.push(processedGuidelines);
      await this.tuneAgent(processedGuidelines);
      
      return processedGuidelines;
    } catch (error) {
      console.error('Error processing company guidelines:', error);
      throw new Error('Failed to process company guidelines');
    }
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private async analyzeGuidelines(content: string, fileName: string): Promise<CompanyGuideline> {
    // Simulate AI analysis of company guidelines
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const dataTypes = this.extractDataTypes(content);
    const rules = this.extractComplianceRules(content);
    const thresholds = this.calculateThresholds(content, rules);
    const extractedRules = this.extractDetailedRules(content);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: fileName.replace(/\.[^/.]+$/, ""),
      content,
      dataTypes,
      rules,
      thresholds,
      uploadDate: new Date(),
      lastUpdated: new Date(),
      extractedRules
    };
  }

  private extractDetailedRules(content: string): CompanyGuideline['extractedRules'] {
    const lowerContent = content.toLowerCase();
    
    return {
      dataClassification: this.extractDataClassificationRules(lowerContent),
      privacyRequirements: this.extractPrivacyRequirements(lowerContent),
      accessControls: this.extractAccessControlRules(lowerContent),
      retentionPolicies: this.extractRetentionPolicies(lowerContent),
      qualityStandards: this.extractQualityStandards(lowerContent),
      securityMeasures: this.extractSecurityMeasures(lowerContent)
    };
  }

  private extractDataClassificationRules(content: string): string[] {
    const rules: string[] = [];
    
    if (content.includes('personal data') || content.includes('pii')) {
      rules.push('Personal data must be classified as confidential');
    }
    if (content.includes('financial data')) {
      rules.push('Financial data requires special handling and encryption');
    }
    if (content.includes('health data') || content.includes('medical')) {
      rules.push('Health data is subject to HIPAA and GDPR Article 9');
    }
    if (content.includes('customer data')) {
      rules.push('Customer data must be classified based on sensitivity level');
    }
    
    return rules;
  }

  private extractPrivacyRequirements(content: string): string[] {
    const rules: string[] = [];
    
    if (content.includes('consent')) {
      rules.push('Explicit consent required for data processing');
    }
    if (content.includes('encryption')) {
      rules.push('Data must be encrypted at rest and in transit');
    }
    if (content.includes('anonymization') || content.includes('pseudonymization')) {
      rules.push('Data must be anonymized or pseudonymized when possible');
    }
    if (content.includes('data minimization')) {
      rules.push('Collect only necessary data (data minimization principle)');
    }
    
    return rules;
  }

  private extractAccessControlRules(content: string): string[] {
    const rules: string[] = [];
    
    if (content.includes('role-based access')) {
      rules.push('Implement role-based access control (RBAC)');
    }
    if (content.includes('multi-factor authentication')) {
      rules.push('Require multi-factor authentication for sensitive data access');
    }
    if (content.includes('audit log')) {
      rules.push('Maintain comprehensive audit logs for all data access');
    }
    
    return rules;
  }

  private extractRetentionPolicies(content: string): string[] {
    const rules: string[] = [];
    
    if (content.includes('retention period')) {
      rules.push('Data must be deleted after specified retention period');
    }
    if (content.includes('7 years')) {
      rules.push('Financial records must be retained for 7 years');
    }
    if (content.includes('customer data')) {
      rules.push('Customer data retention based on business need');
    }
    
    return rules;
  }

  private extractQualityStandards(content: string): string[] {
    const rules: string[] = [];
    
    if (content.includes('data quality')) {
      rules.push('Maintain data accuracy and completeness');
    }
    if (content.includes('validation')) {
      rules.push('Implement data validation rules');
    }
    if (content.includes('integrity')) {
      rules.push('Ensure data integrity throughout lifecycle');
    }
    
    return rules;
  }

  private extractSecurityMeasures(content: string): string[] {
    const rules: string[] = [];
    
    if (content.includes('security')) {
      rules.push('Implement comprehensive security measures');
    }
    if (content.includes('backup')) {
      rules.push('Regular data backups required');
    }
    if (content.includes('incident response')) {
      rules.push('Data breach incident response plan required');
    }
    
    return rules;
  }

  private extractDataTypes(content: string): string[] {
    const lowerContent = content.toLowerCase();
    const dataTypes = [];
    
    // Common data types based on content analysis
    if (lowerContent.includes('personal') || lowerContent.includes('pii')) {
      dataTypes.push('personal_identifiable_information');
    }
    if (lowerContent.includes('financial') || lowerContent.includes('payment')) {
      dataTypes.push('financial_data');
    }
    if (lowerContent.includes('health') || lowerContent.includes('medical')) {
      dataTypes.push('health_data');
    }
    if (lowerContent.includes('customer') || lowerContent.includes('client')) {
      dataTypes.push('customer_data');
    }
    if (lowerContent.includes('employee') || lowerContent.includes('hr')) {
      dataTypes.push('employee_data');
    }
    if (lowerContent.includes('transaction') || lowerContent.includes('payment')) {
      dataTypes.push('transaction_data');
    }
    if (lowerContent.includes('log') || lowerContent.includes('audit')) {
      dataTypes.push('log_data');
    }
    if (lowerContent.includes('synthetic') || lowerContent.includes('generated')) {
      dataTypes.push('synthetic_data');
    }
    
    return dataTypes.length > 0 ? dataTypes : ['general_data'];
  }

  private extractComplianceRules(content: string): ComplianceRule[] {
    const rules: ComplianceRule[] = [];
    const lowerContent = content.toLowerCase();
    
    // Data handling rules
    if (lowerContent.includes('encrypt') || lowerContent.includes('encryption')) {
      rules.push({
        id: 'encryption_required',
        type: 'data_handling',
        description: 'All sensitive data must be encrypted at rest and in transit',
        severity: 'high',
        conditions: ['data_classification = sensitive', 'data_storage = true'],
        actions: ['encrypt_data', 'verify_encryption']
      });
    }
    
    // Privacy rules
    if (lowerContent.includes('consent') || lowerContent.includes('gdpr')) {
      rules.push({
        id: 'consent_required',
        type: 'privacy',
        description: 'Explicit consent required for personal data processing',
        severity: 'critical',
        conditions: ['data_type = personal', 'processing = true'],
        actions: ['obtain_consent', 'document_consent', 'verify_consent']
      });
    }
    
    // Retention rules
    if (lowerContent.includes('retention') || lowerContent.includes('retain')) {
      rules.push({
        id: 'retention_policy',
        type: 'retention',
        description: 'Data must be retained according to policy and deleted after retention period',
        severity: 'medium',
        conditions: ['data_age > retention_period', 'data_type = personal'],
        actions: ['delete_data', 'archive_data', 'verify_deletion']
      });
    }
    
    // Access control rules
    if (lowerContent.includes('access') || lowerContent.includes('permission')) {
      rules.push({
        id: 'access_control',
        type: 'access_control',
        description: 'Data access must be controlled and logged',
        severity: 'high',
        conditions: ['data_access = true', 'user_authorized = false'],
        actions: ['deny_access', 'log_access_attempt', 'notify_admin']
      });
    }
    
    // Classification rules
    if (lowerContent.includes('classify') || lowerContent.includes('classification')) {
      rules.push({
        id: 'data_classification',
        type: 'classification',
        description: 'Data must be properly classified according to sensitivity levels',
        severity: 'medium',
        conditions: ['data_classification = unknown', 'data_type = sensitive'],
        actions: ['classify_data', 'apply_labels', 'verify_classification']
      });
    }
    
    return rules;
  }

  private calculateThresholds(content: string, rules: ComplianceRule[]): ThresholdSettings {
    const lowerContent = content.toLowerCase();
    
    // Calculate thresholds based on content strictness
    let strictness = 0.7; // Default moderate strictness
    
    if (lowerContent.includes('strict') || lowerContent.includes('critical')) {
      strictness = 0.9;
    } else if (lowerContent.includes('lenient') || lowerContent.includes('flexible')) {
      strictness = 0.5;
    }
    
    return {
      overallCompliance: Math.round(85 * strictness),
      dataQuality: Math.round(90 * strictness),
      privacyCompliance: Math.round(95 * strictness),
      retentionCompliance: Math.round(80 * strictness),
      accessControlCompliance: Math.round(88 * strictness),
      classificationAccuracy: Math.round(92 * strictness)
    };
  }

  private async tuneAgent(guidelines: CompanyGuideline): Promise<void> {
    // Simulate agent tuning based on company guidelines
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const tuningData = {
      dataTypes: guidelines.dataTypes,
      rules: guidelines.rules,
      thresholds: guidelines.thresholds,
      patterns: this.extractPatterns(guidelines.content),
      lastTuned: new Date()
    };
    
    this.agentTuningData.set(guidelines.id, tuningData);
  }

  private extractPatterns(content: string): string[] {
    const patterns = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('email')) patterns.push('email_pattern');
    if (lowerContent.includes('phone')) patterns.push('phone_pattern');
    if (lowerContent.includes('ssn') || lowerContent.includes('social security')) patterns.push('ssn_pattern');
    if (lowerContent.includes('credit card') || lowerContent.includes('cc')) patterns.push('credit_card_pattern');
    if (lowerContent.includes('address')) patterns.push('address_pattern');
    if (lowerContent.includes('date of birth') || lowerContent.includes('dob')) patterns.push('dob_pattern');
    
    return patterns;
  }

  async evaluateData(data: any, dataType: string, guidelinesId: string): Promise<DataEvaluationResult> {
    const guidelines = this.guidelines.find(g => g.id === guidelinesId);
    if (!guidelines) {
      throw new Error('Company guidelines not found');
    }

    const tuningData = this.agentTuningData.get(guidelinesId);
    if (!tuningData) {
      throw new Error('Agent not tuned for these guidelines');
    }

    // Simulate data evaluation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const violations = this.checkComplianceViolations(data, guidelines.rules);
    const anomalies = this.detectAnomalies(data, dataType, tuningData);
    const complianceScore = this.calculateComplianceScore(violations, guidelines.thresholds);
    const riskLevel = this.assessRiskLevel(complianceScore, violations);
    const recommendations = this.generateRecommendations(violations, anomalies);

    return {
      dataType,
      complianceScore,
      violations,
      recommendations,
      riskLevel,
      anomalies
    };
  }

  private checkComplianceViolations(data: any, rules: ComplianceRule[]): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    
    // Simulate violation detection
    rules.forEach(rule => {
      if (Math.random() < 0.3) { // 30% chance of violation
        violations.push({
          ruleId: rule.id,
          ruleType: rule.type,
          description: `Violation of ${rule.description}`,
          severity: rule.severity,
          confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
          suggestedAction: rule.actions[0] || 'Review and fix'
        });
      }
    });
    
    return violations;
  }

  private detectAnomalies(data: any, dataType: string, tuningData: any): Anomaly[] {
    const anomalies: Anomaly[] = [];
    
    // Simulate anomaly detection
    const anomalyTypes = ['data_quality', 'privacy_breach', 'access_violation', 'retention_issue', 'classification_error'];
    
    anomalyTypes.forEach(type => {
      if (Math.random() < 0.2) { // 20% chance of anomaly
        anomalies.push({
          id: Math.random().toString(36).substr(2, 9),
          type: type as any,
          description: `Detected ${type.replace('_', ' ')} anomaly`,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
          affectedData: [`${dataType}_field_${Math.floor(Math.random() * 10)}`],
          visualizationType: this.selectVisualizationType(type),
          metrics: this.generateMetrics(type)
        });
      }
    });
    
    return anomalies;
  }

  private selectVisualizationType(anomalyType: string): 'chart' | 'table' | 'heatmap' | 'timeline' | 'network' | 'scatter' {
    const visualizationMap: Record<string, any> = {
      'data_quality': 'chart',
      'privacy_breach': 'heatmap',
      'access_violation': 'timeline',
      'retention_issue': 'scatter',
      'classification_error': 'table'
    };
    
    return visualizationMap[anomalyType] || 'chart';
  }

  private generateMetrics(anomalyType: string): Record<string, any> {
    const baseMetrics = {
      count: Math.floor(Math.random() * 100),
      severity: Math.random(),
      confidence: Math.random() * 0.3 + 0.7
    };
    
    switch (anomalyType) {
      case 'data_quality':
        return { ...baseMetrics, completeness: Math.random(), accuracy: Math.random() };
      case 'privacy_breach':
        return { ...baseMetrics, risk_score: Math.random(), affected_records: Math.floor(Math.random() * 1000) };
      case 'access_violation':
        return { ...baseMetrics, unauthorized_access: Math.floor(Math.random() * 50), time_range: '24h' };
      case 'retention_issue':
        return { ...baseMetrics, overdue_days: Math.floor(Math.random() * 365), retention_policy: '7_years' };
      case 'classification_error':
        return { ...baseMetrics, misclassified_count: Math.floor(Math.random() * 200), accuracy_drop: Math.random() * 0.2 };
      default:
        return baseMetrics;
    }
  }

  private calculateComplianceScore(violations: ComplianceViolation[], thresholds: ThresholdSettings): number {
    if (violations.length === 0) return 100;
    
    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalWeight = violations.reduce((sum, v) => sum + severityWeights[v.severity], 0);
    const maxWeight = violations.length * 4; // All critical
    
    const score = Math.max(0, 100 - (totalWeight / maxWeight) * 100);
    return Math.round(score);
  }

  private assessRiskLevel(complianceScore: number, violations: ComplianceViolation[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    
    if (criticalViolations > 0 || complianceScore < 50) return 'critical';
    if (complianceScore < 70) return 'high';
    if (complianceScore < 85) return 'medium';
    return 'low';
  }

  private generateRecommendations(violations: ComplianceViolation[], anomalies: Anomaly[]): string[] {
    const recommendations: string[] = [];
    
    violations.forEach(violation => {
      recommendations.push(`Fix ${violation.ruleType} violation: ${violation.suggestedAction}`);
    });
    
    anomalies.forEach(anomaly => {
      recommendations.push(`Address ${anomaly.type.replace('_', ' ')} anomaly: Review ${anomaly.affectedData.join(', ')}`);
    });
    
    if (recommendations.length === 0) {
      recommendations.push('No immediate issues detected. Continue monitoring data quality.');
    }
    
    return recommendations;
  }

  getGuidelines(): CompanyGuideline[] {
    return this.guidelines;
  }

  getGuidelineById(id: string): CompanyGuideline | undefined {
    return this.guidelines.find(g => g.id === id);
  }

  getTuningData(guidelinesId: string): any {
    return this.agentTuningData.get(guidelinesId);
  }

  // New comprehensive data evaluation method
  async evaluateDatasetAgainstGuidelines(
    dataset: any, 
    guidelineId: string, 
    gdprAnalysis?: any
  ): Promise<{
    overallComplianceScore: number;
    gdprComplianceScore: number;
    enterpriseComplianceScore: number;
    dataQualityScore: number;
    anomalies: any[];
    violations: any[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    detailedAnalysis: any;
  }> {
    const guideline = this.guidelines.find(g => g.id === guidelineId);
    if (!guideline) {
      throw new Error('Guideline not found');
    }

    // Analyze data structure and content
    const dataAnalysis = this.analyzeDatasetStructure(dataset);
    
    // Check against enterprise guidelines
    const enterpriseViolations = this.checkEnterpriseCompliance(dataset, guideline);
    const enterpriseScore = this.calculateEnterpriseScore(enterpriseViolations, guideline.thresholds);
    
    // Check GDPR compliance (if analysis provided)
    const gdprScore = gdprAnalysis ? gdprAnalysis.overallComplianceScore : 85; // Default score
    const gdprViolations = gdprAnalysis ? gdprAnalysis.violations : [];
    
    // Detect anomalies
    const anomalies = this.detectDataAnomalies(dataset, dataAnalysis);
    
    // Calculate data quality
    const qualityScore = this.calculateDataQualityScore(dataset, dataAnalysis);
    
    // Overall compliance score
    const overallScore = Math.round((enterpriseScore + gdprScore + qualityScore) / 3);
    
    // Determine risk level
    const riskLevel = this.determineOverallRiskLevel(overallScore, enterpriseViolations, gdprViolations, anomalies);
    
    // Generate recommendations
    const recommendations = this.generateComprehensiveRecommendations(
      enterpriseViolations, 
      gdprViolations, 
      anomalies, 
      guideline
    );

    return {
      overallComplianceScore: overallScore,
      gdprComplianceScore: gdprScore,
      enterpriseComplianceScore: enterpriseScore,
      dataQualityScore: qualityScore,
      anomalies,
      violations: [...enterpriseViolations, ...gdprViolations],
      recommendations,
      riskLevel,
      detailedAnalysis: {
        dataStructure: dataAnalysis,
        enterpriseRules: guideline.extractedRules,
        thresholds: guideline.thresholds,
        analysisTimestamp: new Date()
      }
    };
  }

  private analyzeDatasetStructure(dataset: any): any {
    const analysis = {
      totalRows: Array.isArray(dataset) ? dataset.length : 0,
      columns: [],
      dataTypes: {},
      missingValues: {},
      duplicates: 0,
      outliers: {},
      patterns: {}
    };

    if (Array.isArray(dataset) && dataset.length > 0) {
      const firstRow = dataset[0];
      analysis.columns = Object.keys(firstRow);
      
      // Analyze each column
      analysis.columns.forEach(column => {
        const values = dataset.map(row => row[column]).filter(v => v !== null && v !== undefined);
        analysis.dataTypes[column] = this.detectColumnDataType(values);
        analysis.missingValues[column] = dataset.length - values.length;
        
        // Detect patterns
        analysis.patterns[column] = this.detectDataPatterns(values, column);
      });

      // Check for duplicates
      const uniqueRows = new Set(dataset.map(row => JSON.stringify(row)));
      analysis.duplicates = dataset.length - uniqueRows.size;
    }

    return analysis;
  }

  private detectColumnDataType(values: any[]): string {
    if (values.length === 0) return 'unknown';
    
    const sample = values.slice(0, 10);
    const hasNumbers = sample.some(v => typeof v === 'number');
    const hasDates = sample.some(v => !isNaN(Date.parse(v)));
    const hasEmails = sample.some(v => typeof v === 'string' && v.includes('@'));
    const hasPhones = sample.some(v => typeof v === 'string' && /[\d\-\(\)\s]{10,}/.test(v));
    
    if (hasEmails) return 'email';
    if (hasPhones) return 'phone';
    if (hasDates) return 'date';
    if (hasNumbers) return 'numeric';
    return 'text';
  }

  private detectDataPatterns(values: any[], columnName: string): any {
    const patterns = {
      hasPersonalData: false,
      hasFinancialData: false,
      hasHealthData: false,
      hasLocationData: false,
      hasIdentifiers: false
    };

    const lowerColumnName = columnName.toLowerCase();
    const sampleValues = values.slice(0, 20).join(' ').toLowerCase();

    // Check for personal data patterns
    if (lowerColumnName.includes('email') || lowerColumnName.includes('name') || 
        lowerColumnName.includes('address') || sampleValues.includes('@')) {
      patterns.hasPersonalData = true;
    }

    // Check for financial data patterns
    if (lowerColumnName.includes('credit') || lowerColumnName.includes('card') || 
        lowerColumnName.includes('account') || lowerColumnName.includes('balance')) {
      patterns.hasFinancialData = true;
    }

    // Check for health data patterns
    if (lowerColumnName.includes('medical') || lowerColumnName.includes('health') || 
        lowerColumnName.includes('diagnosis') || lowerColumnName.includes('patient')) {
      patterns.hasHealthData = true;
    }

    // Check for location data patterns
    if (lowerColumnName.includes('location') || lowerColumnName.includes('address') || 
        lowerColumnName.includes('gps') || lowerColumnName.includes('coordinates')) {
      patterns.hasLocationData = true;
    }

    // Check for identifiers
    if (lowerColumnName.includes('id') || lowerColumnName.includes('ssn') || 
        lowerColumnName.includes('passport') || lowerColumnName.includes('license')) {
      patterns.hasIdentifiers = true;
    }

    return patterns;
  }

  private checkEnterpriseCompliance(dataset: any, guideline: CompanyGuideline): any[] {
    const violations = [];
    const dataAnalysis = this.analyzeDatasetStructure(dataset);

    // Check data classification rules
    guideline.extractedRules.dataClassification.forEach(rule => {
      if (rule.includes('confidential') && this.hasSensitiveData(dataAnalysis)) {
        violations.push({
          ruleId: 'data-classification-1',
          ruleType: 'data_classification',
          description: 'Sensitive data not properly classified as confidential',
          severity: 'high',
          confidence: 0.8,
          suggestedAction: 'Classify sensitive data as confidential and apply appropriate controls'
        });
      }
    });

    // Check privacy requirements
    guideline.extractedRules.privacyRequirements.forEach(rule => {
      if (rule.includes('encryption') && !this.hasEncryptionIndicators(dataset)) {
        violations.push({
          ruleId: 'privacy-encryption-1',
          ruleType: 'privacy',
          description: 'Data not encrypted as required by enterprise guidelines',
          severity: 'critical',
          confidence: 0.9,
          suggestedAction: 'Implement encryption for data at rest and in transit'
        });
      }
    });

    // Check access controls
    guideline.extractedRules.accessControls.forEach(rule => {
      if (rule.includes('audit log') && !this.hasAuditLogging(dataset)) {
        violations.push({
          ruleId: 'access-control-1',
          ruleType: 'access_control',
          description: 'Missing audit logging for data access',
          severity: 'medium',
          confidence: 0.7,
          suggestedAction: 'Implement comprehensive audit logging for all data access'
        });
      }
    });

    return violations;
  }

  private hasSensitiveData(analysis: any): boolean {
    return Object.values(analysis.patterns).some((pattern: any) => 
      pattern.hasPersonalData || pattern.hasFinancialData || pattern.hasHealthData
    );
  }

  private hasEncryptionIndicators(dataset: any): boolean {
    // Simulate check for encryption indicators
    return Math.random() > 0.7; // 30% chance of having encryption
  }

  private hasAuditLogging(dataset: any): boolean {
    // Simulate check for audit logging
    return Math.random() > 0.6; // 40% chance of having audit logging
  }

  private detectDataAnomalies(dataset: any, analysis: any): any[] {
    const anomalies = [];

    // Check for data quality anomalies
    if (analysis.duplicates > analysis.totalRows * 0.1) {
      anomalies.push({
        id: 'duplicate-data',
        type: 'data_quality',
        description: `High number of duplicate records detected (${analysis.duplicates})`,
        severity: 'medium',
        confidence: 0.8,
        affectedData: ['all_rows'],
        visualizationType: 'table',
        metrics: { duplicateCount: analysis.duplicates, duplicatePercentage: (analysis.duplicates / analysis.totalRows) * 100 }
      });
    }

    // Check for missing data anomalies
    Object.entries(analysis.missingValues).forEach(([column, missingCount]) => {
      const missingPercentage = (missingCount as number / analysis.totalRows) * 100;
      if (missingPercentage > 20) {
        anomalies.push({
          id: `missing-data-${column}`,
          type: 'data_quality',
          description: `High percentage of missing values in ${column} (${missingPercentage.toFixed(1)}%)`,
          severity: 'high',
          confidence: 0.9,
          affectedData: [column],
          visualizationType: 'chart',
          metrics: { missingCount, missingPercentage, column }
        });
      }
    });

    return anomalies;
  }

  private calculateEnterpriseScore(violations: any[], thresholds: any): number {
    if (violations.length === 0) return 100;
    
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    const highViolations = violations.filter(v => v.severity === 'high').length;
    const mediumViolations = violations.filter(v => v.severity === 'medium').length;
    
    const penalty = (criticalViolations * 20) + (highViolations * 10) + (mediumViolations * 5);
    return Math.max(0, 100 - penalty);
  }

  private calculateDataQualityScore(dataset: any, analysis: any): number {
    let score = 100;
    
    // Penalize for missing data
    const totalMissing = Object.values(analysis.missingValues).reduce((sum, count) => sum + (count as number), 0);
    const missingPercentage = (totalMissing / (analysis.totalRows * analysis.columns.length)) * 100;
    score -= missingPercentage * 0.5;
    
    // Penalize for duplicates
    const duplicatePercentage = (analysis.duplicates / analysis.totalRows) * 100;
    score -= duplicatePercentage * 0.3;
    
    return Math.max(0, Math.round(score));
  }

  private determineOverallRiskLevel(
    overallScore: number, 
    enterpriseViolations: any[], 
    gdprViolations: any[], 
    anomalies: any[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = [...enterpriseViolations, ...gdprViolations, ...anomalies]
      .filter(item => item.severity === 'critical').length;
    const highCount = [...enterpriseViolations, ...gdprViolations, ...anomalies]
      .filter(item => item.severity === 'high').length;

    if (criticalCount > 0 || overallScore < 50) return 'critical';
    if (highCount > 2 || overallScore < 70) return 'high';
    if (highCount > 0 || overallScore < 85) return 'medium';
    return 'low';
  }

  private generateComprehensiveRecommendations(
    enterpriseViolations: any[], 
    gdprViolations: any[], 
    anomalies: any[], 
    guideline: CompanyGuideline
  ): string[] {
    const recommendations = [];

    if (enterpriseViolations.length > 0) {
      recommendations.push('Address enterprise guideline violations immediately');
      enterpriseViolations.forEach(violation => {
        recommendations.push(`- ${violation.suggestedAction}`);
      });
    }

    if (gdprViolations.length > 0) {
      recommendations.push('Ensure GDPR compliance for all personal data processing');
      gdprViolations.forEach(violation => {
        recommendations.push(`- ${violation.description}`);
      });
    }

    if (anomalies.length > 0) {
      recommendations.push('Investigate and resolve data quality anomalies');
      anomalies.forEach(anomaly => {
        recommendations.push(`- ${anomaly.description}`);
      });
    }

    if (recommendations.length === 0) {
      recommendations.push('Data appears to be compliant with enterprise guidelines and GDPR requirements');
    }

    return recommendations;
  }
}

export const companyGuidelinesService = new CompanyGuidelinesService();
