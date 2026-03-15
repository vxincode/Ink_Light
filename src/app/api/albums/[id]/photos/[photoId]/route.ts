import { NextRequest } from "next/server"
import { db } from "@/db"
import { photos, albums } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// PUT /api/albums/[id]/photos/[photoId] - 更新照片信息（管理员）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: albumId, photoId } = await params
    const body = await request.json()

    // 验证相册存在
    const album = await db
      .select()
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1)

    if (!album[0]) {
      return errorResponse("相册不存在", 404)
    }

    // 验证照片存在且属于该相册
    const photo = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.albumId, albumId)))
      .limit(1)

    if (!photo[0]) {
      return errorResponse("照片不存在", 404)
    }

    // 更新照片信息
    const updateData: Record<string, unknown> = {}
    if (body.caption !== undefined) {
      updateData.caption = body.caption
    }
    if (body.order !== undefined) {
      updateData.order = body.order
    }

    const updated = await db
      .update(photos)
      .set(updateData)
      .where(eq(photos.id, photoId))
      .returning()

    return successResponse(updated[0])
  } catch (error) {
    console.error("Error updating photo:", error)
    return errorResponse("更新照片失败")
  }
}

// DELETE /api/albums/[id]/photos/[photoId] - 删除照片（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: albumId, photoId } = await params

    // 验证相册存在
    const album = await db
      .select()
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1)

    if (!album[0]) {
      return errorResponse("相册不存在", 404)
    }

    // 验证照片存在且属于该相册
    const photo = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.albumId, albumId)))
      .limit(1)

    if (!photo[0]) {
      return errorResponse("照片不存在", 404)
    }

    // 删除照片
    await db.delete(photos).where(eq(photos.id, photoId))

    return successResponse({ message: "照片已删除" })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return errorResponse("删除照片失败")
  }
}
