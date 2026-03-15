"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewAlbumPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    order: 0,
    isPublic: true,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    let newValue: string | number | boolean = value

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked
    } else if (name === "isPublic") {
      newValue = value === "true"
    } else if (name === "order") {
      newValue = parseInt(value) || 0
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }))
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
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage("保存成功!")
        setMessageType("success")
        if (result.data?.id) {
          router.push(`/admin/albums/${result.data.id}/edit`)
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
          <h1 className="text-base font-medium">新建相册</h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white rounded"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "保存中..." : "保存"}
        </Button>
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
    </div>
  )
}
