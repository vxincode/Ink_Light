import { NextResponse } from "next/server"
import { getAuthSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ isAdmin: false })
    }

    const isAdmin = session.user.userRole === "ADMIN"

    return NextResponse.json({
      isAdmin,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    })
  } catch (error) {
    console.error("Error checking auth status:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
