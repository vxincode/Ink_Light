"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  onRemove?: () => void
  className?: string
}

export function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const xhr = new XMLHttpRequest()

      // 监听上传进度
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      // 监听完成
      xhr.addEventListener("load", () => {
        setIsUploading(false)
        setProgress(0)

        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          if (response.success) {
            onChange?.(response.data.url)
          } else {
            alert(response.error || "上传失败")
          }
        } else if (xhr.status === 401) {
          alert("请先登录")
        } else if (xhr.status === 403) {
          alert("需要管理员权限")
        } else {
          const response = JSON.parse(xhr.responseText)
          alert(response.error || "上传失败，请重试")
        }
      })

      // 监听错误
      xhr.addEventListener("error", () => {
        setIsUploading(false)
        setProgress(0)
        alert("上传失败，请重试")
      })

      xhr.open("POST", "/api/upload")
      xhr.send(formData)
    } catch {
      setIsUploading(false)
      setProgress(0)
      alert("上传失败，请重试")
    }
  }, [onChange])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className={className}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
        >
          {isUploading ? (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">上传中... {progress}%</p>
            </div>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                拖拽图片到这里，或点击上传
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1.5">
                  <Upload className="h-4 w-4" />
                  选择图片
                </span>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                支持 JPG、PNG、GIF、WebP，最大 5MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
