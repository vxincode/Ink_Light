"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, Eye, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AlbumEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string>("")
  const [paramsLoaded, setParamsLoaded] = useState(false)
  const isNew = id === "new"
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    order: 0,
    isPublic: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // 获取 params
  useEffect(() => {
    params.then((p) => {
      setId(p.id)
      setParamsLoaded(true)
    })
  }, [params])

  // 加载现有相册数据
  useEffect(() => {
    if (paramsLoaded && id && id !== "new") {
      setIsLoading(true)
      fetch(`/api/albums/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setFormData({
              title: data.data.title || "",
              description: data.data.description || "",
              coverImage: data.data.coverImage || "",
              order: data.data.order || 0,
              isPublic: data.data.isPublic ?? true,
            })
          }
        })
        .catch((error) => {
          console.error("Error loading album:", error)
          setMessage("加载相册失败")
          setMessageType("error")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [paramsLoaded, id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    let newValue: string | number | boolean = value

    // 处理 checkbox
    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked
    }
    // 处理 isPublic select（字符串转布尔值）
    else if (name === "isPublic") {
      newValue = value === "true"
    }
    // 处理数字输入
    else if (name === "order") {
      newValue = parseInt(value) || 0
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setMessage("请输入相册标题")
      setMessageType("error")
      return
    }

    setIsSaving(true)
    setMessage("")

    try {
      const url = isNew ? "/api/albums" : `/api/albums/${id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage("保存成功!")
        setMessageType("success")

        // 新建相册时重定向到编辑页面
        if (isNew && result.data?.id) {
          router.replace(`/admin/albums/${result.data.id}/edit`)
          router.refresh()
        } else {
          setTimeout(() => router.push("/admin/albums"), 1000)
        }
      } else {
        setMessage(result.error || "保存失败")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error saving album:", error)
      setMessage("保存失败，请重试")
      setMessageType("error")
    } finally {
      setIsSaving(false)
    }
  }

  // 等待 params 加载
  if (!paramsLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/albums"
            className="p-1.5 hover:bg-[#F5F3EF] rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-medium">
              {isNew ? "新建相册" : "编辑相册"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && id && (
            <Link
              href={`/albums/${id}`}
              target="_blank"
              className="h-8 px-3 text-xs border border-[#e4e1db] hover:border-accent/30 flex items-center"
            >
              <Eye className="w-4 h-4 text-[#505050] hover:text-accent" />
            </Link>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white rounded"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={cn(
          "flex items-center gap-2 text-xs px-3 py-2 rounded",
          messageType === "error"
            ? "text-red-500 bg-red-50 border border-red-100"
            : "text-accent bg-accent/5 border border-accent/20"
        )}>
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
          <div className="bg-white border border-[#e4e1db] rounded-lg p-4 space-y-4 shadow-sm">
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">标题 *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="输入相册标题..."
                className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
              />
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">描述</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="描述这个相册..."
                rows={2}
                className="text-xs bg-white border-[#e4e1db] focus:border-accent resize-none placeholder:text-[#404040]"
              />
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">封面图</label>
              <Input
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="图片 URL..."
                className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#666] mb-1 block">排序</label>
                <Input
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange}
                  min={0}
                  className="h-9 text-xs bg-white border-[#e4e1db] focus:border-accent"
                />
                <p className="text-[10px] text-[#555] mt-1">数字越小越靠前</p>
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1 block">可见性</label>
                <select
                  name="isPublic"
                  value={formData.isPublic.toString()}
                  onChange={handleChange}
                  className="w-full h-9 px-3 text-xs bg-white border border-[#e4e1db] rounded focus:border-accent focus:outline-none"
                >
                  <option value="true">公开</option>
                  <option value="false">私密</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-4 text-xs bg-accent hover:bg-accent/90 text-white rounded"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "保存中..." : "保存"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/admin/albums")}
                className="h-8 px-3 text-xs border border-[#e4e1db] hover:border-accent"
              >
                取消
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
