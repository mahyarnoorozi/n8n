-- =====================================================
-- Sales Bot Database Setup
-- اجرا کن قبل از فعال کردن workflow ها
-- =====================================================

-- جدول کاربران و وضعیت فروش
CREATE TABLE IF NOT EXISTS sales_users (
  telegram_id       BIGINT PRIMARY KEY,
  telegram_username TEXT,
  first_name        TEXT,
  last_name         TEXT,
  stage             TEXT NOT NULL DEFAULT 'greeting',
  -- مراحل: greeting | discovery | solution | objection | closing | purchased | dead
  last_message_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  followup_step     INTEGER NOT NULL DEFAULT 0,
  -- 0=هنوز نفرستادیم, 1=30دقیقه, 2=3ساعت, 3=24ساعت, 4=3روز (بعدش dead)
  followup_sent_at  TIMESTAMPTZ,
  has_purchased     BOOLEAN NOT NULL DEFAULT FALSE,
  pain_points       TEXT,  -- JSON array از مشکلات کشف‌شده
  objection_count   INTEGER NOT NULL DEFAULT 0,
  notes             TEXT
);

-- index برای کوئری follow-up (مهم برای performance)
CREATE INDEX IF NOT EXISTS idx_sales_users_followup
  ON sales_users(followup_step, last_message_at, has_purchased);

CREATE INDEX IF NOT EXISTS idx_sales_users_stage
  ON sales_users(stage);

-- جدول n8n_chat_histories خودکار توسط n8n ساخته می‌شه
-- نیازی به ساخت دستی نیست

-- =====================================================
-- تست: چک کن جدول درست ساخته شده
-- =====================================================
-- SELECT * FROM sales_users LIMIT 5;
