# Specification: Multi-Provider Architecture Refactor

**Version:** 1.0.0  
**Status:** Draft  
**Created:** 2024-12-19  
**Last Updated:** 2024-12-19

## Constitution Compliance

- ✅ Multi-Provider Architecture: This specification directly implements Principle 1 by defining the abstraction layer and adapter pattern for multiple LLM providers
- ✅ TypeScript Strict Mode: All interfaces and types will be strictly typed with no `any` types, ensuring compile-time safety
- ✅ Agentic Workflow: The refactor preserves existing agentic behavior - only the underlying provider changes, not the autonomous workflow
- ✅ Diff View Safety: UI components and diff view mechanisms remain unchanged and functional throughout the refactor
- ✅ Spec-Driven Development: This document defines the requirements before any implementation begins

## Scope

### In Scope

- Create a generic abstraction layer (interface/abstract class) for LLM providers
- Extract existing Qwen/DashScope implementation into a QwenProvider adapter
- Create adapter structure for OpenAI and Anthropic providers
- Update configuration system to support multiple API keys (one per provider)
- Implement provider/model selection mechanism via configuration and CLI flags
- Ensure all existing functionality (diff view, UI, agentic workflow) continues to work unchanged
- Maintain backward compatibility with existing Qwen-based workflows

### Out of Scope

- Implementation of Gemini or Ollama providers (structure only, not full implementation)
- Changes to UI/UX components
- Changes to diff view functionality
- Changes to agentic workflow logic
- Migration of existing user data or configurations
- Performance optimizations beyond what's required for multi-provider support

## Requirements

### Functional Requirements

1. **FR-1: LLM Provider Abstraction Layer**
   - The system MUST define a standardized interface (or abstract class) that all LLM providers implement
   - The interface MUST include methods for:
     - Sending messages and receiving responses
     - Streaming responses in real-time
     - Generating code based on prompts
   - All provider-specific implementation details MUST be hidden behind this abstraction
   - Acceptance Criteria:
     - [ ] Interface/abstract class defined with all required methods
     - [ ] Interface is technology-agnostic (no provider-specific types in signature)
     - [ ] All methods have clear, testable contracts
     - [ ] TypeScript strict mode compliance verified

2. **FR-2: Qwen Provider Adapter**
   - The existing Qwen/DashScope API implementation MUST be extracted into a QwenProvider class
   - QwenProvider MUST implement the standard LLM provider interface
   - All existing Qwen functionality MUST be preserved (no feature loss)
   - The adapter MUST handle DashScope API authentication, request formatting, and response parsing
   - Acceptance Criteria:
     - [ ] QwenProvider class implements the standard interface
     - [ ] All existing Qwen features work identically after refactor
     - [ ] No breaking changes to existing Qwen-based workflows
     - [ ] DashScope API calls are encapsulated within QwenProvider

3. **FR-3: Provider Adapter Structure**
   - The system MUST provide adapter class structures for OpenAIProvider and AnthropicProvider
   - Adapters MUST follow the same interface contract as QwenProvider
   - Adapters MUST be ready for implementation (skeleton structure with proper types)
   - Acceptance Criteria:
     - [ ] OpenAIProvider class structure exists with interface implementation
     - [ ] AnthropicProvider class structure exists with interface implementation
     - [ ] Both adapters have placeholder methods that return appropriate types
     - [ ] Adapters can be instantiated without errors (even if not fully functional)

4. **FR-4: Multi-Provider Configuration Management**
   - The configuration system MUST support storing API keys for multiple providers simultaneously
   - Configuration MUST allow users to set API keys for: Qwen, OpenAI, Anthropic (and optionally Gemini, Ollama)
   - Configuration MUST validate API key format for each provider type
   - Configuration MUST persist keys securely (following existing security practices)
   - Users MUST be able to update provider keys without affecting other providers
   - Acceptance Criteria:
     - [ ] Configuration can store multiple provider API keys
     - [ ] Each provider key is stored independently
     - [ ] Key validation works for each supported provider type
     - [ ] Configuration updates don't affect other provider settings
     - [ ] Security practices match or exceed existing implementation

5. **FR-5: Provider and Model Selection**
   - Users MUST be able to select the active LLM provider via configuration file
   - Users MUST be able to override provider selection via CLI flag (e.g., `xyzulu --model gpt-4o`)
   - The system MUST support model selection within a provider (e.g., `gpt-4o`, `gpt-4-turbo` for OpenAI)
   - CLI flag MUST take precedence over configuration file setting
   - The system MUST validate that the selected provider has a valid API key configured
   - Acceptance Criteria:
     - [ ] Users can set default provider in configuration file
     - [ ] CLI flag `--model` or `--provider` overrides configuration
     - [ ] System validates API key exists for selected provider
     - [ ] Clear error messages when provider/key is missing
     - [ ] Model selection works for provider-specific models

