"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useSettings } from "@/hooks/use-settings"

const navItems = [
  { href: "/posts/essay", label: "随笔" },
  { href: "/posts/travel", label: "旅途" },
  { href: "/albums", label: "相册" },
  { href: "/guestbook", label: "留言" },
  { href: "/about", label: "关于" },
]

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { settings } = useSettings()

  return (
    <>
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="px-6 max-w-2xl mx-auto flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-display text-lg font-medium tracking-tight hover:text-accent transition-colors"
          >
            {settings.siteName}
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm link-underline transition-colors",
                  pathname?.startsWith(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs tracking-wide"
            >
              <Link href="/admin/dashboard">管理</Link>
            </Button>
          </div>

          {/* Mobile - 只显示按钮 */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - 完全独立的层，只在移动端显示 */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* 关闭区域 - 点击关闭 */}
          <div
            className="flex-1 bg-black/30"
            onClick={() => setIsOpen(false)}
          />

          {/* 菜单面板 - 完全不透明 */}
          <div className="w-64 bg-background border-l flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="font-medium">菜单</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 导航 */}
            <nav className="flex-1 p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-[15px] transition-colors",
                    pathname?.startsWith(item.href)
                      ? "text-foreground bg-muted font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* 底部 */}
            <div className="p-4 border-t">
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                进入后台
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
