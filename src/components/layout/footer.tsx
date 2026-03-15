"use client"

import Link from "next/link"
import { Github, Mail, Rss, Twitter } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"

export function Footer() {
  const year = new Date().getFullYear()
  const { settings } = useSettings()

  const links = []
  if (settings.githubUrl) {
    links.push({ icon: Github, href: settings.githubUrl, label: "GitHub" })
  }
  if (settings.twitterUrl) {
    links.push({ icon: Twitter, href: settings.twitterUrl, label: "Twitter" })
  }
  if (settings.email) {
    links.push({ icon: Mail, href: `mailto:${settings.email}`, label: "Email" })
  }
  links.push({ icon: Rss, href: "/rss.xml", label: "RSS" })

  return (
    <footer className="border-t mt-auto">
      <div className="px-6 max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg">{settings.siteName}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{settings.siteDescription}</span>
          </div>
          <div className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" />
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>© {year}</span>
          <span className="font-display italic">Carpe Diem</span>
        </div>
      </div>
    </footer>
  )
}
