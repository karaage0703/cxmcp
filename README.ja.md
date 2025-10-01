# cxmcp - Codex MCP Control Panel

🔧 Codex CLI用のインタラクティブなMCPサーバー管理ツール

[English](./README.md) | 日本語

## 機能

- **📋 MCPサーバー一覧表示** - 設定済みのMCPサーバーを表示
- **🔄 サーバー切り替え** - シンプルなキー操作でMCPサーバーを有効化/無効化
- **📊 ステータス監視** - MCPサーバーの動作状況を確認
- **🎮 インタラクティブインターフェース** - 矢印キーでナビゲート、スペースで切り替え
- **📤 mmcpへのエクスポート** - Codex設定をmmcpにエクスポートしてクロスCLI管理
- **🚀 高速・軽量** - TypeScriptで構築された高速動作

## インストール

### オプション1: npx を使用（推奨）

```bash
# インストール不要で直接実行
npx cxmcp@latest

# または特定のバージョンを実行
npx cxmcp@1.0.0
```

### オプション2: グローバルインストール

```bash
# npmからグローバルインストール
npm install -g cxmcp

# どこからでも実行可能
cxmcp
```

### オプション3: 開発環境セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/karaage0703/cxmcp.git
cd cxmcp
npm install
npm run build

# 直接実行
npm start

# またはローカルビルドからグローバルインストール
npm install -g .
cxmcp
```

## 使い方

### mmcp連携

Codex MCPサーバーを[mmcp](https://www.npmjs.com/package/mmcp)にエクスポートしてクロスCLI管理:

```bash
# 1. まずmmcpをインストール（未インストールの場合）
npm install -g mmcp

# 2. Codex設定をmmcp形式にエクスポート
cxmcp export-to-mmcp

# 3. 対象のCLIエージェントを追加（例: Claude Code）
mmcp agents add claude-code

# 4. 設定を対象のCLIに適用
mmcp apply
```

**mmcpとは？**
[mmcp](https://github.com/kou-pg-0131/mmcp)は、複数のAIエージェント（Claude Code、Codex CLI、Cursor、Gemini CLIなど）間でMCPサーバー設定を一元管理するCLIツールです。

### インタラクティブモード（デフォルト）

`cxmcp`を実行するだけでインタラクティブインターフェースが起動します:

```bash
# npxを使用
npx cxmcp@latest

# またはグローバルインストール済みの場合
cxmcp

# または開発環境セットアップから
npm start
```

**操作方法:**
- `↑/↓` - サーバー間を移動
- `SPACE` - サーバーを切り替え（無効化/有効化）
- `Q` - 終了

### 非インタラクティブモード

CI/スクリプトや非TTY環境に最適:

```bash
# npxを使用
CI=true npx cxmcp@latest

# またはグローバルインストール済みの場合
CI=true cxmcp

# または開発環境セットアップから
CI=true npm start
```

インタラクティブインターフェースなしで、設定済みサーバーの一覧を表示します。

## 動作原理

cxmcpは安全なバックアップシステムを使用してCodex MCPサーバーを管理します:

- **設定ファイルパス**: `~/.codex/config.toml` (Codexのメイン設定)
- **バックアップパス**: `~/.codex/cxmcp_backup.toml` (無効化されたサーバーの保管場所)
- **サーバー管理**: アクティブファイルとバックアップファイル間でサーバーを移動
- **ステータス監視**: サーバーコマンドをテストして利用可能性を確認

### サーバーの状態

- **有効**: サーバーが`~/.codex/config.toml`に存在しアクティブ
- **無効**: サーバーが`~/.codex/cxmcp_backup.toml`に移動され、Codexから隠される

このアプローチにより以下が保証されます:
- ✅ Codexが無効化されたサーバーを正しく利用不可として認識
- ✅ サーバー設定が安全に保存され復元可能
- ✅ Codexの設定形式に干渉しない

## 設定ファイル

### アクティブサーバー (`~/.codex/config.toml`)
```toml
[mcp_servers]
context7.command = "npx"
context7.args = ["-y", "@upstash/context7-mcp@latest"]

[mcp_servers.gemini-google-search]
command = "npx"
args = ["mcp-gemini-google-search"]

[mcp_servers.gemini-google-search.env]
GEMINI_API_KEY = "your-api-key"
```

### 無効化されたサーバー (`~/.codex/cxmcp_backup.toml`)
```toml
[disabled_servers]
markitdown.command = "uvx"
markitdown.args = ["markitdown-mcp"]
```

## 開発

```bash
# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# 型チェック
npm run typecheck

# 配布用ビルド
npm run build
```

## 必要環境

- Node.js 20.19.4以上
- Codex CLIがインストール・設定済み
- macOS（現在の実装ではmacOSパスを想定）

## アーキテクチャ

- **TypeScript** - 型安全な開発
- **Native Node.js** - UI用の外部依存なし
- **TOML パーサー** - Codex設定ファイルの読み書き
- **直接ファイル操作** - Codex設定を直接読み書き
- **プロセス監視** - サーバーの利用可能性をテスト

## 関連プロジェクト

- [ccmcp](https://github.com/karaage0703/ccmcp) - Claude Code MCP Control Panel（姉妹プロジェクト）
- [ccusage](https://github.com/ryoppippi/ccusage) - Claude Code使用状況分析ツール

## ライセンス

MIT License - 自由に使用・改変してください！
