import { LLMInteraction, AgentAction, Violation } from '../types';
import { perplexityService, VerificationResult } from '../services/perplexityService';

export class VerifierAgent {
  name = 'VerifierAgent';
  type = 'verifier' as const;
  enabled = true;

  async process(interaction: LLMInteraction): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    // Only verify high-risk interactions or those with existing violations
    const shouldVerify = this.shouldVerifyInteraction(interaction);
    
    if (shouldVerify) {
      try {
        const verificationResult = await this.verifyContent(interaction.output);
        
        if (!verificationResult.isAccurate) {
          // Add misinformation violation
          const misinformationViolation: Violation = {
            type: 'misinformation',
            description: 'Content failed fact-checking verification',
            severity: this.calculateSeverity(verificationResult.confidence),
            confidence: verificationResult.confidence,
            reason: verificationResult.summary
          };

          // Only add violation if it doesn't already exist
          const existingMisinformation = interaction.violations.find(v => v.type === 'misinformation');
          if (!existingMisinformation) {
            interaction.violations.push(misinformationViolation);
          }

          actions.push({
            agentName: this.name,
            action: 'flag',
            details: `Verification failed: ${verificationResult.summary}`,
            timestamp: new Date()
          });
        } else {
          actions.push({
            agentName: this.name,
            action: 'verify',
            details: `Output verified as accurate (confidence: ${(verificationResult.confidence * 100).toFixed(0)}%)`,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Verification failed:', error);
        
        // Log the verification failure but don't block the interaction
        actions.push({
          agentName: this.name,
          action: 'log',
          details: `Verification service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date()
        });
      }
    } else {
      actions.push({
        agentName: this.name,
        action: 'log',
        details: 'Interaction skipped - below verification threshold',
        timestamp: new Date()
      });
    }

    return actions;
  }

  private shouldVerifyInteraction(interaction: LLMInteraction): boolean {
    // Verify if Perplexity is configured
    if (!perplexityService.isConfigured()) {
      return false;
    }

    // Verify high-risk interactions
    const highRiskViolations = interaction.violations.filter(v => v.severity >= 7);
    if (highRiskViolations.length > 0) {
      return true;
    }

    // Verify content that might contain factual claims
    const factualIndicators = [
      'according to', 'studies show', 'research indicates', 'data shows',
      'statistics', 'report', 'survey', 'analysis', 'evidence',
      'medical', 'financial', 'scientific', 'legal', 'historical'
    ];

    const contentLower = interaction.output.toLowerCase();
    return factualIndicators.some(indicator => contentLower.includes(indicator));
  }

  private async verifyContent(content: string): Promise<VerificationResult> {
    // Use the Perplexity service for verification
    return await perplexityService.verifyContent(content);
  }

  private calculateSeverity(confidence: number): number {
    // Higher confidence in inaccuracy = higher severity
    // confidence is how confident we are that it's inaccurate
    return Math.min(10, 5 + (confidence * 5));
  }

  async factCheckClaim(claim: string): Promise<VerificationResult> {
    return await perplexityService.factCheck(claim);
  }

  isConfigured(): boolean {
    return perplexityService.isConfigured();
  }
}