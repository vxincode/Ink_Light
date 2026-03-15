"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, Loader2, Plus } from "lucide-react"
import { useIsAdmin } from "@/hooks/use-admin"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string
  createdAt: string
  publishedAt: string | null
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isAdmin } = useIsAdmin()

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/posts?limit=50")
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ESSAY: "随笔",
      TRAVEL: "旅行",
    }
    return labels[category] || category
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="px-6 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            文章
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            全部<span className="italic text-accent">文章</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground max-w-md">
              在这里，我用文字记录生活中的点点滴滴、分享旅途中的见闻。
            </p>
            {isAdmin && (
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-accent text-white rounded hover:bg-accent/90 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                新建文章
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
                  <Link
                    href={`/posts/${post.slug}`}
                    className="block group-hover:-translate-y-0.5 transition-transform duration-200"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h2 className="text-lg font-medium group-hover:text-accent transition-colors">
                        {post.title}
                      </h2>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
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
