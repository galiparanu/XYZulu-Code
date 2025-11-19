# Task Breakdown: Multi-Provider Architecture Refactor

**Related Spec:** `specs/001-multi-provider-refactor/spec.md`  
**Related Plan:** `specs/001-multi-provider-refactor/plan.md`  
**Status:** Not Started  
**Created:** 2024-12-19

## Constitution Alignment

All tasks MUST:
- Follow TypeScript Strict Mode
- Maintain Multi-Provider Architecture (use adapters where applicable)
- Preserve Agentic Workflow
- Include Diff View for code changes
- Reference corresponding spec

## Implementation Strategy

**MVP Scope:** Phase 1 (Definition) + Phase 2 (QwenProvider Extraction) - This enables the core refactor while maintaining backward compatibility.

**Incremental Delivery:**
1. Phase 1: Establish abstraction (no breaking changes)
2. Phase 2: Extract Qwen (maintains existing functionality)
3. Phase 3: Enable multi-provider (adds new capabilities)
4. Phase 4: Prove extensibility (skeleton providers)

## Dependencies

### Story Completion Order

```
Phase 1 (Setup) 
  ↓
Phase 2 (US1: QwenProvider Extraction)
  ↓
Phase 3 (US2: Multi-Provider Wiring)
  ↓
Phase 4 (US3: Provider Skeletons)
  ↓
Final Phase (Regression & Polish)
```

### Parallel Execution Opportunities

- **Phase 1:** Types and directory structure can be created in parallel
- **Phase 2:** Analysis and QwenProvider structure can start in parallel after Phase 1
- **Phase 3:** Config extension and CLI parsing can be done in parallel
- **Phase 4:** OpenAIProvider and AnthropicProvider skeletons can be created in parallel

---

## Phase 1: Setup & Foundation

**Goal:** Establish the abstraction layer without changing any existing code.

**Independent Test Criteria:** TypeScript compiles with zero errors, all interfaces are properly typed, ProviderRegistry can be instantiated.

### Directory Structure

- [ ] T001 Create `src/providers/` directory
- [ ] T002 [P] Create `src/providers/qwen/` subdirectory
- [ ] T003 [P] Create `src/providers/openai/` subdirectory
- [ ] T004 [P] Create `src/providers/anthropic/` subdirectory
- [ ] T005 Create `src/providers/index.ts` file for exports

### Core Types and Interfaces

- [ ] T006 Create `src/providers/types.ts` file
- [ ] T007 Define `GenerationOptions` interface in `src/providers/types.ts`
- [ ] T008 Define `LLMResponse` interface in `src/providers/types.ts`
- [ ] T009 Define `CodeContext` interface in `src/providers/types.ts`
- [ ] T010 Define `FileChange` interface in `src/providers/types.ts`
- [ ] T011 Define `CodeGenerationResult` interface in `src/providers/types.ts`
- [ ] T012 Define `ProviderConfig` interface in `src/providers/types.ts`
- [ ] T013 Define `MultiProviderConfig` interface in `src/providers/types.ts`
- [ ] T014 Define `LLMProvider` interface in `src/providers/types.ts` with all required methods
- [ ] T015 Define `LLMError` base class in `src/providers/types.ts`
- [ ] T016 Define `AuthenticationError` class extending `LLMError` in `src/providers/types.ts`
- [ ] T017 Define `RateLimitError` class extending `LLMError` in `src/providers/types.ts`
- [ ] T018 Define `NetworkError` class extending `LLMError` in `src/providers/types.ts`
- [ ] T019 Define `ValidationError` class extending `LLMError` in `src/providers/types.ts`
- [ ] T020 Define `ProviderError` class extending `LLMError` in `src/providers/types.ts`

### Provider Registry

- [ ] T021 Create `ProviderRegistry` class skeleton in `src/providers/index.ts`
- [ ] T022 Implement `register(provider: LLMProvider, name: string): void` method in `src/providers/index.ts`
- [ ] T023 Implement `get(name: string): LLMProvider | undefined` method in `src/providers/index.ts`
- [ ] T024 Implement `list(): string[]` method in `src/providers/index.ts`
- [ ] T025 Implement `getDefault(): LLMProvider | undefined` method in `src/providers/index.ts`
- [ ] T026 Implement `setDefault(name: string): void` method in `src/providers/index.ts`
- [ ] T027 Implement `getByModel(modelId: string): LLMProvider | undefined` method in `src/providers/index.ts`

