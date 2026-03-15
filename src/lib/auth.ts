import { auth } from "@/app/api/auth/[...next]/route"
import { NextResponse } from "next/server"

// 获取当前 session
export async function getAuthSession() {
  try {
    const session = await auth()
    return session
  } catch {
    return null
  }
}

// 验证管理员权限
export async function requireAdmin(): Promise<
  | { authorized: true; user: { id: string; userRole: string; email?: string; name?: string | null } }
  | { authorized: false; response: NextResponse }
> {
  const session = await getAuthSession()

  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      ),
    }
  }

  if (session.user.userRole !== "ADMIN") {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "需要管理员权限" },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true,
    user: {
      id: session.user.id,
      userRole: session.user.userRole,
      email: session.user.email,
      name: session.user.name,
    },
  }
}

// 统一的错误响应
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

// 统一的成功响应
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

// 分页响应
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
