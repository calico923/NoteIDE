# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

**NoteIDE** - Note記事の自動投稿CLIツール + Web UI（計画中）

**現在のフェーズ**: 要件定義完了、Phase 1（MVP - CLI実装）開始準備中

## Documentation Structure

### 要件定義書
- **[docs/mvp-requirement.md](./docs/mvp-requirement.md)** - **Phase 1（MVP）実装時はこちらを参照** ⭐
  - CLI機能のみ（TypeScript/Node.js）
  - 実装計画（5ステップ、1週間）
  - 成功基準
- **[docs/requirement.md](./docs/requirement.md)** - 全体設計書（Phase 1-3）
  - Phase 2: Web UI（Next.js + React）
  - Phase 3: 分析機能（データ可視化）
  - 長期ロードマップ

### その他のドキュメント
- **[docs/](./docs/)** - Obsidian vaultへのシンボリックリンク
  - Note API仕様
  - 技術調査資料

## Technology Stack

### Phase 1 (MVP - CLI)
- **TypeScript/Node.js 20 LTS** - ランタイム
- **Commander.js** - CLI構築
- **keytar** - OS Keychain統合（認証情報の安全な保存）
- **Puppeteer** - Note認証（Cookie取得）
- **unified/remark/rehype** - Markdown処理
- **Zod** - バリデーション・型定義
- **pnpm** - パッケージマネージャ
- **Biome** - リンター・フォーマッター

### Phase 2 (Web UI - 計画中)
- Next.js 14.2 + React 18
- tRPC（型安全なAPI通信）
- Tailwind CSS + Shadcn/ui

## Development Workflow

### Current Status
要件定義完了。次のステップ: Phase 1実装開始

### Next Steps
1. プロジェクトセットアップ（TypeScript + pnpm + Biome）
2. Note API Client実装
3. Markdown処理実装
4. CLI実装
5. データ永続化実装

詳細は **[docs/mvp-requirement.md](./docs/mvp-requirement.md)** を参照。

## Important Conventions

### Security
- 認証情報はOS Keychain（keytar）に保存
- 環境変数（.env）はフォールバック用のみ
- /data/ ディレクトリは .gitignore で除外

### Architecture
- Repository Patternでデータ層を抽象化
- TypeScriptによる型安全性
- 機密情報と非機密情報を明確に分離

### Git Workflow
- startpack/ ディレクトリは参考用（Git除外）
- docs/ はObsidian vaultへのシンボリックリンク
