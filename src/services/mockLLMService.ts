export class MockLLMService {
  static async generateSummary(content: string, fileName: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate contextual summary based on file name and content
    const lowerContent = content.toLowerCase();
    const lowerFileName = fileName.toLowerCase();
    
    if (lowerFileName.includes('enterprise') || lowerFileName.includes('guidelines') || lowerFileName.includes('synthetic') || lowerFileName.includes('toolkit')) {
      return `This enterprise guidelines document begins with an enterprise profile (SynthData Inc.) and positions synthetic data as a strategic asset, not just governance. The toolkit covers comprehensive data governance policies and procedures with a focus on synthetic data generation and management. It establishes clear frameworks for data classification, access controls, retention policies, and compliance monitoring.

Key applications include training data augmentation, rare-event simulation, privacy-safe sharing, and industry-specific use cases across healthcare, finance, and autonomous systems. The document reviews both commercial platforms (Gretel, MOSTLY AI, K2View) and open-source tools (SDV, Synthea, Faker) for synthetic data generation.

The evaluation framework emphasizes three critical lenses: fidelity (statistical accuracy), utility (business value), and privacy validation (differential privacy compliance). Workflow integration covers embedding synthetic data processes in CI/CD pipelines, monitoring data drift, and securing data pipelines throughout the lifecycle.

Risk mitigation strategies include differential privacy implementation, bias detection algorithms, granular access controls, and comprehensive audit logging. The document balances governance requirements with practical implementation guidance, reflecting the toolkit's broader scope beyond traditional data governance to encompass strategic synthetic data initiatives.`;
    }
    
    if (lowerFileName.includes('privacy') || lowerContent.includes('gdpr') || lowerContent.includes('privacy')) {
      return `This privacy policy document details comprehensive data protection measures and user privacy rights. It covers data collection practices, processing purposes, retention periods, and user rights under GDPR and other privacy regulations. The policy emphasizes transparency in data handling, user consent mechanisms, and provides clear procedures for data subject requests including access, rectification, and erasure.`;
    }
    
    if (lowerFileName.includes('governance') || lowerContent.includes('governance')) {
      return `This data governance framework establishes organizational policies and procedures for managing enterprise data assets. It defines roles and responsibilities, data classification standards, quality metrics, and compliance requirements. The framework ensures data consistency, accuracy, and security across all business processes while maintaining regulatory compliance and supporting strategic decision-making.`;
    }
    
    if (lowerContent.includes('security') || lowerContent.includes('encryption')) {
      return `This security document outlines comprehensive information security policies and technical controls. It covers access management, encryption standards, incident response procedures, and security monitoring protocols. The document emphasizes the protection of sensitive data through multi-layered security measures and regular security assessments.`;
    }
    
    // Generic summary
    return `This document contains important organizational policies and procedures. It covers key operational guidelines, compliance requirements, and best practices for data management. The content includes detailed information about processes, standards, and regulatory considerations relevant to enterprise operations and governance.`;
  }
  
  static async extractEntities(content: string): Promise<Array<{type: string, value: string, confidence: number}>> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const entities = [];
    const lowerContent = content.toLowerCase();
    
    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailRegex);
    if (emails) {
      emails.forEach(email => {
        entities.push({ type: 'email', value: email, confidence: 0.9 });
      });
    }
    
    // Extract phone numbers
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = content.match(phoneRegex);
    if (phones) {
      phones.forEach(phone => {
        entities.push({ type: 'phone', value: phone, confidence: 0.8 });
      });
    }
    
    // Extract potential names (capitalized words)
    const nameRegex = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const names = content.match(nameRegex);
    if (names) {
      names.slice(0, 3).forEach(name => {
        entities.push({ type: 'person', value: name, confidence: 0.6 });
      });
    }
    
    // Add some contextual entities based on content
    if (lowerContent.includes('data protection officer') || lowerContent.includes('dpo')) {
      entities.push({ type: 'person', value: 'Data Protection Officer', confidence: 0.8 });
    }
    
    if (lowerContent.includes('chief data officer') || lowerContent.includes('cdo')) {
      entities.push({ type: 'person', value: 'Chief Data Officer', confidence: 0.8 });
    }
    
    if (lowerContent.includes('compliance officer')) {
      entities.push({ type: 'person', value: 'Compliance Officer', confidence: 0.7 });
    }
    
    // Synthetic data specific entities
    if (lowerContent.includes('synthdata') || lowerContent.includes('synth data')) {
      entities.push({ type: 'organization', value: 'SynthData Inc.', confidence: 0.9 });
    }
    
    if (lowerContent.includes('gretel') || lowerContent.includes('mostly ai') || lowerContent.includes('k2view')) {
      entities.push({ type: 'organization', value: 'Commercial Platform', confidence: 0.8 });
    }
    
    if (lowerContent.includes('sdv') || lowerContent.includes('synthea') || lowerContent.includes('faker')) {
      entities.push({ type: 'organization', value: 'Open Source Tool', confidence: 0.8 });
    }
    
    if (lowerContent.includes('healthcare') || lowerContent.includes('finance') || lowerContent.includes('autonomous')) {
      entities.push({ type: 'industry', value: 'Industry Application', confidence: 0.7 });
    }
    
    return entities;
  }
  
  static async extractTopics(content: string): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const topics = [];
    const lowerContent = content.toLowerCase();
    
    // Topic detection based on content analysis
    if (lowerContent.includes('privacy') || lowerContent.includes('personal data') || lowerContent.includes('gdpr')) {
      topics.push('privacy');
    }
    
    if (lowerContent.includes('security') || lowerContent.includes('encryption') || lowerContent.includes('access control')) {
      topics.push('security');
    }
    
    if (lowerContent.includes('compliance') || lowerContent.includes('regulation') || lowerContent.includes('policy')) {
      topics.push('compliance');
    }
    
    if (lowerContent.includes('data') || lowerContent.includes('information') || lowerContent.includes('database')) {
      topics.push('data management');
    }
    
    if (lowerContent.includes('governance') || lowerContent.includes('framework') || lowerContent.includes('procedure')) {
      topics.push('governance');
    }
    
    if (lowerContent.includes('enterprise') || lowerContent.includes('organization') || lowerContent.includes('business')) {
      topics.push('enterprise');
    }
    
    if (lowerContent.includes('audit') || lowerContent.includes('monitoring') || lowerContent.includes('assessment')) {
      topics.push('audit');
    }
    
    if (lowerContent.includes('retention') || lowerContent.includes('lifecycle') || lowerContent.includes('storage')) {
      topics.push('data lifecycle');
    }
    
    if (lowerContent.includes('synthetic') || lowerContent.includes('generation') || lowerContent.includes('simulation')) {
      topics.push('synthetic data');
    }
    
    if (lowerContent.includes('ci/cd') || lowerContent.includes('pipeline') || lowerContent.includes('workflow')) {
      topics.push('CI/CD');
    }
    
    if (lowerContent.includes('differential privacy') || lowerContent.includes('privacy validation')) {
      topics.push('differential privacy');
    }
    
    if (lowerContent.includes('bias') || lowerContent.includes('detection') || lowerContent.includes('fairness')) {
      topics.push('bias detection');
    }
    
    if (lowerContent.includes('fidelity') || lowerContent.includes('utility') || lowerContent.includes('validation')) {
      topics.push('evaluation framework');
    }
    
    if (lowerContent.includes('healthcare') || lowerContent.includes('finance') || lowerContent.includes('autonomous')) {
      topics.push('industry applications');
    }
    
    // Default topics if none detected
    if (topics.length === 0) {
      topics.push('documentation', 'policies', 'procedures');
    }
    
    return topics;
  }
}
