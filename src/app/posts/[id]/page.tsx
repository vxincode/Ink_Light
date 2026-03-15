"use client"

import { useState, useEffect } from "react"
import { Calendar, Eye, User, ArrowLeft, Loader2, Send, Check } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import "highlight.js/styles/github-dark.css"

interface Post {
  id: string
  title: string
  content: string
  excerpt: string | null
  category: string
  views: number
  createdAt: string
  publishedAt: string | null
  author: {
    name: string | null
  }
  tags: { id: string; name: string }[]
}

interface Comment {
  id: string
  authorName: string
  content: string
  createdAt: string
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<{ id: string; title: string }[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    if (!params.id) return

    setIsLoading(true)
    fetch(`/api/posts/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setPost(data.data)
          // Fetch related posts
          fetch(`/api/posts?category=${data.data.category}&limit=3`)
            .then((res) => res.json())
            .then((relatedData) => {
              if (relatedData.success && relatedData.data) {
                setRelatedPosts(
                  relatedData.data.filter((p: Post) => p.id !== params.id).slice(0, 2)
                )
              }
            })
          // Fetch comments
          fetch(`/api/comments?postId=${params.id}`)
            .then((res) => res.json())
            .then((commentData) => {
              if (commentData.success && commentData.data) {
                setComments(commentData.data)
              }
            })
        } else {
          router.push("/posts")
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [params.id, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".")
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ESSAY: "随笔",
      TRAVEL: "旅途",
    }
    return labels[category] || category
  }

  const getCategorySlug = (category: string) => {
    const slugs: Record<string, string> = {
      ESSAY: "essay",
      TRAVEL: "travel",
    }
    return slugs[category] || category.toLowerCase()
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !commentText.trim()) {
      setSubmitMessage("请填写昵称和评论内容")
      return
    }

    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: name.trim(),
          authorEmail: email.trim() || null,
          content: commentText.trim(),
          postId: params.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitMessage("评论已提交，等待审核后显示")
        setName("")
        setEmail("")
        setCommentText("")
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <main className="min-h-screen">
      <article className="px-6 max-w-2xl mx-auto py-12">
        {/* Header */}
        <header className="mb-8">
          <Link
            href={`/posts/${getCategorySlug(post.category)}`}
            className="inline-block text-xs text-muted-foreground hover:text-accent transition-colors mb-4"
          >
            ← {getCategoryLabel(post.category)}
          </Link>

          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-medium leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
            {post.author?.name && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {post.author.name}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {post.views || 0} 阅读
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-1 bg-muted text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              h1: ({ children }) => (
                <h1 className="font-display text-2xl font-medium mt-8 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-display text-xl font-medium mt-8 mb-4">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-display text-lg font-medium mt-6 mb-3">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 last:mb-0 leading-relaxed text-foreground/90">{children}</p>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-accent hover:underline">{children}</a>
              ),
              img: ({ src, alt }) => (
                <img src={src} alt={alt} className="rounded-lg my-4 max-w-full" />
              ),
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "")
                const isInline = !match
                return isInline ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="bg-[#1a1a1a] rounded-lg p-4 overflow-x-auto my-4">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-accent/50 pl-4 my-4 italic text-muted-foreground">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
              ),
            }}
          >
            {post.content || ""}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/posts")}
            className="text-xs"
          >
            <span className="flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              返回列表
            </span>
          </Button>
        </footer>

        {/* Related */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
              相关文章
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/posts/${related.id}`}
                  className="group p-4 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="font-medium group-hover:text-accent transition-colors">
                    {related.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="mt-12 pt-8 border-t">
          <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
            评论 ({comments.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-8 space-y-4">
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
              <label className="text-xs text-muted-foreground mb-1.5 block">评论 *</label>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="说点什么..."
                rows={3}
                required
                className="text-sm bg-white border-[#e4e1db] focus:border-accent resize-none"
              />
            </div>

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
              className="h-9 px-4 text-xs bg-accent hover:bg-accent/90 text-white rounded gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isSubmitting ? "提交中..." : "提交评论"}
            </Button>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">暂无评论，成为第一个评论的人吧！</p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </article>
    </main>
  )
}
