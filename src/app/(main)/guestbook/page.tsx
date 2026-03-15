"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  authorName: string
  content: string
  createdAt: string
  replies?: {
    id: string
    authorName: string
    content: string
    createdAt: string
    isAuthor: boolean
  }[]
}

export default function GuestbookPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  // 加载留言
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/comments?type=guestbook")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setComments(data.data)
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) {
      setSubmitMessage("请填写昵称和留言内容")
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName: name.trim(),
          authorEmail: email.trim() || null,
          content: message.trim(),
          postId: null, // Guestbook comment
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage("留言已提交，等待审核后显示")
        setName("")
        setEmail("")
        setMessage("")
      } else {
        setSubmitMessage(result.error || "提交失败，请重试")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      setSubmitMessage("提交失败，请重试")
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitMessage(""), 3000)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="px-6 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            留言板
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            欢迎<span className="italic text-accent">留言</span>
          </h1>
          <p className="text-muted-foreground max-w-md">
            分享你的想法，或者只是打个招呼。期待听到你的声音。
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-8 border-t">
        <div className="px-6 max-w-2xl mx-auto">
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
            发表留言
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">昵称 *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的昵称"
                  required
                  className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">邮箱</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-9 text-sm bg-white border-[#e4e1db] focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">内容 *</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="说点什么..."
                rows={3}
                required
                className="text-sm bg-white border-[#e4e1db] focus:border-accent resize-none"
              />
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={cn(
                "flex items-center gap-2 text-xs px-3 py-2 rounded",
                submitMessage.includes("已提交")
                  ? "text-accent bg-accent/5 border border-accent/20"
                  : "text-red-500 bg-red-50 border border-red-100"
              )}>
                <Check className="w-3.5 h-3.5" />
                {submitMessage}
              </div>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-2 h-9 px-4 text-xs bg-accent hover:bg-accent/90 text-white rounded"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              提交留言
            </Button>
          </form>
        </div>
      </section>

      {/* Comments */}
      <section className="py-8 border-t">
        <div className="px-6 max-w-2xl mx-auto">
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
            全部留言 ({comments.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无留言，成为第一个留言的人吧！
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <article key={comment.id} className="group">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent shrink-0">
                      {comment.authorName?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {comment.content}
                      </p>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-accent/30 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent shrink-0">
                                {reply.authorName?.[0] || "?"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{reply.authorName}</span>
                                  {reply.isAuthor && (
                                    <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent">博主</span>
                                  )}
                                  <span className="text-xs text-muted-foreground">{formatDateTime(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