### TypeScript Validation

- [ ] T028 Run TypeScript compiler with strict mode: `tsc --noEmit`
- [ ] T029 Fix any type errors in `src/providers/types.ts`
- [ ] T030 Fix any type errors in `src/providers/index.ts`
- [ ] T031 Verify zero TypeScript compilation errors
- [ ] T032 Verify zero TypeScript compilation warnings
- [ ] T033 Check for any `any` types and replace with explicit types

### Testing (Phase 1)

- [ ] T034 Create `src/providers/__tests__/types.test.ts` for type validation tests
- [ ] T035 Create `src/providers/__tests__/registry.test.ts` for ProviderRegistry unit tests
- [ ] T036 Write test for `ProviderRegistry.register()` in `src/providers/__tests__/registry.test.ts`
- [ ] T037 Write test for `ProviderRegistry.get()` in `src/providers/__tests__/registry.test.ts`
- [ ] T038 Write test for `ProviderRegistry.list()` in `src/providers/__tests__/registry.test.ts`
- [ ] T039 Write test for `ProviderRegistry.getDefault()` in `src/providers/__tests__/registry.test.ts`

---

## Phase 2: QwenProvider Extraction [US1]

**Goal:** Extract existing Qwen implementation into QwenProvider without breaking functionality.

**Independent Test Criteria:** All existing Qwen workflows work identically, QwenProvider implements LLMProvider interface, all existing tests pass.

**Story:** Existing User (Qwen Only) - User continues using Xyzulu without any changes.

### Codebase Analysis

- [ ] T040 Identify all files that call DashScope API (search for DashScope imports/usage)
- [ ] T041 Document current API call patterns (HTTP client vs SDK) in analysis notes
- [ ] T042 Document current response format and processing flow in analysis notes
- [ ] T043 Identify configuration access points (where API keys are read) in analysis notes
- [ ] T044 Document error handling patterns in existing code in analysis notes
- [ ] T045 Map call hierarchy from entry point to API calls in analysis notes

### QwenProvider Class Structure

- [ ] T046 Create `src/providers/qwen/QwenProvider.ts` file
- [ ] T047 Implement class declaration `class QwenProvider implements LLMProvider` in `src/providers/qwen/QwenProvider.ts`
- [ ] T048 Add private property `private config: ProviderConfig` in `src/providers/qwen/QwenProvider.ts`
- [ ] T049 Implement constructor `constructor(config: ProviderConfig)` in `src/providers/qwen/QwenProvider.ts`
- [ ] T050 Implement `getName(): string` method returning `"qwen"` in `src/providers/qwen/QwenProvider.ts`
- [ ] T051 Implement `isAvailable(): boolean` method in `src/providers/qwen/QwenProvider.ts`
- [ ] T052 Implement `getSupportedModels(): readonly string[]` method in `src/providers/qwen/QwenProvider.ts`
- [ ] T053 Implement `validateConfig(config: ProviderConfig): boolean` method in `src/providers/qwen/QwenProvider.ts`
- [ ] T054 Add private method `private authenticate(): Headers` for API key handling in `src/providers/qwen/QwenProvider.ts`
- [ ] T055 Add private method `private formatRequest(prompt: string, options: GenerationOptions): DashScopeRequest` in `src/providers/qwen/QwenProvider.ts`
- [ ] T056 Add private method `private parseResponse(response: DashScopeResponse): LLMResponse` in `src/providers/qwen/QwenProvider.ts`
- [ ] T057 Add private method `private handleError(error: unknown): LLMError` in `src/providers/qwen/QwenProvider.ts`

### Interface Method Implementation

- [ ] T058 Implement `sendMessage(prompt: string, options: GenerationOptions): Promise<LLMResponse>` in `src/providers/qwen/QwenProvider.ts`
- [ ] T059 Implement `streamResponse(prompt: string, options: GenerationOptions): AsyncIterable<LLMResponse>` in `src/providers/qwen/QwenProvider.ts`
- [ ] T060 Implement `generateCode(prompt: string, context: CodeContext): Promise<CodeGenerationResult>` in `src/providers/qwen/QwenProvider.ts`

### Code Extraction and Migration

