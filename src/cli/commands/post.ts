/**
 * noteide post コマンド
 * Markdownファイルから Note に記事を投稿
 */

import { Command } from 'commander';
import type { PostCommandOptions } from '@shared/types';

export function createPostCommand(): Command {
  const post = new Command('post')
    .description('Post a Markdown file to Note.com')
    .argument('<file>', 'Path to Markdown file')
    .option('-d, --draft', 'Save as draft (default: true)', true)
    .option('-p, --publish', 'Publish immediately')
    .action(async (file: string, options: PostCommandOptions) => {
      // TODO: 実装する
      console.log('Post command - Implementation pending');
      console.log(`File: ${file}`);
      console.log('Options:', options);
    });

  return post;
}
