/**
 * Post History Repository
 * Repository Pattern で投稿履歴を管理
 * Phase 1: JSONファイルベース
 * Phase 2以降: データベース移行可能
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { PostHistoryFile, PostHistoryRecord } from '@shared/types';
import { Post } from '../models/post';

/**
 * Post History Repository インターフェース
 * 将来のDB移行に対応するため抽象化
 */
export interface IPostHistoryRepository {
  findAll(): Promise<Post[]>;
  findById(id: string): Promise<Post | null>;
  save(post: Post): Promise<void>;
  saveMultiple(posts: Post[]): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * Post History Repository (JSON ファイルベース)
 */
export class PostHistoryRepository implements IPostHistoryRepository {
  private filePath: string;
  private dataDir: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.dataDir = dirname(filePath);
  }

  /**
   * すべての投稿履歴を取得
   */
  async findAll(): Promise<Post[]> {
    try {
      const content = await this.readFile();
      return content.records.map((record) => new Post(record));
    } catch (error) {
      // ファイルが存在しない場合は空配列を返す
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        return [];
      }
      throw error;
    }
  }

  /**
   * IDで投稿を検索
   */
  async findById(id: string): Promise<Post | null> {
    const records = await this.findAll();
    const record = records.find((post) => post.id === id);
    return record || null;
  }

  /**
   * 投稿を保存（新規 or 更新）
   */
  async save(post: Post): Promise<void> {
    const records = await this.findAll();

    // 既に存在するなら更新、なければ追加
    const index = records.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      records[index] = post;
    } else {
      records.push(post);
    }

    await this.saveMultiple(records);
  }

  /**
   * 複数の投稿を保存
   */
  async saveMultiple(posts: Post[]): Promise<void> {
    // ディレクトリを作成（存在しない場合）
    await mkdir(this.dataDir, { recursive: true });

    const file: PostHistoryFile = {
      version: '1.0.0',
      records: posts.map((post) => post.toRecord()),
      lastUpdated: new Date().toISOString(),
    };

    const content = JSON.stringify(file, null, 2);
    await writeFile(this.filePath, content, 'utf-8');
  }

  /**
   * IDで投稿を削除
   */
  async delete(id: string): Promise<void> {
    const records = await this.findAll();
    const filtered = records.filter((post) => post.id !== id);
    await this.saveMultiple(filtered);
  }

  /**
   * ファイルを読み込む（プライベートメソッド）
   */
  private async readFile(): Promise<PostHistoryFile> {
    const content = await readFile(this.filePath, 'utf-8');
    const data = JSON.parse(content) as PostHistoryFile;
    return data;
  }

  /**
   * 投稿履歴の統計情報を取得
   */
  async getStats(): Promise<{
    totalPosts: number;
    draftCount: number;
    publishedCount: number;
    lastPostDate?: string;
  }> {
    const posts = await this.findAll();

    return {
      totalPosts: posts.length,
      draftCount: posts.filter((p) => p.status === 'draft').length,
      publishedCount: posts.filter((p) => p.status === 'published').length,
      lastPostDate:
        posts.length > 0
          ? posts.sort(
              (a, b) =>
                new Date(b.postedAt).getTime() -
                new Date(a.postedAt).getTime(),
            )[0]?.postedAt
          : undefined,
    };
  }

  /**
   * ファイルが存在するか確認
   */
  async exists(): Promise<boolean> {
    try {
      await this.readFile();
      return true;
    } catch (error) {
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      ) {
        return false;
      }
      throw error;
    }
  }
}

/**
 * ファイルパスから Repository を作成
 */
export function createPostHistoryRepository(
  filePath: string,
): PostHistoryRepository {
  return new PostHistoryRepository(filePath);
}