- [ ] T061 Extract DashScope API call logic into `sendMessage()` method in `src/providers/qwen/QwenProvider.ts`
- [ ] T062 Extract DashScope streaming logic into `streamResponse()` method in `src/providers/qwen/QwenProvider.ts`
- [ ] T063 Extract code generation logic into `generateCode()` method in `src/providers/qwen/QwenProvider.ts`
- [ ] T064 Update imports in `src/providers/qwen/QwenProvider.ts` to use provider types from `src/providers/types.ts`
- [ ] T065 Ensure response format matches `LLMResponse` interface contract in `src/providers/qwen/QwenProvider.ts`
- [ ] T066 Map DashScope errors to normalized `LLMError` subclasses in `handleError()` method

### Configuration Integration

- [ ] T067 Update QwenProvider to read from `MultiProviderConfig` in `src/providers/qwen/QwenProvider.ts`
- [ ] T068 Add support for old single-key config format (backward compatibility) in `src/providers/qwen/QwenProvider.ts`
- [ ] T069 Add support for new multi-provider config format in `src/providers/qwen/QwenProvider.ts`
- [ ] T070 Implement Qwen API key format validation in `validateConfig()` method

### Testing (Phase 2)

- [ ] T071 Create `src/providers/qwen/__tests__/QwenProvider.test.ts` file
- [ ] T072 Write unit test for `QwenProvider.getName()` in `src/providers/qwen/__tests__/QwenProvider.test.ts`
- [ ] T073 Write unit test for `QwenProvider.isAvailable()` in `src/providers/qwen/__tests__/QwenProvider.test.ts`
- [ ] T074 Write unit test for `QwenProvider.validateConfig()` in `src/providers/qwen/__tests__/QwenProvider.test.ts`
- [ ] T075 Write unit test for `QwenProvider.sendMessage()` with mocked DashScope API in `src/providers/qwen/__tests__/QwenProvider.test.ts`
- [ ] T076 Write unit test for `QwenProvider.streamResponse()` with mocked DashScope API in `src/providers/qwen/__tests__/QwenProvider.test.ts`
- [ ] T077 Write unit test for `QwenProvider.generateCode()` with mocked DashScope API in `src/providers/qwen/__tests__/QwenProvider.test.ts`
- [ ] T078 Write unit test for error handling and normalization in `src/providers/qwen/__tests__/QwenProvider.test.ts`
- [ ] T079 Write integration test for end-to-end Qwen workflow in `src/providers/qwen/__tests__/QwenProvider.integration.test.ts`

### Regression Verification

- [ ] T080 Run all existing tests to verify no breaking changes
- [ ] T081 Manual test: Verify existing Qwen workflows still work (run actual commands)
- [ ] T082 Verify diff view still functions correctly with QwenProvider
- [ ] T083 Verify UI components receive data in expected format from QwenProvider
- [ ] T084 Check that response format matches what UI/diff view expects

### Export QwenProvider

- [ ] T085 Export `QwenProvider` from `src/providers/qwen/QwenProvider.ts`
- [ ] T086 Add `QwenProvider` export to `src/providers/index.ts`

---

## Phase 3: Wiring & Multi-Provider Support [US2]

**Goal:** Replace direct Qwen calls with provider abstraction and enable multi-provider selection.

**Independent Test Criteria:** Users can switch providers via CLI flags, configuration supports multiple keys, all existing workflows work, provider selection logic works correctly.

**Story:** Multi-Provider User - User can switch between providers for different tasks.

### Configuration System Extension

- [ ] T087 Locate existing `ConfigManager` class (likely in `src/config/ConfigManager.ts` or similar)
- [ ] T088 Add `getProviderKey(provider: string): string | undefined` method to `ConfigManager`
- [ ] T089 Add `setProviderKey(provider: string, key: string): void` method to `ConfigManager`
- [ ] T090 Add `getDefaultProvider(): string | undefined` method to `ConfigManager`
- [ ] T091 Add `setDefaultProvider(provider: string): void` method to `ConfigManager`
- [ ] T092 Add `getProviderConfig(provider: string): ProviderConfig | undefined` method to `ConfigManager`
- [ ] T093 Add `setProviderConfig(provider: string, config: ProviderConfig): void` method to `ConfigManager`
- [ ] T094 Implement backward compatibility: auto-migrate old single-key config to new format in `ConfigManager`
- [ ] T095 Update config file format to support `MultiProviderConfig` structure
- [ ] T096 Add validation for provider key format per provider type in `ConfigManager`

### CLI Argument Parsing

