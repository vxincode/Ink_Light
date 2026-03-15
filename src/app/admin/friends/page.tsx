"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Check, X, Trash2, Loader2, Plus, ExternalLink, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

interface Friend {
  id: string
  name: string
  url: string
  description: string | null
  avatar: string | null
  status: "PENDING" | "ACTIVE" | "INACTIVE"
  order: number
  createdAt: string
}

export default function AdminFriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // 编辑/新建表单状态
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    avatar: "",
    order: 0,
    status: "PENDING" as "PENDING" | "ACTIVE" | "INACTIVE",
  })
  const [isSaving, setIsSaving] = useState(false)

  // 加载友链列表
  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = () => {
    setIsLoading(true)
    fetch("/api/admin/friends")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setFriends(data.data)
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }

  const filteredFriends = friends.filter((friend) => {
    if (statusFilter === "all") return true
    return friend.status === statusFilter
  })

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/friends/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      })

      const result = await response.json()

      if (result.success) {
        setFriends(friends.map((f) =>
          f.id === id ? { ...f, status: "ACTIVE" } : f
        ))
        showMessage("友链已通过", "success")
      }
    } catch (error) {
      console.error("Error approving friend:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/friends/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INACTIVE" }),
      })

      const result = await response.json()

      if (result.success) {
        setFriends(friends.map((f) =>
          f.id === id ? { ...f, status: "INACTIVE" } : f
        ))
        showMessage("友链已拒绝", "success")
      }
    } catch (error) {
      console.error("Error rejecting friend:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个友链吗？")) return

    try {
      const response = await fetch(`/api/admin/friends/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setFriends(friends.filter((f) => f.id !== id))
        showMessage("友链已删除", "success")
      }
    } catch (error) {
      console.error("Error deleting friend:", error)
    }
  }

  const handleEdit = (friend: Friend) => {
    setEditingId(friend.id)
    setFormData({
      name: friend.name,
      url: friend.url,
      description: friend.description || "",
      avatar: friend.avatar || "",
      order: friend.order || 0,
      status: friend.status || "PENDING",
    })
    setShowForm(true)
  }

  const handleNew = () => {
    setEditingId(null)
    setFormData({
      name: "",
      url: "",
      description: "",
      avatar: "",
      order: 0,
      status: "PENDING",
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      showMessage("请填写名称和网址", "error")
      return
    }

    setIsSaving(true)

    try {
      const url = editingId ? `/api/admin/friends/${editingId}` : "/api/admin/friends"
      const method = editingId ? "PUT" : "POST"

      const body = editingId
        ? { ...formData, status: formData.status || "ACTIVE" }
        : { ...formData, status: "PENDING" }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        showMessage(editingId ? "友链已更新" : "友链已添加", "success")
        setShowForm(false)
        loadFriends()
      } else {
        showMessage(result.error || "保存失败", "error")
      }
    } catch (error) {
      console.error("Error saving friend:", error)
      showMessage("保存失败", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 3000)
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "待审核",
      ACTIVE: "已通过",
      INACTIVE: "已拒绝",
    }
    return labels[status] || status
  }

  const pendingCount = friends.filter(f => f.status === "PENDING").length

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
          <h1 className="text-lg font-medium">友链管理</h1>
          <p className="text-xs text-[#787672]">
            {pendingCount > 0 ? `${pendingCount} 条待审核` : `${friends.length} 个友链`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-3 text-xs bg-white border border-[#e4e1db] rounded focus:border-accent focus:outline-none"
          >
            <option value="all">全部状态</option>
            <option value="PENDING">待审核</option>
            <option value="ACTIVE">已通过</option>
            <option value="INACTIVE">已拒绝</option>
          </select>
          <Button
            onClick={handleNew}
            className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white rounded-md"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            添加友链
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "text-xs px-3 py-2 rounded",
          messageType === "error"
            ? "text-red-500 bg-red-50 border border-red-100"
            : "text-accent bg-accent/5 border border-accent/20"
        )}>
          {message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-[#e4e1db] rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-medium mb-4">
            {editingId ? "编辑友链" : "添加友链"}
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#666] mb-1 block">名称 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="博客名称"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1 block">网址 *</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#666] mb-1 block">头像 URL</label>
                <Input
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1 block">排序</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1 block">描述</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简短描述..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white"
              >
                {isSaving ? "保存中..." : "保存"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="h-8 px-3 text-xs"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white border border-[#e4e1db] rounded-lg divide-y divide-[#e4e1db] shadow-sm">
        {filteredFriends.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#787672]">没有找到友链</div>
        ) : (
          filteredFriends.map((friend) => (
            <div key={friend.id} className="p-4 hover:bg-[#F5F3EF]/50 transition-colors group">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm text-accent font-medium shrink-0 overflow-hidden">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    friend.name?.[0] || "?"
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{friend.name}</span>
                    <a
                      href={friend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a8a6a2] hover:text-accent"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        friend.status === "ACTIVE"
                          ? "bg-accent/10 text-accent"
                          : friend.status === "INACTIVE"
                          ? "bg-red-50 text-red-500"
                          : "bg-[#F5F3EF] text-[#787672]"
                      )}
                    >
                      {getStatusLabel(friend.status)}
                    </span>
                  </div>

                  <p className="text-sm text-[#787672] mb-2">{friend.description || friend.url}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#a8a6a2]">
                      {new Date(friend.createdAt).toLocaleDateString("zh-CN")}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {friend.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(friend.id)}
                            className="p-1.5 hover:bg-green-50 rounded"
                            title="通过"
                          >
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleReject(friend.id)}
                            className="p-1.5 hover:bg-yellow-50 rounded"
                            title="拒绝"
                          >
                            <X className="w-3.5 h-3.5 text-yellow-500" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(friend)}
                        className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                        title="编辑"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#a8a6a2]" />
                      </button>
                      <button
                        onClick={() => handleDelete(friend.id)}
                        className="p-1.5 hover:bg-red-50 rounded"
                        title="删除"
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
