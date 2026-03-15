"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, Loader2, Plus } from "lucide-react"
import { useIsAdmin } from "@/hooks/use-admin"

interface Post {
  id: string
  title: string
  excerpt: string | null
  createdAt: string
}

export default function TravelPage() {
  const [travels, setTravels] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAdmin } = useIsAdmin()

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/posts?category=TRAVEL&limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTravels(data.data)
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".")
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="px-6 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            旅游日志
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            用脚步丈量<span className="italic text-accent">世界</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground max-w-md">
              每一次旅途都是一场相遇——与风景相遇，与文化相遇，也与未知的自己相遇。
            </p>
            {isAdmin && (
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-accent text-white rounded hover:bg-accent/90 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                新建游记
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Travel List */}
      <section className="py-8 border-t">
        <div className="px-6 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : travels.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">暂无游记</div>
          ) : (
            <div className="space-y-12">
              {travels.map((trip) => (
                <article key={trip.id} className="group">
                  <Link href={`/posts/${trip.id}`} className="block">
                    <h2 className="font-display text-xl md:text-2xl font-medium mb-2 group-hover:text-accent transition-colors duration-300">
                      {trip.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                      {trip.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-mono">{formatDate(trip.createdAt)}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent transition-colors">
                        查看详情 <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
