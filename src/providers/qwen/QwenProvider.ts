/**
 * Qwen Provider Implementation
 * 
 * This adapter encapsulates the DashScope API (Qwen) implementation,
 * providing a standardized interface for the multi-provider architecture.
 * 
 * When the actual Qwen codebase is integrated, the DashScope API calls
 * should be extracted and moved into the private methods of this class.
 */

import type {
  LLMProvider,
  GenerationOptions,
  LLMResponse,
  CodeContext,
  CodeGenerationResult,
  ProviderConfig,
} from '../types';
import {
  LLMError,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  ValidationError,
  ProviderError,
} from '../types';

/**
 * DashScope API response structure (to be updated when actual API is integrated)
 */
interface DashScopeResponse {
  output?: {
    choices?: Array<{
      message?: {
        content?: string;
      };
      finish_reason?: string;
    }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
    };
  };
  code?: string;
  message?: string;
  request_id?: string;
}

/**
 * DashScope API request structure
 */
interface DashScopeRequest {
  model: string;
  input: {
    messages: Array<{
      role: string;
      content: string;
    }>;
  };
  parameters?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stop?: string[];
  };
}

/**
 * QwenProvider implements the LLMProvider interface for DashScope/Qwen API
 */
export class QwenProvider implements LLMProvider {
  private config: ProviderConfig;
  private readonly baseUrl: string;
  private readonly supportedModels: readonly string[] = [
    'qwen-turbo',
    'qwen-plus',
    'qwen-max',
    'qwen-max-longcontext',
  ];

  constructor(config: ProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }

  /**
   * Get the name of this provider
   */
  getName(): string {
    return 'qwen';
  }

  /**
   * Check if the provider is available (has valid configuration)
   */
  isAvailable(): boolean {
    return this.validateConfig(this.config);
  }

  /**
   * Get list of supported models
   */
  getSupportedModels(): readonly string[] {
    return this.supportedModels;
  }

  /**
   * Validate provider configuration
   */
  validateConfig(config: ProviderConfig): boolean {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      return false;
    }

