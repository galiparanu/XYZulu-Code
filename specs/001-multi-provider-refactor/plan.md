# Implementation Plan: Multi-Provider Architecture Refactor

**Status:** Draft  
**Created:** 2024-12-19  
**Last Updated:** 2024-12-19

## Constitution Check

- [x] Adheres to Multi-Provider Architecture (Adapter Pattern) - Core design pattern for this refactor
- [x] Uses TypeScript Strict Mode - All interfaces and implementations will use strict typing
- [x] Maintains Agentic Workflow - Application layer remains unchanged, only provider layer refactored
- [x] Includes Diff View Safety - UI components remain untouched, ensuring diff view continues to work
- [x] Has Corresponding Spec in `specs/*.md` - spec.md exists and is complete

## Overview

This plan implements a multi-provider architecture refactor for Xyzulu, transforming the hardcoded Qwen/DashScope implementation into a flexible, adapter-based system supporting multiple LLM providers (Qwen, OpenAI, Anthropic, and future providers).

The refactor follows a phased approach to minimize risk and ensure backward compatibility:

1. **Definition Phase:** Establish the abstraction layer (interfaces/types)
2. **Extraction Phase:** Move existing Qwen code into QwenProvider adapter
3. **Wiring Phase:** Update application to use the abstraction
4. **Expansion Phase:** Create skeleton adapters for new providers

## Objectives

1. **Abstraction:** Create a technology-agnostic LLM provider interface that all providers implement
2. **Preservation:** Extract existing Qwen functionality without breaking changes
3. **Flexibility:** Enable users to switch between providers via configuration or CLI flags
4. **Extensibility:** Establish a clear pattern for adding new providers in the future

## Technical Context

### Current State Analysis

**Status:** Codebase from `QwenLM/qwen-code` needs to be analyzed once integrated.

**Expected Structure (based on typical TypeScript CLI projects):**

- Entry point: `src/index.ts` or `src/cli.ts`
- LLM integration: Likely `src/generator.ts`, `src/llm.ts`, or `src/api.ts`
- Configuration: `src/config.ts` or similar
- DashScope API calls: Direct HTTP calls or SDK usage

**Key Areas to Identify:**

- Where DashScope API is called (likely in a generator or LLM service)
- How API keys are currently stored and accessed
- How responses are processed and passed to UI/diff view
- CLI argument parsing location
- Configuration file structure

**Known Limitations (To Be Resolved During Integration):**

The following items are documented as known limitations that will be resolved when the Qwen codebase is integrated:

- **File Structure:** Exact file structure of Qwen codebase (to be resolved when code is integrated)
- **Configuration Format:** Current configuration format and storage location (to be analyzed during Phase 2)
- **Error Handling Patterns:** Current error handling patterns (to be documented during codebase analysis)
- **Response Format:** Current response format and how it's used by UI (to be mapped during extraction)

**Note:** The implementation structure is ready to accommodate these details once the Qwen codebase is available. The abstraction layer has been designed to be flexible enough to handle various integration patterns.

### Technology Stack

- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js
- **Pattern:** Adapter Pattern (Gang of Four)
- **Architecture:** Layered architecture with provider abstraction layer

### Dependencies

- Existing Qwen/DashScope implementation (to be extracted)
- TypeScript with strict mode enabled
- Node.js HTTP client (fetch API or axios)
- Configuration management system (to be extended)
- CLI argument parser (to be extended)

## Technical Approach

### Architecture Decision: Interface vs Abstract Class

**Decision:** Use TypeScript interface for maximum flexibility.

**Rationale:**

- Interfaces allow multiple inheritance (if needed)
- No shared implementation needed initially
- Easier to mock for testing
- More flexible for future providers with different needs

**Alternative Considered:** Abstract class - Rejected because no shared implementation is needed yet.

### Directory Structure

```
src/
├── providers/
│   ├── index.ts                 # Provider exports and registry
│   ├── types.ts                 # LLMProvider interface and shared types
│   ├── qwen/
│   │   └── QwenProvider.ts      # Extracted Qwen implementation
│   ├── openai/
│   │   └── OpenAIProvider.ts    # OpenAI adapter (skeleton)
│   └── anthropic/
│       └── AnthropicProvider.ts # Anthropic adapter (skeleton)
├── config/
│   └── ConfigManager.ts         # Extended for multi-provider keys
└── [existing files remain unchanged]
```

### Provider Interface Design

The `LLMProvider` interface will define:

