import NextAuth, { DefaultSession, type NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

// 扩展 NextAuth 类型
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userRole: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string | null
    userRole: string
  }
}

// JWT types are handled internally by next-auth

const nextAuth = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        if (!user[0]) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user[0].password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          userRole: user[0].role || "user",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.userRole = user.userRole
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error - NextAuth v5 beta type issue
        session.user.id = token.id
        // @ts-expect-error - NextAuth v5 beta type issue
        session.user.userRole = token.userRole
      }
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export const auth = nextAuth.auth
const handler = nextAuth.handlers

export async function GET(request: NextRequest) {
  return handler.GET(request)
}

export async function POST(request: NextRequest) {
  return handler.POST(request)
}
