/**
 * 設定関連の型定義
 * アプリケーション設定、CLI設定、ユーザー設定など
 */

/**
 * アプリケーション設定ファイルのスキーマ
 */
export interface AppConfig {
  version: string;
  user: UserConfig;
  api: ApiConfig;
  storage: StorageConfig;
}

/**
 * ユーザー設定
 */
export interface UserConfig {
  userId?: string; // Note User ID
  userName?: string; // Note ユーザー名
  email?: string; // ログイン用メールアドレス
}

/**
 * API設定
 */
export interface ApiConfig {
  baseUrl: string; // Note API ベースURL
  timeout: number; // リクエストタイムアウト（ms）
  maxRetries: number; // 最大リトライ回数
  retryDelayMs: number; // リトライ間隔（ms）
  rateLimitRequestsPerMinute: number; // レート制限（リクエスト/分）
  maxImageSizeBytes: number; // 最大画像サイズ
}

/**
 * ストレージ設定
 */
export interface StorageConfig {
  dataDir: string; // データディレクトリパス
  historyFileName: string; // 投稿履歴ファイル名
  configFileName: string; // 設定ファイル名
}

/**
 * 環境変数から読み込む認証情報
 */
export interface EnvironmentAuthCredentials {
  NOTE_EMAIL?: string;
  NOTE_PASSWORD?: string;
  NOTE_USER_ID?: string;
}

/**
 * CLI コマンドのオプション
 */
export interface CliOptions {
  verbose?: boolean;
  quiet?: boolean;
  configPath?: string;
  dataDir?: string;
}

/**
 * postコマンドのオプション
 */
export interface PostCommandOptions extends CliOptions {
  filePath: string;
  draft?: boolean; // 下書きとして保存（デフォルト）
  publish?: boolean; // 公開状態で保存（今後実装予定）
}

/**
 * loginコマンドのオプション
 */
export interface LoginCommandOptions extends CliOptions {
  headless?: boolean; // ブラウザをheadlessモードで起動（デフォルトfalse）
  save?: boolean; // 認証情報をOS Keychainに保存（デフォルトtrue）
}

/**
 * configコマンドのオプション
 */
export interface ConfigCommandOptions extends CliOptions {
  set?: string; // キーを設定 (--set key=value)
  get?: string; // キーを取得 (--get key)
  list?: boolean; // すべての設定を表示 (--list)
  reset?: boolean; // デフォルト値にリセット (--reset)
}

/**
 * デフォルト設定値
 */
export const DEFAULT_CONFIG: AppConfig = {
  version: '1.0.0',
  user: {
    userId: undefined,
    userName: undefined,
    email: undefined,
  },
  api: {
    baseUrl: 'https://note.com',
    timeout: 30000,
    maxRetries: 3,
    retryDelayMs: 1000,
    rateLimitRequestsPerMinute: 10,
    maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
  },
  storage: {
    dataDir: './data',
    historyFileName: 'history.json',
    configFileName: 'config.json',
  },
};

/**
 * CLI実行時のコンテキスト
 */
export interface CliContext {
  config: AppConfig;
  cliOptions: CliOptions;
  workingDir: string;
  isDevelopment: boolean;
}
