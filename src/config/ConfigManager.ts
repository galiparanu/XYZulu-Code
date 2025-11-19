/**
 * Configuration Manager
 * 
 * Manages application configuration including multi-provider API keys,
 * default provider selection, and configuration persistence.
 * 
 * Supports backward compatibility with old single-provider config format.
 */

import type { ProviderConfig, MultiProviderConfig } from '../providers/types';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

/**
 * Configuration file location
 */
const CONFIG_DIR = path.join(homedir(), '.xyzulu');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Old config format (for backward compatibility)
 */
interface OldConfig {
  apiKey?: string;
  defaultModel?: string;
  [key: string]: unknown;
}

/**
 * ConfigManager handles multi-provider configuration
 */
export class ConfigManager {
  private config: MultiProviderConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || CONFIG_FILE;
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file, with backward compatibility
   */
  private loadConfig(): MultiProviderConfig {
    try {
      // Check if file exists (synchronous check for initial load)
      if (!fs.existsSync(this.configPath)) {
        return { providers: {} };
      }

      const fileContent = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(fileContent) as MultiProviderConfig | OldConfig;

      // Check if it's old format (has apiKey at root level)
      if ('apiKey' in parsed && !('providers' in parsed)) {
        return this.migrateOldConfig(parsed as OldConfig);
      }

      // Validate new format
      if (!('providers' in parsed)) {
        return { providers: {} };
      }

      return parsed as MultiProviderConfig;
    } catch (error) {
      // If config file is invalid, return empty config
      console.warn(`Failed to load config from ${this.configPath}:`, error);
      return { providers: {} };
    }
  }

  /**
   * Migrate old single-provider config to new multi-provider format
   */
  private migrateOldConfig(oldConfig: OldConfig): MultiProviderConfig {
    const newConfig: MultiProviderConfig = {
      providers: {},
    };

    if (oldConfig.apiKey) {
      // Migrate old Qwen key to new format
      newConfig.providers.qwen = {
        apiKey: oldConfig.apiKey,
      };
      newConfig.defaultProvider = 'qwen';

      if (oldConfig.defaultModel) {
        newConfig.defaultModel = oldConfig.defaultModel;
      }

      // Save migrated config
      this.saveConfig(newConfig);
    }

    return newConfig;
  }

  /**
   * Save configuration to file
   */
  private saveConfig(config: MultiProviderConfig): void {
    try {
      // Ensure config directory exists
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to save config to ${this.configPath}:`, error);
      throw new Error(`Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get API key for a specific provider
   */
  getProviderKey(provider: string): string | undefined {
    return this.config.providers[provider]?.apiKey;
  }

  /**
   * Set API key for a specific provider
   */
  setProviderKey(provider: string, key: string): void {
    if (!this.config.providers[provider]) {
      this.config.providers[provider] = { apiKey: key };
    } else {
      this.config.providers[provider].apiKey = key;
    }

    this.saveConfig(this.config);
  }

  /**
   * Get default provider name
   */
  getDefaultProvider(): string | undefined {
    return this.config.defaultProvider;
  }

  /**
   * Set default provider name
   */
  setDefaultProvider(provider: string): void {
    // Validate provider exists
    if (!this.config.providers[provider]) {
      throw new Error(`Provider "${provider}" is not configured. Please set its API key first.`);
    }

    this.config.defaultProvider = provider;
    this.saveConfig(this.config);
  }

  /**
   * Get full configuration for a provider
   */
  getProviderConfig(provider: string): ProviderConfig | undefined {
    return this.config.providers[provider];
  }

  /**
   * Set full configuration for a provider
   */
  setProviderConfig(provider: string, config: ProviderConfig): void {
    this.config.providers[provider] = config;
    this.saveConfig(this.config);
  }

  /**
   * Get default model identifier
   */
  getDefaultModel(): string | undefined {
    return this.config.defaultModel;
  }

  /**
   * Set default model identifier
   */
  setDefaultModel(model: string): void {
    this.config.defaultModel = model;
    this.saveConfig(this.config);
  }

  /**
   * Get all providers configuration
   */
  getAllProviders(): MultiProviderConfig {
    return { ...this.config };
  }

  /**
   * Check if a provider is configured
   */
  hasProvider(provider: string): boolean {
    return provider in this.config.providers && !!this.config.providers[provider]?.apiKey;
  }

  /**
   * Remove a provider configuration
   */
  removeProvider(provider: string): void {
    delete this.config.providers[provider];

    // Clear default if it was this provider
    if (this.config.defaultProvider === provider) {
      this.config.defaultProvider = undefined;
    }

    this.saveConfig(this.config);
  }

  /**
   * Validate provider key format
   * Basic validation - can be enhanced per provider
   */
  validateProviderKey(provider: string, key: string): boolean {
    if (!key || key.trim().length === 0) {
      return false;
    }

    // Provider-specific validation
    switch (provider.toLowerCase()) {
      case 'qwen':
        // Qwen keys are typically alphanumeric
        return /^[a-zA-Z0-9_-]+$/.test(key);

      case 'openai':
        // OpenAI keys start with sk-
        return key.startsWith('sk-') && key.length > 10;

      case 'anthropic':
        // Anthropic keys start with sk-ant-
        return key.startsWith('sk-ant-') && key.length > 15;

      default:
        // Generic validation for unknown providers
        return key.length > 5;
    }
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

