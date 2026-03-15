"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
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

  // 防止滚动
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
        <div className="px-6 max-w-2xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-medium text-black dark:text-white">
            {settings.siteName}
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors",
                  pathname?.startsWith(item.href)
                    ? "text-black dark:text-white"
                    : "text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/dashboard">管理</Link>
            </Button>
          </div>

          {/* Mobile Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(true)}
              className="w-9 h-9 flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden"
          onClick={() => setIsOpen(false)}
        >
          {/* Menu Panel - 点击阻止关闭 */}
          <div
            className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-zinc-700">
              <span className="font-medium text-black dark:text-white">菜单</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-[15px] transition-colors",
                    pathname?.startsWith(item.href)
                      ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium"
                      : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-zinc-700">
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
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
