import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { posts, tags, postTags, type PostCategory, type PostStatus } from "@/db/schema"
import { eq, and, desc, inArray } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth"

// GET /api/posts - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const tagSlug = searchParams.get("tag")
    const statusParam = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // 构建查询条件
    const conditions: any[] = []
    if (category) {
      conditions.push(eq(posts.category, category.toUpperCase() as PostCategory))
    }
    // status="all" 时不添加状态过滤（用于管理后台）
    if (statusParam && statusParam !== "all") {
      conditions.push(eq(posts.status, statusParam.toUpperCase() as PostStatus))
    } else if (!statusParam) {
      // 默认只显示已发布
      conditions.push(eq(posts.status, "PUBLISHED" as PostStatus))
    }

    // 如果有标签筛选，先查找标签对应的文章ID
    let postIdsByTag: string[] | null = null
    if (tagSlug) {
      const tagResult = await db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.slug, tagSlug))
        .limit(1)

      if (tagResult[0]) {
        const postTagResults = await db
          .select({ postId: postTags.postId })
          .from(postTags)
          .where(eq(postTags.tagId, tagResult[0].id))

        postIdsByTag = postTagResults.map(pt => pt.postId)
        if (postIdsByTag.length === 0) {
          // 没有文章使用此标签
          return NextResponse.json({
            success: true,
            data: [],
            pagination: { page, limit, total: 0 },
          })
        }
      } else {
        // 标签不存在
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0 },
        })
      }
    }

    // 执行查询
    let postList
    if (postIdsByTag) {
      postList = await db
        .select()
        .from(posts)
        .where(and(...conditions, inArray(posts.id, postIdsByTag)))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset)
    } else {
      postList = await db
        .select()
        .from(posts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset)
    }

    return NextResponse.json({
      success: true,
      data: postList,
      pagination: {
        page,
        limit,
        total: postList.length,
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts", detail: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/posts - 创建文章（管理员）
export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const body = await request.json()

    if (!body.title?.trim()) {
      return NextResponse.json(
        { success: false, error: "标题不能为空" },
        { status: 400 }
      )
    }

    const newPost = await db.insert(posts).values({
      title: body.title.trim(),
      slug: body.slug || generateSlug(body.title),
      content: body.content || "",
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      category: body.category || "ESSAY",
      status: body.status || "DRAFT",
      authorId: authCheck.user.id,
    }).returning()

    return NextResponse.json({
      success: true,
      data: newPost[0],
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    )
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100)
}
