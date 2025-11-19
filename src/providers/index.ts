/**
 * Provider Registry and Exports
 * 
 * This module manages LLM provider instances and provides a centralized
 * way to register, retrieve, and manage providers.
 */

import type { LLMProvider } from './types';

/**
 * Registry for managing LLM provider instances
 * 
 * The ProviderRegistry maintains a collection of registered providers and
 * provides methods to register, retrieve, and manage them. It also supports
 * model-based provider lookup and default provider management.
 */
export class ProviderRegistry {
  private providers: Map<string, LLMProvider> = new Map();
  private modelToProvider: Map<string, string> = new Map();
  private defaultProviderName: string | undefined;

  /**
   * Register a provider with the registry
   * 
   * @param provider - The provider instance to register
   * @param name - The name to register the provider under
   * @throws Error if provider or name is invalid
   */
  register(provider: LLMProvider, name: string): void {
    if (!provider) {
      throw new Error('Provider cannot be null or undefined');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Provider name cannot be empty');
    }

    // Register provider by name
    this.providers.set(name, provider);

    // Register all supported models to map to this provider
    const models = provider.getSupportedModels();
    for (const model of models) {
      this.modelToProvider.set(model, name);
    }
  }

  /**
   * Get a provider by name
   * 
   * @param name - The name of the provider to retrieve
   * @returns The provider instance, or undefined if not found
   */
  get(name: string): LLMProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get a provider by model identifier
   * 
   * @param modelId - The model identifier (e.g., "gpt-4o", "qwen-turbo")
   * @returns The provider instance that supports this model, or undefined if not found
   */
  getByModel(modelId: string): LLMProvider | undefined {
    const providerName = this.modelToProvider.get(modelId);
    if (!providerName) {
      return undefined;
    }
    return this.providers.get(providerName);
  }

  /**
   * List all registered provider names
   * 
   * @returns Array of registered provider names
   */
  list(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get the default provider
   * 
   * @returns The default provider instance, or undefined if no default is set
   */
  getDefault(): LLMProvider | undefined {
    if (!this.defaultProviderName) {
      return undefined;
    }
    return this.providers.get(this.defaultProviderName);
  }

  /**
   * Set the default provider
   * 
   * @param name - The name of the provider to set as default
   * @throws Error if provider with given name is not registered
   */
  setDefault(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider "${name}" is not registered`);
    }
    this.defaultProviderName = name;
  }

  /**
   * Check if a provider is registered
   * 
   * @param name - The name of the provider to check
   * @returns true if provider is registered, false otherwise
   */
  has(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Unregister a provider
   * 
   * @param name - The name of the provider to unregister
   * @returns true if provider was removed, false if it wasn't registered
   */
  unregister(name: string): boolean {
    const provider = this.providers.get(name);
    if (!provider) {
      return false;
    }

    // Remove provider
    this.providers.delete(name);

    // Remove model mappings for this provider
    const models = provider.getSupportedModels();
    for (const model of models) {
      if (this.modelToProvider.get(model) === name) {
        this.modelToProvider.delete(model);
      }
    }

    // Clear default if it was this provider
    if (this.defaultProviderName === name) {
      this.defaultProviderName = undefined;
    }

    return true;
  }

  /**
   * Clear all registered providers
   */
  clear(): void {
    this.providers.clear();
    this.modelToProvider.clear();
    this.defaultProviderName = undefined;
  }
}

// Export a singleton instance for global use
export const providerRegistry = new ProviderRegistry();

// Re-export types for convenience
export * from './types';

