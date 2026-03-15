"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Settings {
  siteName: string
  siteDescription: string
  siteAvatar: string
  seoKeywords: string
  githubUrl: string
  twitterUrl: string
  email: string
  allowComments: boolean
  allowRegister: boolean
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const [settings, setSettings] = useState<Settings>({
    siteName: "",
    siteDescription: "",
    siteAvatar: "",
    seoKeywords: "",
    githubUrl: "",
    twitterUrl: "",
    email: "",
    allowComments: true,
    allowRegister: false,
  })

  // 加载设置
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings({
            siteName: data.data.siteName || "",
            siteDescription: data.data.siteDescription || "",
            siteAvatar: data.data.siteAvatar || "",
            seoKeywords: data.data.seoKeywords || "",
            githubUrl: data.data.githubUrl || "",
            twitterUrl: data.data.twitterUrl || "",
            email: data.data.email || "",
            allowComments: data.data.allowComments ?? true,
            allowRegister: data.data.allowRegister ?? false,
          })
        }
      })
      .catch((error) => {
        console.error("Error loading settings:", error)
        setMessage("加载设置失败")
        setMessageType("error")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name: keyof Settings) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (result.success) {
        setMessage("设置已保存")
        setMessageType("success")
      } else {
        setMessage(result.error || "保存失败")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage("保存失败，请重试")
      setMessageType("error")
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(""), 3000)
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
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">设置</h1>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white rounded"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? "保存中..." : "保存"}
        </Button>
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

      {/* Form */}
      <div className="bg-white border border-[#e4e1db] rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-[#e4e1db] text-xs font-medium text-[#555]">
          基本信息
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">网站名称</label>
            <Input
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              placeholder="我的博客"
              className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
            />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">网站描述</label>
            <Textarea
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              placeholder="记录生活的点滴..."
              rows={2}
              className="text-xs bg-white border-[#e4e1db] focus:border-accent resize-none placeholder:text-[#404040]"
            />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">网站头像</label>
            <Input
              name="siteAvatar"
              value={settings.siteAvatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
              className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
            />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">SEO 关键词</label>
            <Input
              name="seoKeywords"
              value={settings.seoKeywords}
              onChange={handleChange}
              placeholder="博客, 生活, 旅行, 摄影"
              className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
            />
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="bg-white border border-[#e4e1db] rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-[#e4e1db] text-xs font-medium text-[#555]">
          社交链接
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">GitHub</label>
            <Input
              name="githubUrl"
              value={settings.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
            />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Twitter</label>
            <Input
              name="twitterUrl"
              value={settings.twitterUrl}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
              className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
            />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">邮箱</label>
            <Input
              name="email"
              type="email"
              value={settings.email}
              onChange={handleChange}
              placeholder="hello@example.com"
              className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
            />
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white border border-[#e4e1db] rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-[#e4e1db] text-xs font-medium text-[#555]">
          评论设置
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">允许评论</p>
              <p className="text-[10px] text-[#555]">允许访客在文章下留言</p>
            </div>
            <Switch
              checked={settings.allowComments}
              onCheckedChange={() => handleToggle("allowComments")}
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-sm font-medium">允许注册</p>
              <p className="text-[10px] text-[#555]">允许新用户注册账号</p>
            </div>
            <Switch
              checked={settings.allowRegister}
              onCheckedChange={() => handleToggle("allowRegister")}
            />
          </div>
        </div>
      </div>
    </div>
  )
}