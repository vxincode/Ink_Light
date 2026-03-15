"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowUpRight, Loader2, Tag } from "lucide-react"

interface Post {
  id: string
  title: string
  excerpt: string | null
  createdAt: string
}

interface TagInfo {
  id: string
  name: string
  slug: string
}

export default function TagPage() {
  const params = useParams()
  const slug = params.slug as string

  const [tag, setTag] = useState<TagInfo | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      fetch(`/api/tags`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            const found = data.data.find((t: TagInfo) => t.slug === slug)
            if (found) {
              setTag(found)
            } else {
              setNotFound(true)
            }
          }
        }),
      fetch(`/api/posts?tag=${slug}&limit=100`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setPosts(data.data)
          }
        }),
    ])
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [slug])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".")
  }

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen">
        <div className="px-6 max-w-2xl mx-auto py-24">
          <div className="text-center">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-medium mb-2">标签不存在</h1>
            <p className="text-muted-foreground mb-6">没有找到这个标签</p>
            <Link
              href="/"
              className="text-sm text-accent hover:underline"
            >
              返回首页
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="px-6 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            标签
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            <span className="text-accent">#</span>{tag?.name || slug}
          </h1>
          <p className="text-muted-foreground max-w-md">
            共 {posts.length} 篇文章
          </p>
        </div>
      </section>

      {/* Posts List */}
      <section className="py-8 border-t">
        <div className="px-6 max-w-2xl mx-auto">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              该标签下暂无文章
            </p>
          ) : (
            <div className="space-y-10">
              {posts.map((post) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.id}`} className="block">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatDate(post.createdAt)}
                      </span>
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
