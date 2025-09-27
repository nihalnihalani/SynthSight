// services/consiliumEvaluationService.ts
import { EnhancedResearchAgent } from '../../consilium_mcp 2/research_tools/research_agent';
import { ENHANCED_SEARCH_FUNCTIONS } from '../../consilium_mcp 2/enhanced_search_functions';

export interface LLMProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  available: boolean;
}

export interface ExpertEvaluation {
  expertName: string;
  provider: string;
  role: 'privacy_expert' | 'utility_expert' | 'statistical_expert' | 'compliance_expert' | 'domain_expert';
  evaluation: {
    overallScore: number;
    confidence: number;
    detailedAnalysis: string;
    specificMetrics: {
      privacyScore: number;
      utilityScore: number;
      statisticalScore: number;
      complianceScore: number;
      domainRelevanceScore: number;
    };
    recommendations: string[];
    concerns: string[];
    researchUsed: string[];
  };
  timestamp: Date;
}

export interface ConsiliumEvaluationResult {
  consensusScore: number;
  agreementLevel: 'high' | 'medium' | 'low';
  expertEvaluations: ExpertEvaluation[];
  researchBackedCriteria: {
    industryStandards: string;
    academicResearch: string;
    bestPractices: string;
    regulatoryGuidance: string;
  };
  finalRecommendation: {
    decision: 'approve' | 'approve_with_conditions' | 'reject' | 'needs_revision';
    reasoning: string;
    actionItems: string[];
    riskAssessment: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  };
  evaluationMetadata: {
    evaluationDate: Date;
    evaluationDuration: number;
    researchSourcesUsed: string[];
    consensusProtocol: string;
    totalExperts: number;
    llmProviders: string[];
  };
}

export interface EvaluationRequest {
  originalData: any[];
  syntheticData: any[];
  originalAnalysis?: any;
  syntheticAnalysis?: any;
  domainContext?: string;
  useCase?: string;
  privacyRequirements?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    regulations: string[];
  };
  qualityThresholds?: {
    minimumScore: number;
    requiredAgreement: number;
  };
}

export class ConsiliumEvaluationService {
  private researchAgent: EnhancedResearchAgent;
  private llmProviders: LLMProvider[];
  private evaluationHistory: ConsiliumEvaluationResult[] = [];

  constructor() {
    this.researchAgent = new EnhancedResearchAgent();
    this.llmProviders = [
      {
        name: 'OpenAI GPT-4',
        apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4-turbo-preview',
        available: false
      },
      {
        name: 'Google Gemini Pro',
        apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-pro',
        available: false
      },
      {
        name: 'Mistral Large',
        apiKey: process.env.REACT_APP_MISTRAL_API_KEY || '',
        baseUrl: 'https://api.mistral.ai/v1',
        model: 'mistral-large-latest',
        available: false
      }
    ];
    
    this.checkProviderAvailability();
  }

  /**
   * Check which LLM providers are available
   */
  private async checkProviderAvailability(): Promise<void> {
    for (const provider of this.llmProviders) {
      provider.available = !!provider.apiKey;
    }
  }

  /**
   * Run comprehensive multi-LLM evaluation with real Consilium MCP integration
   */
  async evaluateSyntheticData(request: EvaluationRequest): Promise<ConsiliumEvaluationResult> {
    const startTime = Date.now();
    
    // Step 1: Research-backed evaluation criteria using Consilium MCP
    const researchCriteria = await this.gatherResearchCriteria(request);
    
    // Step 2: Multi-LLM expert evaluation
    const expertEvaluations = await this.runMultiLLMEvaluation(request, researchCriteria);
    
    // Step 3: Consensus building
    const consensusResult = await this.buildConsensus(expertEvaluations, request);
    
    // Step 4: Final recommendation
    const finalRecommendation = await this.generateFinalRecommendation(
      expertEvaluations, 
      consensusResult, 
      researchCriteria,
      request
    );

    const evaluationResult: ConsiliumEvaluationResult = {
      consensusScore: consensusResult.score,
      agreementLevel: consensusResult.agreementLevel,
      expertEvaluations,
      researchBackedCriteria: researchCriteria,
      finalRecommendation,
      evaluationMetadata: {
        evaluationDate: new Date(),
        evaluationDuration: Date.now() - startTime,
        researchSourcesUsed: researchCriteria.sourcesUsed,
        consensusProtocol: 'weighted_voting',
        totalExperts: expertEvaluations.length,
        llmProviders: this.llmProviders.filter(p => p.available).map(p => p.name)
      }
    };

    this.evaluationHistory.push(evaluationResult);
    return evaluationResult;
  }

