"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Loader2, Check, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tag {
  id: string
  name: string
  slug: string
  postCount: number
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 加载标签列表
  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = () => {
    setIsLoading(true)
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setTags(data.data)
        }
      })
      .catch((error) => {
        console.error("Error loading tags:", error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(""), 3000)
  }

  const handleAdd = async () => {
    if (!newTag.trim()) return

    const exists = tags.find((t) => t.name.toLowerCase() === newTag.toLowerCase())
    if (exists) {
      showMessage("标签已存在", "error")
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag.trim() }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setTags([...tags, { ...result.data, postCount: 0 }])
        setNewTag("")
        showMessage("标签添加成功", "success")
      } else {
        showMessage(result.error || "添加失败", "error")
      }
    } catch (error) {
      console.error("Error adding tag:", error)
      showMessage("添加失败，请重试", "error")
    } finally {
      setIsAdding(false)
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditingName(tag.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      showMessage("标签名不能为空", "error")
      return
    }

    const exists = tags.find((t) => t.id !== editingId && t.name.toLowerCase() === editingName.toLowerCase())
    if (exists) {
      showMessage("标签名已存在", "error")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/tags/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      })

      const result = await response.json()

      if (result.success) {
        setTags(tags.map((t) =>
          t.id === editingId
            ? { ...t, name: editingName.trim(), slug: result.data?.slug || t.slug }
            : t
        ))
        setEditingId(null)
        setEditingName("")
        showMessage("标签已更新", "success")
      } else {
        showMessage(result.error || "更新失败", "error")
      }
    } catch (error) {
      console.error("Error updating tag:", error)
      showMessage("更新失败，请重试", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const tag = tags.find((t) => t.id === id)
    if (tag && tag.postCount > 0) {
      if (!confirm(`此标签下有 ${tag.postCount} 篇文章，确定要删除吗？`)) return
    } else {
      if (!confirm("确定要删除这个标签吗？")) return
    }

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setTags(tags.filter((t) => t.id !== id))
        showMessage("标签已删除", "success")
      } else {
        showMessage(result.error || "删除失败", "error")
      }
    } catch (error) {
      console.error("Error deleting tag:", error)
      showMessage("删除失败，请重试", "error")
    }
  }

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
          <h1 className="text-lg font-medium">标签</h1>
          <p className="text-xs text-[#787672]">{tags.length} 个标签</p>
        </div>
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

      {/* Add Tag */}
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="输入新标签名称..."
          className="h-8 max-w-xs text-xs bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#a8a6a2]"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={isAdding}
        />
        <Button
          onClick={handleAdd}
          disabled={!newTag.trim() || isAdding}
          className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white"
        >
          {isAdding ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <Plus className="w-3 h-3 mr-1" />
              添加
            </>
          )}
        </Button>
      </div>

      {/* Tag Cloud */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="group text-xs px-3 py-1.5 bg-white border border-[#e4e1db] hover:border-accent/50 transition-colors rounded-lg"
            >
              {tag.name}
              <span className="text-[#a8a6a2] ml-1.5">{tag.postCount || 0}</span>
              <button
                onClick={() => handleEdit(tag)}
                className="ml-1.5 opacity-0 group-hover:opacity-100 hover:text-accent transition-all"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tags Table */}
      <div className="bg-white border border-[#e4e1db] rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] uppercase tracking-wider text-[#787672] border-b border-[#e4e1db] bg-[#F5F3EF]">
          <div className="col-span-3">标签名</div>
          <div className="col-span-5">链接</div>
          <div className="col-span-2">文章数</div>
          <div className="col-span-2 text-right">操作</div>
        </div>
        {tags.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#787672]">暂无标签</div>
        ) : (
          <div className="divide-y divide-[#e4e1db]">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="grid grid-cols-12 gap-3 px-4 py-2.5 items-center hover:bg-[#F5F3EF]/50 transition-colors group"
              >
                <div className="col-span-3">
                  {editingId === tag.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit()
                        if (e.key === "Escape") handleCancelEdit()
                      }}
                      className="h-7 text-xs"
                      autoFocus
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="text-sm">{tag.name}</span>
                  )}
                </div>
                <div className="col-span-5 text-xs text-[#a8a6a2] font-mono">/tags/{tag.slug}</div>
                <div className="col-span-2 text-xs text-[#787672]">{tag.postCount || 0} 篇</div>
                <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === tag.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="p-1.5 hover:bg-green-50 rounded"
                        title="保存"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 text-green-500 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                        title="取消"
                      >
                        <X className="w-3.5 h-3.5 text-[#a8a6a2]" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(tag)}
                        className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                        title="编辑"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#a8a6a2] hover:text-accent" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-1.5 hover:bg-red-50 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#a8a6a2] hover:text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
