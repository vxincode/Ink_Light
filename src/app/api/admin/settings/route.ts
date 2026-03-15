import { NextRequest } from "next/server"
import { db } from "@/db"
import { siteSettings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// GET /api/admin/settings - 获取网站设置
export async function GET() {
  try {
    const settings = await db.select().from(siteSettings).limit(1)

    if (settings[0]) {
      return successResponse(settings[0])
    }

    // 如果没有设置记录，返回默认值
    return successResponse({
      siteName: "我的博客",
      siteDescription: "",
      siteAvatar: "",
      seoKeywords: "",
      githubUrl: "",
      twitterUrl: "",
      weiboUrl: "",
      email: "",
      footerText: "",
      icpNumber: "",
      policeNumber: "",
      allowComments: true,
      postsPerPage: 10,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return errorResponse("获取设置失败")
  }
}

// PUT /api/admin/settings - 更新网站设置（管理员）
export async function PUT(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const body = await request.json()

    const existing = await db.select().from(siteSettings).limit(1)

    const updateData = {
      siteName: body.siteName?.trim() || "我的博客",
      siteDescription: body.siteDescription?.trim() || null,
      siteAvatar: body.siteAvatar?.trim() || null,
      seoKeywords: body.seoKeywords?.trim() || null,
      githubUrl: body.githubUrl?.trim() || null,
      twitterUrl: body.twitterUrl?.trim() || null,
      weiboUrl: body.weiboUrl?.trim() || null,
      email: body.email?.trim() || null,
      footerText: body.footerText?.trim() || null,
      icpNumber: body.icpNumber?.trim() || null,
      policeNumber: body.policeNumber?.trim() || null,
      allowComments: body.allowComments ?? true,
      postsPerPage: Math.min(50, Math.max(5, body.postsPerPage || 10)),
      updatedAt: new Date(),
    }

    let settings
    if (existing[0]) {
      settings = await db
        .update(siteSettings)
        .set(updateData)
        .where(eq(siteSettings.id, existing[0].id))
        .returning()
    } else {
      settings = await db
        .insert(siteSettings)
        .values({
          ...updateData,
          allowRegister: false,
        })
        .returning()
    }

    return successResponse(settings[0])
  } catch (error) {
    console.error("Error updating settings:", error)
    return errorResponse("更新设置失败")
  }
}
