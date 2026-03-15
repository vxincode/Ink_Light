"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface Post {
  id: string
  title: string
  excerpt: string | null
  createdAt: string
  category: string
}

interface Album {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  photoCount: number
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [albums, setAlbums] = useState<Album[]>([])

  useEffect(() => {
    // Fetch posts
    fetch("/api/posts?limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPosts(data.data)
        }
      })
      .catch(console.error)

    // Fetch albums
    fetch("/api/albums?limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAlbums(data.data)
        }
      })
      .catch(console.error)
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
      TRAVEL: "旅途",
    }
    return labels[category] || category
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="px-6 max-w-2xl mx-auto">
          <div className="space-y-6 opacity-0 animate-fade-up">
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
              个人博客
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1]">
              记录生活的
              <br />
              <span className="italic text-accent">片刻时光</span>
            </h1>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              随笔、旅途、光影——在这里，我用文字和影像记录生活中那些值得珍藏的瞬间。
            </p>
            <div className="flex items-center gap-6 pt-2">
              <Link
                href="/posts/essay"
                className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors"
              >
                开始阅读 <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
              >
                关于我
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 border-t opacity-0 animate-fade-up animation-delay-100">
        <div className="px-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">最新文章</span>
            <Link
              href="/posts/essay"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-8">
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">暂无文章</p>
            ) : (
              posts.map((post, index) => (
                <article
                  key={post.id}
                  className="group"
                  style={{ animationDelay: `${0.15 + index * 0.1}s` }}
                >
                  <Link href={`/posts/${post.id}`} className="block">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs text-muted-foreground font-mono">{formatDate(post.createdAt)}</span>
                      <span className="text-xs text-accent">{getCategoryLabel(post.category)}</span>
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-medium mb-2 group-hover:text-accent transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </Link>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Albums */}
      <section className="py-12 border-t opacity-0 animate-fade-up animation-delay-200">
        <div className="px-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">摄影相册</span>
            <Link
              href="/albums"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {albums.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-2">暂无相册</p>
            ) : (
              albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="group relative aspect-[4/3] bg-muted overflow-hidden"
                >
                  {album.coverImage && (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <span className="text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {album.photoCount} 张照片
                    </span>
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-display text-lg text-white font-medium">{album.title}</h3>
                      {album.description && (
                        <p className="text-sm text-white/80">{album.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
                    <div className="text-center">
                      <span className="font-display text-lg font-medium">{album.title}</span>
                      <p className="text-xs text-muted-foreground">{album.photoCount} 张</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 border-t opacity-0 animate-fade-up animation-delay-300">
        <div className="px-6 max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-md">
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-4">关于</span>
              <p className="text-lg md:text-xl font-display leading-relaxed text-foreground/90">
                这是一个关于<span className="italic">记录</span>的角落——
                <br />
                记录生活的感悟、旅途的风景、镜头里的光影。
              </p>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors shrink-0"
            >
              了解更多 <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