6. **FR-6: Backward Compatibility**
   - Existing Qwen-based workflows MUST continue to work without modification
   - Users with only Qwen API keys configured MUST experience no changes to functionality
   - Default behavior (when no provider specified) MUST remain Qwen if Qwen key is configured
   - Acceptance Criteria:
     - [ ] All existing Qwen workflows function identically
     - [ ] No breaking changes to existing CLI commands
     - [ ] Default provider behavior preserved for existing users
     - [ ] Migration path is transparent (no user action required)

### Non-Functional Requirements

1. **NFR-1: Type Safety**
   - All code MUST use TypeScript strict mode
   - Zero TypeScript compilation errors or warnings
   - All provider interfaces MUST be fully typed
   - No use of `any` type except where absolutely necessary with explicit justification

2. **NFR-2: Code Organization**
   - Provider adapters MUST be organized in a clear directory structure
   - Common interface/abstraction MUST be in a shared location
   - Provider-specific code MUST be isolated in separate modules
   - Code structure MUST facilitate adding new providers in the future

3. **NFR-3: Error Handling**
   - Provider-specific errors MUST be normalized to common error types
   - Users MUST receive clear, actionable error messages regardless of provider
   - Network failures, authentication errors, and rate limits MUST be handled gracefully
   - Error messages MUST not expose provider-specific implementation details unnecessarily
   
   **Error Message Quality Examples:**
   
   ✅ **Good:** "API key not configured for provider 'openai'. Please set it with: xyzulu config set openai.apiKey <key>"
   
   ❌ **Bad:** "Error: 401 Unauthorized" or "DashScope API returned error code: INVALID_API_KEY"
   
   ✅ **Good:** "Provider 'anthropic' is not available. Please check your API key configuration."
   
   ❌ **Bad:** "AnthropicError: sk-ant-api03-..." (exposes key details)

4. **NFR-4: Testing**
   - Each provider adapter MUST have unit tests
   - Integration tests MUST verify provider switching works correctly
   - Existing tests for Qwen functionality MUST continue to pass
   - Mock providers MUST be available for testing without API keys

## User Scenarios

### Scenario 1: Existing User (Qwen Only)
**Actor:** User with existing Qwen setup  
**Goal:** Continue using Xyzulu without any changes  
**Steps:**
1. User has Qwen API key already configured
2. User runs Xyzulu commands as before
3. System uses Qwen provider by default
4. All functionality works identically to before

**Success:** User experiences no changes, everything works as before

### Scenario 2: New User (OpenAI)
**Actor:** New user who wants to use OpenAI  
**Goal:** Configure and use OpenAI as the LLM provider  
**Steps:**
1. User installs Xyzulu
2. User configures OpenAI API key via CLI or config file
3. User sets OpenAI as default provider (or uses `--model gpt-4o` flag)
4. User runs Xyzulu commands
5. System uses OpenAI provider for all requests

**Success:** User can use OpenAI seamlessly, same experience as Qwen users

### Scenario 3: Multi-Provider User
**Actor:** User with multiple API keys  
**Goal:** Switch between providers for different tasks  
**Steps:**
1. User configures API keys for Qwen, OpenAI, and Anthropic
2. User runs `xyzulu --model gpt-4o` for one task (uses OpenAI)
3. User runs `xyzulu --model claude-3-opus` for another task (uses Anthropic)
4. User runs `xyzulu` without flags (uses default from config, e.g., Qwen)

**Success:** User can seamlessly switch between providers via CLI flags

### Scenario 4: Provider Error Handling
**Actor:** User with misconfigured provider  
**Goal:** Receive clear error when provider/key is invalid  
**Steps:**
1. User sets OpenAI as provider but hasn't configured API key
2. User runs Xyzulu command
3. System detects missing/invalid key
4. System displays clear error message indicating which provider needs configuration

**Success:** User receives actionable error message, not cryptic API errors

## Technical Design

### Architecture

The refactor implements an Adapter Pattern architecture:

```
Application Layer (UI, CLI, Agentic Logic)
    ↓
LLMProvider Interface (Abstraction)
    ↓
┌─────────────┬──────────────┬──────────────┐
│ QwenProvider│OpenAIProvider│AnthropicProvider│
└─────────────┴──────────────┴──────────────┘
```

- Application layer remains unchanged (UI, diff view, agentic workflow)
- All provider-specific code is isolated in adapter classes
- New providers can be added by implementing the interface

### API Contracts

