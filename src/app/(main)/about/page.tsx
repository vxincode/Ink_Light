import Link from "next/link"
import { ArrowUpRight, Mail, MapPin } from "lucide-react"

const skills = [
  { name: "JavaScript / TypeScript", level: 90 },
  { name: "React / Next.js", level: 85 },
  { name: "Node.js", level: 75 },
  { name: "摄影", level: 80 },
  { name: "写作", level: 75 },
]

const interests = ["摄影", "旅行", "阅读", "编程", "咖啡", "音乐", "电影", "徒步"]

const links = [
  { label: "GitHub", href: "https://github.com" },
  { label: "Email", href: "mailto:1131596911@qq.com" },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="px-6 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            关于
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            你好，我是<span className="italic text-accent">墨迹</span>
          </h1>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            一个热爱生活、喜欢记录的普通人。在这里，我用文字和影像记录生活中的点滴。
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 border-t space-y-12">
        {/* Intro */}
        <div className="px-6 max-w-2xl mx-auto">
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
            简介
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            欢迎来到我的个人博客！这里是我在网络上的一个小小角落，用来记录生活中的点点滴滴、分享旅途中的见闻、展示摄影作品。
          </p>
          <p className="text-muted-foreground leading-relaxed">
            我是一名独立开发者，也是摄影爱好者。相信技术的力量，也热爱生活的美好。希望通过这个博客，认识更多有趣的朋友。
          </p>
        </div>

        {/* Skills */}
        <div className="px-6 max-w-2xl mx-auto">
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
            技能
          </h2>
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm">{skill.name}</span>
                  <span className="text-xs text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="px-6 max-w-2xl mx-auto">
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
            兴趣爱好
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 text-sm bg-muted text-muted-foreground hover:bg-accent/20 hover:text-accent transition-colors cursor-default"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="px-6 max-w-2xl mx-auto">
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
            联系方式
          </h2>
          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>中国</span>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="px-6 max-w-2xl mx-auto">
          <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-4">
            本站技术栈
          </h2>
          <p className="text-sm text-muted-foreground">
            Next.js · TypeScript · Tailwind CSS · shadcn/ui · Drizzle ORM · PostgreSQL
          </p>
        </div>
      </section>
    </main>
  )
}
