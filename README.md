# 个人博客系统

一个使用 Next.js 16、TypeScript、Tailwind CSS 和 shadcn/ui 构建的现代个人博客系统。

## 功能特性

### 前台功能
- 📝 **生活随笔** - 分享生活感悟与思考
- ✈️ **旅游日志** - 记录旅行见闻（卡片式展示）
- 📷 **相册管理** - 瀑布流展示、灯箱预览
- 💬 **留言板** - 支持嵌套回复的评论系统
- 🔗 **友链管理** - 友情链接展示与申请
- 🔍 **全文搜索** - 文章和相册搜索
- 📰 **RSS 订阅** - `/rss.xml` 订阅源
- 🎨 **暗黑模式** - 支持明暗主题切换

### 后台功能
- 🛡️ **用户认证** - 基于 NextAuth.js 的登录系统
- 📊 **仪表盘** - 数据统计、快速操作
- ✍️ **文章管理** - Markdown 编辑器、实时预览
- 🏷️ **标签管理** - 标签增删改查
- 📸 **相册管理** - 相册创建、照片上传
- 💬 **评论审核** - 评论待审、通过/拒绝
- ⚙️ **系统设置** - 网站信息、功能开关

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (App Router) |
| UI 组件 | shadcn/ui + Tailwind CSS 4 |
| 数据库 | PostgreSQL |
| ORM | Drizzle ORM |
| 认证 | NextAuth.js v5 |
| Markdown | react-markdown + remark-gfm |
| 语言 | TypeScript |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

首先创建 PostgreSQL 数据库：

```sql
CREATE DATABASE blog_db;
```

编辑 `.env` 文件，设置数据库连接：

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/blog_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="blog-secret-key-change-in-production-2024"
```

### 3. 初始化数据库

```bash
npm run db:push
```

### 4. 初始化示例数据（可选）

```bash
npm run db:seed
```

这将创建：
- 管理员账号：`1131596911@qq.com` / `admin123`
- 示例文章和相册

> ⚠️ 生产环境请务必修改默认密码

### 5. 运行开发服务器

```bash
npm run dev
```

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin/login

## 数据库命令

```bash
npm run db:generate  # 生成迁移文件
npm run db:migrate   # 执行迁移
npm run db:push      # 直接推送 schema 到数据库
npm run db:studio    # 打开数据库管理界面
npm run db:seed      # 初始化示例数据
```

## 项目结构

```
src/
├── app/                    # App Router
│   ├── (main)/            # 前台页面
│   │   ├── page.tsx       # 首页
│   │   ├── posts/         # 文章列表/详情
│   │   ├── albums/        # 相册
│   │   ├── guestbook/     # 留言板
│   │   ├── friends/       # 友链
│   │   ├── search/        # 搜索
│   │   └── about/         # 关于我
│   ├── (admin)/           # 后台管理
│   │   ├── dashboard/     # 仪表盘
│   │   ├── posts/         # 文章管理
│   │   ├── albums/        # 相册管理
│   │   ├── comments/      # 评论管理
│   │   ├── tags/          # 标签管理
│   │   ├── settings/      # 系统设置
│   │   └── login/         # 登录页
│   ├── api/               # API Routes
│   │   ├── posts/         # 文章 API
│   │   ├── comments/      # 评论 API
│   │   ├── upload/        # 图片上传 API
│   │   └── auth/          # 认证 API
│   └── rss.xml/           # RSS 订阅
├── components/
│   ├── ui/                # shadcn/ui 组件
│   ├── layout/            # 布局组件
│   └── providers/         # ThemeProvider
├── db/
│   ├── schema.ts          # Drizzle 数据模型
│   ├── index.ts           # 数据库连接
│   └── seed.ts            # 初始化数据
├── hooks/                 # 自定义 Hooks
│   └── use-auto-save.ts   # 自动保存草稿
├── lib/
│   └── utils.ts           # 工具函数
└── types/                 # TypeScript 类型定义
```

## UI 组件库

已集成的 shadcn/ui 组件：
- Button, Card, Input, Textarea
- Badge, Select, Label, Alert
- Table, Dialog, Progress
- Switch, Separator, Tabs, Skeleton
- ImageUpload（自定义）
- MarkdownEditor（自定义）

## API 端点

### 文章
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/[id]` - 获取单篇文章
- `POST /api/posts` - 创建文章
- `PUT /api/posts/[id]` - 更新文章
- `DELETE /api/posts/[id]` - 删除文章

### 评论
- `GET /api/comments?postId=xxx` - 获取评论列表
- `POST /api/comments` - 提交评论

### 图片上传
- `POST /api/upload` - 上传图片

### 认证
- `POST /api/auth/signin` - 登录
- `POST /api/auth/signout` - 登出

## 部署

### 自托管服务器部署 (推荐)

提供交互式初始化脚本，支持配置网站信息、管理员账户和数据库：

```bash
# 1. 克隆代码
git clone <your-repo>
cd blog

# 2. 运行初始化脚本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. 按提示输入配置信息
# - 网站名称和描述
# - 管理员邮箱、用户名、密码
# - 数据库连接信息
# - 网站 URL

# 4. 启动服务
npm run start

# 或使用 PM2 守护进程
pm2 start npm --name blog -- run start
```

### 使用 Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署 PostgreSQL 数据库（推荐 Neon 或 Supabase）
5. 运行数据库迁移

### 环境变量

```env
DATABASE_URL="postgresql://user:password@host:5432/blog_db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"  # 生成: openssl rand -base64 32
```

## License

MIT
