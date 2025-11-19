# Xyzulu - Multi-Provider Agentic CLI

**Version:** 0.1.0  
**Status:** Development

Xyzulu is a rebranded and refactored version of the Qwen Code CLI, transformed into a multi-provider agentic coding assistant. The system supports multiple LLM providers (Qwen, OpenAI, Anthropic) while maintaining an agentic, autonomous workflow similar to Cursor or Claude Code.

## Features

- **Multi-Provider Support**: Switch between Qwen, OpenAI, and Anthropic providers
- **TypeScript Strict Mode**: Full type safety with zero compilation errors
- **Agentic Workflow**: Autonomous coding assistance with context understanding
- **Diff View Safety**: Review proposed changes before applying
- **Spec-Driven Development**: All features follow strict specification process

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```bash
# Generate code with default provider
node dist/index.js generate "Create a hello world function"

# Use specific model
node dist/index.js --model qwen-turbo generate "Create a function"

# Use specific provider
node dist/index.js --provider openai generate "Create a function"
```

### Configuration

Set API keys for providers:

```bash
# Set Qwen API key
node dist/index.js config set qwen.apiKey <your-qwen-key>

# Set OpenAI API key
node dist/index.js config set openai.apiKey <your-openai-key>

# Set Anthropic API key
node dist/index.js config set anthropic.apiKey <your-anthropic-key>

# Set default provider
node dist/index.js config set defaultProvider qwen
```

### CLI Options

```
Options:
  --model, -m <model>      Specify model to use (e.g., gpt-4o, qwen-turbo, claude-3-opus)
  --provider, -p <name>     Specify provider to use (e.g., openai, qwen, anthropic)
  --help, -h               Show help message
```

## Architecture

Xyzulu uses an Adapter Pattern for multi-provider support:

```
Application Layer (UI, CLI, Agentic Logic)
    ↓
LLMProvider Interface (Abstraction)
    ↓
┌─────────────┬──────────────┬──────────────┐
│ QwenProvider│OpenAIProvider│AnthropicProvider│
└─────────────┴──────────────┴──────────────┘
```

### Supported Providers

- **Qwen** (MVP): Full implementation with DashScope API
- **OpenAI** (MVP): Skeleton implementation, ready for API integration
- **Anthropic** (MVP): Skeleton implementation, ready for API integration
- **Gemini** (Future): Planned enhancement
- **Ollama** (Future): Planned enhancement

## Development

### Project Structure

```
src/
├── providers/          # LLM provider adapters
│   ├── types.ts       # Core interfaces and types
│   ├── index.ts       # Provider registry
│   ├── resolver.ts    # Provider resolution logic
│   ├── qwen/          # Qwen provider implementation
│   ├── openai/        # OpenAI provider (skeleton)
│   └── anthropic/     # Anthropic provider (skeleton)
├── config/            # Configuration management
├── cli.ts             # CLI argument parsing
└── index.ts           # Application entry point
```

### Building

```bash
npm run build
```

### Running

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Configuration

Configuration is stored in `~/.xyzulu/config.json`:

```json
{
  "providers": {
    "qwen": {
      "apiKey": "sk-..."
    },
    "openai": {
      "apiKey": "sk-..."
    },
    "anthropic": {
      "apiKey": "sk-ant-..."
    }
  },
  "defaultProvider": "qwen",
  "defaultModel": "qwen-turbo"
}
```

## Adding a New Provider

See [docs/providers/adding-a-provider.md](docs/providers/adding-a-provider.md) for detailed instructions.

## Testing

```bash
# Run TypeScript compilation check
npm run build

# TypeScript strict mode validation
npx tsc --noEmit --strict
```

## Contributing

This project follows Spec-Driven Development. All features must have:
1. Specification in `specs/*.md`
2. Implementation plan
3. Task breakdown
4. Implementation following the spec

See `.specify/memory/constitution.md` for project principles and governance.

## License

MIT

## References

- **Constitution**: `.specify/memory/constitution.md`
- **Specifications**: `specs/001-multi-provider-refactor/`
- **Original Base**: `QwenLM/qwen-code`
