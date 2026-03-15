"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Link2, Plus, Loader2, Check, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface Friend {
  id: string
  name: string
  url: string
  description: string | null
  avatar: string | null
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
  })

  // 加载友链列表
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/friends")
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
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.url.trim()) {
      setMessage("请填写必填项")
      return
    }

    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          url: formData.url.trim(),
          description: formData.description.trim() || null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage("友链申请已提交，等待审核")
        setFormData({ name: "", url: "", description: "" })
        setTimeout(() => {
          setShowForm(false)
          setMessage("")
        }, 2000)
      } else {
        setMessage(result.error || "提交失败，请重试")
      }
    } catch (error) {
      console.error("Error submitting friend link:", error)
      setMessage("提交失败，请重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* 标题区 */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-accent" />
            友情链接
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "加载中..." : `${friends.length} 个友链`}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="h-9 px-4 text-xs bg-accent hover:bg-accent/90 text-white rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          申请友链
        </Button>
      </header>

      {/* 申请表单 */}
      {showForm && (
        <Card className="mb-8 border border-[#e4e1db] rounded-lg shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">申请友链</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">网站名称 *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="你的网站名称"
                    required
                    className="h-9 text-xs bg-white border-[#e4e1db] focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">网站链接 *</label>
                  <Input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://"
                    required
                    className="h-9 text-xs bg-white border-[#e4e1db] focus:border-accent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">网站描述</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="简单描述一下你的网站"
                  rows={2}
                  className="text-xs bg-white border-[#e4e1db] focus:border-accent resize-none"
                />
              </div>

              {/* Message */}
              {message && (
                <div className={cn(
                  "flex items-center gap-2 text-xs px-3 py-2 rounded",
                  message.includes("已提交")
                    ? "text-accent bg-accent/5 border border-accent/20"
                    : "text-red-500 bg-red-50 border border-red-100"
                )}>
                  <Check className="w-3.5 h-3.5" />
                  {message}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-4 text-xs bg-accent hover:bg-accent/90 text-white rounded-lg"
                >
                  {isSubmitting ? "提交中..." : "提交申请"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="h-9 px-4 text-xs border-[#e4e1db] hover:border-accent"
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : friends.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          暂无友链，成为第一个友链吧！
        </div>
      ) : (
        /* 友链列表 */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <a
              key={friend.id}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border border-[#e4e1db] hover:border-accent/50 hover:shadow-md transition-all rounded-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-lg font-semibold text-accent flex-shrink-0 overflow-hidden">
                      {friend.avatar ? (
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        friend.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium group-hover:text-accent transition-colors truncate flex items-center gap-1">
                        {friend.name}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {friend.description || friend.url}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
