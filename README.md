# NoteIDE

Note記事の自動投稿CLIツール + Web UI（計画中）

**Phase 1 (MVP)** ✅ 完成 - CLIツールが利用可能です！

## ✨ 主な機能

- 📝 **Markdownファイルから直接投稿** - `noteide post article.md` で完了
- 🔐 **自動認証** - OS Keychainで認証情報を安全に保存
- 🖼️ **画像自動処理** - Markdown内の画像を自動検出・アップロード
- 📊 **投稿履歴管理** - 投稿したすべての記事を履歴として記録
- ⚙️ **設定管理** - `noteide config` で各種設定の確認・変更

## 🚀 クイックスタート

### 1. インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/NoteIDE.git
cd NoteIDE

# 依存関係をインストール
pnpm install

# ビルド（本番利用の場合）
pnpm run build
```

### 2. Note.comにログイン

```bash
# 開発モード
pnpm run dev login

# または本番ビルド後
node dist/cli/main.js login
```

**インタラクティブにメールアドレスとパスワードを入力:**
```
Email: your-email@example.com
Password: ********
```

認証情報はOS Keychainに安全に保存され、次回以降は自動的に使用されます。

### 3. Markdownファイルを作成

**example.md:**
```markdown
---
title: "はじめてのNote投稿"
description: "NoteIDEを使った投稿のテスト記事"
tags: ["技術", "CLI", "自動化"]
status: published
---

# はじめに

NoteIDEを使えば、Markdownファイルから直接Note.comに投稿できます。

## 画像の埋め込み

相対パスで画像を指定できます：

![サンプル画像](./images/sample.png)

画像は自動的にアップロードされ、URLが置き換えられます。
```

**Front Matter 必須フィールド:**
- `title` (string) - 記事タイトル
- `description` (string) - 記事の説明
- `tags` (string[]) - タグの配列
- `status` ('draft' | 'published') - 公開ステータス

### 4. 記事を投稿

```bash
# 開発モード
pnpm run dev post example.md

# または本番ビルド後
node dist/cli/main.js post example.md
```

**実行例:**
```
✅ Markdown file parsed successfully
✅ Found 1 images
✅ Image uploaded: sample.png
✅ Markdown converted to HTML
✅ Article posted successfully!

📊 Post Statistics:
   Title: はじめてのNote投稿
   Status: published
   Images: 1
   Note URL: https://note.com/your-username/n/abc123xyz

✅ Post saved to history
```

## 📖 コマンドリファレンス

### `noteide login`

Note.comにログインし、認証情報を保存します。

```bash
noteide login [オプション]
```

**オプション:**
- `--no-save` - Keychainに保存せず、環境変数のみ使用

**例:**
```bash
# 通常のログイン（Keychainに保存）
noteide login

# 保存せずにログイン（CI/CD環境向け）
noteide login --no-save
```

### `noteide post`

Markdownファイルを読み込み、Note.comに投稿します。

```bash
noteide post <file> [オプション]
```

**引数:**
- `<file>` - 投稿するMarkdownファイルのパス

**オプション:**
- `--dry-run` - 実際に投稿せず、処理内容のみ表示

**例:**
```bash
# 記事を投稿
noteide post article.md

# ドライラン（投稿せずに検証）
noteide post article.md --dry-run
```

### `noteide config`

アプリケーションの設定を管理します。

```bash
noteide config [オプション]
```

**オプション:**
- `--list` - すべての設定を表示
- `--get <key>` - 特定の設定値を取得
- `--set <key=value>` - 設定値を変更
- `--reset` - すべての設定をデフォルトに戻す

**例:**
```bash
# すべての設定を表示
noteide config --list

# 特定の設定を取得
noteide config --get api.timeout

# 設定を変更（ネストされたキーに対応）
noteide config --set api.timeout=10000

# デフォルトに戻す
noteide config --reset
```

## 📁 ディレクトリ構造

```
NoteIDE/
├── src/                    # ソースコード
│   ├── cli/               # CLIコマンド
│   ├── core/              # コアロジック
│   │   ├── auth/         # 認証管理
│   │   ├── markdown/     # Markdown処理
│   │   └── note-api/     # API通信
│   ├── data/              # データ層
│   │   ├── models/       # エンティティモデル
│   │   └── repositories/ # リポジトリ実装
│   └── shared/            # 共通型定義
├── data/                   # データ保存先（.gitignore）
│   └── post-history.json  # 投稿履歴
├── docs/                   # ドキュメント
├── test-article.md         # テスト用記事
└── README.md              # このファイル
```

## 🛠️ 技術スタック

### Phase 1 (MVP - 完成)
- **TypeScript 5.3** - 型安全な開発
- **Node.js 20 LTS** - ランタイム
- **Commander.js** - CLI構築
- **keytar** - OS Keychain統合
- **Puppeteer** - Note認証
- **unified/remark/rehype** - Markdown処理
- **Biome** - リンター・フォーマッター
- **pnpm** - パッケージマネージャ

### Phase 2 (計画中)
- Next.js 14 + React 18
- tRPC（型安全なAPI通信）
- Tailwind CSS + Shadcn/ui
- SQLite（データベース）

## 🔧 開発者向け

### セットアップ

```bash
# 依存関係インストール
pnpm install

# 開発モード（ホットリロード）
pnpm run dev --help

# 型チェック
pnpm run type-check

# リント
pnpm run lint

# フォーマット
pnpm run format

# ビルド
pnpm run build
```

### 品質保証

```bash
# すべてのチェックを実行
pnpm run type-check && pnpm run lint && pnpm run build
```

## 🔐 セキュリティ

- **認証情報**: OS Keychain（macOS Keychain、Windows Credential Manager、Linux Secret Service）に保存
- **環境変数フォールバック**: Keychain利用不可の場合、`.env` ファイルから読み込み
- **機密情報の除外**: `/data/` ディレクトリは `.gitignore` で除外

## ⚠️ トラブルシューティング

### Keychainへのアクセスが拒否される

```bash
# macOSの場合、Keychainアクセスを許可してください
# システム設定 > プライバシーとセキュリティ > キーチェーンアクセス
```

### Puppeteerのブラウザが起動しない

```bash
# Chromiumが正しくインストールされているか確認
npx puppeteer browsers install chrome
```

### 認証情報をリセットしたい

```bash
# Keychainから削除（手動）
# macOS: キーチェーンアクセスアプリで "NoteIDE" を検索して削除

# または再度ログイン
noteide login
```

## 📚 ドキュメント

- **[docs/mvp-requirement.md](./docs/mvp-requirement.md)** - Phase 1（MVP）実装計画
- **[docs/requirement.md](./docs/requirement.md)** - 全体設計書（Phase 1-3）
- **[PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)** - Phase 1完了サマリー
- **[CLAUDE.md](./CLAUDE.md)** - プロジェクト設定

## 🗺️ ロードマップ

### Phase 1 (MVP - 完成) ✅
- ✅ CLI: `noteide post article.md` でMarkdownから投稿
- ✅ 認証: OS Keychain統合（自動ログイン）
- ✅ 画像: 自動アップロード
- ✅ 履歴: JSON保存
- ✅ 設定管理: `noteide config` コマンド

### Phase 2 (計画中)
- Web UI: 投稿管理ダッシュボード
- エディタ: Markdown編集とリアルタイムプレビュー
- エクスポート: Markdownファイル出力
- データベース: SQLite移行

### Phase 3 (計画中)
- 分析: パフォーマンス推移グラフ
- トレンド: キーワード分析
- データ: CSV/JSONエクスポート

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issue や Pull Request を歓迎します！
