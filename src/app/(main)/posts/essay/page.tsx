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

export default function EssaysPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAdmin } = useIsAdmin()

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/posts?category=ESSAY&limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPosts(data.data)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
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
            生活随笔
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            记录生活的<span className="italic text-accent">点滴感悟</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground max-w-md">
              思考、感悟、成长——在这里，我用文字记录生活中那些值得珍藏的瞬间。
            </p>
            {isAdmin && (
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-accent text-white rounded hover:bg-accent/90 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                新建随笔
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Posts List */}
      <section className="py-8 border-t">
        <div className="px-6 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">暂无文章</p>
          ) : (
            <div className="space-y-10">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.id}`} className="block">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs text-muted-foreground font-mono">{formatDate(post.createdAt)}</span>
                    </div>
                    <h2 className="font-display text-xl md:text-2xl font-medium mb-2 group-hover:text-accent transition-colors duration-300">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-3 group-hover:text-accent transition-colors">
                      阅读全文 <ArrowUpRight className="w-3 h-3" />
                    </span>
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