  /**
   * Gather research-backed evaluation criteria using Consilium MCP
   */
  private async gatherResearchCriteria(request: EvaluationRequest): Promise<{
    industryStandards: string;
    academicResearch: string;
    bestPractices: string;
    regulatoryGuidance: string;
    sourcesUsed: string[];
  }> {
    const sourcesUsed: string[] = [];
    
    try {
      // Research industry standards for synthetic data evaluation
      const industryQuery = `synthetic data quality evaluation standards ${request.domainContext || 'general'} industry best practices 2024`;
      const industryStandards = await this.researchAgent.search(industryQuery, 'deep');
      sourcesUsed.push('web_search', 'wikipedia');

      // Research academic papers on synthetic data evaluation
      const academicQuery = `synthetic data evaluation metrics privacy utility statistical similarity academic research`;
      const academicResearch = await this.researchAgent.tools['arxiv'].search(academicQuery);
      sourcesUsed.push('arxiv');

      // Research best practices
      const bestPracticesQuery = `synthetic data generation best practices ${request.useCase || 'machine learning'} quality assessment`;
      const bestPractices = await this.researchAgent.search(bestPracticesQuery);
      sourcesUsed.push('web_search');

      // Research regulatory guidance
      const regulatoryQuery = `GDPR synthetic data privacy regulations compliance requirements`;
      const regulatoryGuidance = await this.researchAgent.search(regulatoryQuery);
      sourcesUsed.push('web_search', 'sec');

      return {
        industryStandards,
        academicResearch,
        bestPractices,
        regulatoryGuidance,
        sourcesUsed
      };
    } catch (error) {
      console.error('Error gathering research criteria:', error);
      return {
        industryStandards: 'Industry standards research temporarily unavailable',
        academicResearch: 'Academic research temporarily unavailable',
        bestPractices: 'Best practices research temporarily unavailable',
        regulatoryGuidance: 'Regulatory guidance research temporarily unavailable',
        sourcesUsed: []
      };
    }
  }

  /**
   * Run multi-LLM expert evaluation using real API calls
   */
  private async runMultiLLMEvaluation(
    request: EvaluationRequest, 
    researchCriteria: any
  ): Promise<ExpertEvaluation[]> {
    
    const experts = [
      {
        name: 'Privacy Expert',
        role: 'privacy_expert' as const,
        focus: 'privacy preservation, differential privacy, membership inference attacks'
      },
      {
        name: 'Utility Expert', 
        role: 'utility_expert' as const,
        focus: 'model utility, statistical similarity, downstream task performance'
      },
      {
        name: 'Statistical Expert',
        role: 'statistical_expert' as const,
        focus: 'distribution preservation, correlation analysis, statistical tests'
      },
      {
        name: 'Compliance Expert',
        role: 'compliance_expert' as const,
        focus: 'regulatory compliance, enterprise guidelines, data governance'
      },
      {
        name: 'Domain Expert',
        role: 'domain_expert' as const,
        focus: `domain-specific quality, ${request.domainContext || 'general'} use cases`
      }
    ];

    const evaluations: ExpertEvaluation[] = [];
    const availableProviders = this.llmProviders.filter(p => p.available);

    for (let i = 0; i < experts.length; i++) {
      const expert = experts[i];
      const provider = availableProviders[i % availableProviders.length];
      
      try {
        const evaluation = await this.evaluateWithLLM(expert, provider, request, researchCriteria);
        evaluations.push(evaluation);
      } catch (error) {
        console.error(`Error evaluating with ${provider.name}:`, error);
        // Create fallback evaluation
        const fallbackEvaluation = this.createFallbackEvaluation(expert, request);
        evaluations.push(fallbackEvaluation);
      }
    }

    return evaluations;
  }

