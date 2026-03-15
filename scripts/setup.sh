#!/bin/bash

# 博客系统初始化脚本
# 用于生产环境部署时的交互式配置
#
# 使用方法:
#   cd /path/to/Ink_Light
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh

set -e

# 获取脚本所在目录和项目根目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 切换到项目根目录
cd "$PROJECT_DIR"

echo ""
echo "🚀 博客系统初始化向导"
echo "========================"
echo "项目目录: $PROJECT_DIR"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未安装 Node.js${NC}"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 未找到 package.json，请在项目根目录运行此脚本${NC}"
    echo "   正确用法: cd /path/to/Ink_Light && ./scripts/setup.sh"
    exit 1
fi

# 检查 .env 是否存在
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env 文件已存在${NC}"
    read -p "是否覆盖? (y/N): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "取消操作"
        exit 0
    fi
fi

echo ""
echo "📝 请输入网站配置信息"
echo "------------------------"

# 网站配置
read -p "网站名称 [我的博客]: " SITE_NAME
SITE_NAME=${SITE_NAME:-我的博客}

read -p "网站描述 [分享生活随笔、旅游日志和摄影作品]: " SITE_DESCRIPTION
SITE_DESCRIPTION=${SITE_DESCRIPTION:-分享生活随笔、旅游日志和摄影作品}

echo ""
echo "👤 请输入管理员信息"
echo "------------------------"

read -p "管理员邮箱: " ADMIN_EMAIL
if [ -z "$ADMIN_EMAIL" ]; then
    echo -e "${RED}❌ 邮箱不能为空${NC}"
    exit 1
fi

read -p "管理员用户名 [admin]: " ADMIN_NAME
ADMIN_NAME=${ADMIN_NAME:-admin}

