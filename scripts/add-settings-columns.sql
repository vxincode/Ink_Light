-- 手动添加网站设置新字段
-- 在服务器上执行: psql -d blog_db -f scripts/add-settings-columns.sql

-- 添加微博链接字段
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS weibo_url VARCHAR(255);

-- 添加页脚文字字段
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS footer_text TEXT;

-- 添加 ICP 备案号字段
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS icp_number VARCHAR(100);

-- 添加公安备案号字段
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS police_number VARCHAR(100);

-- 添加每页文章数字段
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS posts_per_page INTEGER DEFAULT 10;
