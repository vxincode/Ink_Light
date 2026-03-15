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
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: "var(--background)",
          borderBottom: "1px solid var(--border)"
        }}
      >
        <div style={{
          padding: "0 1.5rem",
          maxWidth: "42rem",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "4rem"
        }}>
          <Link
            href="/"
            style={{
              fontSize: "1.125rem",
              fontWeight: 500,
              letterSpacing: "-0.025em"
            }}
          >
            {settings.siteName}
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: "none" }} className="md:flex md:items-center md:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: "0.875rem",
                  color: pathname?.startsWith(item.href) ? "var(--foreground)" : "var(--muted-foreground)"
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "none" }} className="md:flex md:items-center md:gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/dashboard">管理</Link>
            </Button>
          </div>

          {/* Mobile Button */}
          <div style={{ display: "flex" }} className="md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(true)}
              style={{
                width: "2.25rem",
                height: "2.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                cursor: "pointer"
              }}
            >
              <Menu style={{ width: "1.25rem", height: "1.25rem" }} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex"
          }}
          className="md:hidden"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.4)"
            }}
          />

          {/* Menu */}
          <div
            style={{
              width: "16rem",
              backgroundColor: "var(--background)",
              borderLeft: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "4rem",
              padding: "0 1rem",
              borderBottom: "1px solid var(--border)"
            }}>
              <span style={{ fontWeight: 500 }}>菜单</span>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "2rem",
                  height: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer"
                }}
              >
                <X style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            {/* Links */}
            <nav style={{ flex: 1, padding: "0.5rem" }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "block",
                    padding: "0.75rem 1rem",
                    fontSize: "0.9375rem",
                    borderRadius: "0.5rem",
                    color: pathname?.startsWith(item.href) ? "var(--foreground)" : "var(--muted-foreground)",
                    backgroundColor: pathname?.startsWith(item.href) ? "var(--muted)" : "transparent",
                    fontWeight: pathname?.startsWith(item.href) ? 500 : 400
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "block",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  color: "var(--muted-foreground)"
                }}
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
