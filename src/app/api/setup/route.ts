import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.role, "ADMIN"))
      .limit(1)

    if (existingAdmin.length > 0) {
      return NextResponse.json({
        success: true,
        message: "管理员已存在",
        user: { email: existingAdmin[0].email, name: existingAdmin[0].name },
      })
    }

    // 创建默认管理员
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const [admin] = await db
      .insert(users)
      .values({
        email: "1131596911@qq.com",
        password: hashedPassword,
        name: "管理员",
        role: "ADMIN",
        bio: "博客管理员",
      })
      .returning()

    return NextResponse.json({
      success: true,
      message: "管理员创建成功",
      user: { email: admin.email, name: admin.name },
      password: "admin123",
    })
  } catch (error) {
    console.error("Setup error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: "初始化失败", detail: errorMessage },
      { status: 500 }
    )
  }
}
