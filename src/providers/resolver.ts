/**
 * Provider Resolver
 * 
 * Resolves and instantiates LLM providers based on CLI flags, configuration,
 * or fallback logic. Handles provider selection priority and validation.
 */

import type { LLMProvider, MultiProviderConfig, ProviderConfig } from './types';
import { QwenProvider } from './qwen/QwenProvider';
import { OpenAIProvider } from './openai/OpenAIProvider';
import { AnthropicProvider } from './anthropic/AnthropicProvider';
import { providerRegistry } from './index';
import { AuthenticationError } from './types';
import { configManager } from '../config/ConfigManager';
import type { ConfigManager } from '../config/ConfigManager';

/**
 * Model to provider mapping
 * This maps model identifiers to their provider names
 */
const MODEL_TO_PROVIDER: Record<string, string> = {
  // Qwen models
  'qwen-turbo': 'qwen',
  'qwen-plus': 'qwen',
  'qwen-max': 'qwen',
  'qwen-max-longcontext': 'qwen',
  // OpenAI models
  'gpt-4o': 'openai',
  'gpt-4-turbo': 'openai',
  'gpt-4': 'openai',
  'gpt-3.5-turbo': 'openai',
  // Anthropic models
  'claude-3-opus': 'anthropic',
  'claude-3-sonnet': 'anthropic',
  'claude-3-haiku': 'anthropic',
  'claude-3-5-sonnet': 'anthropic',
};

/**
 * Resolve provider from model identifier or provider name
 */
function resolveProviderName(modelOrProvider?: string): string | undefined {
  if (!modelOrProvider) {
    return undefined;
  }

  // Check if it's a provider name directly
  if (providerRegistry.has(modelOrProvider)) {
    return modelOrProvider;
  }

  // Check if it's a model identifier
  const provider = MODEL_TO_PROVIDER[modelOrProvider.toLowerCase()];
  if (provider) {
    return provider;
  }

  return undefined;
}

/**
 * Create provider instance from configuration
 */
function createProviderInstance(
  providerName: string,
  config: ProviderConfig
): LLMProvider {
  switch (providerName.toLowerCase()) {
    case 'qwen':
      return new QwenProvider(config);

    case 'openai':
      return new OpenAIProvider(config);

    case 'anthropic':
      return new AnthropicProvider(config);

    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

/**
 * Resolve and instantiate LLM provider
 * 
 * Priority order:
 * 1. CLI flag (modelOrProvider parameter)
 * 2. Configuration default provider
 * 3. Qwen fallback (if Qwen key is configured)
 * 
 * @param modelOrProvider - Model identifier or provider name from CLI flag
 * @param config - Optional configuration override (defaults to ConfigManager)
 * @returns Resolved and instantiated provider
 * @throws AuthenticationError if provider/key is missing
 */
export function resolveProvider(
  modelOrProvider?: string,
  config?: MultiProviderConfig,
  manager?: ConfigManager
): LLMProvider {
  const effectiveManager = manager || configManager;
  const effectiveConfig = config || effectiveManager.getAllProviders();
  let providerName: string | undefined;

  // Priority 1: CLI flag
  if (modelOrProvider) {
    providerName = resolveProviderName(modelOrProvider);
    if (!providerName) {
      throw new Error(
        `Unknown model or provider: "${modelOrProvider}". ` +
        `Available providers: ${providerRegistry.list().join(', ')}`
      );
    }
  }

  // Priority 2: Configuration default
  if (!providerName && effectiveConfig.defaultProvider) {
    providerName = effectiveConfig.defaultProvider;
  }

  // Priority 3: Qwen fallback (if Qwen key exists)
  if (!providerName && effectiveConfig.providers.qwen?.apiKey) {
    providerName = 'qwen';
  }

  // If still no provider, throw error
  if (!providerName) {
    throw new AuthenticationError(
      'No provider configured. Please set an API key for at least one provider.',
      'unknown'
    );
  }

  // Get provider configuration
  const providerConfig = effectiveConfig.providers[providerName];
  if (!providerConfig || !providerConfig.apiKey) {
    throw new AuthenticationError(
      `API key not configured for provider "${providerName}". ` +
      `Please set it with: xyzulu config set ${providerName}.apiKey <key>`,
      providerName
    );
  }

  // Validate API key format
  if (!effectiveManager.validateProviderKey(providerName, providerConfig.apiKey)) {
    throw new AuthenticationError(
      `Invalid API key format for provider "${providerName}"`,
      providerName
    );
  }

  // Check if provider is already registered
  let provider = providerRegistry.get(providerName);

  // If not registered, create and register it
  if (!provider) {
    provider = createProviderInstance(providerName, providerConfig);
    providerRegistry.register(provider, providerName);
  }

  return provider;
}

/**
 * Get provider by model identifier
 */
export function getProviderByModel(modelId: string): LLMProvider | undefined {
  const providerName = MODEL_TO_PROVIDER[modelId.toLowerCase()];
  if (!providerName) {
    return undefined;
  }

  return providerRegistry.getByModel(modelId) || providerRegistry.get(providerName);
}

/**
 * Register all configured providers at startup
 */
export function registerConfiguredProviders(manager?: ConfigManager): void {
  const effectiveManager = manager || configManager;
  const config = effectiveManager.getAllProviders();

  for (const [providerName, providerConfig] of Object.entries(config.providers)) {
    if (providerConfig.apiKey) {
      try {
        const provider = createProviderInstance(providerName, providerConfig);
        providerRegistry.register(provider, providerName);
      } catch (error) {
        // Skip providers that aren't implemented yet
        if (error instanceof Error && error.message.includes('not yet implemented')) {
          continue;
        }
        throw error;
      }
    }
  }

  // Set default provider if configured
  if (config.defaultProvider && providerRegistry.has(config.defaultProvider)) {
    providerRegistry.setDefault(config.defaultProvider);
  } else if (providerRegistry.has('qwen')) {
    // Fallback to Qwen if available
    providerRegistry.setDefault('qwen');
  }
}