- [ ] T097 Locate CLI argument parser (likely in `src/cli.ts` or `src/index.ts`)
- [ ] T098 Add `--model` flag support to CLI parser (e.g., `--model gpt-4o`)
- [ ] T099 Add `--provider` flag support to CLI parser (e.g., `--provider openai`)
- [ ] T100 Implement model identifier parsing to determine provider in CLI parser
- [ ] T101 Add validation for provider/model combination in CLI parser
- [ ] T102 Add error handling for missing provider/key in CLI parser
- [ ] T103 Update CLI help text to document new `--model` and `--provider` flags

### Provider Factory/Resolver

- [ ] T104 Create `src/providers/resolver.ts` file for provider resolution logic
- [ ] T105 Implement `resolveProvider(modelOrProvider?: string, config?: MultiProviderConfig): LLMProvider` function in `src/providers/resolver.ts`
- [ ] T106 Implement provider resolution priority: CLI flag > config default > Qwen fallback in `src/providers/resolver.ts`
- [ ] T107 Add API key validation check in provider resolver
- [ ] T108 Add provider instantiation logic in provider resolver
- [ ] T109 Add error handling for missing provider/key in provider resolver

### Application Entry Point Updates

- [ ] T110 Locate main application entry point (likely `src/index.ts` or `src/cli.ts`)
- [ ] T111 Replace direct Qwen API calls with `LLMProvider` interface calls in entry point
- [ ] T112 Use `ProviderRegistry` to get provider instance in entry point
- [ ] T113 Pass `LLMProvider` instance to components that need LLM access
- [ ] T114 Ensure UI/diff view components receive data in same format (no changes to UI layer)

### LLM Call Site Updates

- [ ] T115 Find all places that call Qwen API directly (search codebase for DashScope/Qwen calls)
- [ ] T116 Replace first Qwen API call site with `provider.sendMessage()` call
- [ ] T117 Replace second Qwen API call site with `provider.sendMessage()` or `provider.generateCode()` call
- [ ] T118 Replace all remaining Qwen API call sites with provider interface calls
- [ ] T119 Update streaming calls to use `provider.streamResponse()` instead of direct API calls
- [ ] T120 Update error handling to use normalized `LLMError` types instead of provider-specific errors

### Provider Registration

- [ ] T121 Register `QwenProvider` in `ProviderRegistry` at application startup
- [ ] T122 Set Qwen as default provider if Qwen key is configured in startup logic
- [ ] T123 Ensure QwenProvider is available for selection via registry

### Testing (Phase 3)

- [ ] T124 Create `src/config/__tests__/ConfigManager.test.ts` for multi-provider config tests
- [ ] T125 Write test for `ConfigManager.getProviderKey()` in `src/config/__tests__/ConfigManager.test.ts`
- [ ] T126 Write test for `ConfigManager.setProviderKey()` in `src/config/__tests__/ConfigManager.test.ts`
- [ ] T127 Write test for `ConfigManager.getDefaultProvider()` in `src/config/__tests__/ConfigManager.test.ts`
- [ ] T128 Write test for config backward compatibility migration in `src/config/__tests__/ConfigManager.test.ts`
- [ ] T129 Create `src/providers/__tests__/resolver.test.ts` for provider resolution tests
- [ ] T130 Write test for provider resolution with CLI flag in `src/providers/__tests__/resolver.test.ts`
- [ ] T131 Write test for provider resolution with config default in `src/providers/__tests__/resolver.test.ts`
- [ ] T132 Write test for provider resolution fallback to Qwen in `src/providers/__tests__/resolver.test.ts`
- [ ] T133 Write integration test for provider switching via CLI flags
- [ ] T134 Write integration test for default provider from config
- [ ] T135 Write integration test for error when provider/key missing

### Regression Testing (Phase 3)

- [ ] T136 Run all existing tests to verify no breaking changes
- [ ] T137 Manual test: Verify existing Qwen workflows still work after wiring
- [ ] T138 Manual test: Test provider switching via CLI flag `--model qwen-turbo`
- [ ] T139 Verify diff view still functions correctly with provider abstraction
- [ ] T140 Verify UI components function identically regardless of provider

---

## Phase 4: Provider Skeletons [US3]

**Goal:** Create skeleton adapters for OpenAI and Anthropic to prove extensibility.

**Independent Test Criteria:** Skeleton providers implement LLMProvider interface, can be registered and selected, configuration accepts their keys, TypeScript compiles without errors.

**Story:** New User (OpenAI) - New user can configure and use OpenAI as LLM provider (even if skeleton).

### OpenAIProvider Skeleton

