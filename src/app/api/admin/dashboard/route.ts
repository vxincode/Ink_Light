import { NextRequest } from "next/server"
import { db } from "@/db"
import { posts, albums, comments } from "@/db/schema"
import { count, sum, desc, eq } from "drizzle-orm"
import { requireAdmin, successResponse, errorResponse } from "@/lib/auth"

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin()
  if (!authCheck.authorized) return authCheck.response

  try {
    // Run all queries in parallel for better performance
    const [
      postCountResult,
      albumCountResult,
      commentCountResult,
      totalViewsResult,
      recentPostsList,
      recentCommentsList,
    ] = await Promise.all([
      db.select({ count: count() }).from(posts),
      db.select({ count: count() }).from(albums),
      db.select({ count: count() }).from(comments).where(eq(comments.isApproved, true)),
      db.select({ total: sum(posts.views) }).from(posts),
      db
        .select({
          id: posts.id,
          title: posts.title,
          status: posts.status,
          createdAt: posts.createdAt,
          publishedAt: posts.publishedAt,
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(5),
      db
        .select({
          id: comments.id,
          author: comments.author,
          content: comments.content,
          createdAt: comments.createdAt,
        })
        .from(comments)
        .where(eq(comments.isApproved, true))
        .orderBy(desc(comments.createdAt))
        .limit(5),
    ])

    return successResponse({
      stats: {
        posts: postCountResult[0]?.count || 0,
        albums: albumCountResult[0]?.count || 0,
        comments: commentCountResult[0]?.count || 0,
        views: Number(totalViewsResult[0]?.total || 0),
      },
      recentPosts: recentPostsList.map((post) => ({
        id: post.id,
        title: post.title,
        status: post.status,
        date: post.publishedAt || post.createdAt,
      })),
      recentComments: recentCommentsList.map((comment) => ({
        id: comment.id,
        author: comment.author,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return errorResponse("Failed to fetch dashboard statistics")
  }
}
