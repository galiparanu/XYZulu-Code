# Adding a New Provider to Xyzulu

This guide explains how to add a new LLM provider to Xyzulu's multi-provider architecture.

## Overview

Xyzulu uses an Adapter Pattern to support multiple LLM providers. Each provider implements the `LLMProvider` interface, ensuring a consistent API regardless of the underlying provider.

## Step-by-Step Guide

### 1. Create Provider Directory

Create a new directory for your provider:

```bash
mkdir -p src/providers/<provider-name>
```

Example:
```bash
mkdir -p src/providers/gemini
```

### 2. Create Provider Class

Create a new file `src/providers/<provider-name>/<ProviderName>Provider.ts`:

```typescript
import type {
  LLMProvider,
  GenerationOptions,
  LLMResponse,
  CodeContext,
  CodeGenerationResult,
  ProviderConfig,
} from '../types';
import { ProviderError } from '../types';

export class GeminiProvider implements LLMProvider {
  private config: ProviderConfig;
  private readonly supportedModels: readonly string[] = [
    'gemini-pro',
    'gemini-pro-vision',
  ];

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  getName(): string {
    return 'gemini';
  }

  isAvailable(): boolean {
    return this.validateConfig(this.config);
  }

  getSupportedModels(): readonly string[] {
    return this.supportedModels;
  }

  validateConfig(config: ProviderConfig): boolean {
    // Implement provider-specific key validation
    return config.apiKey?.startsWith('your-key-prefix-') ?? false;
  }

  async sendMessage(
    prompt: string,
    options: GenerationOptions
  ): Promise<LLMResponse> {
    // TODO: Implement actual API call
    throw new ProviderError('Not implemented', this.getName(), 'NOT_IMPLEMENTED');
  }

  async *streamResponse(
    prompt: string,
    options: GenerationOptions
  ): AsyncIterable<LLMResponse> {
    // TODO: Implement streaming API call
    throw new ProviderError('Not implemented', this.getName(), 'NOT_IMPLEMENTED');
  }

  async generateCode(
    prompt: string,
    context: CodeContext
  ): Promise<CodeGenerationResult> {
    // TODO: Implement code generation
    throw new ProviderError('Not implemented', this.getName(), 'NOT_IMPLEMENTED');
  }
}
```

### 3. Implement Required Methods

All providers must implement these methods from the `LLMProvider` interface:

- **`getName()`**: Return the provider name (e.g., "gemini")
- **`isAvailable()`**: Check if provider has valid configuration
- **`getSupportedModels()`**: Return array of supported model identifiers
- **`validateConfig()`**: Validate API key format
- **`sendMessage()`**: Send prompt and get complete response
- **`streamResponse()`**: Send prompt and get streaming response
- **`generateCode()`**: Generate code with context

### 4. Add Model Mapping

Update `src/providers/resolver.ts` to add model-to-provider mapping:

```typescript
const MODEL_TO_PROVIDER: Record<string, string> = {
  // ... existing mappings
  'gemini-pro': 'gemini',
  'gemini-pro-vision': 'gemini',
};
```

### 5. Update Provider Factory

Update `createProviderInstance()` in `src/providers/resolver.ts`:

```typescript
case 'gemini':
  return new GeminiProvider(config);
```

### 6. Add Key Validation

Update `ConfigManager.validateProviderKey()` in `src/config/ConfigManager.ts`:

```typescript
case 'gemini':
  return key.startsWith('your-key-prefix-') && key.length > 10;
```

### 7. Export Provider

Add export to `src/providers/index.ts`:

```typescript
export { GeminiProvider } from './gemini/GeminiProvider';
```

### 8. Create Tests

Create test file `src/providers/<provider-name>/__tests__/<ProviderName>Provider.test.ts`:

```typescript
import { GeminiProvider } from '../GeminiProvider';
import type { ProviderConfig, LLMProvider } from '../../types';

export function testGeminiProviderImplementsInterface(): void {
  const config: ProviderConfig = { apiKey: 'test-key' };
  const provider: LLMProvider = new GeminiProvider(config);
  // Test implementation...
}
```

### 9. Register Provider

Providers are automatically registered when:
- API key is configured via `ConfigManager`
- `registerConfiguredProviders()` is called at startup

## Example: Complete Provider Implementation

See `src/providers/qwen/QwenProvider.ts` for a complete implementation example.

## Key Points

1. **Interface Compliance**: All methods must match the `LLMProvider` interface exactly
2. **Error Normalization**: Map provider-specific errors to `LLMError` subclasses
3. **Response Format**: Always return normalized `LLMResponse` format
4. **TypeScript Strict**: No `any` types, all types must be explicit
5. **Testing**: Create unit tests for all interface methods

## Testing Your Provider

1. Create provider instance: `const provider = new YourProvider({ apiKey: 'test-key' })`
2. Verify interface compliance: `const test: LLMProvider = provider`
3. Test all methods return correct types
4. Test error handling
5. Test configuration validation

## Next Steps

After implementing the skeleton:
1. Replace placeholder methods with actual API calls
2. Add proper error handling
3. Implement streaming support
4. Add provider-specific optimizations
5. Update documentation

## Questions?

Refer to:
- `src/providers/types.ts` - Interface definitions
- `src/providers/qwen/QwenProvider.ts` - Complete implementation example
- `src/providers/resolver.ts` - Provider resolution logic

