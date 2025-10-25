/**
 * Note API関連の型定義
 * Note.com非公式API通信で使用するデータ型
 */

/**
 * Note API レスポンス（テキスト記事作成）
 */
export interface NoteApiTextNotesResponse {
  id: string;
  userId: string;
  title: string;
  body: string;
  htmlBody: string;
  mediaIds: string[];
  status: 'draft' | 'published';
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Note API レスポンス（画像アップロード）
 */
export interface NoteApiUploadImageResponse {
  mediaId: string;
  url: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Note API エラーレスポンス
 */
export interface NoteApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Note API リクエスト（テキスト記事作成）
 */
export interface NoteApiCreateTextNoteRequest {
  title: string;
  body: string;
  mediaIds?: string[];
}

/**
 * Note API リクエスト（テキスト記事更新）
 */
export interface NoteApiUpdateTextNoteRequest {
  title?: string;
  body?: string;
  mediaIds?: string[];
}

/**
 * Note API クライアント設定
 */
export interface NoteApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  rateLimitRequestsPerMinute?: number;
}

/**
 * Cookie認証情報
 */
export interface NoteCookieAuth {
  cookies: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }>;
  expiresAt: number;
}

/**
 * ユーザー情報（認証後）
 */
export interface NoteUserInfo {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
}
