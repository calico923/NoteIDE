# NoteIDE

Note記事の自動投稿CLIツール + Web UI（計画中）

## 📚 Documentation

- **[docs/mvp-requirement.md](./docs/mvp-requirement.md)** - **Phase 1（MVP）実装時はこちらを参照** ⭐
  - CLI機能のみ（TypeScript/Node.js）
  - 実装計画（5ステップ、1週間）
- **[docs/requirement.md](./docs/requirement.md)** - 全体設計書（Phase 1-3）
  - Phase 2: Web UI（Next.js + React）
  - Phase 3: 分析機能（データ可視化）
- **[CLAUDE.md](./CLAUDE.md)** - プロジェクト設定

## 🎯 Features

### Phase 1 (MVP - 開発中)
- ✅ CLI: `noteide post article.md` でMarkdownから投稿
- ✅ 認証: OS Keychain統合（自動ログイン）
- ✅ 画像: 自動アップロード
- ✅ 履歴: JSON保存

### Phase 2 (計画中)
- Web UI: 投稿管理ダッシュボード
- エディタ: Markdown編集とリアルタイムプレビュー
- エクスポート: Markdownファイル出力

### Phase 3 (計画中)
- 分析: パフォーマンス推移グラフ
- トレンド: キーワード分析
- データ: CSV/JSONエクスポート

## 🛠️ Tech Stack

- **TypeScript/Node.js 20 LTS**
- **Commander.js** - CLI
- **keytar** - OS Keychain
- **Puppeteer** - Note認証
- **unified/remark/rehype** - Markdown処理

## 📖 Getting Started

詳細は **[docs/mvp-requirement.md](./docs/mvp-requirement.md)** を参照してください。