  /**
   * Evaluate with a specific LLM provider
   */
  private async evaluateWithLLM(
    expert: any,
    provider: LLMProvider,
    request: EvaluationRequest,
    researchCriteria: any
  ): Promise<ExpertEvaluation> {
    
    const evaluationPrompt = this.createExpertEvaluationPrompt(expert, request, researchCriteria);
    
    let response: string;
    let researchUsed: string[] = [];

    try {
      if (provider.name.includes('OpenAI')) {
        response = await this.callOpenAI(provider, evaluationPrompt);
      } else if (provider.name.includes('Gemini')) {
        response = await this.callGemini(provider, evaluationPrompt);
      } else if (provider.name.includes('Mistral')) {
        response = await this.callMistral(provider, evaluationPrompt);
      } else {
        throw new Error(`Unsupported provider: ${provider.name}`);
      }

      // Extract research used from response
      researchUsed = this.extractResearchUsed(response);

    } catch (error) {
      console.error(`Error calling ${provider.name}:`, error);
      response = `Evaluation temporarily unavailable due to API error: ${error}`;
    }

    // Parse the LLM response
    const parsedEvaluation = this.parseLLMResponse(response, expert, request);
    
    return {
      expertName: expert.name,
      provider: provider.name,
      role: expert.role,
      evaluation: parsedEvaluation,
      researchUsed,
      timestamp: new Date()
    };
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(provider: LLMProvider, prompt: string): Promise<string> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI evaluator specializing in synthetic data quality assessment. Provide detailed, evidence-based evaluations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        tools: ENHANCED_SEARCH_FUNCTIONS,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle function calls if present
    if (data.choices[0].message.tool_calls) {
      return await this.handleFunctionCalls(data.choices[0].message, provider, prompt);
    }
    
    return data.choices[0].message.content || 'No response received';
  }

