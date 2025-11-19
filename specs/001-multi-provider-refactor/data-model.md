# Data Model: Multi-Provider Architecture

**Feature:** Multi-Provider Architecture Refactor  
**Created:** 2024-12-19

## Entities

### LLMProvider (Interface)

**Type:** TypeScript Interface  
**Purpose:** Abstraction layer for all LLM providers

**Methods:**
- `sendMessage(prompt: string, options: GenerationOptions): Promise<LLMResponse>`
- `streamResponse(prompt: string, options: GenerationOptions): AsyncIterable<LLMResponse>`
- `generateCode(prompt: string, context: CodeContext): Promise<CodeGenerationResult>`
- `validateConfig(config: ProviderConfig): boolean`
- `getSupportedModels(): readonly string[]`
- `getName(): string`
- `isAvailable(): boolean`

**Constraints:**
- All methods must be implemented by concrete providers
- Methods must not expose provider-specific types in signatures
- Interface must be technology-agnostic

---

### GenerationOptions

**Type:** TypeScript Type/Interface  
**Purpose:** Configuration for LLM generation requests

**Fields:**
```typescript
{
  model?: string;              // Provider-specific model identifier
  temperature?: number;         // 0.0 to 2.0, default varies by provider
  maxTokens?: number;           // Maximum tokens in response
  topP?: number;                // Nucleus sampling parameter
  stream?: boolean;             // Whether to stream response
  stopSequences?: string[];     // Stop generation on these sequences
}
```

**Validation Rules:**
- `temperature`: Must be between 0.0 and 2.0 (if provided)
- `maxTokens`: Must be positive integer (if provided)
- `topP`: Must be between 0.0 and 1.0 (if provided)
- `model`: Must be a valid model identifier for the provider

---

### LLMResponse

**Type:** TypeScript Type/Interface  
**Purpose:** Normalized response format from any provider

**Fields:**
```typescript
{
  content: string;                    // The generated text
  provider: string;                    // Provider name (e.g., "qwen", "openai")
  model: string;                       // Model identifier used
  tokensUsed?: {
    prompt: number;                    // Tokens in prompt
    completion: number;                // Tokens in completion
    total: number;                     // Total tokens
  };
  finishReason?: string;               // Why generation stopped
  metadata?: Record<string, unknown>;   // Provider-specific metadata
}
```

**Constraints:**
- `content` is always present (may be empty string)
- `provider` and `model` are always present
- `tokensUsed` may be undefined if provider doesn't report it
- `metadata` can contain provider-specific information

---

### CodeContext

**Type:** TypeScript Type/Interface  
**Purpose:** Context information for code generation

**Fields:**
```typescript
{
  filePath?: string;                   // Target file path
  language?: string;                    // Programming language
  existingCode?: string;                // Existing code to modify
  projectStructure?: string[];         // Relevant file paths
  requirements?: string;                // Requirements/specification
}
```

**Validation Rules:**
- At least one field must be provided
- `filePath` must be valid path format (if provided)
- `language` should be valid programming language identifier (if provided)

---

### CodeGenerationResult

**Type:** TypeScript Type/Interface  
**Purpose:** Result of code generation operation

**Fields:**
```typescript
{
  code: string;                         // Generated code
  explanation?: string;                  // Explanation of the code
  changes?: FileChange[];                // File changes to apply
  response: LLMResponse;                // Full LLM response
}
```

**Related Types:**
```typescript
interface FileChange {
  path: string;                         // File path
  operation: 'create' | 'modify' | 'delete';
  content: string;                      // New file content
  diff?: string;                        // Diff representation
}
```

---

### ProviderConfig

**Type:** TypeScript Type/Interface  
**Purpose:** Configuration for a specific provider

**Fields:**
```typescript
{
  apiKey: string;                       // Provider API key
  baseUrl?: string;                     // Custom API base URL (optional)
  timeout?: number;                     // Request timeout in ms
  maxRetries?: number;                  // Maximum retry attempts
  customHeaders?: Record<string, string>; // Additional HTTP headers
}
```

**Validation Rules:**
- `apiKey` is required and must be non-empty
- `timeout` must be positive integer (if provided)
- `maxRetries` must be non-negative integer (if provided)
- API key format validation is provider-specific

---

### MultiProviderConfig

**Type:** TypeScript Type/Interface  
**Purpose:** Application-level configuration supporting multiple providers

**Fields:**
```typescript
{
  providers: {
    [providerName: string]: ProviderConfig;  // Config per provider
  };
  defaultProvider?: string;                 // Default provider name
  defaultModel?: string;                     // Default model identifier
}
```

**Validation Rules:**
- At least one provider must be configured
- `defaultProvider` must exist in `providers` object (if provided)
- `defaultModel` must be valid for `defaultProvider` (if provided)

**Example:**
```typescript
{
  providers: {
    qwen: {
      apiKey: "sk-...",
    },
    openai: {
      apiKey: "sk-...",
    },
    anthropic: {
      apiKey: "sk-ant-...",
    }
  },
  defaultProvider: "qwen",
  defaultModel: "qwen-turbo"
}
```

---

### LLMError (Base Class)

**Type:** TypeScript Class  
**Purpose:** Base error class for normalized provider errors

**Fields:**
```typescript
class LLMError extends Error {
  provider: string;                      // Provider that generated error
  code: string;                          // Error code (normalized)
  statusCode?: number;                   // HTTP status code (if applicable)
  metadata?: Record<string, unknown>;    // Provider-specific error details
}
```

**Subclasses:**
- `AuthenticationError` - Invalid or missing API key
- `RateLimitError` - Rate limit exceeded
- `NetworkError` - Network/connection issues
- `ValidationError` - Invalid request parameters
- `ProviderError` - Provider-specific errors

---

## Relationships

```
MultiProviderConfig
  ├── contains → ProviderConfig (one per provider)
  └── references → defaultProvider (string)

LLMProvider (interface)
  ├── uses → GenerationOptions
  ├── returns → LLMResponse
  ├── uses → CodeContext
  ├── returns → CodeGenerationResult
  └── validates → ProviderConfig

ProviderRegistry
  ├── manages → LLMProvider instances
  └── uses → MultiProviderConfig
```

## State Transitions

### Provider Selection Flow

```
1. User specifies provider/model (CLI flag or config)
   ↓
2. System validates provider exists in registry
   ↓
3. System checks ProviderConfig exists for provider
   ↓
4. System validates API key is present and valid
   ↓
5. System instantiates provider (if not already)
   ↓
6. Provider is available for use
```

### Error Handling Flow

```
1. Provider operation fails
   ↓
2. Provider-specific error caught
   ↓
3. Error normalized to LLMError subclass
   ↓
4. Application handles normalized error
   ↓
5. User sees clear, actionable error message
```

## Validation Rules Summary

1. **API Keys:** Must be validated per provider format
2. **Models:** Must be validated against provider's supported models
3. **GenerationOptions:** Numeric values must be in valid ranges
4. **Provider Selection:** Must validate provider exists and has config
5. **Error Handling:** All errors must be normalized before reaching application layer

