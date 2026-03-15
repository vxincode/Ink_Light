"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, X, Trash2, ArrowUpRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  author: string
  email: string
  content: string
  postId: string | null
  post: { id: string; title: string } | null
  isApproved: boolean | null
  createdAt: string
}

export default function AdminCommentsPage() {
  const [commentList, setCommentList] = useState<Comment[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")

  // 加载评论列表
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/admin/comments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCommentList(data.data)
        }
      })
      .catch((error) => {
        console.error("Error loading comments:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const filteredComments = commentList.filter((comment) => {
    const status = getStatusLabel(comment.isApproved)
    if (statusFilter === "all") return true
    if (statusFilter === "pending") return comment.isApproved === null
    if (statusFilter === "approved") return comment.isApproved === true
    if (statusFilter === "rejected") return comment.isApproved === false
    return true
  })

  const getStatusLabel = (isApproved: boolean | null) => {
    if (isApproved === null) return "待审核"
    if (isApproved === true) return "已通过"
    return "已拒绝"
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      })

      const result = await response.json()

      if (result.success) {
        setCommentList(commentList.map((c) =>
          c.id === id ? { ...c, isApproved: true } : c
        ))
        setMessage("评论已通过")
        setTimeout(() => setMessage(""), 2000)
      }
    } catch (error) {
      console.error("Error approving comment:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      })

      const result = await response.json()

      if (result.success) {
        setCommentList(commentList.map((c) =>
          c.id === id ? { ...c, isApproved: false } : c
        ))
        setMessage("评论已拒绝")
        setTimeout(() => setMessage(""), 2000)
      }
    } catch (error) {
      console.error("Error rejecting comment:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条评论吗？")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setCommentList(commentList.filter((c) => c.id !== id))
        setMessage("评论已删除")
        setTimeout(() => setMessage(""), 2000)
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".")
  }

  const pendingCount = commentList.filter(c => c.isApproved === null).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">评论</h1>
          <p className="text-xs text-[#787672]">
            {pendingCount > 0 ? `${pendingCount} 条待审核` : "暂无待审核"}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 px-3 text-xs bg-white border border-[#e4e1db] rounded focus:border-accent focus:outline-none"
        >
          <option value="all">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>

      {/* Message */}
      {message && (
        <div className="text-xs text-accent bg-accent/5 border border-accent/20 px-3 py-2 rounded">
          {message}
        </div>
      )}

      {/* Comments List */}
      <div className="bg-white border border-[#e4e1db] rounded-lg divide-y divide-[#e4e1db] shadow-sm">
        {filteredComments.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#787672]">没有找到评论</div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="p-4 hover:bg-[#F5F3EF]/50 transition-colors group">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent font-medium shrink-0">
                  {comment.author?.[0] || "?"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author}</span>
                    <span className="text-[10px] text-[#a8a6a2]">{comment.email}</span>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded",
                      comment.isApproved === true
                        ? "bg-accent/10 text-accent"
                        : comment.isApproved === false
                        ? "bg-red-50 text-red-500"
                        : "bg-[#F5F3EF] text-[#787672]"
                    )}>
                      {getStatusLabel(comment.isApproved)}
                    </span>
                  </div>

                  <p className="text-sm text-[#787672] mb-2">{comment.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-[#a8a6a2]">
                      {comment.post && (
                        <Link
                          href={`/posts/${comment.post.id}`}
                          target="_blank"
                          className="hover:text-accent flex items-center gap-1"
                        >
                          《{comment.post.title}》 <ArrowUpRight className="w-2.5 h-2.5" />
                        </Link>
                      )}
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {comment.isApproved === null && (
                        <>
                          <button
                            onClick={() => handleApprove(comment.id)}
                            className="p-1.5 hover:bg-green-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleReject(comment.id)}
                            className="p-1.5 hover:bg-yellow-50 rounded"
                          >
                            <X className="w-3.5 h-3.5 text-yellow-500" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
