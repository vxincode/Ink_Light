"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Image, MessageSquare, Eye, Plus, Loader2 } from "lucide-react"

interface Stats {
  posts: number
  albums: number
  comments: number
  views: number
}

interface RecentPost {
  id: string
  title: string
  status: string
  date: string | null
}

interface RecentComment {
  id: string
  author: string
  content: string
  createdAt: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ posts: 0, albums: 0, comments: 0, views: 0 })
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [recentComments, setRecentComments] = useState<RecentComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStats(data.data.stats)
          setRecentPosts(data.data.recentPosts)
          setRecentComments(data.data.recentComments)
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".")
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return formatDate(dateString)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  const statItems = [
    { label: "文章", value: stats.posts, icon: FileText, href: "/admin/posts" },
    { label: "相册", value: stats.albums, icon: Image, href: "/admin/albums" },
    { label: "评论", value: stats.comments, icon: MessageSquare, href: "/admin/comments" },
    { label: "访问", value: formatNumber(stats.views), icon: Eye, href: "#" },
  ]

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PUBLISHED: "已发布",
      DRAFT: "草稿",
    }
    return labels[status] || status
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">概览</h1>
          <p className="text-xs text-[#787672]">欢迎回来，管理员</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="h-8 px-3 text-xs flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-white rounded-md"
        >
          <Plus className="w-3.5 h-3.5" />
          新建文章
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-4 bg-white border border-[#e4e1db] rounded-lg hover:border-accent/50 transition-colors group shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-[#a8a6a2] group-hover:text-accent transition-colors" />
              </div>
              <div className="text-2xl font-medium">{stat.value}</div>
              <div className="text-xs text-[#787672] mt-1">{stat.label}</div>
            </Link>
          )
        })}
      </div>

      {/* Two Columns */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Posts */}
        <div className="lg:col-span-3 bg-white border border-[#e4e1db] rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-[#e4e1db] flex items-center justify-between">
            <span className="text-sm font-medium">最近文章</span>
            <Link href="/admin/posts" className="text-xs text-[#787672] hover:text-accent">
              查看全部
            </Link>
          </div>
          <div className="divide-y divide-[#e4e1db]">
            {recentPosts.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#787672]">暂无文章</div>
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#F5F3EF] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{post.title}</div>
                    <div className="text-xs text-[#a8a6a2] mt-0.5">{formatDate(post.date)}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded ml-3 shrink-0 ${
                    post.status === "PUBLISHED"
                      ? "bg-accent/10 text-accent"
                      : "bg-[#F5F3EF] text-[#787672]"
                  }`}>
                    {getStatusLabel(post.status)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="lg:col-span-2 bg-white border border-[#e4e1db] rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-[#e4e1db] flex items-center justify-between">
            <span className="text-sm font-medium">最近评论</span>
            <Link href="/admin/comments" className="text-xs text-[#787672] hover:text-accent">
              查看全部
            </Link>
          </div>
          <div className="divide-y divide-[#e4e1db]">
            {recentComments.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[#787672]">暂无评论</div>
            ) : (
              recentComments.map((comment) => (
                <div key={comment.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[10px] text-accent font-medium">
                      {comment.author?.[0] || "?"}
                    </div>
                    <span className="text-xs">{comment.author}</span>
                    <span className="text-[10px] text-[#a8a6a2]">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-[#787672] line-clamp-1">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
