/**
 * noteide login コマンド
 * Note.com への認証情報を登録
 */

import { Command } from 'commander';
import * as credentialStore from '@core/auth/credential-store';
import * as noteAuth from '@core/note-api/auth';
import type { LoginCommandOptions } from '@shared/types';

export function createLoginCommand(): Command {
  const login = new Command('login')
    .description('Authenticate with Note.com and save credentials')
    .option('--headless', 'Run browser in headless mode (default: false)')
    .option(
      '--no-save',
      'Do not save credentials to OS Keychain (default: save enabled)',
    )
    .action(async (options: LoginCommandOptions) => {
      try {
        console.log('Authenticating with Note.com...');

        // メールアドレスとパスワードの入力を促す
        const email = await promptForInput('Email: ');
        const password = await promptForInput('Password: ', true);

        // Puppeteer でログイン
        const headless = !options.headless; // headless オプションは default true
        console.log(
          `Logging in using ${headless ? 'headless' : 'visible'} browser...`,
        );
        const cookieAuth = await noteAuth.loginWithPuppeteer(
          email,
          password,
          headless,
        );

        // 認証情報を保存
        if (options.save !== false) {
          console.log('Saving credentials to OS Keychain...');
          await credentialStore.saveAuthCredentials(email, password);
          console.log('✅ Credentials saved successfully');
        } else {
          console.log(
            'ℹ️  Credentials not saved (use --save to enable in future)',
          );
        }

        console.log('✅ Authentication successful!');
        console.log(`User email: ${email}`);
      } catch (error) {
        console.error('❌ Authentication failed:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return login;
}

/**
 * ユーザー入力を促す
 * @param prompt 入力プロンプトテキスト
 * @param hidden パスワード入力の場合はtrue
 */
async function promptForInput(
  prompt: string,
  hidden = false,
): Promise<string> {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      console.error('Error: Interactive input not available');
      process.exit(1);
    }

    process.stdout.write(prompt);

    if (hidden && process.stdin.isTTY) {
      // パスワード入力時は入力を表示しない
      process.stdin.setRawMode(true);
    }

    let input = '';

    process.stdin.once('data', (chunk) => {
      if (hidden && process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      const str = chunk.toString();
      input = str.trim();
      process.stdout.write('\n');
      resolve(input);
    });
  });
}
