/**
 * ポスト（記事）関連の型定義
 * Markdownファイルから抽出されるメタデータと投稿データ
 */

/**
 * Markdownファイルのメタデータ（Front Matter）
 */
export interface PostFrontMatter {
  title: string;
  description?: string;
  image?: string; // サムネイル画像パス
  tags?: string[];
  [key: string]: unknown; // その他のカスタムメタデータ
}

/**
 * パースされたMarkdownファイル全体
 */
export interface ParsedMarkdownFile {
  frontMatter: PostFrontMatter;
  content: string; // Markdown形式の本文
  filePath: string; // 元のファイルパス
  fileName: string; // ファイル名
}

/**
 * 画像参照情報
 */
export interface ImageReference {
  originalPath: string; // Markdown内の相対パス
  absolutePath: string; // 絶対パス（解決済み）
  mimeType: string; // MIME type
  size: number; // ファイルサイズ（バイト）
  uploadedMediaId?: string; // アップロード後のMedia ID
  uploadedUrl?: string; // アップロード後のURL
}

/**
 * 処理済みMarkdownコンテンツ
 */
export interface ProcessedMarkdownContent {
  htmlBody: string; // Note用HTML形式
  images: ImageReference[]; // 検出された画像リスト
  mediaIds: string[]; // アップロード済み画像のMedia ID一覧
}

/**
 * Note APIに送信するポストデータ
 */
export interface PostDataForNoteApi {
  title: string;
  body: string; // Note用HTML形式
  mediaIds?: string[];
}

/**
 * 投稿履歴レコード
 */
export interface PostHistoryRecord {
  id: string; // 投稿ID（Note API response の id）
  title: string;
  sourceFileName: string; // 元のMarkdownファイル名
  sourceFilePath: string; // 元のMarkdownファイルパス
  postedAt: string; // ISO 8601形式のタイムスタンプ
  noteUrl?: string; // Note上の記事URL
  status: 'draft' | 'published'; // 投稿ステータス
  mediaIds?: string[]; // アップロードされた画像ID一覧
}

/**
 * 投稿履歴ファイルのスキーマ
 */
export interface PostHistoryFile {
  version: string; // ファイルフォーマットバージョン
  records: PostHistoryRecord[];
  lastUpdated: string; // ISO 8601形式のタイムスタンプ
}

/**
 * ポスト投稿結果
 */
export interface PostingResult {
  success: boolean;
  postId?: string; // 成功時の投稿ID
  noteUrl?: string; // 成功時のNote上のURL
  message: string; // 結果メッセージ
  error?: Error; // エラー情報
}
