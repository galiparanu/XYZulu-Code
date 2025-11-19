# Quick Start Guide: Multi-Provider Architecture

**Feature:** Multi-Provider Architecture Refactor  
**Created:** 2024-12-19

## Overview

This guide provides quick test scenarios to verify the multi-provider architecture refactor is working correctly after each implementation phase.

## Prerequisites

- Xyzulu CLI installed
- At least one provider API key configured
- TypeScript compilation successful
- All tests passing

---

## Phase 1 Verification: Interface Definition

**Goal:** Verify interfaces and types are correctly defined.

### Test 1: TypeScript Compilation
```bash
# Should compile with zero errors and warnings
npm run build
# or
tsc --noEmit
```

**Expected:** ✅ Compilation succeeds with no errors

### Test 2: Interface Exports
```typescript
// Test file: test-interfaces.ts
import { LLMProvider, GenerationOptions, LLMResponse } from './src/providers/types';

// Should compile without errors
const options: GenerationOptions = {
  model: 'test-model',
  temperature: 0.7
};

console.log('Interfaces loaded successfully');
```

**Expected:** ✅ TypeScript accepts the types, no compilation errors

---

## Phase 2 Verification: QwenProvider Extraction

**Goal:** Verify QwenProvider works identically to original implementation.

### Test 1: QwenProvider Instantiation
```bash
# Should create QwenProvider without errors
node -e "
const { QwenProvider } = require('./dist/providers/qwen/QwenProvider');
const provider = new QwenProvider({ apiKey: 'test-key' });
console.log('Provider name:', provider.getName());
"
```

**Expected:** ✅ Provider instantiates, returns name "qwen"

### Test 2: Existing Qwen Workflow
```bash
# Run existing Qwen command (should work identically)
xyzulu generate "Create a hello world function"
```

**Expected:** ✅ Works exactly as before, generates code, shows diff view

### Test 3: QwenProvider Interface Compliance
```typescript
// Test that QwenProvider implements all interface methods
import { QwenProvider } from './src/providers/qwen/QwenProvider';
import { LLMProvider } from './src/providers/types';

const provider: LLMProvider = new QwenProvider({ apiKey: 'test' });
// Should compile - QwenProvider is assignable to LLMProvider
```

**Expected:** ✅ TypeScript accepts assignment, no type errors

---

## Phase 3 Verification: Provider Abstraction & Selection

**Goal:** Verify application uses abstraction and provider switching works.

### Test 1: Configuration - Multiple Provider Keys
```bash
# Configure multiple providers
xyzulu config set qwen.apiKey "sk-qwen-..."
xyzulu config set openai.apiKey "sk-openai-..."
xyzulu config set anthropic.apiKey "sk-ant-..."

# Verify keys are stored
xyzulu config get qwen.apiKey
xyzulu config get openai.apiKey
```

**Expected:** ✅ All keys stored independently, can be retrieved

### Test 2: Default Provider Selection
```bash
# Set default provider
xyzulu config set defaultProvider "qwen"

# Run command without flags (should use default)
xyzulu generate "Create a function"
```

**Expected:** ✅ Uses Qwen provider (default)

### Test 3: CLI Flag Override
```bash
# Override default with CLI flag
xyzulu --model gpt-4o generate "Create a function"
```

**Expected:** ✅ Uses OpenAI provider (if configured), even if default is Qwen

### Test 4: Provider Switching
```bash
# Switch between providers in same session
xyzulu --model qwen-turbo generate "Task 1"
xyzulu --model gpt-4o generate "Task 2"
xyzulu --model claude-3-opus generate "Task 3"
```

**Expected:** ✅ Each command uses specified provider

### Test 5: Error Handling - Missing Key
```bash
# Try to use provider without configured key
xyzulu --model gpt-4o generate "Test"
# (assuming OpenAI key not configured)
```

**Expected:** ✅ Clear error message: "OpenAI API key not configured. Please set it with: xyzulu config set openai.apiKey <key>"

