export const perplexityConfig = {
  apiKey: import.meta.env.VITE_PERPLEXITY_API_KEY,
  model: import.meta.env.VITE_PERPLEXITY_MODEL || 'llama-3.1-sonar-small-128k-online',
  apiUrl: import.meta.env.VITE_PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions',
  maxTokens: 1000,
  temperature: 0.1, // Low temperature for fact-checking accuracy
  timeout: 30000 // 30 second timeout
};

export const isPerplexityConfigured = (): boolean => {
  return !!perplexityConfig.apiKey && perplexityConfig.apiKey.trim() !== '';
};