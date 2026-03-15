"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye, MessageCircle, BookOpen, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Post {
  id: string | number
  title: string
  excerpt: string
  date: string
  category: string
  href: string
  coverImage?: string
  readTime?: string
  views?: number
  comments?: number
  tags?: string[]
}

interface FeaturedPostsProps {
  posts: Post[]
  showMoreLink?: {
    href: string
    label: string
  }
}

export function FeaturedPosts({ posts, showMoreLink = { href: "/posts/essay", label: "归档" } }: FeaturedPostsProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">最新文章</h2>
          <p className="text-sm text-muted-foreground mt-1">探索最新的生活感悟与旅途故事</p>
        </div>
        <Link
          href={showMoreLink.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {showMoreLink.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <article
            key={post.id}
            className={cn(
              "group relative rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl",
              index === 0 && "md:col-span-2 lg:col-span-1"
            )}
          >
            <Link href={post.href} className="block h-full">
              {/* Cover Image Placeholder */}
              <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 relative overflow-hidden">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-primary/40" />
                    </div>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {post.category}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  {post.readTime && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  {post.views !== undefined && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {post.views}
                    </span>
                  )}
                  {post.comments !== undefined && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="h-3 w-3" />
                      {post.comments}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

