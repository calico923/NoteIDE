/**
 * Note API クライアント
 * Note.com API への HTTP リクエストを管理
 */

import type {
  NoteApiTextNotesResponse,
  NoteApiUploadImageResponse,
  NoteApiCreateTextNoteRequest,
  NoteApiUpdateTextNoteRequest,
  NoteApiClientConfig,
  NoteCookieAuth,
} from '@shared/types';

/**
 * Note API クライアント
 * レート制限、リトライ、エラーハンドリングを含む
 */
export class NoteApiClient {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private cookieAuth: NoteCookieAuth | null = null;
  private requestTimestamps: number[] = []; // レート制限用
  private rateLimitRequestsPerMinute: number;

  constructor(config: NoteApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'https://note.com';
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelayMs = config.retryDelayMs || 1000;
    this.rateLimitRequestsPerMinute = config.rateLimitRequestsPerMinute || 10;
  }

  /**
   * Cookie認証情報を設定
   */
  setCookieAuth(cookieAuth: NoteCookieAuth): void {
    this.cookieAuth = cookieAuth;
  }

  /**
   * Cookie文字列を生成
   */
  private getCookieString(): string {
    if (!this.cookieAuth) {
      throw new Error('Cookie auth not set. Please call setCookieAuth first.');
    }
    return this.cookieAuth.cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
  }

  /**
   * レート制限をチェック
   * @throws Error レート制限に達している場合
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // 1分以内のリクエストをフィルタ
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    );

    // レート制限チェック
    if (this.requestTimestamps.length >= this.rateLimitRequestsPerMinute) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = oldestRequest + 60000 - now;
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
      );
    }

    // リクエストタイムスタンプを記録
    this.requestTimestamps.push(now);
  }

  /**
   * リトライロジック付きでHTTPリクエストを実行
   */
  private async requestWithRetry(
    url: string,
    options: RequestInit,
    retryCount = 0,
  ): Promise<Response> {
    try {
      // レート制限をチェック
      await this.checkRateLimit();

      // タイムアウト設定
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // 成功時は即座に返す
        if (response.ok) {
          return response;
        }

        // 4xx エラーはリトライしない
        if (response.status >= 400 && response.status < 500) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}\nURL: ${url}`,
          );
        }

        // 5xx エラーはリトライ
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}\nURL: ${url}`,
        );
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      // リトライ判定
      if (retryCount < this.maxRetries) {
        const waitTime = this.retryDelayMs * (2 ** retryCount); // 指数バックオフ
        console.warn(
          `Request failed (attempt ${retryCount + 1}/${this.maxRetries + 1}), retrying in ${waitTime}ms...`,
          error,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.requestWithRetry(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * テキスト記事を作成（POST /api/v1/text_notes）
   */
  async createTextNote(
    request: NoteApiCreateTextNoteRequest,
  ): Promise<NoteApiTextNotesResponse> {
    const url = `${this.baseUrl}/api/v1/text_notes`;
    const response = await this.requestWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.getCookieString(),
        'User-Agent': 'Mozilla/5.0 (NoteIDE/1.0)',
      },
      body: JSON.stringify(request),
    });

    const data = (await response.json()) as NoteApiTextNotesResponse;
    return data;
  }

  /**
   * テキスト記事を更新（PUT /api/v1/text_notes/{id}）
   */
  async updateTextNote(
    id: string,
    request: NoteApiUpdateTextNoteRequest,
  ): Promise<NoteApiTextNotesResponse> {
    const url = `${this.baseUrl}/api/v1/text_notes/${id}`;
    const response = await this.requestWithRetry(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.getCookieString(),
        'User-Agent': 'Mozilla/5.0 (NoteIDE/1.0)',
      },
      body: JSON.stringify(request),
    });

    const data = (await response.json()) as NoteApiTextNotesResponse;
    return data;
  }

  /**
   * 画像をアップロード（POST /api/v1/upload_image）
   * @param imageBuffer 画像バイナリ
   * @param fileName ファイル名
   * @param mimeType MIME type
   */
  async uploadImage(
    imageBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<NoteApiUploadImageResponse> {
    const url = `${this.baseUrl}/api/v1/upload_image`;
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append('file', blob, fileName);

    const response = await this.requestWithRetry(url, {
      method: 'POST',
      headers: {
        Cookie: this.getCookieString(),
        'User-Agent': 'Mozilla/5.0 (NoteIDE/1.0)',
      },
      body: formData,
    });

    const data = (await response.json()) as NoteApiUploadImageResponse;
    return data;
  }

  /**
   * リクエスト履歴を取得（デバッグ用）
   */
  getRequestStats(): {
    requestsInLastMinute: number;
    rateLimitRemaining: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const requestsInLastMinute = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    ).length;

    return {
      requestsInLastMinute,
      rateLimitRemaining: Math.max(
        0,
        this.rateLimitRequestsPerMinute - requestsInLastMinute,
      ),
    };
  }
}
