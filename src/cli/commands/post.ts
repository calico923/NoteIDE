/**
 * noteide post コマンド
 * Markdownファイルから Note に記事を投稿
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { Command } from 'commander';
import * as credentialStore from '@core/auth/credential-store';
import { NoteApiClient } from '@core/note-api/client';
import { parseMarkdownFile, validateFrontMatter } from '@core/markdown/parser';
import {
  detectImages,
  readImageFile,
  validateImageFile,
  replaceImageReferences,
} from '@core/markdown/image-handler';
import { convertMarkdownToHtml, sanitizeHtmlForNote } from '@core/markdown/converter';
import { createPostHistoryRepository } from '@data/repositories/post-history';
import { Post } from '@data/models/post';
import { DEFAULT_CONFIG, type PostCommandOptions } from '@shared/types';

export function createPostCommand(): Command {
  const post = new Command('post')
    .description('Post a Markdown file to Note.com')
    .argument('<file>', 'Path to Markdown file')
    .option('-d, --draft', 'Save as draft (default: true)', true)
    .action(async (file: string, options: PostCommandOptions) => {
      try {
        const filePath = resolve(file);

        // ファイルを読み込む
        console.log(`Reading file: ${filePath}`);
        const content = readFileSync(filePath, 'utf-8');

        // Markdownをパース
        const parsed = parseMarkdownFile(content, filePath, file);

        // Front Matterを検証
        const validation = validateFrontMatter(parsed.frontMatter);
        if (!validation.valid) {
          console.error('❌ Front Matter validation failed:');
          for (const error of validation.errors) {
            console.error(`  - ${error}`);
          }
          process.exit(1);
        }

        console.log('✅ Front Matter validated');
        console.log(`  Title: ${parsed.frontMatter.title}`);

        // 画像を検出・アップロード
        const fileDir = dirname(filePath);
        const images = await detectImages(parsed.content, fileDir);
        console.log(
          `Found ${images.length} image(s)`,
        );

        // 認証情報を取得
        const creds = await credentialStore.getAuthCredentials();
        if (!creds) {
          console.error(
            '❌ Authentication credentials not found. Please run: noteide login',
          );
          process.exit(1);
        }

        // API クライアントを初期化
        const client = new NoteApiClient();
        // TODO: Cookie認証を設定（現在、認証は TODO）
        // client.setCookieAuth(cookieAuth);

        // 画像をアップロード
        const uploadedImages = [];
        for (const image of images) {
          try {
            // ファイルを検証
            const fileValidation = await validateImageFile(image.absolutePath);
            if (!fileValidation.valid) {
              console.warn(
                `⚠️  Skipping image ${image.originalPath}:`,
                fileValidation.errors.join(', '),
              );
              continue;
            }

            // 画像をアップロード
            console.log(`Uploading image: ${image.originalPath}`);
            const imageBuffer = await readImageFile(image.absolutePath);
            const response = await client.uploadImage(
              imageBuffer,
              image.originalPath,
              image.mimeType,
            );

            console.log(`  ✅ Uploaded: ${response.url}`);
            uploadedImages.push({
              originalPath: image.originalPath,
              uploadedUrl: response.url,
              uploadedMediaId: response.mediaId,
            });
          } catch (error) {
            console.warn(
              `⚠️  Failed to upload image ${image.originalPath}:`,
              error instanceof Error ? error.message : error,
            );
          }
        }

        // 画像参照をアップロード後のURLに置換
        let htmlContent = parsed.content;
        for (const uploaded of uploadedImages) {
          htmlContent = replaceImageReferences(
            htmlContent,
            new Map([[uploaded.originalPath, uploaded.uploadedUrl]]),
          );
        }

        // MarkdownをHTMLに変換
        console.log('Converting Markdown to HTML...');
        const htmlBody = await convertMarkdownToHtml(htmlContent);
        const sanitized = sanitizeHtmlForNote(htmlBody);

        // Note APIで投稿
        console.log('Posting to Note.com...');
        const postResult = await client.createTextNote({
          title: parsed.frontMatter.title,
          body: sanitized,
          mediaIds: uploadedImages.map((img) => img.uploadedMediaId),
        });

        console.log('✅ Post successful!');
        console.log(`  Post ID: ${postResult.id}`);
        console.log(`  Status: ${postResult.status}`);
        console.log(`  Created: ${postResult.createdAt}`);

        // 投稿履歴を保存
        try {
          const historyPath = resolve(
            DEFAULT_CONFIG.storage.dataDir,
            DEFAULT_CONFIG.storage.historyFileName,
          );
          const repository = createPostHistoryRepository(historyPath);

          const postRecord = new Post({
            id: postResult.id,
            title: parsed.frontMatter.title,
            sourceFileName: file,
            sourceFilePath: filePath,
            postedAt: postResult.createdAt,
            status: postResult.status,
            mediaIds: uploadedImages.map((img) => img.uploadedMediaId),
          });

          await repository.save(postRecord);
          console.log('✅ Post history saved');

          // 統計情報を表示
          const stats = await repository.getStats();
          console.log('\nPosting statistics:');
          console.log(`  Total posts: ${stats.totalPosts}`);
          console.log(`  Drafts: ${stats.draftCount}`);
          console.log(`  Published: ${stats.publishedCount}`);
        } catch (historyError) {
          console.warn(
            '⚠️  Failed to save post history:',
            historyError instanceof Error ? historyError.message : historyError,
          );
        }
      } catch (error) {
        console.error(
          '❌ Post failed:',
          error instanceof Error ? error.message : error,
        );
        process.exit(1);
      }
    });

  return post;
}
