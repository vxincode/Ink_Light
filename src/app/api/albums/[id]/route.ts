import { NextRequest } from "next/server"
import { db } from "@/db"
import { albums, photos, users } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// GET /api/albums/[id] - 获取相册详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: albumId } = await params

    // 获取相册信息
    const albumResult = await db
      .select()
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1)

    if (!albumResult[0]) {
      return errorResponse("相册不存在", 404)
    }

    const album = albumResult[0]

    // 非公开相册需要管理员权限
    if (!album.isPublic) {
      const authCheck = await requireAdmin()
      if (!authCheck.authorized) {
        return errorResponse("相册不存在", 404)
      }
    }

    // 获取照片列表
    const photoList = await db
      .select()
      .from(photos)
      .where(eq(photos.albumId, albumId))
      .orderBy(desc(photos.order), desc(photos.createdAt))

    // 获取作者信息
    const authorResult = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.id, album.authorId))
      .limit(1)

    return successResponse({
      ...album,
      photos: photoList,
      author: authorResult[0] || null,
    })
  } catch (error) {
    console.error("Error fetching album:", error)
    return errorResponse("获取相册详情失败")
  }
}

// PUT /api/albums/[id] - 更新相册（管理员）
export async function PUT(
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

    // 检查相册是否存在
    const existing = await db
      .select()
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("相册不存在", 404)
    }

    // 更新相册
    const updated = await db
      .update(albums)
      .set({
        title: body.title?.trim(),
        description: body.description,
        coverImage: body.coverImage,
        isPublic: body.isPublic,
        order: body.order,
        updatedAt: new Date(),
      })
      .where(eq(albums.id, albumId))
      .returning()

    return successResponse(updated[0])
  } catch (error) {
    console.error("Error updating album:", error)
    return errorResponse("更新相册失败")
  }
}

// DELETE /api/albums/[id] - 删除相册（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { id: albumId } = await params

    // 检查相册是否存在
    const existing = await db
      .select()
      .from(albums)
      .where(eq(albums.id, albumId))
      .limit(1)

    if (!existing[0]) {
      return errorResponse("相册不存在", 404)
    }

    // 删除相册（级联删除会自动删除关联照片）
    await db.delete(albums).where(eq(albums.id, albumId))

    return successResponse({ message: "相册已删除" })
  } catch (error) {
    console.error("Error deleting album:", error)
    return errorResponse("删除相册失败")
  }
}
