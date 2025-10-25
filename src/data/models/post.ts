/**
 * Post データモデル
 * Repository Pattern で使用するデータモデル
 */

import type { PostHistoryRecord } from '@shared/types';

/**
 * Post エンティティ
 * 投稿記録を表す
 */
export class Post {
  id: string;
  title: string;
  sourceFileName: string;
  sourceFilePath: string;
  postedAt: string;
  noteUrl?: string;
  status: 'draft' | 'published';
  mediaIds?: string[];

  constructor(record: PostHistoryRecord) {
    this.id = record.id;
    this.title = record.title;
    this.sourceFileName = record.sourceFileName;
    this.sourceFilePath = record.sourceFilePath;
    this.postedAt = record.postedAt;
    this.noteUrl = record.noteUrl;
    this.status = record.status;
    this.mediaIds = record.mediaIds;
  }

  /**
   * Post をレコードに変換
   */
  toRecord(): PostHistoryRecord {
    return {
      id: this.id,
      title: this.title,
      sourceFileName: this.sourceFileName,
      sourceFilePath: this.sourceFilePath,
      postedAt: this.postedAt,
      noteUrl: this.noteUrl,
      status: this.status,
      mediaIds: this.mediaIds,
    };
  }

  /**
   * 投稿日時を Date オブジェクトで取得
   */
  getPostedDate(): Date {
    return new Date(this.postedAt);
  }

  /**
   * 投稿から経過した時間（ミリ秒）
   */
  getElapsedTime(): number {
    return Date.now() - this.getPostedDate().getTime();
  }
}
