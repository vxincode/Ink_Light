import { NextRequest } from "next/server"
import { db } from "@/db"
import { friendLinks } from "@/db/schema"
import { eq, desc, asc, count } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse, paginatedResponse } from "@/lib/auth"

// POST /api/admin/friends - 创建友链（管理员）
export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const body = await request.json()

    // 验证必填字段
    if (!body.name?.trim() || !body.url?.trim()) {
      return errorResponse("名称和网址不能为空", 400)
    }

    // 创建友链
    const newLink = await db
      .insert(friendLinks)
      .values({
        name: body.name.trim(),
        url: body.url.trim(),
        description: body.description?.trim() || null,
        avatar: body.avatar?.trim() || null,
        status: body.status || "PENDING",
        order: body.order || 0,
      })
      .returning()

    return successResponse(newLink[0])
  } catch (error) {
    console.error("Error creating friend link:", error)
    return errorResponse("创建友链失败")
  }
}

// GET /api/admin/friends - 获取所有友链（管理员）
export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    // 构建查询条件
    const conditions = status ? [eq(friendLinks.status, status.toUpperCase() as any)] : []

    // 获取友链列表
    const linkList = await db
      .select()
      .from(friendLinks)
      .where(conditions.length > 0 ? eq(friendLinks.status, status!.toUpperCase() as any) : undefined)
      .orderBy(asc(friendLinks.order), desc(friendLinks.createdAt))
      .limit(limit)
      .offset(offset)

    // 获取总数
    const totalResult = await db
      .select({ value: count() })
      .from(friendLinks)
      .where(conditions.length > 0 ? eq(friendLinks.status, status!.toUpperCase() as any) : undefined)

    const total = totalResult[0]?.value || 0
    return paginatedResponse(linkList, page, limit, total)
  } catch (error) {
    console.error("Error fetching friend links:", error)
    return errorResponse("获取友链列表失败")
  }
}