    // Qwen API keys typically start with 'sk-' or are alphanumeric
    // This is a basic validation - can be enhanced when actual key format is known
    const keyPattern = /^[a-zA-Z0-9_-]+$/;
    return keyPattern.test(config.apiKey);
  }

  /**
   * Send a message and receive a complete response
   */
  async sendMessage(
    prompt: string,
    options: GenerationOptions
  ): Promise<LLMResponse> {
    try {
      const request = this.formatRequest(prompt, options);
      const response = await this.makeRequest(request);

      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      const data = (await response.json()) as DashScopeResponse;
      return this.parseResponse(data, options.model || 'qwen-turbo');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send a message and receive a streaming response
   */
  async *streamResponse(
    prompt: string,
    options: GenerationOptions
  ): AsyncIterable<LLMResponse> {
    try {
      const request = this.formatRequest(prompt, { ...options, stream: true });
      const response = await this.makeRequest(request, true);

      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      if (!response.body) {
        throw new NetworkError('Response body is null', this.getName());
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '' || !line.startsWith('data: ')) {
              continue;
            }

            const data = line.slice(6); // Remove 'data: ' prefix
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed: DashScopeResponse = JSON.parse(data);
              yield this.parseResponse(parsed, options.model || 'qwen-turbo');
            } catch (parseError) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate code based on a prompt and context
   */
  async generateCode(
    prompt: string,
    context: CodeContext
  ): Promise<CodeGenerationResult> {
    try {
      // Build enhanced prompt with context
      let enhancedPrompt = prompt;

      if (context.filePath) {
        enhancedPrompt = `File: ${context.filePath}\n\n${enhancedPrompt}`;
      }

      if (context.language) {
        enhancedPrompt = `Language: ${context.language}\n\n${enhancedPrompt}`;
      }

      if (context.existingCode) {
        enhancedPrompt = `Existing code:\n\`\`\`${context.language || ''}\n${context.existingCode}\n\`\`\`\n\n${enhancedPrompt}`;
      }

      if (context.requirements) {
        enhancedPrompt = `Requirements: ${context.requirements}\n\n${enhancedPrompt}`;
      }

      // Use default model for code generation
      const options: GenerationOptions = {
        model: 'qwen-turbo',
        temperature: 0.2, // Lower temperature for code generation
      };

      const response = await this.sendMessage(enhancedPrompt, options);

      // Extract code from response (simple extraction - can be enhanced)
      const code = this.extractCodeFromResponse(response.content, context.language);

      return {
        code,
        explanation: response.metadata?.explanation as string | undefined,
        response,
        changes: context.filePath
          ? [
              {
                path: context.filePath,
                operation: context.existingCode ? 'modify' : 'create',
                content: code,
              },
            ]
          : undefined,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create authentication headers
   */
  private authenticate(): Headers {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${this.config.apiKey}`);
    headers.set('Content-Type', 'application/json');

    // Add custom headers if provided
    if (this.config.customHeaders) {
      for (const [key, value] of Object.entries(this.config.customHeaders)) {
        headers.set(key, value);
      }
    }

    return headers;
  }

  /**
   * Format request for DashScope API
   */
  private formatRequest(
    prompt: string,
    options: GenerationOptions
  ): DashScopeRequest {
    const model = options.model || 'qwen-turbo';

    const request: DashScopeRequest = {
      model,
      input: {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
    };

    // Add parameters if provided
    if (
      options.temperature !== undefined ||
      options.maxTokens !== undefined ||
      options.topP !== undefined ||
      options.stopSequences !== undefined
    ) {
      request.parameters = {};

      if (options.temperature !== undefined) {
        request.parameters.temperature = options.temperature;
      }

      if (options.maxTokens !== undefined) {
        request.parameters.max_tokens = options.maxTokens;
      }

      if (options.topP !== undefined) {
        request.parameters.top_p = options.topP;
      }

      if (options.stopSequences !== undefined && options.stopSequences.length > 0) {
        request.parameters.stop = options.stopSequences;
      }
    }

    return request;
  }

  /**
   * Parse DashScope API response to normalized LLMResponse
   */
  private parseResponse(
    response: DashScopeResponse,
    model: string
  ): LLMResponse {
    const output = response.output;
    const choices = output?.choices || [];
    const firstChoice = choices[0];

    if (!firstChoice || !firstChoice.message) {
      throw new ProviderError(
        'Invalid response format from DashScope API',
        this.getName(),
        'INVALID_RESPONSE',
        undefined,
        { response }
      );
    }

    const content = firstChoice.message.content || '';
    const finishReason = firstChoice.finish_reason;

    const tokensUsed = output?.usage
      ? {
          prompt: output.usage.input_tokens || 0,
          completion: output.usage.output_tokens || 0,
          total: output.usage.total_tokens || 0,
        }
      : undefined;

    return {
      content,
      provider: this.getName(),
      model,
      tokensUsed,
      finishReason,
      metadata: {
        request_id: response.request_id,
        code: response.code,
      },
    };
  }

  /**
   * Handle and normalize errors from DashScope API
   */
  private handleError(error: unknown): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return new NetworkError(
          `Network error: ${error.message}`,
          this.getName(),
          undefined,
          { originalError: error.message }
        );
      }

      // Generic provider error
      return new ProviderError(
        error.message,
        this.getName(),
        'UNKNOWN_ERROR',
        undefined,
        { originalError: error.message }
      );
    }

    // Unknown error type
    return new ProviderError(
      'Unknown error occurred',
      this.getName(),
      'UNKNOWN_ERROR',
      undefined,
      { error }
    );
  }

  /**
   * Handle HTTP error responses
   */
  private async handleHttpError(response: Response): Promise<LLMError> {
    const status = response.status;
    let errorData: unknown;

    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    switch (status) {
      case 401:
      case 403:
        return new AuthenticationError(
          'Invalid or missing API key',
          this.getName(),
          status,
          { errorData }
        );

      case 429:
        return new RateLimitError(
          'Rate limit exceeded',
          this.getName(),
          status,
          { errorData }
        );

      case 400:
        return new ValidationError(
          'Invalid request parameters',
          this.getName(),
          status,
          { errorData }
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return new NetworkError(
          `Server error: ${status}`,
          this.getName(),
          status,
          { errorData }
        );

      default:
        return new ProviderError(
          `HTTP error: ${status}`,
          this.getName(),
          `HTTP_${status}`,
          status,
          { errorData }
        );
    }
  }

  /**
   * Make HTTP request to DashScope API
   */
  private async makeRequest(
    request: DashScopeRequest,
    stream = false
  ): Promise<Response> {
    const headers = this.authenticate();

    if (stream) {
      // Note: DashScope streaming may require different endpoint or parameters
      // This will need to be updated when actual API is integrated
      headers.set('Accept', 'text/event-stream');
    }

    const timeout = this.config.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timeout', this.getName(), undefined, {
          timeout,
        });
      }

      throw error;
    }
  }

  /**
   * Extract code from response content
   * This is a simple implementation that can be enhanced
   */
  private extractCodeFromResponse(
    content: string,
    language?: string
  ): string {
    // Try to extract code blocks
    const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
    const matches = Array.from(content.matchAll(codeBlockRegex));

    if (matches.length > 0) {
      // Return the first code block
      return matches[0][1].trim();
    }

    // If no code blocks, try to find code-like content
    // This is a fallback - actual implementation should be more sophisticated
    if (language) {
      const lines = content.split('\n');
      let inCode = false;
      const codeLines: string[] = [];

      for (const line of lines) {
        if (line.trim().startsWith('```')) {
          inCode = !inCode;
          continue;
        }

        if (inCode) {
          codeLines.push(line);
        }
      }

      if (codeLines.length > 0) {
        return codeLines.join('\n').trim();
      }
    }

    // Fallback: return content as-is
    return content.trim();
  }
}

