/**
 * 共通型定義の一元化
 * すべての型定義をエクスポート
 */

// Note API 関連
export type {
  NoteApiTextNotesResponse,
  NoteApiUploadImageResponse,
  NoteApiErrorResponse,
  NoteApiCreateTextNoteRequest,
  NoteApiUpdateTextNoteRequest,
  NoteApiClientConfig,
  NoteCookieAuth,
  NoteUserInfo,
} from './note';

// ポスト（記事）関連
export type {
  PostFrontMatter,
  ParsedMarkdownFile,
  ImageReference,
  ProcessedMarkdownContent,
  PostDataForNoteApi,
  PostHistoryRecord,
  PostHistoryFile,
  PostingResult,
} from './post';

// 設定関連
export type {
  AppConfig,
  UserConfig,
  ApiConfig,
  StorageConfig,
  EnvironmentAuthCredentials,
  CliOptions,
  PostCommandOptions,
  LoginCommandOptions,
  ConfigCommandOptions,
  CliContext,
} from './config';

export { DEFAULT_CONFIG } from './config';
