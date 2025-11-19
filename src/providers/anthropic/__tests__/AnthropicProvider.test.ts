/**
 * Unit tests for AnthropicProvider
 * 
 * These tests verify that AnthropicProvider correctly implements the LLMProvider
 * interface and can be instantiated and registered.
 */

import { AnthropicProvider } from '../AnthropicProvider';
import type { ProviderConfig, LLMProvider } from '../../types';

/**
 * Test that AnthropicProvider implements LLMProvider interface
 */
export function testAnthropicProviderImplementsInterface(): void {
  const config: ProviderConfig = { apiKey: 'sk-ant-test-key-1234567890' };
  const provider: LLMProvider = new AnthropicProvider(config);

  // Type check: should compile without errors
  // If it doesn't, AnthropicProvider doesn't implement LLMProvider correctly
  const _test: LLMProvider = provider;
  void _test;
}

/**
 * Test AnthropicProvider.getName()
 */
export function testAnthropicProviderGetName(): void {
  const config: ProviderConfig = { apiKey: 'sk-ant-test-key-1234567890' };
  const provider = new AnthropicProvider(config);

  if (provider.getName() !== 'anthropic') {
    throw new Error('getName() should return "anthropic"');
  }
}

/**
 * Test AnthropicProvider.validateConfig()
 */
export function testAnthropicProviderValidateConfig(): void {
  const provider = new AnthropicProvider({ apiKey: 'sk-ant-test-key' });

  const validConfig: ProviderConfig = { apiKey: 'sk-ant-valid-key-1234567890' };
  const invalidConfig1: ProviderConfig = { apiKey: '' };
  const invalidConfig2: ProviderConfig = { apiKey: 'invalid-key' }; // Doesn't start with sk-ant-

  if (!provider.validateConfig(validConfig)) {
    throw new Error('validateConfig() should return true for valid Anthropic key');
  }

  if (provider.validateConfig(invalidConfig1)) {
    throw new Error('validateConfig() should return false for empty key');
  }

  if (provider.validateConfig(invalidConfig2)) {
    throw new Error('validateConfig() should return false for invalid key format');
  }
}

/**
 * Test AnthropicProvider.getSupportedModels()
 */
export function testAnthropicProviderGetSupportedModels(): void {
  const provider = new AnthropicProvider({ apiKey: 'sk-ant-test-key' });
  const models = provider.getSupportedModels();

  if (!Array.isArray(models) || models.length === 0) {
    throw new Error('getSupportedModels() should return a non-empty array');
  }

  if (!models.includes('claude-3-opus')) {
    throw new Error('getSupportedModels() should include "claude-3-opus"');
  }

  if (!models.includes('claude-3-5-sonnet')) {
    throw new Error('getSupportedModels() should include "claude-3-5-sonnet"');
  }
}

/**
 * Test AnthropicProvider.isAvailable()
 */
export function testAnthropicProviderIsAvailable(): void {
  const validConfig: ProviderConfig = { apiKey: 'sk-ant-valid-key-1234567890' };
  const invalidConfig: ProviderConfig = { apiKey: '' };

  const validProvider = new AnthropicProvider(validConfig);
  const invalidProvider = new AnthropicProvider(invalidConfig);

  if (!validProvider.isAvailable()) {
    throw new Error('isAvailable() should return true for valid config');
  }

  if (invalidProvider.isAvailable()) {
    throw new Error('isAvailable() should return false for invalid config');
  }
}

/**
 * Test that AnthropicProvider can be instantiated
 */
export function testAnthropicProviderInstantiation(): void {
  const config: ProviderConfig = { apiKey: 'sk-ant-test-key-1234567890' };
  const provider = new AnthropicProvider(config);

  if (!provider) {
    throw new Error('AnthropicProvider should be instantiable');
  }

  // Verify it has all required methods
  if (typeof provider.getName !== 'function') {
    throw new Error('AnthropicProvider should have getName() method');
  }

  if (typeof provider.isAvailable !== 'function') {
    throw new Error('AnthropicProvider should have isAvailable() method');
  }

  if (typeof provider.getSupportedModels !== 'function') {
    throw new Error('AnthropicProvider should have getSupportedModels() method');
  }

  if (typeof provider.validateConfig !== 'function') {
    throw new Error('AnthropicProvider should have validateConfig() method');
  }
}

