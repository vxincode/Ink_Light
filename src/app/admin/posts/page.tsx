"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search, Plus, Eye, Pencil, Trash2, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Post {
  id: string
  title: string
  category: string
  status: string
  views: number
  createdAt: string
}

const categoryLabels: Record<string, string> = {
  ESSAY: "随笔",
  TRAVEL: "旅途",
}

const statusLabels: Record<string, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
}

export default function AdminPostsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [postList, setPostList] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // 加载文章列表
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/posts?status=all&limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPostList(data.data)
        } else {
          setMessage("加载文章失败")
          setMessageType("error")
        }
      })
      .catch((error) => {
        console.error("Error loading posts:", error)
        setMessage("加载文章失败")
        setMessageType("error")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const filteredPosts = postList.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
    const categoryLabel = categoryLabels[post.category] || post.category
    const matchesCategory = categoryFilter === "all" || categoryLabel === categoryFilter
    const statusLabel = statusLabels[post.status] || post.status
    const matchesStatus = statusFilter === "all" || statusLabel === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setPostList(postList.filter((p) => p.id !== id))
        setMessage("文章已删除")
        setMessageType("success")
      } else {
        setMessage(result.error || "删除失败")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      setMessage("删除失败，请重试")
      setMessageType("error")
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">文章</h1>
          <p className="text-xs text-[#787672]">{postList.length} 篇文章</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="h-8 px-3 text-xs flex items-center gap-1.5 text-white rounded-md transition-colors"
          style={{ backgroundColor: 'rgb(201, 169, 98)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(181, 149, 78)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(201, 169, 98)'}
        >
          <Plus className="w-3.5 h-3.5" />
          新建
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            "flex items-center gap-2 text-xs px-3 py-2 rounded",
            messageType === "error"
              ? "text-red-500 bg-red-50 border border-red-100"
              : "text-accent bg-accent/5 border border-accent/20"
          )}
        >
          <Check className="w-3.5 h-3.5" />
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#a8a6a2]" />
          <Input
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-9 text-xs bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#a8a6a2]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-8 px-3 text-xs bg-white border border-[#e4e1db] rounded focus:border-accent focus:outline-none"
        >
          <option value="all">全部分类</option>
          <option value="随笔">随笔</option>
          <option value="旅途">旅途</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 px-3 text-xs bg-white border border-[#e4e1db] rounded focus:border-accent focus:outline-none"
        >
          <option value="all">全部状态</option>
          <option value="已发布">已发布</option>
          <option value="草稿">草稿</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border border-[#e4e1db] rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] uppercase tracking-wider text-[#787672] border-b border-[#e4e1db] bg-[#F5F3EF]">
              <div className="col-span-5">标题</div>
              <div className="col-span-2">分类</div>
              <div className="col-span-2">状态</div>
              <div className="col-span-1 text-right">阅读</div>
              <div className="col-span-2 text-right">操作</div>
            </div>
            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#787672]">暂无文章</div>
            ) : (
              <div className="divide-y divide-[#e4e1db]">
                {filteredPosts.map((post) => {
                  const categoryLabel = categoryLabels[post.category] || post.category
                  const statusLabel = statusLabels[post.status] || post.status
                  return (
                    <div
                      key={post.id}
                      className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-[#F5F3EF]/50 transition-colors group"
                    >
                      <div className="col-span-5 min-w-0">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="text-sm hover:text-accent transition-colors truncate block"
                        >
                          {post.title}
                        </Link>
                        <div className="text-[10px] text-[#a8a6a2] mt-0.5">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                      <div className="col-span-2 text-xs text-[#787672]">{categoryLabel}</div>
                      <div className="col-span-2">
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded",
                            post.status === "PUBLISHED"
                              ? "bg-accent/10 text-accent"
                              : "bg-[#F5F3EF] text-[#787672]"
                          )}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <div className="col-span-1 text-xs text-[#787672] text-right">
                        {post.views > 0 ? post.views.toLocaleString() : "-"}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/posts/${post.id}`}
                          target="_blank"
                          className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#a8a6a2] hover:text-accent" />
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#a8a6a2] hover:text-accent" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#a8a6a2] hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
