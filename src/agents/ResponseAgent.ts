import { LLMInteraction, AgentAction } from '../types';

export class ResponseAgent {
  name = 'ResponseAgent';
  type = 'response' as const;
  enabled = true;

  async process(interaction: LLMInteraction): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];

    if (interaction.violations.length > 0) {
      // Log analysis for violations
      actions.push({
        agentName: this.name,
        action: 'log',
        details: `Response agent analyzing ${interaction.violations.length} violation(s)`,
        timestamp: new Date()
      });
      
      const suggestion = await this.generateSafeSuggestion(interaction);
      actions.push({
        agentName: this.name,
        action: 'suggest',
        details: suggestion,
        timestamp: new Date()
      });
    } else {
      // Always log that the response agent processed the interaction
      actions.push({
        agentName: this.name,
        action: 'log',
        details: 'Response agent analyzed interaction - no safety recommendations needed',
        timestamp: new Date()
      });
    }

    return actions;
  }

  private async generateSafeSuggestion(interaction: LLMInteraction): Promise<string> {
    const violationTypes = interaction.violations.map(v => v.type);

    if (violationTypes.includes('pii')) {
      return "Consider removing or anonymizing personal information before sharing this response.";
    }

    if (violationTypes.includes('hallucination')) {
      return "Verify the factual accuracy of this response before sharing. Consider adding disclaimers.";
    }

    if (violationTypes.includes('bias')) {
      return "Review this response for potential bias. Consider more neutral language.";
    }

    return "This response requires review before sharing due to detected violations.";
  }
}