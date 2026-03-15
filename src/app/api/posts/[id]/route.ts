import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { posts } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/auth"

// 检查是否是有效的 UUID
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

// GET /api/posts/[id] - 获取单篇文章（支持 id 或 slug）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 根据 id 格式选择查询方式
    const post = await db
      .select()
      .from(posts)
      .where(isUUID(id) ? eq(posts.id, id) : eq(posts.slug, id))
      .limit(1)

    if (!post[0]) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      )
    }

    // 增加阅读量
    await db
      .update(posts)
      .set({ views: (post[0].views || 0) + 1 })
      .where(eq(posts.id, post[0].id))

    return NextResponse.json({
      success: true,
      data: post[0],
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch post", detail: errorMessage },
      { status: 500 }
    )
  }
}

// PUT /api/posts/[id] - 更新文章（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id } = await params
    const body = await request.json()

    const updatedPost = await db
      .update(posts)
      .set({
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        category: body.category,
        status: body.status,
        updatedAt: new Date(),
        publishedAt: body.status === "PUBLISHED" ? new Date() : undefined,
      })
      .where(eq(posts.id, id))
      .returning()

    if (!updatedPost[0]) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedPost[0],
    })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update post" },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - 删除文章（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id } = await params

    await db.delete(posts).where(eq(posts.id, id))

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