```typescript
interface LLMProvider {
  // Core generation methods
  sendMessage(prompt: string, options: GenerationOptions): Promise<LLMResponse>;
  streamResponse(
    prompt: string,
    options: GenerationOptions
  ): AsyncIterable<LLMResponse>;
  generateCode(
    prompt: string,
    context: CodeContext
  ): Promise<CodeGenerationResult>;

  // Configuration
  validateConfig(config: ProviderConfig): boolean;
  getSupportedModels(): readonly string[];

  // Metadata
  getName(): string;
  isAvailable(): boolean;
}
```

### Error Normalization Strategy

**Decision:** Create common error types with provider-specific details in metadata.

**Approach:**

- Define `LLMError` base class with common properties
- Provider-specific errors extend base with additional metadata
- Application layer only handles common error types
- Provider details available in error metadata for debugging

## Implementation Steps

### Phase 1: Definition - Create Interfaces and Types

**Goal:** Establish the abstraction layer without changing any existing code.

**Steps:**

1. **Create provider directory structure**

   - [ ] Create `src/providers/` directory
   - [ ] Create subdirectories: `qwen/`, `openai/`, `anthropic/`
   - [ ] Create `src/providers/index.ts` for exports

2. **Define core types and interfaces**

   - [ ] Create `src/providers/types.ts` with:
     - `LLMProvider` interface (all required methods)
     - `GenerationOptions` type (model, temperature, maxTokens, etc.)
     - `LLMResponse` type (normalized response format)
     - `CodeContext` type (for code generation)
     - `CodeGenerationResult` type
     - `ProviderConfig` type (API key, base URL, etc.)
     - Common error types (`LLMError`, `AuthenticationError`, `RateLimitError`, etc.)

3. **Validate TypeScript strict mode compliance**

   - [ ] Ensure all types are explicit (no `any`)
   - [ ] Run TypeScript compiler with strict mode
   - [ ] Fix any type errors
   - [ ] Verify zero warnings

4. **Create provider registry structure**
   - [ ] Create `ProviderRegistry` class in `src/providers/index.ts`
   - [ ] Define methods: `register()`, `get()`, `list()`, `getDefault()`
   - [ ] Implement provider lookup by name or model identifier

**Deliverables:**

- `src/providers/types.ts` with all interfaces and types
- `src/providers/index.ts` with ProviderRegistry skeleton
- TypeScript compilation passes with zero errors/warnings

**Testing:**

- Unit tests for type definitions (compile-time validation)
- Unit tests for ProviderRegistry basic operations

---

### Phase 2: Extraction - Move Qwen Code to QwenProvider

**Goal:** Extract existing Qwen implementation into QwenProvider without breaking functionality.

**Prerequisites:** Phase 1 complete, Qwen codebase analyzed

**Steps:**

1. **Analyze existing Qwen implementation**

   - [ ] Identify all files that call DashScope API
   - [ ] Map current API call patterns (HTTP client, SDK, etc.)
   - [ ] Document current response format and processing
   - [ ] Identify configuration access points
   - [ ] Document error handling patterns

2. **Create QwenProvider class structure**

   - [ ] Create `src/providers/qwen/QwenProvider.ts`
   - [ ] Implement `LLMProvider` interface (all methods)
   - [ ] Add private methods for DashScope-specific logic:
     - `authenticate()` - API key handling
     - `formatRequest()` - Convert to DashScope API format
     - `parseResponse()` - Convert DashScope response to LLMResponse
     - `handleError()` - Map DashScope errors to common errors

3. **Extract and migrate code**

   - [ ] Move DashScope API calls into QwenProvider methods
   - [ ] Update imports to use provider types
   - [ ] Ensure all existing functionality is preserved
   - [ ] Maintain backward compatibility with existing response format

4. **Update configuration access**

   - [ ] Modify QwenProvider to read from new multi-provider config
   - [ ] Support both old config format (for migration) and new format
   - [ ] Add validation for Qwen API key format

5. **Create QwenProvider tests**

   - [ ] Unit tests for each interface method
   - [ ] Mock DashScope API responses
   - [ ] Test error handling and normalization
   - [ ] Verify response format matches interface contract

6. **Verify no breaking changes**
   - [ ] Run all existing tests (should pass without modification)
   - [ ] Manual test: Verify existing Qwen workflows still work
   - [ ] Verify diff view still functions correctly
   - [ ] Verify UI components receive data in expected format

**Deliverables:**

- `src/providers/qwen/QwenProvider.ts` fully implemented
- All existing Qwen functionality working through QwenProvider
- Test suite for QwenProvider
- Zero regression in existing functionality

**Testing:**

- All existing tests pass
- New unit tests for QwenProvider
- Integration test: End-to-end Qwen workflow
- Manual verification of diff view and UI

---

### Phase 3: Wiring - Update Application to Use Interface

