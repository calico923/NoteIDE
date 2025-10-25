#!/usr/bin/env node

/**
 * NoteIDE CLI エントリポイント
 * Commander.js ベースのCLIアプリケーション
 */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLoginCommand } from './commands/login';
import { createPostCommand } from './commands/post';
import { createConfigCommand } from './commands/config';

// パッケージ情報を読み込む
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
  version: string;
  description: string;
};

// CLIプログラムを作成
const program = new Command();

program
  .name('noteide')
  .description(packageJson.description)
  .version(packageJson.version, '-v, --version', 'Display version');

// グローバルオプション
program.option('-q, --quiet', 'Suppress output messages');
program.option('--verbose', 'Enable verbose logging');

// サブコマンドを登録
program.addCommand(createLoginCommand());
program.addCommand(createPostCommand());
program.addCommand(createConfigCommand());

// ヘルプメッセージをカスタマイズ
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ noteide login                 # Authenticate with Note.com');
  console.log('  $ noteide post article.md       # Post a Markdown file');
  console.log('  $ noteide config --list         # Show all settings');
});

/**
 * main関数: CLIを実行
 */
async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// CLI実行
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { program };
