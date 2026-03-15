import { NextRequest } from "next/server"
import { db } from "@/db"
import { comments } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// PUT /api/admin/comments/[id] - 审核评论（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: commentId } = await params
    const body = await request.json()

    // 检查评论是否存在
    const existing = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("评论不存在", 404)
    }

    // 更新评论状态
    const updated = await db
      .update(comments)
      .set({
        isApproved: body.isApproved,
      })
      .where(eq(comments.id, commentId))
      .returning()

    return successResponse(updated[0])
  } catch (error) {
    console.error("Error updating comment:", error)
    return errorResponse("更新评论状态失败")
  }
}

// DELETE /api/admin/comments/[id] - 删除评论（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: commentId } = await params

    // 检查评论是否存在
    const existing = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("评论不存在", 404)
    }

    // 删除评论
    await db.delete(comments).where(eq(comments.id, commentId))

    return successResponse({ message: "评论已删除" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return errorResponse("删除评论失败")
  }
}
