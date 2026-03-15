import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { comments } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// GET /api/comments - 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Post ID is required" },
        { status: 400 }
      )
    }

    const commentList = await db
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.isApproved, true)))

    return NextResponse.json({
      success: true,
      data: commentList,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    )
  }
}

// POST /api/comments - 创建评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必填字段
    if (!body.content || !body.author) {
      return NextResponse.json(
        { success: false, error: "Content and author are required" },
        { status: 400 }
      )
    }

    const newComment = await db.insert(comments).values({
      content: body.content,
      author: body.author,
      email: body.email,
      website: body.website,
      postId: body.postId,
      parentId: body.parentId,
      userId: body.userId,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      isApproved: false, // 默认需要审核
    }).returning()

    return NextResponse.json({
      success: true,
      data: newComment[0],
      message: "评论提交成功，等待审核后显示",
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
      { status: 500 }
    )
  }
}