**Goal:** Replace direct Qwen calls with provider abstraction throughout the application.

**Prerequisites:** Phase 2 complete

**Steps:**

1. **Update configuration system**

   - [ ] Extend `ConfigManager` to support multiple provider keys
   - [ ] Add `getProviderKey(provider: string): string | undefined`
   - [ ] Add `setProviderKey(provider: string, key: string): void`
   - [ ] Add `getDefaultProvider(): string`
   - [ ] Add `setDefaultProvider(provider: string): void`
   - [ ] Maintain backward compatibility (migrate old single-key config)

2. **Update CLI argument parsing**

   - [ ] Add `--model` flag support (e.g., `--model gpt-4o`)
   - [ ] Add `--provider` flag support (e.g., `--provider openai`)
   - [ ] Parse model identifier to determine provider
   - [ ] Validate provider/model combination
   - [ ] Show clear error if provider/key missing

3. **Create provider factory/resolver**

   - [ ] Implement logic to resolve provider from:
     - CLI flag (highest priority)
     - Configuration default
     - Fallback to Qwen if available
   - [ ] Validate API key exists for selected provider
   - [ ] Instantiate provider with appropriate config

4. **Update application entry points**

   - [ ] Replace direct Qwen calls with `LLMProvider` interface calls
   - [ ] Use ProviderRegistry to get provider instance
   - [ ] Pass provider to all components that need LLM access
   - [ ] Ensure UI/diff view components receive data in same format

5. **Update all LLM call sites**

   - [ ] Find all places that call Qwen API directly
   - [ ] Replace with `provider.sendMessage()` or `provider.generateCode()`
   - [ ] Update streaming calls to use `provider.streamResponse()`
   - [ ] Ensure error handling uses normalized error types

6. **Register QwenProvider**

   - [ ] Register QwenProvider in ProviderRegistry at startup
   - [ ] Set as default if Qwen key is configured
   - [ ] Ensure provider is available for selection

7. **Test provider switching**
   - [ ] Test CLI flag override of config
   - [ ] Test default provider from config
   - [ ] Test fallback to Qwen
   - [ ] Test error when provider/key missing
   - [ ] Verify all existing workflows still work

**Deliverables:**

- Application uses `LLMProvider` interface throughout
- Configuration supports multiple providers
- CLI flags work for provider selection
- All existing functionality preserved
- Provider switching works end-to-end

**Testing:**

- Integration tests for provider selection logic
- Integration tests for CLI flag parsing
- Regression tests: All existing Qwen workflows
- Manual test: Provider switching via CLI

---

### Phase 4: Expansion - Create Provider Skeletons

**Goal:** Create skeleton adapters for OpenAI and Anthropic to prove extensibility.

**Prerequisites:** Phase 3 complete

**Steps:**

1. **Create OpenAIProvider skeleton**

   - [ ] Create `src/providers/openai/OpenAIProvider.ts`
   - [ ] Implement `LLMProvider` interface with placeholder methods
   - [ ] Add method stubs that return appropriate types
   - [ ] Add `getSupportedModels()` returning OpenAI models (gpt-4o, gpt-4-turbo, etc.)
   - [ ] Implement `validateConfig()` for OpenAI API key format
   - [ ] Add TODO comments for full implementation
   - [ ] Ensure class can be instantiated without errors

2. **Create AnthropicProvider skeleton**

   - [ ] Create `src/providers/anthropic/AnthropicProvider.ts`
   - [ ] Implement `LLMProvider` interface with placeholder methods
   - [ ] Add method stubs that return appropriate types
   - [ ] Add `getSupportedModels()` returning Anthropic models (claude-3-opus, claude-3-sonnet, etc.)
   - [ ] Implement `validateConfig()` for Anthropic API key format
   - [ ] Add TODO comments for full implementation
   - [ ] Ensure class can be instantiated without errors

3. **Register new providers**

   - [ ] Register OpenAIProvider in ProviderRegistry
   - [ ] Register AnthropicProvider in ProviderRegistry
   - [ ] Test provider listing includes new providers
   - [ ] Test provider selection can target new providers (even if not fully functional)

4. **Update configuration**

   - [ ] Test storing OpenAI API key
   - [ ] Test storing Anthropic API key
   - [ ] Test key validation for both providers
   - [ ] Verify keys are stored independently

5. **Documentation and examples**
   - [ ] Document how to add a new provider (pattern from skeletons)
   - [ ] Add code comments explaining what needs to be implemented
   - [ ] Create example showing provider registration

**Deliverables:**

- `src/providers/openai/OpenAIProvider.ts` skeleton
- `src/providers/anthropic/AnthropicProvider.ts` skeleton
- Both providers registered and selectable
- Documentation for adding new providers

