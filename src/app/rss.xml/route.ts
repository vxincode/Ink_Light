import RSS from "rss"
import { db } from "@/db"
import { posts } from "@/db/schema"
import { eq, desc, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET() {
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  const feed = new RSS({
    title: "我的博客",
    description: "分享生活随笔、旅游日志和摄影作品",
    feed_url: `${siteUrl}/rss.xml`,
    site_url: siteUrl,
    language: "zh-CN",
    pubDate: new Date(),
    ttl: 60,
  })

  // 从数据库获取已发布的文章（只查询需要的字段）
  const publishedPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(eq(posts.status, "PUBLISHED"))
    .orderBy(desc(posts.publishedAt))
    .limit(20)

  publishedPosts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt || "",
      url: `${siteUrl}/posts/${post.id}`,
      date: new Date(post.publishedAt || post.createdAt),
    })
  })

  return new Response(feed.xml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}
