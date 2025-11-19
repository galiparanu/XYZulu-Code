<!--
Sync Impact Report:
- Version: 0.1.0 (initial)
- Principles: 5 core principles defined
  - Principle 1: Multi-Provider Architecture
  - Principle 2: TypeScript Strict Mode
  - Principle 3: Agentic Workflow Preservation
  - Principle 4: Safety Through Diff View
  - Principle 5: Spec-Driven Development
- Added sections: Project Overview, Core Principles, Technical Architecture, Governance, Compliance Checklist
- Templates requiring updates: ✅ updated
  - ✅ .specify/templates/plan-template.md (includes constitution check)
  - ✅ .specify/templates/spec-template.md (includes constitution compliance section)
  - ✅ .specify/templates/tasks-template.md (includes constitution alignment)
  - ✅ .specify/templates/commands/speckit.constitution.md (command template)
- Follow-up TODOs: None
-->

# Xyzulu Project Constitution

**Version:** 0.1.0  
**Ratification Date:** 2024-12-19  
**Last Amended:** 2024-12-19

---

## Project Overview

**Project Name:** Xyzulu  
**Foundation:** Based on `QwenLM/qwen-code` (TypeScript/Node.js CLI)  
**Purpose:** Multi-Provider Agentic CLI for autonomous coding assistance

Xyzulu is a rebranded and refactored version of the Qwen Code CLI, transformed into a multi-provider agentic coding assistant. The system must support multiple LLM providers (OpenAI, Anthropic, Gemini, Ollama) while maintaining an agentic, autonomous workflow similar to Cursor or Claude Code.

---

## Core Principles

### Principle 1: Multi-Provider Architecture

**MUST** implement an Adapter Pattern for the LLM layer to abstract provider-specific logic. The system MUST support at least four providers: OpenAI, Anthropic (Claude), Google Gemini, and Ollama. Users MUST be able to configure and switch between providers via API keys or configuration files without code changes.

**Rationale:** The original Qwen Code was hardcoded to a single provider. To achieve true flexibility and avoid vendor lock-in, the architecture must be provider-agnostic at the core, with provider-specific implementations isolated behind adapters.

---

### Principle 2: TypeScript Strict Mode

**MUST** use TypeScript with strict mode enabled. All code MUST pass TypeScript compilation with zero errors and zero warnings. Type definitions MUST be explicit and avoid `any` types except where absolutely necessary (with explicit justification).

**Rationale:** Type safety is critical for maintaining code quality in a complex agentic system. Strict mode prevents common errors and ensures better IDE support and refactoring safety.

---

### Principle 3: Agentic Workflow Preservation

**MUST** maintain an agentic (autonomous) coding assistance workflow. The CLI MUST be capable of understanding context, making decisions, and executing coding tasks autonomously, similar to Cursor or Claude Code experiences.

**Rationale:** The core value proposition is autonomous assistance. Users expect the system to work independently with minimal intervention, understanding project context and making intelligent decisions.

---

### Principle 4: Safety Through Diff View

**MUST** display a diff view before applying any code changes. Users MUST have the opportunity to review proposed changes before they are written to disk. The diff view MUST be clear, readable, and show the full context of changes.

**Rationale:** Autonomous systems can make mistakes. A mandatory review step prevents accidental data loss or incorrect modifications, maintaining user trust and control.

---

### Principle 5: Spec-Driven Development

**MUST** follow Spec-Driven Development workflow. No code implementation MAY be written without a corresponding specification file in `specs/*.md` first. Specifications MUST define:

- Feature scope and requirements
- Technical approach
- API contracts (if applicable)
- Testing strategy
- Success criteria

**Rationale:** Documentation-first development ensures clarity, reduces rework, and maintains alignment between implementation and requirements. It also serves as living documentation for the project.

---

## Technical Architecture

### Adapter Pattern Implementation

The LLM provider layer MUST be structured as follows:

```
LLMProvider (interface)
├── OpenAIAdapter
├── AnthropicAdapter
├── GeminiAdapter
└── OllamaAdapter
```

Each adapter MUST implement a common interface that includes:

- `generate(prompt: string, options: GenerationOptions): Promise<Response>`
- `stream(prompt: string, options: GenerationOptions): AsyncIterable<Response>`
- `validateConfig(config: ProviderConfig): boolean`

Provider-specific authentication, API endpoints, and response parsing MUST be encapsulated within each adapter.

---

## Governance

### Amendment Procedure

1. Proposed changes MUST be documented in a pull request or issue
2. Changes affecting core principles require consensus from maintainers
3. Version MUST be incremented according to semantic versioning:
   - **MAJOR:** Backward incompatible changes, principle removals, or fundamental architecture changes
   - **MINOR:** New principles, new features, or significant expansions
   - **PATCH:** Clarifications, typo fixes, or non-semantic refinements
4. Constitution updates MUST include a Sync Impact Report in HTML comments
5. Dependent templates and documentation MUST be updated to reflect changes

### Compliance Review

- All code contributions MUST be reviewed against this constitution
- Violations of MUST-level principles are blocking issues
- SHOULD-level guidance should be followed unless explicitly justified
- Regular audits should ensure ongoing compliance

### Version History

- **0.1.0** (2024-12-19): Initial constitution ratification

---

## Compliance Checklist

Before any code contribution:

- [ ] Does it follow the Adapter Pattern for LLM providers?
- [ ] Is it written in TypeScript with strict mode?
- [ ] Does it maintain the agentic workflow?
- [ ] Does it include diff view for code changes?
- [ ] Is there a corresponding spec in `specs/*.md`?
- [ ] Does it pass TypeScript compilation with zero errors/warnings?

---

_This constitution is a living document. All team members and contributors are expected to understand and adhere to these principles._
