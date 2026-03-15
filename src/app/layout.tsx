import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SettingsProvider } from "@/hooks/use-settings"

export const metadata: Metadata = {
  title: "墨迹 - 记录生活的片刻时光",
  description: "分享生活随笔、旅游日志、摄影相册的个人博客",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
