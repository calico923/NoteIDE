/**
 * 認証情報ストア
 * OS Keychain（優先）と環境変数（フォールバック）を管理
 */

import * as keychain from './keychain';
import type { EnvironmentAuthCredentials } from '@shared/types';

/**
 * 認証情報の取得（Keychain優先、環境変数フォールバック）
 * @returns メールアドレスとパスワード、またはnull
 */
export async function getAuthCredentials(): Promise<{
  email: string;
  password: string;
} | null> {
  // 1. キーチェーンから取得を試みる
  try {
    const keychainCreds = await keychain.getCredentials();
    if (keychainCreds) {
      return keychainCreds;
    }
  } catch (error) {
    console.warn('Failed to read from keychain, falling back to env vars:', error);
  }

  // 2. 環境変数からフォールバック
  const envCreds = getEnvironmentCredentials();
  if (envCreds?.NOTE_EMAIL && envCreds?.NOTE_PASSWORD) {
    return {
      email: envCreds.NOTE_EMAIL,
      password: envCreds.NOTE_PASSWORD,
    };
  }

  return null;
}

/**
 * 認証情報を保存
 * キーチェーンに優先的に保存し、失敗時はエラーをスロー
 * @param email Note のメールアドレス
 * @param password Note のパスワード
 */
export async function saveAuthCredentials(
  email: string,
  password: string,
): Promise<void> {
  try {
    await keychain.saveCredentials(email, password);
  } catch (error) {
    throw new Error(`Failed to save authentication credentials: ${error}`);
  }
}

/**
 * 認証情報を削除
 * @returns 削除成功時 true
 */
export async function deleteAuthCredentials(): Promise<void> {
  try {
    await keychain.deleteCredentials();
  } catch (error) {
    console.warn('Failed to delete credentials from keychain:', error);
    // Keychainからの削除失敗は警告のみ（環境変数の削除は別途対応）
  }
}

/**
 * 認証情報が存在するか確認
 * @returns 認証情報が存在する場合 true
 */
export async function hasAuthCredentials(): Promise<boolean> {
  // キーチェーンをチェック
  try {
    const hasKeychainCreds = await keychain.hasCredentials();
    if (hasKeychainCreds) {
      return true;
    }
  } catch {
    // 継続
  }

  // 環境変数をチェック
  const envCreds = getEnvironmentCredentials();
  return !!(envCreds?.NOTE_EMAIL && envCreds?.NOTE_PASSWORD);
}

/**
 * 環境変数から認証情報を取得
 * @returns 環境変数から読み込んだ認証情報
 */
function getEnvironmentCredentials(): EnvironmentAuthCredentials {
  return {
    NOTE_EMAIL: process.env.NOTE_EMAIL,
    NOTE_PASSWORD: process.env.NOTE_PASSWORD,
    NOTE_USER_ID: process.env.NOTE_USER_ID,
  };
}

/**
 * .env ファイルから環境変数を読み込む
 * 開発環境やローカルテスト用
 */
export function loadDotEnv(): void {
  try {
    // dotenvをdynamic importで読み込み
    // ESM対応のため
    import('dotenv').then((dotenv) => {
      dotenv.config();
    });
  } catch {
    console.warn('dotenv not available or failed to load');
  }
}
