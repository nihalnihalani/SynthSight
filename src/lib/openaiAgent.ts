interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface LLMResult {
  response: string;
  source: 'openai' | 'groq' | 'fallback';
  model?: string;
  error?: string;
}

export async function callOpenAI(prompt: string): Promise<LLMResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not found, using fallback');
    return {
      response: `Simulated OpenAI reply for: "${prompt}"`,
      source: 'fallback',
      error: 'API key not configured'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response choices returned from OpenAI API');
    }

    const content = data.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response content from OpenAI API');
    }

    return {
      response: content.trim(),
      source: 'openai',
      model: data.model
    };

  } catch (error) {
    console.error('OpenAI API call failed:', error);
    
    // Return fallback response
    return {
      response: `Simulated OpenAI reply for: "${prompt}"`,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function isOpenAIConfigured(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}
