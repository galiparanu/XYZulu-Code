/**
 * Application Entry Point
 * 
 * Main entry point for Xyzulu CLI. Initializes providers, handles CLI arguments,
 * and coordinates the agentic workflow.
 */

import { parseArgs, getHelpText, validateProviderModel } from './cli';
import { resolveProvider, registerConfiguredProviders } from './providers/resolver';
import type { LLMProvider } from './providers/types';
import { configManager } from './config/ConfigManager';

/**
 * Main application function
 */
async function main(): Promise<void> {
  try {
    // Parse CLI arguments
    // Get process.argv in Node.js environment
    const nodeArgs = typeof process !== 'undefined' ? process.argv.slice(2) : [];
    const options = parseArgs(nodeArgs);

    // Show help if requested
    if (options.help) {
      console.log(getHelpText());
      process.exit(0);
    }

    // Validate provider/model combination
    const validation = validateProviderModel(options.model, options.provider);
    if (!validation.valid) {
      console.error(`Error: ${validation.error}`);
      process.exit(1);
    }

    // Register configured providers at startup
    registerConfiguredProviders();

    // Resolve provider (CLI flag > config default > Qwen fallback)
    const modelOrProvider = options.model || options.provider;
    const provider = resolveProvider(modelOrProvider);

    // Execute command with provider
    if (options.command) {
      await executeCommand(options.command, options.args, provider);
    } else {
      console.error('Error: No command specified. Use --help for usage information.');
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    } else {
      console.error('Unknown error occurred');
      process.exit(1);
    }
  }
}

/**
 * Execute a command with the resolved provider
 */
async function executeCommand(
  command: string,
  args: string[],
  provider: LLMProvider
): Promise<void> {
  switch (command) {
    case 'generate':
    case 'gen':
      await handleGenerateCommand(args, provider);
      break;

    case 'config':
      await handleConfigCommand(args);
      break;

    default:
      console.error(`Unknown command: ${command}. Use --help for usage information.`);
      process.exit(1);
  }
}

/**
 * Handle generate command
 */
async function handleGenerateCommand(
  args: string[],
  provider: LLMProvider
): Promise<void> {
  if (args.length === 0) {
    console.error('Error: generate command requires a prompt');
    process.exit(1);
  }

  const prompt = args.join(' ');

  try {
    console.log(`Using provider: ${provider.getName()}`);
    console.log(`Generating response for: "${prompt}"\n`);

    const response = await provider.sendMessage(prompt, {
      model: configManager.getDefaultModel(),
    });

    console.log(response.content);

    if (response.tokensUsed) {
      console.log(
        `\nTokens used: ${response.tokensUsed.total} (prompt: ${response.tokensUsed.prompt}, completion: ${response.tokensUsed.completion})`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error generating response: ${error.message}`);
      process.exit(1);
    } else {
      console.error('Unknown error during generation');
      process.exit(1);
    }
  }
}

/**
 * Handle config command
 */
async function handleConfigCommand(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('Error: config command requires arguments');
    console.log('Usage: xyzulu config <get|set> <key> [value]');
    process.exit(1);
  }

  const subcommand = args[0];

  switch (subcommand) {
    case 'get':
      if (args.length < 2) {
        console.error('Error: config get requires a key');
        process.exit(1);
      }
      handleConfigGet(args[1]);
      break;

    case 'set':
      if (args.length < 3) {
        console.error('Error: config set requires a key and value');
        process.exit(1);
      }
      handleConfigSet(args[1], args.slice(2).join(' '));
      break;

    default:
      console.error(`Unknown config subcommand: ${subcommand}`);
      console.log('Usage: xyzulu config <get|set> <key> [value]');
      process.exit(1);
  }
}

/**
 * Handle config get
 */
function handleConfigGet(key: string): void {
  if (key.includes('.')) {
    const [provider, subkey] = key.split('.', 2);
    if (subkey === 'apiKey') {
      const apiKey = configManager.getProviderKey(provider);
      if (apiKey) {
        // Mask API key for security
        const masked = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
        console.log(masked);
      } else {
        console.log('(not set)');
      }
    } else {
      console.error(`Unknown config key: ${key}`);
      process.exit(1);
    }
  } else {
    switch (key) {
      case 'defaultProvider':
        console.log(configManager.getDefaultProvider() || '(not set)');
        break;

      case 'defaultModel':
        console.log(configManager.getDefaultModel() || '(not set)');
        break;

      default:
        console.error(`Unknown config key: ${key}`);
        process.exit(1);
    }
  }
}

/**
 * Handle config set
 */
function handleConfigSet(key: string, value: string): void {
  if (key.includes('.')) {
    const [provider, subkey] = key.split('.', 2);
    if (subkey === 'apiKey') {
      // Validate key format
      if (!configManager.validateProviderKey(provider, value)) {
        console.error(`Invalid API key format for provider "${provider}"`);
        process.exit(1);
      }
      configManager.setProviderKey(provider, value);
      console.log(`Set ${provider}.apiKey`);
    } else {
      console.error(`Unknown config key: ${key}`);
      process.exit(1);
    }
  } else {
    switch (key) {
      case 'defaultProvider':
        try {
          configManager.setDefaultProvider(value);
          console.log(`Set defaultProvider to ${value}`);
        } catch (error) {
          if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
          }
        }
        break;

      case 'defaultModel':
        configManager.setDefaultModel(value);
        console.log(`Set defaultModel to ${value}`);
        break;

      default:
        console.error(`Unknown config key: ${key}`);
        process.exit(1);
    }
  }
}

// Export main for programmatic use
export { main };

// Run main if this is the entry point (when executed directly)
// Note: In TypeScript/Node.js, this check works at runtime
if (typeof require !== 'undefined' && require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  });
}

