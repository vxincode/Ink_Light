"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, PenLine } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("邮箱或密码错误")
      } else {
        router.push("/admin/dashboard")
        router.refresh()
      }
    } catch {
      setError("登录失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-white rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgb(201, 169, 98)' }}>
              <PenLine className="w-6 h-6 text-[#1a1a1a]" />
            </div>
            <span className="font-display text-2xl font-medium">墨迹</span>
          </div>

          <h1 className="font-display text-4xl font-medium leading-tight mb-4">
            记录生活的
            <br />
            <span className="italic" style={{ color: 'rgb(201, 169, 98)' }}>片刻时光</span>
          </h1>

          <p className="text-white/60 leading-relaxed mb-8">
            随笔、旅途、光影——在这里，用文字和影像记录生活中那些值得珍藏的瞬间。
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgb(201, 169, 98)' }}>
                <PenLine className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <span className="font-display text-xl font-medium">墨迹</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-medium mb-2">欢迎回来</h2>
            <p className="text-sm text-muted-foreground">
              登录以管理你的博客内容
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">邮箱地址</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 bg-white border-[#e4e1db] focus:border-accent placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">密码</label>
                <Input
                  type="password"
                  placeholder="输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 bg-white border-[#e4e1db] focus:border-accent placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 font-medium"
              style={{ backgroundColor: 'rgb(201, 169, 98)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  验证中...
                </span>
              ) : (
                "登录"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              首次使用？请联系管理员获取账号
            </p>
          </div>

          {/* Mobile Back Link */}
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-6 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
