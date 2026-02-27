-- 外幣保險考題練習網站 — 資料庫結構
-- 執行方式：npx wrangler d1 execute exam-quiz-db --file=.cloudflare/schema.sql

CREATE TABLE IF NOT EXISTS questions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT    NOT NULL DEFAULT '外幣保險',
  difficulty  TEXT    NOT NULL DEFAULT 'medium',  -- easy / medium / hard
  question    TEXT    NOT NULL,
  question_part2 TEXT NOT NULL DEFAULT '',
  option_1    TEXT    NOT NULL,
  option_2    TEXT    NOT NULL,
  option_3    TEXT    NOT NULL,
  option_4    TEXT    NOT NULL,
  answer      INTEGER NOT NULL,  -- 1, 2, 3, 或 4
  explanation TEXT    NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 索引：加速依分類篩選
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- 預設分類範例資料（可刪除）
INSERT INTO questions (category, question, option_1, option_2, option_3, option_4, answer, explanation)
VALUES (
  '管理外匯條例',
  '「管理外匯條例」第3條規定，掌理外匯業務機關為何？',
  '金管會', '財政部', '國貿局', '中央銀行',
  4,
  '掌理外匯業務的機關為中央銀行；而管理外匯的行政主管機關則為金管會，兩者角色不同，要特別區分。'
);
