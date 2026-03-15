"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Camera, MapPin, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
}

export function HeroSection({
  title = "我的博客",
  subtitle = "记录生活 · 分享旅行 · 摄影作品",
  description = "在这里，我分享生活中的点滴感悟、旅途中的风景故事，以及镜头下的美好瞬间。希望这些文字和影像，能给你带来一些启发与共鸣。"
}: HeroSectionProps) {
  const quickLinks = [
    { href: "/posts/essay", label: "生活随笔", icon: BookOpen, color: "text-blue-500" },
    { href: "/posts/travel", label: "旅游日志", icon: MapPin, color: "text-green-500" },
    { href: "/albums", label: "摄影相册", icon: Camera, color: "text-orange-500" },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container-main mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>欢迎来到我的小站</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-4">
            {subtitle}
          </p>

          {/* Description */}
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/posts/essay">
                开始阅读
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full px-8">
              <Link href="/about">
                了解更多
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors group"
              >
                <link.icon className={cn("h-4 w-4", link.color)} />
                <span>{link.label}</span>
                <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

