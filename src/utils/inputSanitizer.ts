export class InputSanitizer {
  private static readonly DANGEROUS_PATTERNS = [
    // Prompt injection patterns
    /ignore\s+previous\s+instructions/i,
    /forget\s+everything/i,
    /system\s*:\s*/i,
    /assistant\s*:\s*/i,
    /human\s*:\s*/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|.*?\|>/g,
    
    // Script injection
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/|;)/,
    
    // XSS patterns
    /<[^>]*>/g,
    /&[#\w]+;/g,
  ];

  private static readonly MAX_LENGTH = 5000;
  private static readonly MIN_LENGTH = 1;

  static sanitize(input: string): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Input must be a non-empty string');
    }

    // Length validation
    if (input.length < this.MIN_LENGTH) {
      throw new Error('Input too short');
    }

    if (input.length > this.MAX_LENGTH) {
      throw new Error(`Input too long. Maximum ${this.MAX_LENGTH} characters allowed`);
    }

    // Trim whitespace
    let sanitized = input.trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        throw new Error('Input contains potentially dangerous content');
      }
    }

    // Escape HTML entities
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return sanitized;
  }

  static validatePrompt(prompt: string): { isValid: boolean; error?: string; sanitized?: string } {
    try {
      const sanitized = this.sanitize(prompt);
      return { isValid: true, sanitized };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid input' 
      };
    }
  }

  static isPromptInjection(input: string): boolean {
    const injectionPatterns = [
      /ignore\s+previous\s+instructions/i,
      /forget\s+everything/i,
      /you\s+are\s+now/i,
      /new\s+instructions/i,
      /system\s+override/i,
      /developer\s+mode/i,
      /jailbreak/i,
      /roleplay\s+as/i,
    ];

    return injectionPatterns.some(pattern => pattern.test(input));
  }
}