/**
 * Unit tests for OpenAIProvider
 * 
 * These tests verify that OpenAIProvider correctly implements the LLMProvider
 * interface and can be instantiated and registered.
 */

import { OpenAIProvider } from '../OpenAIProvider';
import type { ProviderConfig, LLMProvider } from '../../types';

/**
 * Test that OpenAIProvider implements LLMProvider interface
 */
export function testOpenAIProviderImplementsInterface(): void {
  const config: ProviderConfig = { apiKey: 'sk-test-key-1234567890' };
  const provider: LLMProvider = new OpenAIProvider(config);

  // Type check: should compile without errors
  // If it doesn't, OpenAIProvider doesn't implement LLMProvider correctly
  const _test: LLMProvider = provider;
  void _test;
}

/**
 * Test OpenAIProvider.getName()
 */
export function testOpenAIProviderGetName(): void {
  const config: ProviderConfig = { apiKey: 'sk-test-key-1234567890' };
  const provider = new OpenAIProvider(config);

  if (provider.getName() !== 'openai') {
    throw new Error('getName() should return "openai"');
  }
}

/**
 * Test OpenAIProvider.validateConfig()
 */
export function testOpenAIProviderValidateConfig(): void {
  const provider = new OpenAIProvider({ apiKey: 'sk-test-key' });

  const validConfig: ProviderConfig = { apiKey: 'sk-valid-key-1234567890' };
  const invalidConfig1: ProviderConfig = { apiKey: '' };
  const invalidConfig2: ProviderConfig = { apiKey: 'invalid-key' }; // Doesn't start with sk-

  if (!provider.validateConfig(validConfig)) {
    throw new Error('validateConfig() should return true for valid OpenAI key');
  }

  if (provider.validateConfig(invalidConfig1)) {
    throw new Error('validateConfig() should return false for empty key');
  }

  if (provider.validateConfig(invalidConfig2)) {
    throw new Error('validateConfig() should return false for invalid key format');
  }
}

/**
 * Test OpenAIProvider.getSupportedModels()
 */
export function testOpenAIProviderGetSupportedModels(): void {
  const provider = new OpenAIProvider({ apiKey: 'sk-test-key' });
  const models = provider.getSupportedModels();

  if (!Array.isArray(models) || models.length === 0) {
    throw new Error('getSupportedModels() should return a non-empty array');
  }

  if (!models.includes('gpt-4o')) {
    throw new Error('getSupportedModels() should include "gpt-4o"');
  }

  if (!models.includes('gpt-3.5-turbo')) {
    throw new Error('getSupportedModels() should include "gpt-3.5-turbo"');
  }
}

/**
 * Test OpenAIProvider.isAvailable()
 */
export function testOpenAIProviderIsAvailable(): void {
  const validConfig: ProviderConfig = { apiKey: 'sk-valid-key-1234567890' };
  const invalidConfig: ProviderConfig = { apiKey: '' };

  const validProvider = new OpenAIProvider(validConfig);
  const invalidProvider = new OpenAIProvider(invalidConfig);

  if (!validProvider.isAvailable()) {
    throw new Error('isAvailable() should return true for valid config');
  }

  if (invalidProvider.isAvailable()) {
    throw new Error('isAvailable() should return false for invalid config');
  }
}

/**
 * Test that OpenAIProvider can be instantiated
 */
export function testOpenAIProviderInstantiation(): void {
  const config: ProviderConfig = { apiKey: 'sk-test-key-1234567890' };
  const provider = new OpenAIProvider(config);

  if (!provider) {
    throw new Error('OpenAIProvider should be instantiable');
  }

  // Verify it has all required methods
  if (typeof provider.getName !== 'function') {
    throw new Error('OpenAIProvider should have getName() method');
  }

  if (typeof provider.isAvailable !== 'function') {
    throw new Error('OpenAIProvider should have isAvailable() method');
  }

  if (typeof provider.getSupportedModels !== 'function') {
    throw new Error('OpenAIProvider should have getSupportedModels() method');
  }

  if (typeof provider.validateConfig !== 'function') {
    throw new Error('OpenAIProvider should have validateConfig() method');
  }
}

