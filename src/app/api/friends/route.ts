import { NextRequest } from "next/server"
import { db } from "@/db"
import { friendLinks } from "@/db/schema"
import { eq, desc, asc } from "drizzle-orm"
import { successResponse, errorResponse } from "@/lib/auth"

// GET /api/friends - 获取友链列表（公开）
export async function GET(request: NextRequest) {
  try {
    const linkList = await db
      .select({
        id: friendLinks.id,
        name: friendLinks.name,
        url: friendLinks.url,
        avatar: friendLinks.avatar,
        description: friendLinks.description,
      })
      .from(friendLinks)
      .where(eq(friendLinks.status, "ACTIVE"))
      .orderBy(asc(friendLinks.order), desc(friendLinks.createdAt))

    return successResponse(linkList)
  } catch (error) {
    console.error("Error fetching friends:", error)
    return errorResponse("获取友链列表失败")
  }
}

// POST /api/friends - 申请友链（公开）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必填字段
    if (!body.name?.trim()) {
      return errorResponse("网站名称不能为空", 400)
    }
    if (!body.url?.trim()) {
      return errorResponse("网站链接不能为空", 400)
    }

    // 验证 URL 格式
    try {
      new URL(body.url)
    } catch {
      return errorResponse("网站链接格式不正确", 400)
    }

    // 检查是否已存在相同 URL
    const existing = await db
      .select()
      .from(friendLinks)
      .where(eq(friendLinks.url, body.url.trim()))
      .limit(1)

    if (existing[0]) {
      if (existing[0].status === "ACTIVE") {
        return errorResponse("该网站已在友链列表中", 400)
      } else if (existing[0].status === "PENDING") {
        return errorResponse("该网站的友链申请正在审核中", 400)
      }
    }

    // 创建友链申请
    const newLink = await db
      .insert(friendLinks)
      .values({
        name: body.name.trim(),
        url: body.url.trim(),
        avatar: body.avatar,
        description: body.description,
        status: "PENDING",
        order: 0,
      })
      .returning()

    return successResponse({
      message: "友链申请已提交，等待审核",
      link: {
        id: newLink[0].id,
        name: newLink[0].name,
      },
    }, 201)
  } catch (error) {
    console.error("Error creating friend link:", error)
    return errorResponse("提交友链申请失败")
  }
}
