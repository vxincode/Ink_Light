import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { requireAdmin } from "@/lib/auth"

// 允许的图片类型
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
// 最大文件大小 5MB
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  // 验证管理员权限
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) {
    return authCheck.response
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: "没有选择文件" },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "不支持的文件类型，请上传 JPG、PNG、GIF 或 WebP 格式" },
        { status: 400 }
      )
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "文件大小不能超过 5MB" },
        { status: 400 }
      )
    }

    // 生成文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split(".").pop()
    const filename = `${timestamp}-${randomStr}.${ext}`

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    return NextResponse.json({
      success: true,
      data: {
        url: `/uploads/${filename}`,
        filename,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { success: false, error: "文件上传失败" },
      { status: 500 }
    )
  }
}
