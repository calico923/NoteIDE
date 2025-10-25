/**
 * noteide config コマンド
 * アプリケーション設定を管理
 */

import { Command } from 'commander';
import { DEFAULT_CONFIG, type ConfigCommandOptions } from '@shared/types';

export function createConfigCommand(): Command {
  const config = new Command('config')
    .description('Manage application configuration')
    .option('-l, --list', 'List all configuration values')
    .option('-g, --get <key>', 'Get a configuration value')
    .option('-s, --set <key=value>', 'Set a configuration value')
    .option('-r, --reset', 'Reset to default configuration')
    .action(async (options: ConfigCommandOptions) => {
      try {
        if (options.list) {
          // すべての設定を表示
          displayConfig(DEFAULT_CONFIG);
        } else if (options.get) {
          // 特定の設定を取得
          displayConfigValue(DEFAULT_CONFIG, options.get);
        } else if (options.set) {
          // 設定を変更（TODO: ファイルに保存）
          const [key, value] = options.set.split('=');
          console.log(`Setting ${key} = ${value}`);
          console.log('⚠️  Note: Config changes will be persisted in Phase 2');
        } else if (options.reset) {
          // デフォルト設定にリセット（TODO: ファイルをリセット）
          console.log('Resetting configuration to defaults...');
          console.log('⚠️  Note: Config reset will be persisted in Phase 2');
        } else {
          // オプションがない場合は設定を表示
          displayConfig(DEFAULT_CONFIG);
        }
      } catch (error) {
        console.error(
          '❌ Config error:',
          error instanceof Error ? error.message : error,
        );
        process.exit(1);
      }
    });

  return config;
}

/**
 * 設定全体を表示
 */
function displayConfig(config: typeof DEFAULT_CONFIG): void {
  console.log('Current Configuration:\n');

  console.log('API Settings:');
  console.log(`  Base URL: ${config.api.baseUrl}`);
  console.log(`  Timeout: ${config.api.timeout}ms`);
  console.log(`  Max Retries: ${config.api.maxRetries}`);
  console.log(`  Retry Delay: ${config.api.retryDelayMs}ms`);
  console.log(`  Rate Limit: ${config.api.rateLimitRequestsPerMinute} req/min`);
  console.log(`  Max Image Size: ${(config.api.maxImageSizeBytes / 1024 / 1024).toFixed(1)}MB`);

  console.log('\nStorage Settings:');
  console.log(`  Data Directory: ${config.storage.dataDir}`);
  console.log(`  History File: ${config.storage.historyFileName}`);
  console.log(`  Config File: ${config.storage.configFileName}`);

  console.log('\nUser Settings:');
  if (config.user.userId) {
    console.log(`  User ID: ${config.user.userId}`);
  }
  if (config.user.userName) {
    console.log(`  User Name: ${config.user.userName}`);
  }
  if (config.user.email) {
    console.log(`  Email: ${config.user.email}`);
  }
  if (!config.user.email && !config.user.userId) {
    console.log('  (Not logged in)');
  }
}

/**
 * 特定の設定値を取得して表示
 */
function displayConfigValue(
  config: typeof DEFAULT_CONFIG,
  key: string,
): void {
  const keys = key.split('.');

  let value: unknown = config;
  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.error(`❌ Configuration key not found: ${key}`);
      process.exit(1);
    }
  }

  console.log(`${key}: ${JSON.stringify(value, null, 2)}`);
}
