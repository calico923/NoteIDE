/**
 * noteide config コマンド
 * アプリケーション設定を管理
 */

import { Command } from 'commander';
import type { ConfigCommandOptions } from '@shared/types';

export function createConfigCommand(): Command {
  const config = new Command('config')
    .description('Manage application configuration')
    .option('-s, --set <key=value>', 'Set a configuration value')
    .option('-g, --get <key>', 'Get a configuration value')
    .option('-l, --list', 'List all configuration values')
    .option('-r, --reset', 'Reset to default configuration')
    .action(async (options: ConfigCommandOptions) => {
      // TODO: 実装する
      console.log('Config command - Implementation pending');
      console.log('Options:', options);
    });

  return config;
}
