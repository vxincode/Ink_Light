import { NextRequest } from "next/server"
import { db } from "@/db"
import { comments, posts, users } from "@/db/schema"
import { eq, desc, and, count } from "drizzle-orm"
import { requireAdmin, paginatedResponse, errorResponse } from "@/lib/auth"

// GET /api/admin/comments - 获取所有评论（管理员）
export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const approved = searchParams.get("approved")
    const postId = searchParams.get("postId")
    const offset = (page - 1) * limit

    // 构建查询条件
    const conditions: any[] = []

    if (approved !== null && approved !== "all") {
      conditions.push(eq(comments.isApproved, approved === "true"))
    }

    if (postId) {
      conditions.push(eq(comments.postId, postId))
    }

    // 获取评论列表
    const commentList = await db
      .select({
        id: comments.id,
        content: comments.content,
        author: comments.author,
        email: comments.email,
        isApproved: comments.isApproved,
        createdAt: comments.createdAt,
        postId: comments.postId,
        parentId: comments.parentId,
        post: {
          id: posts.id,
          title: posts.title,
        },
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .leftJoin(posts, eq(comments.postId, posts.id))
      .leftJoin(users, eq(comments.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset)

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(comments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return paginatedResponse(commentList, page, limit, totalResult[0].count)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return errorResponse("获取评论列表失败")
  }
}
