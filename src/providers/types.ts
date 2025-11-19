/**
 * Core types and interfaces for the Multi-Provider LLM Architecture
 * 
 * This module defines the abstraction layer that all LLM providers must implement.
 * All types are designed to be provider-agnostic and technology-neutral.
 */

/**
 * Configuration options for LLM generation requests
 */
export interface GenerationOptions {
  /** Provider-specific model identifier (e.g., "gpt-4o", "qwen-turbo", "claude-3-opus") */
  model?: string;
  
  /** Temperature for sampling (0.0 to 2.0, default varies by provider) */
  temperature?: number;
  
  /** Maximum tokens in the response */
  maxTokens?: number;
  
  /** Nucleus sampling parameter (0.0 to 1.0) */
  topP?: number;
  
  /** Whether to stream the response in real-time */
  stream?: boolean;
  
  /** Sequences that will stop generation when encountered */
  stopSequences?: string[];
}

/**
 * Normalized response format from any LLM provider
 */
export interface LLMResponse {
  /** The generated text content */
  content: string;
  
  /** Provider name (e.g., "qwen", "openai", "anthropic") */
  provider: string;
  
  /** Model identifier used for generation */
  model: string;
  
  /** Token usage information (if available from provider) */
  tokensUsed?: {
    /** Tokens in the prompt */
    prompt: number;
    /** Tokens in the completion */
    completion: number;
    /** Total tokens used */
    total: number;
  };
  
  /** Reason why generation stopped */
  finishReason?: string;
  
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Context information for code generation
 */
export interface CodeContext {
  /** Target file path for the generated code */
  filePath?: string;
  
  /** Programming language identifier */
  language?: string;
  
  /** Existing code to modify */
  existingCode?: string;
  
  /** Relevant file paths in the project */
  projectStructure?: string[];
  
  /** Requirements or specification for the code */
  requirements?: string;
}

/**
 * Represents a file change operation
 */
export interface FileChange {
  /** File path */
  path: string;
  
  /** Type of operation */
  operation: 'create' | 'modify' | 'delete';
  
  /** New file content */
  content: string;
  
  /** Optional diff representation */
  diff?: string;
}

/**
 * Result of a code generation operation
 */
export interface CodeGenerationResult {
  /** Generated code */
  code: string;
  
  /** Optional explanation of the generated code */
  explanation?: string;
  
  /** File changes to apply */
  changes?: FileChange[];
  
  /** Full LLM response */
  response: LLMResponse;
}

/**
 * Configuration for a specific LLM provider
 */
export interface ProviderConfig {
  /** Provider API key (required) */
  apiKey: string;
  
  /** Custom API base URL (optional, uses provider default if not specified) */
  baseUrl?: string;
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** Maximum retry attempts for failed requests */
  maxRetries?: number;
  
  /** Additional HTTP headers to include in requests */
  customHeaders?: Record<string, string>;
}

/**
 * Application-level configuration supporting multiple providers
 */
export interface MultiProviderConfig {
  /** Provider configurations keyed by provider name */
  providers: {
    [providerName: string]: ProviderConfig;
  };
  
  /** Default provider name to use when none is specified */
  defaultProvider?: string;
  
  /** Default model identifier to use */
  defaultModel?: string;
}

/**
 * Base error class for normalized provider errors
 */
export class LLMError extends Error {
  /** Provider that generated the error */
  provider: string;
  
  /** Normalized error code */
  code: string;
  
  /** HTTP status code (if applicable) */
  statusCode?: number;
  
  /** Provider-specific error details */
  metadata?: Record<string, unknown>;

  constructor(
    message: string,
    provider: string,
    code: string,
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LLMError';
    this.provider = provider;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LLMError);
    }
  }
}

/**
 * Error thrown when authentication fails (invalid or missing API key)
 */
export class AuthenticationError extends LLMError {
  constructor(
    message: string,
    provider: string,
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, provider, 'AUTHENTICATION_ERROR', statusCode, metadata);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends LLMError {
  constructor(
    message: string,
    provider: string,
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, provider, 'RATE_LIMIT_ERROR', statusCode, metadata);
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when network/connection issues occur
 */
export class NetworkError extends LLMError {
  constructor(
    message: string,
    provider: string,
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, provider, 'NETWORK_ERROR', statusCode, metadata);
    this.name = 'NetworkError';
  }
}

/**
 * Error thrown when request parameters are invalid
 */
export class ValidationError extends LLMError {
  constructor(
    message: string,
    provider: string,
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, provider, 'VALIDATION_ERROR', statusCode, metadata);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown for provider-specific errors that don't fit other categories
 */
export class ProviderError extends LLMError {
  constructor(
    message: string,
    provider: string,
    code: string,
    statusCode?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, provider, code, statusCode, metadata);
    this.name = 'ProviderError';
  }
}

/**
 * Core interface that all LLM providers must implement
 * 
 * This interface provides a technology-agnostic abstraction for LLM operations,
 * allowing the application to work with any provider without knowing implementation details.
 */
export interface LLMProvider {
  /**
   * Send a message and receive a complete response
   * 
   * @param prompt - The prompt text to send to the LLM
   * @param options - Generation options (model, temperature, etc.)
   * @returns Promise resolving to a normalized LLM response
   */
  sendMessage(
    prompt: string,
    options: GenerationOptions
  ): Promise<LLMResponse>;

  /**
   * Send a message and receive a streaming response
   * 
   * @param prompt - The prompt text to send to the LLM
   * @param options - Generation options (model, temperature, etc.)
   * @returns AsyncIterable yielding normalized LLM responses as they arrive
   */
  streamResponse(
    prompt: string,
    options: GenerationOptions
  ): AsyncIterable<LLMResponse>;

  /**
   * Generate code based on a prompt and context
   * 
   * @param prompt - The prompt describing what code to generate
   * @param context - Context information (file path, language, existing code, etc.)
   * @returns Promise resolving to a code generation result
   */
  generateCode(
    prompt: string,
    context: CodeContext
  ): Promise<CodeGenerationResult>;

  /**
   * Validate provider configuration
   * 
   * @param config - Provider configuration to validate
   * @returns true if configuration is valid, false otherwise
   */
  validateConfig(config: ProviderConfig): boolean;

  /**
   * Get list of supported models for this provider
   * 
   * @returns Array of model identifiers supported by this provider
   */
  getSupportedModels(): readonly string[];

  /**
   * Get the name of this provider
   * 
   * @returns Provider name (e.g., "qwen", "openai", "anthropic")
   */
  getName(): string;

  /**
   * Check if the provider is available (has valid configuration)
   * 
   * @returns true if provider is available, false otherwise
   */
  isAvailable(): boolean;
}

