"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import {
  LayoutDashboard,
  FileText,
  Image,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  Tag,
  Menu,
  X,
  ChevronRight,
  Users,
} from "lucide-react"

const navItems = [
  { href: "/admin/dashboard", label: "概览", icon: LayoutDashboard },
  { href: "/admin/posts", label: "文章", icon: FileText },
  { href: "/admin/albums", label: "相册", icon: Image },
  { href: "/admin/comments", label: "评论", icon: MessageSquare },
  { href: "/admin/tags", label: "标签", icon: Tag },
  { href: "/admin/friends", label: "友链", icon: Users },
  { href: "/admin/settings", label: "设置", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // 检查登录状态
  useEffect(() => {
    // 登录页不需要检查
    if (pathname === "/admin/login") {
      setIsAuthenticated(true)
      return
    }

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          router.push("/admin/login")
        }
      })
      .catch(() => {
        setIsAuthenticated(false)
        router.push("/admin/login")
      })
  }, [pathname, router])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/admin/login")
    router.refresh()
  }

  // 登录页直接显示
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // 加载中
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // 未认证
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#1c1c1c] font-sans flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded border border-[#e4e1db] bg-white flex items-center justify-center shadow-sm"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-56 bg-white border-r border-[#e4e1db] flex flex-col transition-transform lg:translate-x-0 shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-[#e4e1db]">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
              <span className="text-xs font-bold text-[#1c1c1c]">M</span>
            </div>
            <span className="font-medium text-sm">墨迹后台</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-[#F5F3EF] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="mb-2 px-3 py-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#787672] font-medium">
              内容管理
            </span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-colors mb-0.5",
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-[#787672] hover:text-[#1c1c1c] hover:bg-[#F5F3EF]"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3 h-3 ml-auto" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[#e4e1db]">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#787672] hover:text-[#1c1c1c] rounded-lg hover:bg-[#F5F3EF]"
          >
            <Home className="w-4 h-4" />
            <span>返回前台</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#787672] hover:text-red-500 rounded-lg hover:bg-red-50 text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 px-4 lg:px-6 flex items-center justify-between border-b border-[#e4e1db] bg-white">
          <div className="lg:hidden w-9" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs text-accent font-medium">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