**Testing:**

- Unit tests: Verify skeletons implement interface correctly
- Integration test: Verify providers can be selected (even if not functional)
- Test: Verify configuration accepts keys for new providers

---

## Dependencies

### External Dependencies

- TypeScript (^5.0+) with strict mode
- Node.js (^18.0+)
- Existing Qwen/DashScope SDK or HTTP client (to be analyzed)

### Internal Dependencies

- Existing configuration system (to be extended)
- Existing CLI parser (to be extended)
- Existing UI/diff view components (no changes needed)

### Dependency Order

1. Phase 1 can start immediately (no dependencies)
2. Phase 2 requires Phase 1 + Qwen codebase analysis
3. Phase 3 requires Phase 2 completion
4. Phase 4 requires Phase 3 completion

## Testing Strategy

### Unit Testing

- **Phase 1:** Test type definitions, ProviderRegistry operations
- **Phase 2:** Test QwenProvider methods with mocked DashScope API
- **Phase 3:** Test configuration management, provider selection logic
- **Phase 4:** Test skeleton providers implement interface correctly

### Integration Testing

- **Phase 2:** End-to-end Qwen workflow through QwenProvider
- **Phase 3:** Provider switching, CLI flag parsing, config migration
- **Phase 4:** Provider selection for skeleton providers

### Regression Testing

- After each phase: Verify all existing Qwen workflows still work
- After Phase 3: Verify diff view and UI components unchanged
- Continuous: Run full test suite after each change

### Manual Testing

- After Phase 2: Test existing Qwen workflows manually
- After Phase 3: Test provider switching via CLI
- After Phase 4: Verify skeleton providers can be selected

## Success Criteria

See `spec.md` Success Criteria section for detailed acceptance criteria. Key phase-level criteria (summary):

- [ ] Phase 1: All interfaces defined, TypeScript compiles with zero errors
- [ ] Phase 2: QwenProvider works identically to original implementation
- [ ] Phase 3: Users can switch providers via CLI flag, all existing workflows work
- [ ] Phase 4: OpenAIProvider and AnthropicProvider skeletons exist and are selectable
- [ ] All existing tests pass without modification
- [ ] TypeScript strict mode: Zero errors, zero warnings
- [ ] Diff view and UI components function identically
- [ ] Configuration supports multiple provider keys
- [ ] Documentation exists for adding new providers

## Risks & Mitigations

- **Risk 1:** Existing Qwen code is tightly coupled, making extraction difficult

  - _Mitigation:_ Analyze codebase thoroughly in Phase 2, refactor incrementally, maintain tests throughout

- **Risk 2:** Breaking changes during extraction (Phase 2)

  - _Mitigation:_ Comprehensive test coverage before extraction, verify all existing tests pass after each change

- **Risk 3:** Configuration migration breaks existing user setups

  - _Mitigation:_ Support both old and new config formats, auto-migrate transparently, maintain backward compatibility

- **Risk 4:** Provider interface too generic or too specific

  - _Mitigation:_ Start with spec-defined interface, iterate based on real provider implementations, keep interface focused on common operations

- **Risk 5:** Performance degradation from abstraction layer
  - _Mitigation:_ Profile before/after, ensure abstraction adds minimal overhead, optimize hot paths if needed

## Notes

### Codebase Analysis Required

Once the Qwen codebase is integrated, the following analysis is needed:

1. **File Structure:**

   - Locate all files that interact with DashScope API
   - Map the call hierarchy (entry point → API calls)
   - Identify shared utilities and helpers

2. **API Integration Points:**

   - How DashScope is called (SDK, HTTP client, etc.)
   - Request/response formats
   - Authentication mechanism
   - Error handling patterns

3. **Configuration:**

   - Current config file location and format
   - How API keys are stored and accessed
   - Environment variable support

4. **Response Processing:**
   - How responses are transformed before UI
   - What format UI/diff view expects
   - Any response caching or processing

### Migration Strategy

- **Backward Compatibility:** Maintain support for existing single-provider config
- **Transparent Migration:** Auto-detect and migrate old config format
- **Zero Downtime:** Existing users should see no changes until they configure new providers

### Future Enhancements (Out of Scope)

- Full OpenAI implementation
- Full Anthropic implementation
- Gemini provider
- Ollama provider
- Provider-specific optimizations
- Response caching layer
- Provider health monitoring

---

**Next Steps:**

1. Analyze Qwen codebase once integrated
2. Begin Phase 1: Create interfaces and types
3. Proceed through phases sequentially
4. Test thoroughly after each phase
