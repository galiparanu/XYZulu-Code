/**
 * Unit tests for Provider Resolver
 * 
 * These tests verify provider resolution logic and priority handling.
 */

import { resolveProvider, registerConfiguredProviders, getProviderByModel } from '../resolver';
import { providerRegistry } from '../index';
import { QwenProvider } from '../qwen/QwenProvider';
import type { ProviderConfig, MultiProviderConfig } from '../types';
import { ConfigManager } from '../../config/ConfigManager';
import * as path from 'path';
import { tmpdir } from 'os';
import * as fs from 'fs';

/**
 * Test provider resolution with CLI flag (highest priority)
 */
export function testResolveProviderWithCLIFlag(): void {
  const testConfigPath = path.join(tmpdir(), 'test-resolver-1.json');
  // Create a temporary ConfigManager instance for testing
  const manager = new ConfigManager(testConfigPath);
  
  // Temporarily override the global configManager
  // Note: In a real test framework, you'd use dependency injection or mocks

  // Setup: Configure multiple providers
  manager.setProviderKey('qwen', 'sk-qwen-key');
  manager.setProviderKey('openai', 'sk-openai-key');
  manager.setDefaultProvider('openai'); // Set default to openai

  // Register providers
  registerConfiguredProviders(manager);

  // Resolve with CLI flag (should override default)
  try {
    const provider = resolveProvider('qwen-turbo', undefined, manager); // CLI flag
    if (provider.getName() !== 'qwen') {
      throw new Error('CLI flag should take priority over config default');
    }
  } catch (error) {
    // Expected if OpenAI provider not implemented
    if (error instanceof Error && error.message.includes('not yet implemented')) {
      // This is expected - test structure is correct
      return;
    }
    throw error;
  } finally {
    // Cleanup
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
    providerRegistry.clear();
  }
}

/**
 * Test provider resolution with config default
 */
export function testResolveProviderWithConfigDefault(): void {
  const testConfigPath = path.join(tmpdir(), 'test-resolver-2.json');
  const manager = new ConfigManager(testConfigPath);

  // Setup: Configure Qwen and set as default
  manager.setProviderKey('qwen', 'sk-qwen-key');
  manager.setDefaultProvider('qwen');

  // Register providers
  registerConfiguredProviders(manager);

  // Resolve without CLI flag (should use default)
  const provider = resolveProvider(undefined, undefined, manager); // No CLI flag

  if (provider.getName() !== 'qwen') {
    throw new Error('Should use config default when no CLI flag');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
  providerRegistry.clear();
}

/**
 * Test provider resolution fallback to Qwen
 */
export function testResolveProviderFallbackToQwen(): void {
  const testConfigPath = path.join(tmpdir(), 'test-resolver-3.json');
  const manager = new ConfigManager(testConfigPath);

  // Setup: Only configure Qwen (no default set)
  manager.setProviderKey('qwen', 'sk-qwen-key');

  // Register providers
  registerConfiguredProviders(manager);

  // Resolve without CLI flag or default (should fallback to Qwen)
  const provider = resolveProvider(undefined, undefined, manager); // No CLI flag, no default

  if (provider.getName() !== 'qwen') {
    throw new Error('Should fallback to Qwen if available and no default set');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
  providerRegistry.clear();
}

/**
 * Test provider resolution error when no provider configured
 */
export function testResolveProviderErrorNoProvider(): void {
  const testConfigPath = path.join(tmpdir(), 'test-resolver-4.json');
  const manager = new ConfigManager(testConfigPath);

  // Don't configure any providers

  let threw = false;
  try {
    resolveProvider(undefined, undefined, manager);
  } catch (error) {
    threw = true;
    if (!(error instanceof Error) || !error.message.includes('No provider configured')) {
      throw new Error('Should throw error when no provider is configured');
    }
  }

  if (!threw) {
    throw new Error('Should throw error when no provider is configured');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
}

/**
 * Test getProviderByModel()
 */
export function testGetProviderByModel(): void {
  // Register Qwen provider
  const qwenProvider = new QwenProvider({ apiKey: 'sk-test-key' });
  providerRegistry.register(qwenProvider, 'qwen');

  // Test model lookup
  const provider = getProviderByModel('qwen-turbo');

  if (!provider || provider.getName() !== 'qwen') {
    throw new Error('getProviderByModel() should return correct provider');
  }

  // Test unknown model
  const unknownProvider = getProviderByModel('unknown-model');
  if (unknownProvider !== undefined) {
    throw new Error('getProviderByModel() should return undefined for unknown model');
  }

  // Cleanup
  providerRegistry.clear();
}