### Test 6: Backward Compatibility
```bash
# Existing Qwen-only user workflow
xyzulu generate "Create a function"
# (no flags, Qwen key configured)
```

**Expected:** ✅ Works exactly as before, no changes to user experience

---

## Phase 4 Verification: Provider Skeletons

**Goal:** Verify skeleton providers are selectable and follow the pattern.

### Test 1: Provider Registration
```bash
# List available providers
xyzulu providers list
```

**Expected:** ✅ Shows: qwen, openai, anthropic

### Test 2: Skeleton Provider Selection
```bash
# Select skeleton provider (should not error, even if not fully functional)
xyzulu --model gpt-4o generate "Test"
```

**Expected:** ✅ Provider is selected (may show "not fully implemented" message if skeleton)

### Test 3: Skeleton Provider Configuration
```bash
# Configure skeleton provider key
xyzulu config set openai.apiKey "sk-test-..."
xyzulu config get openai.apiKey
```

**Expected:** ✅ Key stored and retrieved successfully

### Test 4: Provider Interface Compliance
```typescript
// Test skeleton providers implement interface
import { OpenAIProvider } from './src/providers/openai/OpenAIProvider';
import { AnthropicProvider } from './src/providers/anthropic/AnthropicProvider';
import { LLMProvider } from './src/providers/types';

const openai: LLMProvider = new OpenAIProvider({ apiKey: 'test' });
const anthropic: LLMProvider = new AnthropicProvider({ apiKey: 'test' });
// Should compile
```

**Expected:** ✅ Both providers are assignable to LLMProvider interface

---

## End-to-End Test Scenarios

### Scenario 1: Existing User (No Changes)
```bash
# User with existing Qwen setup
xyzulu generate "Create a hello world function"
```

**Expected:** ✅ Works identically to before refactor

### Scenario 2: New User (OpenAI)
```bash
# New user configuring OpenAI
xyzulu config set openai.apiKey "sk-..."
xyzulu config set defaultProvider "openai"
xyzulu generate "Create a function"
```

**Expected:** ✅ Uses OpenAI provider seamlessly

### Scenario 3: Multi-Provider User
```bash
# User with multiple providers
xyzulu config set qwen.apiKey "sk-..."
xyzulu config set openai.apiKey "sk-..."
xyzulu config set anthropic.apiKey "sk-..."

# Switch between providers
xyzulu --model qwen-turbo generate "Task 1"
xyzulu --model gpt-4o generate "Task 2"
xyzulu --model claude-3-opus generate "Task 3"
```

**Expected:** ✅ Can switch between providers seamlessly

### Scenario 4: Error Recovery
```bash
# User tries invalid provider
xyzulu --model invalid-model generate "Test"
```

**Expected:** ✅ Clear error: "Unknown model 'invalid-model'. Available models: ..."

---

## Regression Tests

After each phase, verify these still work:

1. **Diff View:** Code changes are shown in diff view before applying
2. **UI Components:** All UI elements display correctly
3. **Agentic Workflow:** Autonomous coding assistance works
4. **Error Messages:** Errors are clear and actionable
5. **Performance:** No significant performance degradation

---

## Troubleshooting

### Issue: TypeScript compilation errors
**Check:**
- All interfaces properly exported
- No `any` types used
- Strict mode enabled in tsconfig.json

### Issue: Provider not found
**Check:**
- Provider registered in ProviderRegistry
- Provider class exported from providers/index.ts
- Provider name matches configuration

### Issue: Configuration not persisting
**Check:**
- Config file permissions
- Config file location
- Config format matches MultiProviderConfig type

### Issue: CLI flag not working
**Check:**
- Argument parser updated
- Flag name matches specification (`--model` or `--provider`)
- Flag parsing happens before provider selection

---

## Success Indicators

✅ All tests pass  
✅ TypeScript compiles with zero errors/warnings  
✅ Existing workflows work identically  
✅ Provider switching works via CLI flags  
✅ Configuration supports multiple providers  
✅ Error messages are clear and actionable  
✅ Diff view and UI components function correctly

