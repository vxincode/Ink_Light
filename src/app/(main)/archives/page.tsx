"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, Loader2, Calendar } from "lucide-react"

interface Post {
  id: string
  title: string
  excerpt: string | null
  createdAt: string
  category: string
}

interface GroupedPosts {
  year: string
  months: {
    month: string
    posts: Post[]
  }[]
}

export default function ArchivesPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/posts?limit=200")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPosts(data.data)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const groupPostsByDate = (posts: Post[]): GroupedPosts[] => {
    const grouped: Record<string, Record<string, Post[]>> = {}

    posts.forEach((post) => {
      const date = new Date(post.createdAt)
      const year = date.getFullYear().toString()
      const month = (date.getMonth() + 1).toString()

      if (!grouped[year]) {
        grouped[year] = {}
      }
      if (!grouped[year][month]) {
        grouped[year][month] = []
      }
      grouped[year][month].push(post)
    })

    const result: GroupedPosts[] = Object.keys(grouped)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map((year) => ({
        year,
        months: Object.keys(grouped[year])
          .sort((a, b) => parseInt(b) - parseInt(a))
          .map((month) => ({
            month,
            posts: grouped[year][month].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
          })),
      }))

    return result
  }

  const getMonthName = (month: string) => {
    const monthNames = [
      "一月", "二月", "三月", "四月", "五月", "六月",
      "七月", "八月", "九月", "十月", "十一月", "十二月"
    ]
    return monthNames[parseInt(month) - 1] || month
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}.${date.getDate()}`
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ESSAY: "随笔",
      TRAVEL: "旅途",
    }
    return labels[category] || category
  }

  const groupedPosts = groupPostsByDate(posts)
  const totalPosts = posts.length

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
            文章归档
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            时光<span className="italic text-accent">轴</span>
          </h1>
          <p className="text-muted-foreground max-w-md">
            共 {totalPosts} 篇文章，按时间归档
          </p>
        </div>
      </section>

      {/* Archives List */}
      <section className="py-8 border-t">
        <div className="px-6 max-w-2xl mx-auto">
          {groupedPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">暂无文章</p>
          ) : (
            <div className="space-y-12">
              {groupedPosts.map((yearGroup) => (
                <div key={yearGroup.year}>
                  {/* Year Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-accent" />
                    <h2 className="font-display text-2xl font-medium">{yearGroup.year}</h2>
                    <span className="text-xs text-muted-foreground">
                      {yearGroup.months.reduce((acc, m) => acc + m.posts.length, 0)} 篇
                    </span>
                  </div>

                  {/* Months */}
                  <div className="space-y-8 pl-8 border-l-2 border-border">
                    {yearGroup.months.map((monthGroup) => (
                      <div key={`${yearGroup.year}-${monthGroup.month}`}>
                        {/* Month Header */}
                        <div className="flex items-center gap-2 mb-4 -ml-[9px]">
                          <div className="w-4 h-4 rounded-full bg-accent" />
                          <h3 className="text-sm font-medium text-muted-foreground">
                            {getMonthName(monthGroup.month)}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {monthGroup.posts.length} 篇
                          </span>
                        </div>

                        {/* Posts */}
                        <div className="space-y-4 pl-6">
                          {monthGroup.posts.map((post) => (
                            <article key={post.id} className="group">
                              <Link href={`/posts/${post.id}`} className="block">
                                <div className="flex items-start gap-3">
                                  <span className="text-xs text-muted-foreground font-mono shrink-0 mt-1">
                                    {formatDate(post.createdAt)}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium group-hover:text-accent transition-colors">
                                      {post.title}
                                    </h4>
                                    {post.excerpt && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {post.excerpt}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {getCategoryLabel(post.category)}
                                  </span>
                                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                                </div>
                              </Link>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