- [ ] T141 Create `src/providers/openai/OpenAIProvider.ts` file
- [ ] T142 Implement class declaration `class OpenAIProvider implements LLMProvider` in `src/providers/openai/OpenAIProvider.ts`
- [ ] T143 Add private property `private config: ProviderConfig` in `src/providers/openai/OpenAIProvider.ts`
- [ ] T144 Implement constructor `constructor(config: ProviderConfig)` in `src/providers/openai/OpenAIProvider.ts`
- [ ] T145 Implement `getName(): string` method returning `"openai"` in `src/providers/openai/OpenAIProvider.ts`
- [ ] T146 Implement `isAvailable(): boolean` method in `src/providers/openai/OpenAIProvider.ts`
- [ ] T147 Implement `getSupportedModels(): readonly string[]` returning OpenAI models in `src/providers/openai/OpenAIProvider.ts`
- [ ] T148 Implement `validateConfig(config: ProviderConfig): boolean` for OpenAI API key format in `src/providers/openai/OpenAIProvider.ts`
- [ ] T149 Implement `sendMessage()` method stub returning appropriate `Promise<LLMResponse>` type in `src/providers/openai/OpenAIProvider.ts`
- [ ] T150 Implement `streamResponse()` method stub returning appropriate `AsyncIterable<LLMResponse>` type in `src/providers/openai/OpenAIProvider.ts`
- [ ] T151 Implement `generateCode()` method stub returning appropriate `Promise<CodeGenerationResult>` type in `src/providers/openai/OpenAIProvider.ts`
- [ ] T152 Add TODO comments for full implementation in `src/providers/openai/OpenAIProvider.ts`
- [ ] T153 Verify OpenAIProvider can be instantiated without errors

### AnthropicProvider Skeleton

