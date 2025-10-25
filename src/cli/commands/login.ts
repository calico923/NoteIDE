/**
 * noteide login コマンド
 * Note.com への認証情報を登録
 */

import { Command } from 'commander';
import type { LoginCommandOptions } from '@shared/types';

export function createLoginCommand(): Command {
  const login = new Command('login')
    .description('Authenticate with Note.com and save credentials')
    .option('-h, --headless', 'Run browser in headless mode (default: false)')
    .option(
      '-s, --save-credentials',
      'Save credentials to OS Keychain (default: true)',
      true,
    )
    .action(async (options: LoginCommandOptions) => {
      // TODO: 実装する
      console.log('Login command - Implementation pending');
      console.log('Options:', options);
    });

  return login;
}
