/**
 * Markdown → Note HTML 変換
 * unified/remark/rehype を使用
 */

import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import type { ImageReference, ProcessedMarkdownContent } from '@shared/types';

/**
 * Markdown を HTML に変換
 * Note.com 用のHTMLフォーマットに対応
 *
 * @param markdownContent Markdown コンテンツ
 * @returns HTML 文字列
 */
export async function convertMarkdownToHtml(
  markdownContent: string,
): Promise<string> {
  const processor = remark()
    .use(remarkRehype)
    .use(rehypeStringify);

  const vfile = await processor.process(markdownContent);
  return String(vfile);
}

/**
 * Markdown を処理済みコンテンツに変換
 * 画像参照を抽出し、HTMLに変換
 *
 * @param markdownContent Markdown コンテンツ
 * @param images 画像参照リスト（アップロード済み）
 * @returns 処理済みコンテンツ
 */
export async function processMarkdownContent(
  markdownContent: string,
  images: Array<{ originalPath: string; uploadedUrl?: string; uploadedMediaId?: string }> = [],
): Promise<ProcessedMarkdownContent> {
  // 画像URLをマッピング
  let htmlContent = markdownContent;
  const mediaIds: string[] = [];

  for (const image of images) {
    if (image.uploadedUrl) {
      // 元のパスをアップロード後のURLに置換
      const imageMarkdown = new RegExp(
        `!\\[([^\\]]*)\\]\\(${escapeRegExp(image.originalPath)}\\)`,
        'g',
      );
      htmlContent = htmlContent.replace(
        imageMarkdown,
        `![$1](${image.uploadedUrl})`,
      );
    }
    if (image.uploadedMediaId) {
      mediaIds.push(image.uploadedMediaId);
    }
  }

  // Markdown を HTML に変換
  const htmlBody = await convertMarkdownToHtml(htmlContent);

  // 画像参照を ImageReference 型に変換
  const imageReferences: ImageReference[] = images.map((img) => ({
    originalPath: img.originalPath,
    absolutePath: img.originalPath,
    mimeType: 'image/unknown',
    size: 0,
    uploadedMediaId: img.uploadedMediaId,
    uploadedUrl: img.uploadedUrl,
  }));

  return {
    htmlBody,
    images: imageReferences,
    mediaIds,
  };
}

/**
 * 正規表現用の特殊文字をエスケープ
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * HTML をNote用にサニタイズ・最適化
 * 不要なタグ・スタイルを削除し、Note互換性を確保
 *
 * @param html HTML コンテンツ
 * @returns 最適化されたHTML
 */
export function sanitizeHtmlForNote(html: string): string {
  // Note が対応していないタグを削除
  let sanitized = html;

  // スクリプトタグを完全に削除
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // スタイルタグを完全に削除
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // on* イベントハンドラーを削除
  sanitized = sanitized.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*'[^']*'/gi, '');

  // 危険な属性を削除
  const dangerousAttrs = ['datauri', 'vbscript:', 'javascript:'];
  for (const attr of dangerousAttrs) {
    const regex = new RegExp(attr, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  return sanitized.trim();
}

/**
 * Note用のHTML形式を検証
 */
export function validateNoteHtml(html: string): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // スクリプト検出
  if (/<script/i.test(html)) {
    warnings.push('HTML contains <script> tags (will be stripped)');
  }

  // 危険なイベントハンドラー検出
  if (/\son\w+\s*=/i.test(html)) {
    warnings.push('HTML contains event handlers (will be removed)');
  }

  // サイズチェック（Note APIの制限を想定）
  if (html.length > 1000000) {
    // 1MB以上
    warnings.push('HTML content is very large (>1MB)');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
