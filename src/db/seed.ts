import { db } from "./index"
import { users, posts, albums, photos, friendLinks, siteSettings } from "./schema"
import bcrypt from "bcryptjs"

async function seed() {
  console.log("🌱 开始初始化数据...")

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const [adminUser] = await db
    .insert(users)
    .values({
      email: "1131596911@qq.com",
      password: hashedPassword,
      name: "管理员",
      role: "ADMIN",
      bio: "博客管理员",
    })
    .returning()

  console.log("✅ 创建管理员用户:", adminUser.email)
  console.log("🔑 默认密码: admin123")

  // 创建示例文章
  const [post1] = await db
    .insert(posts)
    .values({
      title: "春日赏花之旅：京都樱花季",
      slug: "kyoto-cherry-blossom",
      content: `# 引言

三月下旬，我踏上了前往京都的旅程，只为一睹那漫天飞舞的樱花盛景。

## 哲学之道

第一站我选择了哲学之道，这条沿小溪而建的步道是京都赏花的绝佳地点。两岸的樱花树形成了一道天然的粉色隧道。

## 清水寺

第二天清晨，我来到了清水寺。站在清水舞台上俯瞰，整个京都被樱花装点得粉妆玉砌。

## 结语

短短几天的旅程，让我深深爱上了春天的京都。`,
      excerpt: "三月下旬，我踏上了前往京都的旅程，只为一睹那漫天飞舞的樱花盛景...",
      category: "TRAVEL",
      status: "PUBLISHED",
      authorId: adminUser.id,
      views: 1234,
      publishedAt: new Date("2024-03-10"),
    })
    .returning()

  await db.insert(posts).values({
    title: "极简生活的实践与思考",
    slug: "minimalist-life",
    content: `# 什么是极简生活

极简生活不是苦行僧式的生活，而是去除不必要的物品和活动，专注于真正重要的事情。

## 我的极简实践

1. 清理不常用的物品
2. 减少社交媒体使用
3. 专注于质量而非数量

## 结语

极简生活让我更加专注于内心的平静和真正的快乐。`,
    excerpt: "过去一年里，我开始尝试极简生活方式，减少物质欲望，专注于真正重要的事情...",
    category: "ESSAY",
    status: "PUBLISHED",
    authorId: adminUser.id,
    views: 892,
    publishedAt: new Date("2024-03-05"),
  })

  await db.insert(posts).values({
    title: "摄影入门：如何拍出好看的照片",
    slug: "photography-basics",
    content: `# 摄影基础

摄影不仅仅是按快门，更重要的是观察和构图。

## 基本技巧

1. 注意光线
2. 运用三分法
3. 寻找有趣的视角

## 结语

摄影是记录生活、表达自我的方式。`,
    excerpt: "分享一些我在摄影学习过程中的心得体会...",
    category: "ESSAY",
    status: "DRAFT",
    authorId: adminUser.id,
    views: 0,
  })

  console.log("✅ 创建示例文章")

  // 创建示例相册
  const [album1] = await db
    .insert(albums)
    .values({
      title: "京都樱花季",
      description: "2024年春季京都赏花之旅",
      order: 1,
      isPublic: true,
      authorId: adminUser.id,
    })
    .returning()

  await db.insert(photos).values({
    url: "/images/kyoto-1.jpg",
    caption: "哲学之道",
    order: 1,
    albumId: album1.id,
  })

  await db.insert(photos).values({
    url: "/images/kyoto-2.jpg",
    caption: "清水寺",
    order: 2,
    albumId: album1.id,
  })

  console.log("✅ 创建示例相册")

  // 创建网站设置
  await db.insert(siteSettings).values({
    siteName: "我的博客",
    siteDescription: "分享生活随笔、旅游日志和摄影作品",
    allowComments: true,
    allowRegister: false,
  })

  console.log("✅ 创建网站设置")
  console.log("🎉 数据初始化完成！")
}

seed()
  .catch((error) => {
    console.error("❌ 初始化失败:", error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
