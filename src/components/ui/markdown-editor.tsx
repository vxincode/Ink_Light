"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import "highlight.js/styles/github-dark.css"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "支持 Markdown 语法...",
  rows = 15,
  className,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">内容</span>
          <span className="text-xs text-muted-foreground">
            {value.length} 字符
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="ml-1 hidden sm:inline">
              {showPreview ? "隐藏预览" : "显示预览"}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div
        className={`grid gap-4 ${showPreview ? "md:grid-cols-2" : "grid-cols-1"} ${
          isFullscreen ? "fixed inset-4 z-50" : ""
        }`}
      >
        {/* 编辑器 */}
        <div className={`${isFullscreen ? "flex-1" : ""}`}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={isFullscreen ? undefined : rows}
            className={`w-full rounded-lg border border-input bg-background p-4 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none ${
              isFullscreen ? "h-full" : ""
            }`}
          />
        </div>

        {/* 预览 */}
        {showPreview && (
          <Card className={`${isFullscreen ? "flex-1 overflow-auto" : ""}`}>
            <div
              className={`p-4 prose prose-neutral dark:prose-invert max-w-none ${
                isFullscreen ? "h-full" : ""
              }`}
            >
              {value ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                >
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">预览将在这里显示...</p>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Markdown 语法提示 */}
      <div className="mt-2 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
        <p className="font-medium mb-1">Markdown 语法提示：</p>
        <code className="block">
          # 标题 | **粗体** | *斜体* | [链接](url) | ![图片](url) | `代码`
        </code>
      </div>
    </div>
  )
}