- [ ] T154 Create `src/providers/anthropic/AnthropicProvider.ts` file
- [ ] T155 Implement class declaration `class AnthropicProvider implements LLMProvider` in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T156 Add private property `private config: ProviderConfig` in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T157 Implement constructor `constructor(config: ProviderConfig)` in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T158 Implement `getName(): string` method returning `"anthropic"` in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T159 Implement `isAvailable(): boolean` method in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T160 Implement `getSupportedModels(): readonly string[]` returning Anthropic models in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T161 Implement `validateConfig(config: ProviderConfig): boolean` for Anthropic API key format in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T162 Implement `sendMessage()` method stub returning appropriate `Promise<LLMResponse>` type in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T163 Implement `streamResponse()` method stub returning appropriate `AsyncIterable<LLMResponse>` type in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T164 Implement `generateCode()` method stub returning appropriate `Promise<CodeGenerationResult>` type in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T165 Add TODO comments for full implementation in `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T166 Verify AnthropicProvider can be instantiated without errors

### Provider Registration

- [ ] T167 Register `OpenAIProvider` in `ProviderRegistry` at application startup
- [ ] T168 Register `AnthropicProvider` in `ProviderRegistry` at application startup
- [ ] T169 Test provider listing includes new providers (verify `ProviderRegistry.list()` includes "openai" and "anthropic")
- [ ] T170 Test provider selection can target new providers (verify `ProviderRegistry.get("openai")` works)

### Configuration Testing

- [ ] T171 Test storing OpenAI API key via `ConfigManager.setProviderKey("openai", "sk-...")`
- [ ] T172 Test storing Anthropic API key via `ConfigManager.setProviderKey("anthropic", "sk-ant-...")`
- [ ] T173 Test key validation for OpenAI provider format
- [ ] T174 Test key validation for Anthropic provider format
- [ ] T175 Verify keys are stored independently (setting OpenAI key doesn't affect Anthropic key)

### Testing (Phase 4)

- [ ] T176 Create `src/providers/openai/__tests__/OpenAIProvider.test.ts` file
- [ ] T177 Write test verifying OpenAIProvider implements LLMProvider interface in `src/providers/openai/__tests__/OpenAIProvider.test.ts`
- [ ] T178 Write test for `OpenAIProvider.getName()` in `src/providers/openai/__tests__/OpenAIProvider.test.ts`
- [ ] T179 Write test for `OpenAIProvider.validateConfig()` in `src/providers/openai/__tests__/OpenAIProvider.test.ts`
- [ ] T180 Create `src/providers/anthropic/__tests__/AnthropicProvider.test.ts` file
- [ ] T181 Write test verifying AnthropicProvider implements LLMProvider interface in `src/providers/anthropic/__tests__/AnthropicProvider.test.ts`
- [ ] T182 Write test for `AnthropicProvider.getName()` in `src/providers/anthropic/__tests__/AnthropicProvider.test.ts`
- [ ] T183 Write test for `AnthropicProvider.validateConfig()` in `src/providers/anthropic/__tests__/AnthropicProvider.test.ts`
- [ ] T184 Write integration test verifying skeleton providers can be selected (even if not functional)

### Documentation

- [ ] T185 Create `docs/providers/adding-a-provider.md` documentation file
- [ ] T186 Document how to add a new provider (pattern from skeletons) in `docs/providers/adding-a-provider.md`
- [ ] T187 Add code comments explaining what needs to be implemented in skeleton providers
- [ ] T188 Create example showing provider registration pattern in documentation

### Export New Providers

- [ ] T189 Export `OpenAIProvider` from `src/providers/openai/OpenAIProvider.ts`
- [ ] T190 Export `AnthropicProvider` from `src/providers/anthropic/AnthropicProvider.ts`
- [ ] T191 Add `OpenAIProvider` export to `src/providers/index.ts`
- [ ] T192 Add `AnthropicProvider` export to `src/providers/index.ts`

---

## Final Phase: Regression Testing & Polish

**Goal:** Ensure zero regression, all tests pass, documentation complete.

**Independent Test Criteria:** All existing Qwen workflows work identically, TypeScript compiles with zero errors/warnings, all tests pass, diff view and UI function correctly.

### Comprehensive Regression Testing

- [ ] T193 Run full test suite: `npm test` or equivalent
- [ ] T194 Verify all existing Qwen tests pass without modification
- [ ] T195 Manual test: Run existing Qwen workflow end-to-end (full user scenario)
- [ ] T196 Manual test: Verify diff view displays correctly for QwenProvider responses
- [ ] T197 Manual test: Verify UI components render correctly with provider abstraction
- [ ] T198 Manual test: Test provider switching: `xyzulu --model qwen-turbo generate "test"`
- [ ] T199 Manual test: Test default provider from config works correctly
- [ ] T200 Manual test: Test error handling when provider/key missing

### TypeScript Validation

- [ ] T201 Run TypeScript compiler: `tsc --noEmit --strict`
- [ ] T202 Verify zero TypeScript compilation errors
- [ ] T203 Verify zero TypeScript compilation warnings
- [ ] T204 Check for any remaining `any` types and document justification if needed
- [ ] T205 Verify all interfaces are properly exported and accessible

### Code Quality

- [ ] T206 Run linter: `npm run lint` or equivalent
- [ ] T207 Fix any linting errors
- [ ] T208 Verify code follows project style guidelines
- [ ] T209 Review error messages for clarity and actionability
- [ ] T210 Verify all TODO comments are documented with context

### Documentation Review

- [ ] T211 Verify README.md is updated if needed
- [ ] T212 Verify all code has appropriate JSDoc comments
- [ ] T213 Verify provider registration documentation is complete
- [ ] T214 Verify configuration documentation includes multi-provider examples

### Final Verification

- [ ] T215 Verify backward compatibility: existing Qwen-only users see no changes
- [ ] T216 Verify new functionality: users can configure multiple providers
- [ ] T217 Verify provider selection: CLI flags work correctly
- [ ] T218 Verify error handling: clear messages for missing providers/keys
- [ ] T219 Create summary of changes for release notes

---

## Task Summary

**Total Tasks:** 219

**Tasks by Phase:**
- Phase 1 (Setup & Foundation): 39 tasks
- Phase 2 (QwenProvider Extraction): 47 tasks
- Phase 3 (Wiring & Multi-Provider): 54 tasks
- Phase 4 (Provider Skeletons): 52 tasks
- Final Phase (Regression & Polish): 27 tasks

**Parallel Opportunities:**
- Phase 1: T002-T004 (directory creation), T007-T020 (type definitions)
- Phase 2: T040-T045 (analysis tasks can be done in parallel)
- Phase 3: T087-T096 (config extension), T097-T103 (CLI parsing)
- Phase 4: T141-T153 (OpenAIProvider), T154-T166 (AnthropicProvider) can be done in parallel

**Suggested MVP Scope:**
- Complete Phase 1 (Definition) - 39 tasks
- Complete Phase 2 (QwenProvider Extraction) - 47 tasks
- **Total MVP: 86 tasks**

This MVP enables the core refactor while maintaining 100% backward compatibility with existing Qwen workflows.

