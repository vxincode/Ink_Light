import { NextRequest } from "next/server"
import { db } from "@/db"
import { tags } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// GET /api/tags/[id] - 获取单个标签
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params

    const tag = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1)

    if (!tag[0]) {
      return errorResponse("标签不存在", 404)
    }

    return successResponse(tag[0])
  } catch (error) {
    console.error("Error fetching tag:", error)
    return errorResponse("获取标签失败")
  }
}

// PUT /api/tags/[id] - 更新标签（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: tagId } = await params
    const body = await request.json()

    // 检查标签是否存在
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("标签不存在", 404)
    }

    // 生成新的 slug
    const newName = body.name?.trim() || existing[0].name
    const newSlug = body.slug?.trim() || newName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    // 如果要更新 slug，检查是否已存在
    if (newSlug !== existing[0].slug) {
      const slugExists = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, newSlug))
        .limit(1)

      if (slugExists[0]) {
        return errorResponse("标签链接已存在", 400)
      }
    }

    const updated = await db
      .update(tags)
      .set({
        name: newName,
        slug: newSlug,
      })
      .where(eq(tags.id, tagId))
      .returning()

    return successResponse(updated[0])
  } catch (error) {
    console.error("Error updating tag:", error)
    return errorResponse("更新标签失败")
  }
}

// DELETE /api/tags/[id] - 删除标签（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: tagId } = await params

    // 检查标签是否存在
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("标签不存在", 404)
    }

    // 删除标签（关联的 post_tags 会级联删除）
    await db.delete(tags).where(eq(tags.id, tagId))

    return successResponse({ message: "标签已删除" })
  } catch (error) {
    console.error("Error deleting tag:", error)
    return errorResponse("删除标签失败")
  }
}
