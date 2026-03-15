"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
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

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] pt-12">
              <SheetTitle className="sr-only">导航菜单</SheetTitle>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-3 text-base transition-colors",
                      pathname?.startsWith(item.href)
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
