import { MockLLMService } from './mockLLMService';

export interface LandingAIResponse {
  success: boolean;
  data?: {
    content: string;
    summary: string;
    metadata: {
      title?: string;
      author?: string;
      pages?: number;
      wordCount?: number;
      extractedAt: string;
    };
    entities?: Array<{
      type: string;
      value: string;
      confidence: number;
    }>;
    topics?: string[];
  };
  error?: string;
}

export class LandingAIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = 'ejVqa2cxMDAzYWwzNmY4OXJxOTJ2OmRVQUtxN2gwc1NEMXVCWENhT2xVQThuR2lJdElHN2ZC';
    this.apiUrl = 'https://api.landing.ai/v1/extract';
  }

  async extractDocumentContent(file: File): Promise<LandingAIResponse> {
    try {
      // For now, let's use LLM-based extraction instead of Landing AI API
      // This will provide better results for our demo
      return await this.llmBasedExtraction(file);
    } catch (error) {
      console.error('Document extraction failed:', error);
      
      // Fallback: basic text extraction for demo purposes
      return this.fallbackExtraction(file);
    }
  }

  private async llmBasedExtraction(file: File): Promise<LandingAIResponse> {
    try {
      // Read file content
      const content = await this.readFileAsText(file);
      
      if (!content || content.trim().length === 0) {
        throw new Error('File content is empty');
      }

      // Use Mock LLM service to generate summary and extract information
      const summary = await MockLLMService.generateSummary(content, file.name);
      const entities = await MockLLMService.extractEntities(content);
      const topics = await MockLLMService.extractTopics(content);
      
      return {
        success: true,
        data: {
          content: content,
          summary: summary,
          metadata: {
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
            author: 'Document Author',
            pages: Math.ceil(content.length / 2000), // Estimate pages
            wordCount: content.split(' ').length,
            extractedAt: new Date().toISOString()
          },
          entities: entities,
          topics: topics
        }
      };
    } catch (error) {
      console.error('LLM-based extraction failed:', error);
      throw error;
    }
  }

  private async generateLLMSummary(content: string, fileName: string): Promise<string> {
    try {
      // Use OpenAI API to generate summary
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY || 'sk-demo-key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert document analyst. Analyze the following document and provide a concise, professional summary focusing on:
              1. Main purpose and scope
              2. Key policies, guidelines, or procedures
              3. Important compliance or governance aspects
              4. Data handling and privacy considerations
              
              Keep the summary under 200 words and make it suitable for enterprise governance review.`
            },
            {
              role: 'user',
              content: `Document: ${fileName}\n\nContent:\n${content.substring(0, 4000)}` // Limit content length
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      return result.choices[0]?.message?.content || this.generateSummary(content);
    } catch (error) {
      console.warn('OpenAI summary generation failed, using fallback:', error);
      return this.generateSummary(content);
    }
  }

  private async extractLLMEntities(content: string): Promise<Array<{type: string, value: string, confidence: number}>> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY || 'sk-demo-key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Extract entities from the document and return them as a JSON array. Each entity should have: type (email, phone, person, organization, date, location), value, and confidence (0-1). Focus on business-relevant entities.`
            },
            {
              role: 'user',
              content: `Extract entities from:\n${content.substring(0, 3000)}`
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const entitiesText = result.choices[0]?.message?.content || '[]';
      
      try {
        return JSON.parse(entitiesText);
      } catch {
        return this.extractBasicEntities(content);
      }
    } catch (error) {
      console.warn('OpenAI entity extraction failed, using fallback:', error);
      return this.extractBasicEntities(content);
    }
  }

  private async extractLLMTopics(content: string): Promise<string[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY || 'sk-demo-key'}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Analyze the document and identify 3-5 key topics. Return as a JSON array of strings. Focus on: data governance, compliance, privacy, security, policies, procedures, enterprise guidelines, GDPR, data protection, etc.`
            },
            {
              role: 'user',
              content: `Identify topics in:\n${content.substring(0, 3000)}`
            }
          ],
          max_tokens: 200,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const result = await response.json();
      const topicsText = result.choices[0]?.message?.content || '[]';
      
      try {
        return JSON.parse(topicsText);
      } catch {
        return this.extractBasicTopics(content);
      }
    } catch (error) {
      console.warn('OpenAI topic extraction failed, using fallback:', error);
      return this.extractBasicTopics(content);
    }
  }

  private async fallbackExtraction(file: File): Promise<LandingAIResponse> {
    try {
      const content = await this.readFileAsText(file);
      const summary = this.generateSummary(content);
      
      return {
        success: true,
        data: {
          content,
          summary,
          metadata: {
            title: file.name,
            author: 'Unknown',
            pages: 1,
            wordCount: content.split(' ').length,
            extractedAt: new Date().toISOString()
          },
          entities: this.extractBasicEntities(content),
          topics: this.extractBasicTopics(content)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
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

  private generateSummary(content: string): string {
    if (!content || content.length < 100) {
      return content;
    }

    // Simple extractive summarization - take first few sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summaryLength = Math.min(3, Math.ceil(sentences.length * 0.3));
    
    return sentences.slice(0, summaryLength).join('. ').trim() + '.';
  }

  private extractBasicEntities(content: string): Array<{type: string, value: string, confidence: number}> {
    const entities = [];
    
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
      names.slice(0, 5).forEach(name => {
        entities.push({ type: 'person', value: name, confidence: 0.6 });
      });
    }

    return entities;
  }

  private extractBasicTopics(content: string): string[] {
    const topics = [];
    const contentLower = content.toLowerCase();
    
    // Common topic keywords
    const topicKeywords = {
      'privacy': ['privacy', 'personal data', 'gdpr', 'data protection'],
      'security': ['security', 'encryption', 'authentication', 'access control'],
      'compliance': ['compliance', 'regulation', 'policy', 'governance'],
      'data': ['data', 'information', 'database', 'storage'],
      'ai': ['artificial intelligence', 'machine learning', 'ai', 'algorithm'],
      'business': ['business', 'company', 'organization', 'enterprise']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }
}

export const landingAIService = new LandingAIService();
