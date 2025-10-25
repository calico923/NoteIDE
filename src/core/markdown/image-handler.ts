/**
 * 画像ハンドラー
 * Markdown内の画像参照を検出・処理
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { ImageReference } from '@shared/types';

// サポートされるMIME タイプ
const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// 最大ファイルサイズ（10MB）
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Markdownコンテンツから画像参照を検出
 * Markdown 画像構文: ![alt](path) をすべて検出
 *
 * @param markdownContent Markdown コンテンツ
 * @param basePath 相対パスを解決するためのベースパス
 * @returns 検出された画像参照リスト
 */
export async function detectImages(
  markdownContent: string,
  basePath: string,
): Promise<ImageReference[]> {
  // Markdown 画像構文: ![alt](path)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: ImageReference[] = [];

  let match: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: 正規表現マッチ処理で必要
  while ((match = imageRegex.exec(markdownContent)) !== null) {
    const imagePath = match[2];

    // URL （http://や https://）は対象外
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      continue;
    }

    // ローカルファイルパスを絶対パスに変換
    const absolutePath = path.resolve(basePath, imagePath);

    try {
      // ファイル情報を取得
      const stats = await fs.stat(absolutePath);

      if (!stats.isFile()) {
        console.warn(`Skipping non-file image path: ${absolutePath}`);
        continue;
      }

      if (stats.size > MAX_IMAGE_SIZE) {
        console.warn(
          `Skipping oversized image (${stats.size} bytes > ${MAX_IMAGE_SIZE} bytes): ${absolutePath}`,
        );
        continue;
      }

      // MIME タイプを判定
      const mimeType = getMimeType(absolutePath);
      if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
        console.warn(
          `Unsupported image MIME type (${mimeType}): ${absolutePath}`,
        );
        continue;
      }

      images.push({
        originalPath: imagePath,
        absolutePath,
        mimeType,
        size: stats.size,
      });
    } catch (error) {
      console.warn(`Failed to read image file: ${absolutePath}`, error);
    }
  }

  return images;
}

/**
 * ファイルパスからMIME タイプを推定
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };

  return mimeTypeMap[ext] || 'application/octet-stream';
}

/**
 * ファイルを読み込んでバイナリバッファを取得
 */
export async function readImageFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

/**
 * 画像ファイルを検証
 */
export async function validateImageFile(
  filePath: string,
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    const stats = await fs.stat(filePath);

    if (!stats.isFile()) {
      errors.push('Not a file');
    }

    if (stats.size === 0) {
      errors.push('File is empty');
    }

    if (stats.size > MAX_IMAGE_SIZE) {
      errors.push(
        `File size (${stats.size} bytes) exceeds maximum (${MAX_IMAGE_SIZE} bytes)`,
      );
    }

    const mimeType = getMimeType(filePath);
    if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
      errors.push(`Unsupported MIME type: ${mimeType}`);
    }
  } catch (error) {
    errors.push(`Failed to read file: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Markdownコンテンツ内の画像パスを置換
 * アップロード後のメディアIDやURLに置き換える
 */
export function replaceImageReferences(
  markdownContent: string,
  imageMap: Map<string, string>,
): string {
  let updated = markdownContent;

  // 元のパスをアップロード後のURLに置換
  for (const [originalPath, uploadedUrl] of imageMap.entries()) {
    const imageRegex = new RegExp(
      `!\\[([^\\]]*)\\]\\(${escapeRegExp(originalPath)}\\)`,
      'g',
    );
    updated = updated.replace(imageRegex, `![$1](${uploadedUrl})`);
  }

  return updated;
}

/**
 * 正規表現用の特殊文字をエスケープ
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
