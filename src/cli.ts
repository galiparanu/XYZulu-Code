/**
 * CLI Argument Parser
 * 
 * Handles command-line arguments including provider/model selection flags.
 */

export interface CLIOptions {
  model?: string;
  provider?: string;
  command?: string;
  args: string[];
  help?: boolean;
}

/**
 * Parse command-line arguments
 */
export function parseArgs(argv?: string[]): CLIOptions {
  // Get args from parameter or process.argv (Node.js environment)
  let args: string[];
  if (argv) {
    args = argv;
  } else {
    // In Node.js, process.argv is available
    // For TypeScript strict mode, we'll require argv to be passed
    // or use a type declaration file for Node.js types
    args = [];
  }

  const options: CLIOptions = {
    args: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--model':
      case '-m':
        if (i + 1 < args.length) {
          options.model = args[++i];
        } else {
          throw new Error('--model requires a value (e.g., --model gpt-4o)');
        }
        break;

      case '--provider':
      case '-p':
        if (i + 1 < args.length) {
          options.provider = args[++i];
        } else {
          throw new Error('--provider requires a value (e.g., --provider openai)');
        }
        break;

      case '--help':
      case '-h':
        options.help = true;
        break;

      default:
        if (arg.startsWith('--')) {
          throw new Error(`Unknown option: ${arg}. Use --help for usage information.`);
        }
        // First non-flag argument is the command
        if (!options.command) {
          options.command = arg;
        } else {
          options.args.push(arg);
        }
        break;
    }
  }

  return options;
}

/**
 * Validate provider/model combination
 */
export function validateProviderModel(
  model?: string,
  provider?: string
): { valid: boolean; error?: string } {
  if (model && provider) {
    // Both specified - validate they match
    const modelToProvider: Record<string, string> = {
      'qwen-turbo': 'qwen',
      'qwen-plus': 'qwen',
      'qwen-max': 'qwen',
      'gpt-4o': 'openai',
      'gpt-4-turbo': 'openai',
      'gpt-4': 'openai',
      'claude-3-opus': 'anthropic',
      'claude-3-sonnet': 'anthropic',
    };

    const expectedProvider = modelToProvider[model.toLowerCase()];
    if (expectedProvider && expectedProvider !== provider.toLowerCase()) {
      return {
        valid: false,
        error: `Model "${model}" belongs to provider "${expectedProvider}", not "${provider}"`,
      };
    }
  }

  return { valid: true };
}

/**
 * Get CLI help text
 */
export function getHelpText(): string {
  return `
Xyzulu - Multi-Provider Agentic CLI

Usage:
  xyzulu [options] <command> [args...]

Options:
  --model, -m <model>      Specify model to use (e.g., gpt-4o, qwen-turbo, claude-3-opus)
  --provider, -p <name>    Specify provider to use (e.g., openai, qwen, anthropic)
  --help, -h               Show this help message

Examples:
  xyzulu generate "Create a function"
  xyzulu --model gpt-4o generate "Create a function"
  xyzulu --provider openai generate "Create a function"
  xyzulu --model qwen-turbo generate "Create a function"

Configuration:
  Set API keys: xyzulu config set <provider>.apiKey <key>
  Set default: xyzulu config set defaultProvider <provider>
`;
}

