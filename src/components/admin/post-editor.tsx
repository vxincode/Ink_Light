"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { MarkdownEditor } from "@/components/ui/markdown-editor"
import { Save, Eye, ArrowLeft, ChevronRight, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const categories = [
  { value: "ESSAY", label: "生活随笔" },
  { value: "TRAVEL", label: "旅游日志" },
]

interface PostEditorProps {
  postId: string
}

export default function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter()
  const isNew = postId === "new"
  const [isLoading, setIsLoading] = useState(!isNew)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "ESSAY",
    status: "DRAFT",
    coverImage: "",
  })

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // 加载现有文章数据
  useEffect(() => {
    if (!isNew && postId) {
      setIsLoading(true)
      fetch(`/api/posts/${postId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setFormData({
              title: data.data.title || "",
              slug: data.data.slug || "",
              content: data.data.content || "",
              excerpt: data.data.excerpt || "",
              category: data.data.category || "ESSAY",
              status: data.data.status || "DRAFT",
              coverImage: data.data.coverImage || "",
            })
            // 加载标签
            if (data.data.tags) {
              setTags(data.data.tags.map((t: { tag: { name: string } }) => t.tag.name))
            }
          }
        })
        .catch((error) => {
          console.error("Error loading post:", error)
          setMessage("加载文章失败")
          setMessageType("error")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [postId, isNew])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "title" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async (publish = false) => {
    // 表单验证
    if (!formData.title.trim()) {
      setMessage("请输入文章标题")
      setMessageType("error")
      return
    }
    if (!formData.content.trim()) {
      setMessage("请输入文章内容")
      setMessageType("error")
      return
    }

    setIsSaving(true)
    setMessage("")

    const status = publish ? "PUBLISHED" : "DRAFT"
    const postData = {
      ...formData,
      status,
      tags,
    }

    try {
      const url = isNew ? "/api/posts" : `/api/posts/${postId}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(publish ? "文章已发布！" : "草稿已保存!")
        setMessageType("success")

        // 新建文章时重定向到编辑页面
        if (isNew && result.data?.id) {
          // 使用 replace 避免历史记录中出现 "new" 页面
          router.replace(`/admin/posts/${result.data.id}/edit`)
          // 刷新页面以更新服务端组件状态
          router.refresh()
        }
      } else {
        setMessage(result.error || "保存失败")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error saving post:", error)
      setMessage("保存失败，请重试")
      setMessageType("error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-1.5 hover:bg-[#F5F3EF] rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-medium">
              {isNew ? "新建文章" : "编辑文章"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && postId && (
            <Link
              href={`/posts/${postId}`}
              target="_blank"
              className="h-8 px-3 text-xs border border-[#e4e1db] hover:border-accent/30"
            >
              <Eye className="w-4 h-4 text-[#505050] hover:text-accent" />
            </Link>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="h-8 px-3 text-xs border border-[#e4e1db] hover:border-accent"
          >
            <Save className="w-4 h-4 mr-2" />
            保存草稿
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white rounded"
          >
            {isSaving ? "发布中..." : "发布"}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "flex items-center gap-2 text-xs px-3 py-2 rounded",
          messageType === "error" ? "text-red-500 bg-red-50" : "text-accent bg-accent/10 border border-accent/20"
        )}>
          <ChevronRight className="w-3.5 h-3.5" />
          {message}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Form */}
          <div className="grid lg:grid-cols-4 gap-4">
            {/* Main */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-[#e4e1db] rounded-lg p-4 shadow-sm">
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">标题</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="输入文章标题..."
                    className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">链接</label>
                  <div className="flex items-center gap-2 text-sm text-[#a8a6a2]">
                    /posts/
                    <Input
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="article-slug"
                      className="h-9 flex-1 text-xs bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040] font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">摘要</label>
                  <Textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="简短描述文章内容..."
                    rows={2}
                    className="text-xs bg-white border-[#e4e1db] focus:border-accent resize-none placeholder:text-[#404040]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">正文内容 *</label>
                  <MarkdownEditor
                    value={formData.content}
                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                    placeholder="开始写作... 支持 Markdown 语法"
                    rows={12}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white border border-[#e4e1db] rounded-lg shadow-sm">
                <div className="px-4 py-2 border-b border-[#e4e1db] text-xs font-medium text-[#555]">发布设置</div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-xs text-[#666] mb-1 block">分类</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full h-9 px-3 text-xs bg-white border border-[#e4e1db] rounded focus:border-accent focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-1 block">状态</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, status: "DRAFT" }))}
                        className={cn(
                          "flex-1 h-8 text-xs border transition-all",
                          formData.status === "DRAFT"
                            ? "border-accent/50 bg-accent/10 text-accent"
                            : "border-[#e4e1db] text-[#666]"
                        )}
                      >
                        草稿
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, status: "PUBLISHED" }))}
                        className={cn(
                          "flex-1 h-8 text-xs border transition-all",
                          formData.status === "PUBLISHED"
                            ? "border-accent/50 bg-accent/10 text-accent"
                            : "border-[#e4e1db] text-[#666]"
                        )}
                      >
                        已发布
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#666] mb-1 block">封面图</label>
                    <ImageUpload
                      value={formData.coverImage}
                      onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                      onRemove={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e4e1db] rounded-lg shadow-sm">
                <div className="px-4 py-2 border-b border-[#e4e1db] text-xs font-medium text-[#555]">标签</div>
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="添加标签..."
                      className="h-8 flex-1 text-xs bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
                    />
                    <Button
                      onClick={handleAddTag}
                      className="h-8 px-2 text-xs bg-accent hover:bg-accent/90 text-white rounded"
                    >
                      +
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 border border-[#e4e1db] rounded group"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="opacity-50 hover:opacity-100"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
