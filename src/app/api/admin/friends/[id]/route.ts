import { NextRequest } from "next/server"
import { db } from "@/db"
import { friendLinks } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// PUT /api/admin/friends/[id] - 审核或更新友链（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: linkId } = await params
    const body = await request.json()

    // 检查友链是否存在
    const existing = await db
      .select()
      .from(friendLinks)
      .where(eq(friendLinks.id, linkId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("友链不存在", 404)
    }

    // 更新友链
    const updated = await db
      .update(friendLinks)
      .set({
        name: body.name?.trim(),
        url: body.url?.trim(),
        avatar: body.avatar,
        description: body.description,
        status: body.status,
        order: body.order,
        updatedAt: new Date(),
      })
      .where(eq(friendLinks.id, linkId))
      .returning()

    return successResponse(updated[0])
  } catch (error) {
    console.error("Error updating friend link:", error)
    return errorResponse("更新友链失败")
  }
}

// DELETE /api/admin/friends/[id] - 删除友链（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: linkId } = await params

    // 检查友链是否存在
    const existing = await db
      .select()
      .from(friendLinks)
      .where(eq(friendLinks.id, linkId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("友链不存在", 404)
    }

    // 删除友链
    await db.delete(friendLinks).where(eq(friendLinks.id, linkId))

    return successResponse({ message: "友链已删除" })
  } catch (error) {
    console.error("Error deleting friend link:", error)
    return errorResponse("删除友链失败")
  }
}
