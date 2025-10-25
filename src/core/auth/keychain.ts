/**
 * OS Keychainラッパー
 * keytar ライブラリを使用してセキュアに認証情報を保存・取得
 */

import keytar from 'keytar';

const SERVICE_NAME = 'NoteIDE';
const ACCOUNT_NAME = 'note-credentials';

/**
 * キーチェーンに認証情報を保存
 * @param email Note のメールアドレス
 * @param password Note のパスワード
 * @throws Error キーチェーンへの保存に失敗した場合
 */
export async function saveCredentials(
  email: string,
  password: string,
): Promise<void> {
  try {
    // 前の認証情報があれば削除
    try {
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch {
      // 削除対象がない場合はスルー
    }

    // メールアドレスとパスワードをJSON形式で保存
    const credentials = JSON.stringify({ email, password });
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, credentials);
  } catch (error) {
    throw new Error(`Failed to save credentials to keychain: ${error}`);
  }
}

/**
 * キーチェーンから認証情報を取得
 * @returns メールアドレスとパスワードのオブジェクト、または null
 */
export async function getCredentials(): Promise<{
  email: string;
  password: string;
} | null> {
  try {
    const credentials = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    if (!credentials) {
      return null;
    }
    return JSON.parse(credentials) as { email: string; password: string };
  } catch (error) {
    throw new Error(`Failed to retrieve credentials from keychain: ${error}`);
  }
}

/**
 * キーチェーンから認証情報を削除
 * @throws Error 削除に失敗した場合
 */
export async function deleteCredentials(): Promise<void> {
  try {
    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  } catch (error) {
    throw new Error(`Failed to delete credentials from keychain: ${error}`);
  }
}

/**
 * キーチェーンに認証情報が保存されているか確認
 * @returns 認証情報が存在する場合 true
 */
export async function hasCredentials(): Promise<boolean> {
  try {
    const credentials = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    return !!credentials;
  } catch {
    return false;
  }
}