while true; do
    read -s -p "管理员密码: " ADMIN_PASSWORD
    echo ""
    if [ -z "$ADMIN_PASSWORD" ]; then
        echo -e "${RED}❌ 密码不能为空${NC}"
        continue
    fi
    if [ ${#ADMIN_PASSWORD} -lt 6 ]; then
        echo -e "${RED}❌ 密码至少需要6个字符${NC}"
        continue
    fi
    read -s -p "确认密码: " ADMIN_PASSWORD_CONFIRM
    echo ""
    if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
        echo -e "${RED}❌ 两次密码不一致${NC}"
        continue
    fi
    break
done

echo ""
echo "🗄️  请输入数据库配置"
echo "------------------------"
echo -e "${YELLOW}提示: PostgreSQL 默认用户是 postgres，不是 root${NC}"

read -p "数据库主机 [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "数据库端口 [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "数据库名称 [blog_db]: " DB_NAME
DB_NAME=${DB_NAME:-blog_db}

read -p "数据库用户 [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "数据库密码: " DB_PASSWORD
echo ""

echo ""
echo "🌐 网站URL配置"
echo "------------------------"

read -p "网站URL (不带斜杠) [http://localhost:3000]: " SITE_URL
SITE_URL=${SITE_URL:-http://localhost:3000}

# 生成安全密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

# URL 编码密码
ENCODED_PASSWORD=$(node -e "console.log(encodeURIComponent('$DB_PASSWORD'))")

# 创建 .env 文件
echo ""
echo "⚙️  生成配置文件..."

cat > .env << EOF
# 数据库配置
DATABASE_URL="postgresql://${DB_USER}:${ENCODED_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# NextAuth 配置
NEXTAUTH_URL="${SITE_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
EOF

echo -e "${GREEN}✅ .env 文件已创建${NC}"

# 安装依赖
echo ""
read -p "是否安装依赖? (Y/n): " install_deps
if [ "$install_deps" != "n" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 测试数据库连接
echo ""
echo "🔍 测试数据库连接..."

DB_TEST_RESULT=$(node -e "
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 5 });
sql\`SELECT 1 as test\`
  .then(() => { console.log('SUCCESS'); sql.end(); })
  .catch((e) => { console.log('FAILED:', e.message); process.exit(1); });
" 2>&1)

if echo "$DB_TEST_RESULT" | grep -q "SUCCESS"; then
    echo -e "${GREEN}✅ 数据库连接成功${NC}"
else
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo "   错误信息: $(echo "$DB_TEST_RESULT" | grep -o 'FAILED:.*' || echo '未知错误')"
    echo ""
    echo "   常见问题:"
    echo "   1. 数据库用户不存在 - PostgreSQL 默认用户是 'postgres'"
    echo "   2. 数据库未创建 - 需要先创建数据库: CREATE DATABASE $DB_NAME;"
    echo "   3. 密码错误 - 检查数据库密码是否正确"
    echo "   4. 连接被拒绝 - 检查数据库服务是否启动"
    echo ""
    read -p "是否继续? (y/N): " continue_setup
    if [ "$continue_setup" != "y" ]; then
        exit 1
    fi
fi

# 数据库迁移
echo ""
echo "📦 运行数据库迁移..."
npx drizzle-kit push || {
    echo -e "${YELLOW}⚠️  数据库迁移失败${NC}"
    echo "   你可以稍后手动运行: npx drizzle-kit push"
    read -p "是否继续? (y/N): " continue_setup
    if [ "$continue_setup" != "y" ]; then
        exit 1
    fi
}

# 创建管理员和网站设置
echo ""
echo "👤 创建管理员账户..."

# 将变量导出到环境变量
export ADMIN_EMAIL ADMIN_NAME ADMIN_PASSWORD SITE_NAME SITE_DESCRIPTION

node -e "
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SITE_NAME = process.env.SITE_NAME;
const SITE_DESCRIPTION = process.env.SITE_DESCRIPTION;

async function init() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    // 检查管理员是否存在
    const existing = await sql\`SELECT * FROM users WHERE email = \${ADMIN_EMAIL}\`;
    if (existing.length > 0) {
      console.log('⚠️  管理员已存在，跳过创建');
      await sql.end();
      return;
    }

    // 创建管理员
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await sql\`
      INSERT INTO users (id, email, password, name, role, bio, created_at, updated_at)
      VALUES (gen_random_uuid(), \${ADMIN_EMAIL}, \${hash}, \${ADMIN_NAME}, 'ADMIN', '博客管理员', NOW(), NOW())
    \`;
    console.log('✅ 管理员创建成功');

    // 创建网站设置
    const settingsExist = await sql\`SELECT * FROM site_settings LIMIT 1\`;
    if (settingsExist.length === 0) {
      await sql\`
        INSERT INTO site_settings (id, site_name, site_description, allow_comments, allow_register, updated_at)
        VALUES (gen_random_uuid(), \${SITE_NAME}, \${SITE_DESCRIPTION}, true, false, NOW())
      \`;
      console.log('✅ 网站设置创建成功');
    } else {
      console.log('⚠️  网站设置已存在，跳过创建');
    }
  } catch (e) {
    console.error('❌ 初始化失败:', e.message);
    process.exit(1);
  }

  await sql.end();
}
init();
" || echo -e "${YELLOW}⚠️  创建失败，请手动完成初始化${NC}"

# 清除敏感环境变量
unset ADMIN_PASSWORD

# 构建
echo ""
read -p "是否构建生产版本? (Y/n): " do_build
if [ "$do_build" != "n" ]; then
    echo "🔨 构建生产版本..."
    npm run build
fi

# 完成
echo ""
echo "========================"
echo -e "${GREEN}🎉 初始化完成！${NC}"
echo ""
echo "📌 下一步操作:"
echo "   启动服务: npm run start"
echo "   或使用 PM2: pm2 start npm --name blog -- run start"
echo ""
echo "🔐 登录信息:"
echo "   地址: ${SITE_URL}/admin/login"
echo "   邮箱: ${ADMIN_EMAIL}"
echo "   密码: (你设置的密码)"
echo ""
echo -e "${YELLOW}⚠️  请妥善保管 .env 文件，不要提交到版本控制${NC}"