The standard LLM provider interface MUST define:

```typescript
interface LLMProvider {
  // Core methods that all providers must implement
  sendMessage(prompt: string, options: GenerationOptions): Promise<LLMResponse>
  streamResponse(prompt: string, options: GenerationOptions): AsyncIterable<LLMResponse>
  generateCode(prompt: string, context: CodeContext): Promise<CodeGenerationResult>
  
  // Configuration and validation
  validateConfig(config: ProviderConfig): boolean
  getSupportedModels(): string[]
  
  // Provider metadata
  getName(): string
  isAvailable(): boolean
}
```

### Data Models

**ProviderConfig:**
- Stores API keys and settings per provider
- Supports multiple providers simultaneously
- Includes default provider selection

**GenerationOptions:**
- Model selection (provider-specific model names)
- Temperature, max tokens, etc.
- Streaming preferences

**LLMResponse:**
- Normalized response format
- Provider-agnostic structure
- Includes metadata (provider, model, tokens used)

### Provider Adapter Requirements

Each provider adapter MUST:
1. Implement the LLMProvider interface completely
2. Handle provider-specific authentication
3. Transform provider API responses to normalized format
4. Handle provider-specific error codes and map to common errors
5. Support provider-specific models and capabilities
6. Encapsulate all HTTP/API communication internally

## Implementation Details

### Components

- **LLMProvider Interface/Abstract Class:** Core abstraction defining the contract
- **QwenProvider:** Extracted from existing codebase, implements interface
- **OpenAIProvider:** New adapter structure for OpenAI API
- **AnthropicProvider:** New adapter structure for Anthropic API
- **ProviderRegistry:** Manages provider instances and selection logic
- **ConfigManager:** Extended to handle multi-provider configuration
- **CLI Parser:** Updated to handle `--model` and `--provider` flags

### Key Design Decisions

1. **Interface vs Abstract Class:** Use interface for maximum flexibility, abstract class only if shared implementation needed
2. **Provider Instantiation:** Lazy loading - providers instantiated only when needed
3. **Error Normalization:** Common error types with provider-specific details in metadata
4. **Configuration Storage:** Extend existing config format to support multiple keys

## Testing Strategy

### Unit Tests

- Test LLMProvider interface contract compliance for each adapter
- Test QwenProvider maintains all existing functionality
- Test configuration management with multiple providers
- Test provider selection logic (config vs CLI flag precedence)
- Test error handling and normalization

### Integration Tests

- Test end-to-end workflow with Qwen provider (regression)
- Test switching between providers in same session
- Test CLI flag override of configuration
- Test error scenarios (missing keys, invalid providers)

### Manual Testing

- Verify existing Qwen workflows still work
- Test OpenAI provider with real API (when implemented)
- Test Anthropic provider with real API (when implemented)
- Verify diff view and UI remain functional
- Test provider switching via CLI flags

## Success Criteria

**Acceptance Criteria:**

1. **Multi-Provider Support**
   - Users can configure and use at least 3 providers (Qwen, OpenAI, Anthropic) without code changes
   - Configuration system supports storing keys for all providers simultaneously
   - New provider adapters can be added by implementing the interface (demonstrated with OpenAI/Anthropic skeletons)

2. **Backward Compatibility**
   - All existing Qwen functionality works identically after refactor (zero regression)
   - All existing tests pass without modification

3. **Performance**
   - CLI flag parsing and provider resolution completes in under 2 seconds (measured from flag parsing to provider instance ready)

4. **Code Quality**
   - TypeScript compilation produces zero errors and zero warnings

5. **User Experience**
   - Error messages are clear and actionable for 95% of common failure scenarios (see NFR-3 for examples)
   - Diff view and UI components function identically regardless of selected provider

## Dependencies

- Existing Qwen/DashScope implementation (to be extracted)
- TypeScript with strict mode enabled
- Existing configuration system (to be extended)
- Existing CLI argument parser (to be extended)
- Existing UI/diff view components (no changes required)

## Assumptions

1. The existing Qwen implementation is modular enough to extract into an adapter class
2. The existing configuration system can be extended to support multiple keys without breaking changes
3. Provider API responses can be normalized to a common format
4. CLI argument parsing can be extended to support new flags without breaking existing commands
5. Users will primarily use one provider at a time, with occasional switching
6. API keys will be stored using existing security practices (no new security requirements)

## Open Questions

None - all requirements are clear based on the constitution and user requirements.

## References

- Xyzulu Project Constitution: `.specify/memory/constitution.md`
- Qwen Code Base: `QwenLM/qwen-code` (reference implementation)
- Adapter Pattern: Standard design pattern for provider abstraction
