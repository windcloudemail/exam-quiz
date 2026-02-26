# 外幣保險考題練習網站

備考外幣保險證照的線上練習系統，支援隨機抽題、即時顯示答案解說與題庫後台管理。

## 技術架構

- **前端**：React 18 + Vite + Tailwind CSS
- **部署**：Cloudflare Pages
- **後端 API**：Cloudflare Pages Functions (Workers)
- **資料庫**：Cloudflare D1 (SQLite)

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立 Cloudflare D1 資料庫

```bash
npx wrangler d1 create exam-quiz-db
```

把輸出的 `database_id` 填入 `wrangler.toml`。

### 3. 建立資料表

```bash
npx wrangler d1 execute exam-quiz-db --file=.cloudflare/schema.sql
```

### 4. 本機開發

```bash
npm run dev
```

### 5. 部署

推送到 GitHub，Cloudflare Pages 會自動部署。

## 目錄結構

```
src/
  components/   共用元件
  pages/        頁面
  lib/          工具函式（API 呼叫）
functions/
  api/          後端 API（Cloudflare Workers）
.cloudflare/
  schema.sql    資料庫結構
```

## AI 開發說明

請參閱 [CLAUDE.md](./CLAUDE.md)，內含完整的架構說明供 AI 工具參考。
