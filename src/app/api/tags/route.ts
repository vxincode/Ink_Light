import { NextRequest } from "next/server"
import { db } from "@/db"
import { tags, postTags } from "@/db/schema"
import { desc, eq, count, sql } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// GET /api/tags - 获取所有标签（含文章数量）
export async function GET() {
  try {
    const tagList = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        postCount: count(postTags.postId).as("post_count"),
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .groupBy(tags.id)
      .orderBy(desc(sql`post_count`), tags.name)

    return successResponse(tagList)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return errorResponse("获取标签失败")
  }
}

// POST /api/tags - 创建标签（管理员）
export async function POST(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const body = await request.json()

    if (!body.name?.trim()) {
      return errorResponse("标签名称不能为空", 400)
    }

    // 生成 slug
    const slug = body.slug?.trim() || generateSlug(body.name)

    // 检查 slug 是否已存在
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1)

    if (existing[0]) {
      return errorResponse("标签链接已存在", 400)
    }

    const newTag = await db
      .insert(tags)
      .values({
        name: body.name.trim(),
        slug,
      })
      .returning()

    return successResponse(newTag[0], 201)
  } catch (error) {
    console.error("Error creating tag:", error)
    return errorResponse("创建标签失败")
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-\u4e00-\u9fa5]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50)
}
