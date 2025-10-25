/**
 * Markdown パーサー
 * gray-matter を使用したFront Matter解析
 * unified/remark を使用したMarkdown処理
 */

import matter from 'gray-matter';
import type { PostFrontMatter, ParsedMarkdownFile } from '@shared/types';

/**
 * Markdownファイルを解析
 * Front Matter を抽出し、本文を分離する
 *
 * @param content ファイルの内容（テキスト）
 * @param filePath ファイルパス（メタデータ用）
 * @param fileName ファイル名
 * @returns パース結果
 */
export function parseMarkdownFile(
  content: string,
  filePath: string,
  fileName: string,
): ParsedMarkdownFile {
  // gray-matter で Front Matter を抽出
  const { data, content: markdownContent } = matter(content);

  // Front Matter の型チェック・正規化
  const frontMatter: PostFrontMatter = {
    title: String(data.title || 'Untitled'),
    description: data.description ? String(data.description) : undefined,
    image: data.image ? String(data.image) : undefined,
    tags: Array.isArray(data.tags)
      ? data.tags.map((tag: unknown) => String(tag))
      : undefined,
  };

  return {
    frontMatter,
    content: markdownContent.trim(),
    filePath,
    fileName,
  };
}

/**
 * Front Matter のバリデーション
 * @param frontMatter Front Matter オブジェクト
 * @returns バリデーション結果
 */
export function validateFrontMatter(frontMatter: PostFrontMatter): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!frontMatter.title || frontMatter.title.trim() === '') {
    errors.push('title is required and cannot be empty');
  }

  if (frontMatter.title && frontMatter.title.length > 200) {
    errors.push('title must be less than 200 characters');
  }

  if (frontMatter.description && frontMatter.description.length > 500) {
    errors.push('description must be less than 500 characters');
  }

  if (frontMatter.tags) {
    if (!Array.isArray(frontMatter.tags)) {
      errors.push('tags must be an array');
    } else if (frontMatter.tags.length > 10) {
      errors.push('tags must have 10 or fewer items');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Markdown ファイルを文字列から解析（ファイルパスなしの簡易版）
 */
export function parseMarkdownContent(content: string): ParsedMarkdownFile {
  return parseMarkdownFile(content, '', 'unknown.md');
}
