import { NextRequest } from "next/server"
import { db } from "@/db"
import { posts, albums, tags, postTags } from "@/db/schema"
import { eq, or, and, desc, like, sql, inArray } from "drizzle-orm"
import { successResponse, errorResponse } from "@/lib/auth"

// GET /api/search - 全局搜索
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    const type = searchParams.get("type") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    if (!query) {
      return errorResponse("请输入搜索关键词", 400)
    }

    const results: {
      posts: any[]
      albums: any[]
      tags: any[]
      total: number
    } = {
      posts: [],
      albums: [],
      tags: [],
      total: 0,
    }

    // 搜索标签
    if (type === "all" || type === "tags") {
      const tagResults = await db
        .select()
        .from(tags)
        .where(
          or(
            like(tags.name, `%${query}%`),
            like(tags.slug, `%${query}%`)
          )
        )
        .limit(limit)

      results.tags = tagResults.map((tag) => ({
        ...tag,
        type: "tag",
        href: `/tags/${tag.slug}`,
      }))
      results.total += tagResults.length
    }

    // 搜索文章
    if (type === "all" || type === "posts") {
      // 先查找匹配的标签，获取相关文章ID
      const matchingTags = await db
        .select({ id: tags.id })
        .from(tags)
        .where(or(
          like(tags.name, `%${query}%`),
          like(tags.slug, `%${query}%`)
        ))

      let postIdsByTag: string[] = []
      if (matchingTags.length > 0) {
        const tagIds = matchingTags.map(t => t.id)
        const postTagResults = await db
          .select({ postId: postTags.postId })
          .from(postTags)
          .where(inArray(postTags.tagId, tagIds))
        postIdsByTag = [...new Set(postTagResults.map(pt => pt.postId))]
      }

      // 构建搜索条件：标题、内容、摘要或标签匹配
      const searchConditions = []
      searchConditions.push(eq(posts.status, "PUBLISHED"))

      const keywordConditions = or(
        like(posts.title, `%${query}%`),
        like(posts.content, `%${query}%`),
        like(posts.excerpt, `%${query}%`)
      )

      let postResults
      if (postIdsByTag.length > 0) {
        // 包含标签匹配的文章
        postResults = await db
          .select({
            id: posts.id,
            title: posts.title,
            excerpt: posts.excerpt,
            category: posts.category,
            createdAt: posts.createdAt,
            publishedAt: posts.publishedAt,
            views: posts.views,
          })
          .from(posts)
          .where(
            and(
              eq(posts.status, "PUBLISHED"),
              or(keywordConditions, inArray(posts.id, postIdsByTag))
            )
          )
          .orderBy(desc(posts.publishedAt))
          .limit(limit)
          .offset(offset)
      } else {
        postResults = await db
          .select({
            id: posts.id,
            title: posts.title,
            excerpt: posts.excerpt,
            category: posts.category,
            createdAt: posts.createdAt,
            publishedAt: posts.publishedAt,
            views: posts.views,
          })
          .from(posts)
          .where(
            and(
              eq(posts.status, "PUBLISHED"),
              keywordConditions
            )
          )
          .orderBy(desc(posts.publishedAt))
          .limit(limit)
          .offset(offset)
      }

      results.posts = postResults.map((post) => ({
        ...post,
        type: "post",
        href: `/posts/${post.id}`,
      }))
      results.total += postResults.length
    }

    // 搜索相册
    if (type === "all" || type === "albums") {
      const albumResults = await db
        .select({
          id: albums.id,
          title: albums.title,
          description: albums.description,
          coverImage: albums.coverImage,
          createdAt: albums.createdAt,
        })
        .from(albums)
        .where(
          and(
            eq(albums.isPublic, true),
            or(
              like(albums.title, `%${query}%`),
              like(albums.description, `%${query}%`)
            )
          )
        )
        .orderBy(desc(albums.createdAt))
        .limit(limit)
        .offset(offset)

      results.albums = albumResults.map((album) => ({
        ...album,
        type: "album",
        href: `/albums/${album.id}`,
      }))
      results.total += albumResults.length
    }

    return successResponse({
      query,
      ...results,
      pagination: {
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error searching:", error)
    return errorResponse("搜索失败")
  }
}
