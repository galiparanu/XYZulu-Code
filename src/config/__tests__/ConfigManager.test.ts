/**
 * Unit tests for ConfigManager
 * 
 * These tests verify multi-provider configuration management functionality.
 */

import { ConfigManager } from '../ConfigManager';
import type { ProviderConfig } from '../../providers/types';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

/**
 * Test ConfigManager.getProviderKey()
 */
export function testGetProviderKey(): void {
  const testConfigPath = path.join(tmpdir(), 'test-config.json');
  const manager = new ConfigManager(testConfigPath);

  // Set a provider key
  manager.setProviderKey('qwen', 'sk-test-key-123');

  // Get it back
  const key = manager.getProviderKey('qwen');

  if (key !== 'sk-test-key-123') {
    throw new Error('getProviderKey() should return the set key');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
}

/**
 * Test ConfigManager.setProviderKey()
 */
export function testSetProviderKey(): void {
  const testConfigPath = path.join(tmpdir(), 'test-config-2.json');
  const manager = new ConfigManager(testConfigPath);

  // Set multiple provider keys
  manager.setProviderKey('qwen', 'sk-qwen-key');
  manager.setProviderKey('openai', 'sk-openai-key');

  // Verify both are stored
  if (manager.getProviderKey('qwen') !== 'sk-qwen-key') {
    throw new Error('Qwen key should be stored');
  }

  if (manager.getProviderKey('openai') !== 'sk-openai-key') {
    throw new Error('OpenAI key should be stored');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
}

/**
 * Test ConfigManager.getDefaultProvider()
 */
export function testGetDefaultProvider(): void {
  const testConfigPath = path.join(tmpdir(), 'test-config-3.json');
  const manager = new ConfigManager(testConfigPath);

  // Set provider keys
  manager.setProviderKey('qwen', 'sk-qwen-key');
  manager.setProviderKey('openai', 'sk-openai-key');

  // Set default provider
  manager.setDefaultProvider('qwen');

  // Get default
  const defaultProvider = manager.getDefaultProvider();

  if (defaultProvider !== 'qwen') {
    throw new Error('getDefaultProvider() should return the set default');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
}

/**
 * Test ConfigManager.setDefaultProvider() error handling
 */
export function testSetDefaultProviderError(): void {
  const testConfigPath = path.join(tmpdir(), 'test-config-4.json');
  const manager = new ConfigManager(testConfigPath);

  let threw = false;
  try {
    manager.setDefaultProvider('nonexistent');
  } catch (error) {
    threw = true;
    if (!(error instanceof Error) || !error.message.includes('not configured')) {
      throw new Error('setDefaultProvider() should throw if provider not configured');
    }
  }

  if (!threw) {
    throw new Error('setDefaultProvider() should throw error for unconfigured provider');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
}

/**
 * Test config backward compatibility migration
 */
export function testBackwardCompatibility(): void {
  const testConfigPath = path.join(tmpdir(), 'test-config-old.json');

  // Create old format config
  const oldConfig = {
    apiKey: 'sk-old-qwen-key',
    defaultModel: 'qwen-turbo',
  };

  fs.writeFileSync(testConfigPath, JSON.stringify(oldConfig, null, 2), 'utf-8');

  // Load with ConfigManager (should auto-migrate)
  const manager = new ConfigManager(testConfigPath);

  // Verify migration
  const qwenKey = manager.getProviderKey('qwen');
  if (qwenKey !== 'sk-old-qwen-key') {
    throw new Error('Old config should be migrated to new format');
  }

  const defaultProvider = manager.getDefaultProvider();
  if (defaultProvider !== 'qwen') {
    throw new Error('Default provider should be set to qwen after migration');
  }

  // Verify new format file exists
  const newConfigContent = fs.readFileSync(testConfigPath, 'utf-8');
  const newConfig = JSON.parse(newConfigContent);

  if (!('providers' in newConfig)) {
    throw new Error('Migrated config should have providers structure');
  }

  // Cleanup
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }
}

/**
 * Test ConfigManager.validateProviderKey()
 */
export function testValidateProviderKey(): void {
  const manager = new ConfigManager();

  // Test valid keys
  if (!manager.validateProviderKey('qwen', 'sk-valid-key-123')) {
    throw new Error('Valid Qwen key should pass validation');
  }

  if (!manager.validateProviderKey('openai', 'sk-valid-openai-key')) {
    throw new Error('Valid OpenAI key should pass validation');
  }

  if (!manager.validateProviderKey('anthropic', 'sk-ant-valid-key')) {
    throw new Error('Valid Anthropic key should pass validation');
  }

  // Test invalid keys
  if (manager.validateProviderKey('qwen', '')) {
    throw new Error('Empty key should fail validation');
  }

  if (manager.validateProviderKey('openai', 'invalid')) {
    throw new Error('Invalid OpenAI key format should fail validation');
  }
}

