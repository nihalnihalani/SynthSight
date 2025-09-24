import { LLMInteraction, AgentAction } from '../types';

export class FeedbackAgent {
  name = 'FeedbackAgent';
  type = 'feedback' as const;
  enabled = true;

  async process(interaction: LLMInteraction): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];


    if (interaction.userFeedback) {
      actions.push({
        agentName: this.name,
        action: 'log',
        details: `User feedback collected: ${interaction.userFeedback.rating}${interaction.userFeedback.comment ? ' with comment' : ''}`,
        timestamp: new Date()
      });

      await this.processFeedback(interaction);
    } else {
      // Only log once that we're monitoring for feedback
      actions.push({
        agentName: this.name,
        action: 'log',
        details: 'Feedback agent ready to collect user input',
        timestamp: new Date()
      });
    }

    return actions;
  }

  private async processFeedback(interaction: LLMInteraction): Promise<void> {
    // In a real implementation, this would update model training data
    console.log('Feedback processed:', {
      interactionId: interaction.id,
      feedback: interaction.userFeedback,
      violations: interaction.violations
    });
  }
}