import { NextRequest } from "next/server"
import { db } from "@/db"
import { albums, photos } from "@/db/schema"
import { desc, eq, and, count, sql } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse, paginatedResponse } from "@/lib/auth"

// GET /api/albums - 获取相册列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const publicOnly = searchParams.get("public") !== "false"
    const offset = (page - 1) * limit

    // 构建查询条件
    const conditions = publicOnly ? [eq(albums.isPublic, true)] : []

    // 获取相册列表，同时统计照片数量
    const albumList = await db
      .select({
        id: albums.id,
        title: albums.title,
        description: albums.description,
        coverImage: albums.coverImage,
        order: albums.order,
        isPublic: albums.isPublic,
        createdAt: albums.createdAt,
        updatedAt: albums.updatedAt,
        photoCount: count(photos.id).as("photo_count"),
      })
      .from(albums)
      .leftJoin(photos, eq(albums.id, photos.albumId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(albums.id)
      .orderBy(desc(albums.order), desc(albums.createdAt))
      .limit(limit)
      .offset(offset)

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(albums)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    return paginatedResponse(albumList, page, limit, totalResult[0].count)
  } catch (error) {
    console.error("Error fetching albums:", error)
    return errorResponse("获取相册列表失败")
  }
}

// POST /api/albums - 创建相册（管理员）
export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const body = await request.json()

    if (!body.title?.trim()) {
      return errorResponse("相册标题不能为空", 400)
    }

    const newAlbum = await db
      .insert(albums)
      .values({
        title: body.title.trim(),
        description: body.description,
        coverImage: body.coverImage,
        isPublic: body.isPublic ?? true,
        order: body.order || 0,
        authorId: authCheck.user.id,
      })
      .returning()

    return successResponse(newAlbum[0], 201)
  } catch (error) {
    console.error("Error creating album:", error)
    return errorResponse("创建相册失败")
  }
}
