/**
 * Note API 認証（Puppeteer使用）
 * Note.com にPuppeteerでログインしてCookieを取得
 */

import puppeteer, { type Browser, type Page } from 'puppeteer';
import type { NoteCookieAuth } from '@shared/types';

const NOTE_LOGIN_URL = 'https://note.com/login';
const NOTE_HOME_URL = 'https://note.com';

/**
 * Note.com に Puppeteer でログイン
 * @param email メールアドレス
 * @param password パスワード
 * @param headless ブラウザをヘッドレスモードで起動するか（デフォルト: "new"）
 * @returns Cookie認証情報
 * @throws Error ログイン失敗時
 */
export async function loginWithPuppeteer(
  email: string,
  password: string,
  headless: boolean | "new" = "new",
): Promise<NoteCookieAuth> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // ブラウザを起動
    browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    // タイムアウト設定（30秒）
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // ログインページにアクセス
    console.log('Navigating to Note login page...');
    await page.goto(NOTE_LOGIN_URL, { waitUntil: 'networkidle2' });

    // メールアドレスを入力
    console.log('Entering email...');
    await page.type('input[type="email"]', email, { delay: 100 });

    // パスワードを入力
    console.log('Entering password...');
    await page.type('input[type="password"]', password, { delay: 100 });

    // ログインボタンをクリック
    console.log('Clicking login button...');
    const loginButtonSelector = 'button[type="submit"]';
    await page.click(loginButtonSelector);

    // ホームページにリダイレクトされるまで待機
    console.log('Waiting for redirect to home page...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {
      // ナビゲーションがない場合もある（既にホームページ表示済み）
    });

    // ページがNote.comであることを確認
    const currentUrl = page.url();
    if (!currentUrl.includes('note.com')) {
      throw new Error(
        `Login failed: redirected to unexpected URL: ${currentUrl}`,
      );
    }

    console.log('Login successful!');

    // Cookieを取得
    const cookies = await page.cookies();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24時間後

    const cookieAuth: NoteCookieAuth = {
      cookies: cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as 'Strict' | 'Lax' | 'None' | undefined,
      })),
      expiresAt,
    };

    return cookieAuth;
  } catch (error) {
    throw new Error(`Puppeteer login failed: ${error}`);
  } finally {
    // ブラウザを閉じる
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Cookie認証情報の有効期限を確認
 * @param cookieAuth Cookie認証情報
 * @returns 有効期限内の場合 true
 */
export function isCookieAuthValid(cookieAuth: NoteCookieAuth): boolean {
  return cookieAuth.expiresAt > Date.now();
}

/**
 * Cookieを取得できるまで再ログインを試みる（ユーザーインタラクティブ）
 * ブラウザを表示した状態でユーザーに手動ログインさせる方法
 * @param timeout タイムアウト（ミリ秒）
 * @returns Cookie認証情報
 * @throws Error タイムアウトまたはログイン失敗時
 */
export async function loginInteractive(
  timeout = 120000,
): Promise<NoteCookieAuth> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // ブラウザを起動（headless=false でUIを表示）
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();
    page.setDefaultTimeout(timeout);

    // Note のホームページを開く
    console.log('Opening Note.com... Please login in the browser');
    await page.goto(NOTE_HOME_URL);

    // ログイン完了を待つ（Cookie が設定されるまで）
    // setIntervalで1秒ごとにCookieをチェック
    const startTime = Date.now();
    let cookieAuth: NoteCookieAuth | null = null;

    while (Date.now() - startTime < timeout) {
      const cookies = await page.cookies();
      const sessionCookie = cookies.find((c) => c.name.includes('session') || c.name.includes('auth'));

      if (sessionCookie) {
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        cookieAuth = {
          cookies: cookies.map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path,
            expires: cookie.expires,
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite as 'Strict' | 'Lax' | 'None' | undefined,
          })),
          expiresAt,
        };
        console.log('Login successful!');
        break;
      }

      // 1秒待機
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!cookieAuth) {
      throw new Error(`Login timeout after ${timeout}ms`);
    }

    return cookieAuth;
  } catch (error) {
    throw new Error(`Interactive login failed: ${error}`);
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}
