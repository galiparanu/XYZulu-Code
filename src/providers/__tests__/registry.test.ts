/**
 * Unit tests for ProviderRegistry
 * 
 * These tests verify that the ProviderRegistry correctly manages
 * provider instances and provides the expected functionality.
 */

import { ProviderRegistry } from '../index';
import type { LLMProvider, GenerationOptions, LLMResponse, CodeContext, CodeGenerationResult, ProviderConfig } from '../types';

/**
 * Mock provider implementation for testing
 */
class MockProvider implements LLMProvider {
  constructor(
    private name: string,
    private models: readonly string[],
    private available: boolean = true
  ) {}

  async sendMessage(_prompt: string, _options: GenerationOptions): Promise<LLMResponse> {
    return {
      content: 'Mock response',
      provider: this.name,
      model: 'mock-model',
    };
  }

  async *streamResponse(_prompt: string, _options: GenerationOptions): AsyncIterable<LLMResponse> {
    yield {
      content: 'Mock stream response',
      provider: this.name,
      model: 'mock-model',
    };
  }

  async generateCode(_prompt: string, _context: CodeContext): Promise<CodeGenerationResult> {
    return {
      code: 'mock code',
      response: {
        content: 'mock code',
        provider: this.name,
        model: 'mock-model',
      },
    };
  }

  validateConfig(_config: ProviderConfig): boolean {
    return this.available;
  }

  getSupportedModels(): readonly string[] {
    return this.models;
  }

  getName(): string {
    return this.name;
  }

  isAvailable(): boolean {
    return this.available;
  }
}

/**
 * Test functions for ProviderRegistry
 * 
 * These functions can be used with any testing framework (Jest, Mocha, etc.)
 * or run manually for verification.
 */

export function testRegisterProvider(): void {
  const registry = new ProviderRegistry();
  const provider = new MockProvider('test', ['model1', 'model2']);
  registry.register(provider, 'test');

  if (!registry.has('test') || registry.get('test') !== provider) {
    throw new Error('register should add a provider');
  }
}

export function testRegisterMapsModels(): void {
  const registry = new ProviderRegistry();
  const provider = new MockProvider('test', ['model1', 'model2']);
  registry.register(provider, 'test');

  if (registry.getByModel('model1') !== provider || registry.getByModel('model2') !== provider) {
    throw new Error('register should map models to provider');
  }
}

export function testGetUnregisteredProvider(): void {
  const registry = new ProviderRegistry();
  if (registry.get('nonexistent') !== undefined) {
    throw new Error('get should return undefined for unregistered provider');
  }
}

export function testGetByModelUnknown(): void {
  const registry = new ProviderRegistry();
  if (registry.getByModel('unknown-model') !== undefined) {
    throw new Error('getByModel should return undefined for unknown model');
  }
}

export function testListProviders(): void {
  const registry = new ProviderRegistry();
  const provider1 = new MockProvider('provider1', ['model1']);
  const provider2 = new MockProvider('provider2', ['model2']);

  registry.register(provider1, 'provider1');
  registry.register(provider2, 'provider2');

  const list = registry.list();
  if (!list.includes('provider1') || !list.includes('provider2') || list.length !== 2) {
    throw new Error('list should return all registered provider names');
  }
}

export function testSetDefault(): void {
  const registry = new ProviderRegistry();
  const provider = new MockProvider('test', ['model1']);
  registry.register(provider, 'test');
  registry.setDefault('test');

  if (registry.getDefault() !== provider) {
    throw new Error('setDefault should set the default provider');
  }
}

export function testSetDefaultThrows(): void {
  const registry = new ProviderRegistry();
  let threw = false;
  try {
    registry.setDefault('nonexistent');
  } catch (error) {
    threw = true;
    if (!(error instanceof Error) || !error.message.includes('not registered')) {
      throw new Error('setDefault should throw if provider not registered');
    }
  }
  if (!threw) {
    throw new Error('setDefault should throw if provider not registered');
  }
}

export function testHasProvider(): void {
  const registry = new ProviderRegistry();
  const provider = new MockProvider('test', ['model1']);
  registry.register(provider, 'test');

  if (!registry.has('test') || registry.has('nonexistent')) {
    throw new Error('has should return correct boolean values');
  }
}

export function testUnregisterProvider(): void {
  const registry = new ProviderRegistry();
  const provider = new MockProvider('test', ['model1']);
  registry.register(provider, 'test');
  registry.setDefault('test');

  const removed = registry.unregister('test');

  if (!removed || registry.has('test') || registry.getDefault() !== undefined || registry.getByModel('model1') !== undefined) {
    throw new Error('unregister should remove a provider');
  }
}

export function testClearProviders(): void {
  const registry = new ProviderRegistry();
  const provider1 = new MockProvider('provider1', ['model1']);
  const provider2 = new MockProvider('provider2', ['model2']);

  registry.register(provider1, 'provider1');
  registry.register(provider2, 'provider2');
  registry.setDefault('provider1');

  registry.clear();

  if (registry.list().length !== 0 || registry.getDefault() !== undefined || registry.getByModel('model1') !== undefined) {
    throw new Error('clear should remove all providers');
  }
}

// Note: These tests use a simple test framework structure.
// In a real project, you would use Jest, Mocha, or another testing framework.
// The tests are structured to be easily adaptable to any testing framework.

