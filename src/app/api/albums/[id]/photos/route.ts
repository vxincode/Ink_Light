import { NextRequest } from "next/server"
import { db } from "@/db"
import { photos, albums } from "@/db/schema"
import { eq, max } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// POST /api/albums/[id]/photos - 批量添加照片（管理员）
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: albumId } = await params
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

    // 验证请求数据
    if (!Array.isArray(body.photos) || body.photos.length === 0) {
      return errorResponse("请提供照片列表", 400)
    }

    // 获取当前最大 order
    const maxOrderResult = await db
      .select({ maxOrder: max(photos.order) })
      .from(photos)
      .where(eq(photos.albumId, albumId))

    let currentOrder = maxOrderResult[0]?.maxOrder || 0

    // 批量插入照片
    const photosToInsert = body.photos.map((photo: {
      url: string
      caption?: string
      width?: number
      height?: number
    }) => {
      currentOrder += 1
      return {
        url: photo.url,
        caption: photo.caption,
        width: photo.width,
        height: photo.height,
        order: currentOrder,
        albumId: albumId,
      }
    })

    const insertedPhotos = await db
      .insert(photos)
      .values(photosToInsert)
      .returning()

    return successResponse(insertedPhotos, 201)
  } catch (error) {
    console.error("Error adding photos:", error)
    return errorResponse("添加照片失败")
  }
}