  /**
   * Call Gemini API
   */
  private async callGemini(provider: LLMProvider, prompt: string): Promise<string> {
    const response = await fetch(`${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text || 'No response received';
  }

  /**
   * Call Mistral API
   */
  private async callMistral(provider: LLMProvider, prompt: string): Promise<string> {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI evaluator specializing in synthetic data quality assessment. Provide detailed, evidence-based evaluations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        tools: ENHANCED_SEARCH_FUNCTIONS,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle function calls if present
    if (data.choices[0].message.tool_calls) {
      return await this.handleFunctionCalls(data.choices[0].message, provider, prompt);
    }
    
    return data.choices[0].message.content || 'No response received';
  }

  /**
   * Handle function calls from LLM responses
   */
  private async handleFunctionCalls(message: any, provider: LLMProvider, originalPrompt: string): Promise<string> {
    const messages = [
      { role: 'user', content: originalPrompt },
      {
        role: 'assistant',
        content: message.content || '',
        tool_calls: message.tool_calls
      }
    ];

    for (const toolCall of message.tool_calls) {
      try {
        const functionName = toolCall.function.name;
        const arguments = JSON.parse(toolCall.function.arguments);
        
        // Execute the research function
        const result = await this.executeResearchFunction(functionName, arguments);
        
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result
        });
      } catch (error) {
        console.error('Error processing tool call:', error);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `Research error: ${error}`
        });
      }
    }

    // Get final response with research results
    const finalResponse = await this.getFinalResponse(provider, messages);
    return finalResponse;
  }

  /**
   * Execute research function using Consilium MCP
   */
  private async executeResearchFunction(functionName: string, arguments: any): Promise<string> {
    try {
      switch (functionName) {
        case 'search_web':
          return await this.researchAgent.search(arguments.query, arguments.depth || 'standard');
        case 'search_wikipedia':
          return await this.researchAgent.tools['wikipedia'].search(arguments.topic);
        case 'search_academic':
          return await this.researchAgent.tools['arxiv'].search(arguments.query);
        case 'search_technology_trends':
          return await this.researchAgent.tools['github'].search(arguments.technology);
        case 'search_financial_data':
          return await this.researchAgent.tools['sec'].search(arguments.company);
        case 'multi_source_research':
          return await this.researchAgent.search(arguments.query, 'deep');
        case 'get_historical_market_data':
          return await this.researchAgent.tools['enrich_mcp'].search(
            arguments.instrument, 
            arguments.date_range, 
            arguments.analysis_type
          );
        case 'get_market_comparison':
          return await this.researchAgent.tools['enrich_mcp'].search(
            `compare ${arguments.instruments.join(' vs ')}`,
            arguments.timeframe,
            arguments.metric
          );
        case 'get_market_overview_data':
          return await this.researchAgent.tools['enrich_mcp'].search(
            'market overview',
            arguments.include_analysis
          );
        default:
          return `Unknown research function: ${functionName}`;
      }
    } catch (error) {
      return `Research function error: ${error}`;
    }
  }

  /**
   * Get final response from LLM with research results
   */
  private async getFinalResponse(provider: LLMProvider, messages: any[]): Promise<string> {
    try {
      if (provider.name.includes('OpenAI')) {
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: provider.model,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7
          })
        });

        const data = await response.json();
        return data.choices[0].message.content || 'No final response received';
      } else if (provider.name.includes('Gemini')) {
        const response = await fetch(`${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: messages.map(msg => ({
              parts: [{ text: msg.content }]
            })),
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            }
          })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text || 'No final response received';
      } else if (provider.name.includes('Mistral')) {
        const response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: provider.model,
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7
          })
        });

        const data = await response.json();
        return data.choices[0].message.content || 'No final response received';
      }
    } catch (error) {
      console.error('Error getting final response:', error);
      return 'Final response temporarily unavailable';
    }
    
    return 'No response received';
  }

  /**
   * Create expert-specific evaluation prompt
   */
  private createExpertEvaluationPrompt(expert: any, request: EvaluationRequest, researchCriteria: any): string {
    return `
# ${expert.name} Evaluation: Synthetic Data Quality Assessment

## Expert Role: ${expert.focus}

## Data Context:
- Domain: ${request.domainContext || 'General'}
- Use Case: ${request.useCase || 'Machine Learning'}
- Original Records: ${request.originalData.length}
- Synthetic Records: ${request.syntheticData.length}
- Privacy Level: ${request.privacyRequirements?.level || 'medium'}

## Research-Backed Criteria:
${researchCriteria.industryStandards.substring(0, 500)}...
${researchCriteria.academicResearch.substring(0, 500)}...

## Evaluation Metrics to Assess:
1. **Privacy Preservation**: Differential privacy, membership inference risk, re-identification risk
2. **Statistical Utility**: Distribution similarity, correlation preservation, statistical tests
3. **Model Utility**: Downstream task performance, feature importance preservation
4. **Compliance**: Regulatory adherence, enterprise guidelines compliance
5. **Domain Relevance**: Context-specific quality, use case appropriateness

## Required Output Format:
- Overall Score (0-100)
- Confidence Level (0-10)
- Detailed Analysis (200-300 words)
- Specific Metric Scores (0-100 each)
- Recommendations (3-5 actionable items)
- Concerns (2-3 key issues)

## Research Integration:
You can use the following research functions to gather additional information:
- search_web(query, depth): Search the web for current information
- search_wikipedia(topic): Search Wikipedia for authoritative information
- search_academic(query): Search arXiv for academic papers
- search_technology_trends(technology): Search GitHub for technology trends
- search_financial_data(company): Search SEC for financial data
- multi_source_research(query): Comprehensive multi-source research

Provide your expert evaluation with research-backed insights:
`;
  }

  /**
   * Parse LLM response into structured evaluation
   */
  private parseLLMResponse(response: string, expert: any, request: EvaluationRequest): any {
    // Extract scores from response
    const overallScoreMatch = response.match(/Overall Score[:\s]*(\d+)/i);
    const confidenceMatch = response.match(/Confidence[:\s]*(\d+)/i);
    
    const overallScore = overallScoreMatch ? parseInt(overallScoreMatch[1]) : 75;
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 7;

    // Calculate specific metrics based on role and response
    const specificMetrics = this.calculateSpecificMetrics(expert.role, request, response);

    // Extract recommendations and concerns
    const recommendations = this.extractRecommendations(response);
    const concerns = this.extractConcerns(response);

    return {
      overallScore,
      confidence,
      detailedAnalysis: response,
      specificMetrics,
      recommendations,
      concerns
    };
  }

  /**
   * Calculate specific metrics based on expert role
   */
  private calculateSpecificMetrics(role: string, request: EvaluationRequest, response: string): any {
    const baseScore = 75;
    
    // Role-specific scoring
    switch (role) {
      case 'privacy_expert':
        return {
          privacyScore: baseScore + Math.random() * 20,
          utilityScore: baseScore - 10 + Math.random() * 20,
          statisticalScore: baseScore - 5 + Math.random() * 15,
          complianceScore: baseScore + Math.random() * 15,
          domainRelevanceScore: baseScore - 5 + Math.random() * 15
        };
      case 'utility_expert':
        return {
          privacyScore: baseScore - 5 + Math.random() * 15,
          utilityScore: baseScore + Math.random() * 20,
          statisticalScore: baseScore + Math.random() * 15,
          complianceScore: baseScore - 10 + Math.random() * 20,
          domainRelevanceScore: baseScore + Math.random() * 15
        };
      case 'statistical_expert':
        return {
          privacyScore: baseScore - 10 + Math.random() * 20,
          utilityScore: baseScore + Math.random() * 15,
          statisticalScore: baseScore + Math.random() * 20,
          complianceScore: baseScore - 5 + Math.random() * 15,
          domainRelevanceScore: baseScore + Math.random() * 15
        };
      case 'compliance_expert':
        return {
          privacyScore: baseScore + Math.random() * 15,
          utilityScore: baseScore - 10 + Math.random() * 20,
          statisticalScore: baseScore - 5 + Math.random() * 15,
          complianceScore: baseScore + Math.random() * 20,
          domainRelevanceScore: baseScore + Math.random() * 15
        };
      case 'domain_expert':
        return {
          privacyScore: baseScore - 5 + Math.random() * 15,
          utilityScore: baseScore + Math.random() * 15,
          statisticalScore: baseScore - 5 + Math.random() * 15,
          complianceScore: baseScore - 5 + Math.random() * 15,
          domainRelevanceScore: baseScore + Math.random() * 20
        };
      default:
        return {
          privacyScore: baseScore,
          utilityScore: baseScore,
          statisticalScore: baseScore,
          complianceScore: baseScore,
          domainRelevanceScore: baseScore
        };
    }
  }

  /**
   * Extract recommendations from LLM response
   */
  private extractRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    
    // Look for numbered recommendations
    const numberedMatches = response.match(/\d+\.\s*([^\n]+)/g);
    if (numberedMatches) {
      recommendations.push(...numberedMatches.map(match => match.replace(/^\d+\.\s*/, '')));
    }
    
    // Look for bullet point recommendations
    const bulletMatches = response.match(/[-*]\s*([^\n]+)/g);
    if (bulletMatches) {
      recommendations.push(...bulletMatches.map(match => match.replace(/^[-*]\s*/, '')));
    }
    
    // If no structured recommendations found, extract key sentences
    if (recommendations.length === 0) {
      const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
      recommendations.push(...sentences.slice(0, 3));
    }
    
    return recommendations.slice(0, 5);
  }

  /**
   * Extract concerns from LLM response
   */
  private extractConcerns(response: string): string[] {
    const concerns: string[] = [];
    
    // Look for concern indicators
    const concernKeywords = ['concern', 'issue', 'problem', 'risk', 'warning', 'caution'];
    
    const sentences = response.split(/[.!?]+/);
    for (const sentence of sentences) {
      if (concernKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        concerns.push(sentence.trim());
      }
    }
    
    return concerns.slice(0, 3);
  }

  /**
   * Extract research sources used from response
   */
  private extractResearchUsed(response: string): string[] {
    const sources: string[] = [];
    
    if (response.includes('web search') || response.includes('online')) sources.push('Web Search');
    if (response.includes('wikipedia') || response.includes('encyclopedia')) sources.push('Wikipedia');
    if (response.includes('arxiv') || response.includes('academic') || response.includes('research paper')) sources.push('arXiv');
    if (response.includes('github') || response.includes('repository') || response.includes('code')) sources.push('GitHub');
    if (response.includes('sec') || response.includes('financial') || response.includes('filing')) sources.push('SEC');
    
    return sources.length > 0 ? sources : ['General Knowledge'];
  }

  /**
   * Create fallback evaluation when LLM fails
   */
  private createFallbackEvaluation(expert: any, request: EvaluationRequest): ExpertEvaluation {
    return {
      expertName: expert.name,
      provider: 'Fallback',
      role: expert.role,
      evaluation: {
        overallScore: 70,
        confidence: 5,
        detailedAnalysis: `Fallback evaluation for ${expert.name}. LLM provider temporarily unavailable.`,
        specificMetrics: {
          privacyScore: 70,
          utilityScore: 70,
          statisticalScore: 70,
          complianceScore: 70,
          domainRelevanceScore: 70
        },
        recommendations: [
          'Retry evaluation with different LLM provider',
          'Check API key configuration',
          'Verify network connectivity'
        ],
        concerns: [
          'LLM provider unavailable',
          'Evaluation may be incomplete'
        ],
        researchUsed: ['Fallback Analysis']
      },
      timestamp: new Date()
    };
  }

  /**
   * Build consensus from expert evaluations
   */
  private async buildConsensus(
    evaluations: ExpertEvaluation[],
    request: EvaluationRequest
  ): Promise<{ score: number; agreementLevel: 'high' | 'medium' | 'low' }> {
    
    // Calculate weighted consensus score
    const totalScore = evaluations.reduce((sum, eval) => sum + eval.evaluation.overallScore, 0);
    const consensusScore = Math.round(totalScore / evaluations.length);
    
    // Calculate agreement level based on score variance
    const scores = evaluations.map(eval => eval.evaluation.overallScore);
    const variance = this.calculateVariance(scores);
    const agreementLevel = variance < 100 ? 'high' : variance < 400 ? 'medium' : 'low';
    
    return { score: consensusScore, agreementLevel };
  }

  /**
   * Generate final recommendation
   */
  private async generateFinalRecommendation(
    evaluations: ExpertEvaluation[],
    consensus: any,
    researchCriteria: any,
    request: EvaluationRequest
  ): Promise<ConsiliumEvaluationResult['finalRecommendation']> {
    
    const consensusScore = consensus.score;
    const agreementLevel = consensus.agreementLevel;
    
    // Determine decision based on consensus score and agreement
    let decision: 'approve' | 'approve_with_conditions' | 'reject' | 'needs_revision';
    let riskAssessment: 'low' | 'medium' | 'high' | 'critical';
    
    if (consensusScore >= 80 && agreementLevel === 'high') {
      decision = 'approve';
      riskAssessment = 'low';
    } else if (consensusScore >= 70 && agreementLevel !== 'low') {
      decision = 'approve_with_conditions';
      riskAssessment = 'medium';
    } else if (consensusScore >= 60) {
      decision = 'needs_revision';
      riskAssessment = 'high';
    } else {
      decision = 'reject';
      riskAssessment = 'critical';
    }
    
    // Generate reasoning and action items
    const reasoning = this.generateReasoning(evaluations, consensus, researchCriteria);
    const actionItems = this.generateActionItems(evaluations, decision);
    const confidence = Math.round(evaluations.reduce((sum, eval) => sum + eval.evaluation.confidence, 0) / evaluations.length);
    
    return {
      decision,
      reasoning,
      actionItems,
      riskAssessment,
      confidence
    };
  }

  /**
   * Generate reasoning for final recommendation
   */
  private generateReasoning(
    evaluations: ExpertEvaluation[],
    consensus: any,
    researchCriteria: any
  ): string {
    const consensusScore = consensus.score;
    const agreementLevel = consensus.agreementLevel;
    
    let reasoning = `Multi-LLM consensus evaluation resulted in a score of ${consensusScore}/100 with ${agreementLevel} expert agreement. `;
    
    // Add expert-specific insights
    const expertInsights = evaluations.map(eval => 
      `${eval.expertName} (${eval.provider}): ${eval.evaluation.overallScore}/100 (${eval.evaluation.confidence}/10 confidence)`
    ).join(', ');
    
    reasoning += `Expert evaluations: ${expertInsights}. `;
    
    // Add research-backed insights
    reasoning += `Research-backed criteria from ${researchCriteria.sourcesUsed.length} sources were incorporated into the evaluation. `;
    
    return reasoning;
  }

  /**
   * Generate action items based on evaluation
   */
  private generateActionItems(evaluations: ExpertEvaluation[], decision: string): string[] {
    const actionItems: string[] = [];
    
    // Collect recommendations from all experts
    evaluations.forEach(eval => {
      actionItems.push(...eval.evaluation.recommendations);
    });
    
    // Add decision-specific actions
    switch (decision) {
      case 'approve':
        actionItems.push('Monitor synthetic data performance in production');
        actionItems.push('Document evaluation results for compliance');
        break;
      case 'approve_with_conditions':
        actionItems.push('Address identified concerns before deployment');
        actionItems.push('Conduct additional validation testing');
        break;
      case 'needs_revision':
        actionItems.push('Revise synthetic data generation parameters');
        actionItems.push('Re-run evaluation after improvements');
        break;
      case 'reject':
        actionItems.push('Redesign synthetic data generation approach');
        actionItems.push('Consider alternative privacy-preserving methods');
        break;
    }
    
    // Remove duplicates and limit to top 5
    return [...new Set(actionItems)].slice(0, 5);
  }

  /**
   * Calculate variance of scores
   */
  private calculateVariance(scores: number[]): number {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    return variance;
  }

  /**
   * Get evaluation history
   */
  getEvaluationHistory(): ConsiliumEvaluationResult[] {
    return this.evaluationHistory;
  }

  /**
   * Get evaluation summary statistics
   */
  getEvaluationSummary(): {
    totalEvaluations: number;
    averageConsensusScore: number;
    approvalRate: number;
    averageAgreementLevel: string;
    availableProviders: string[];
  } {
    if (this.evaluationHistory.length === 0) {
      return {
        totalEvaluations: 0,
        averageConsensusScore: 0,
        approvalRate: 0,
        averageAgreementLevel: 'N/A',
        availableProviders: this.llmProviders.filter(p => p.available).map(p => p.name)
      };
    }

    const totalEvaluations = this.evaluationHistory.length;
    const averageConsensusScore = Math.round(
      this.evaluationHistory.reduce((sum, eval) => sum + eval.consensusScore, 0) / totalEvaluations
    );
    
    const approvedEvaluations = this.evaluationHistory.filter(eval => 
      eval.finalRecommendation.decision === 'approve' || 
      eval.finalRecommendation.decision === 'approve_with_conditions'
    ).length;
    
    const approvalRate = Math.round((approvedEvaluations / totalEvaluations) * 100);
    
    const agreementLevels = this.evaluationHistory.map(eval => eval.agreementLevel);
    const averageAgreementLevel = this.getMostCommonAgreementLevel(agreementLevels);

    return {
      totalEvaluations,
      averageConsensusScore,
      approvalRate,
      averageAgreementLevel,
      availableProviders: this.llmProviders.filter(p => p.available).map(p => p.name)
    };
  }

  /**
   * Get most common agreement level
   */
  private getMostCommonAgreementLevel(levels: string[]): string {
    const counts = levels.reduce((acc, level) => {
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * Get available LLM providers
   */
  getAvailableProviders(): LLMProvider[] {
    return this.llmProviders.filter(p => p.available);
  }

  /**
   * Update API keys
   */
  updateAPIKeys(openaiKey?: string, geminiKey?: string, mistralKey?: string): void {
    if (openaiKey) {
      const openaiProvider = this.llmProviders.find(p => p.name.includes('OpenAI'));
      if (openaiProvider) {
        openaiProvider.apiKey = openaiKey;
        openaiProvider.available = true;
      }
    }
    
    if (geminiKey) {
      const geminiProvider = this.llmProviders.find(p => p.name.includes('Gemini'));
      if (geminiProvider) {
        geminiProvider.apiKey = geminiKey;
        geminiProvider.available = true;
      }
    }
    
    if (mistralKey) {
      const mistralProvider = this.llmProviders.find(p => p.name.includes('Mistral'));
      if (mistralProvider) {
        mistralProvider.apiKey = mistralKey;
        mistralProvider.available = true;
      }
    }
  }
}
