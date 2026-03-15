"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, GripVertical, Trash2, Check, Image, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  url: string
  caption: string | null
  order: number
}

export default function AlbumPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [albumId, setAlbumId] = useState<string>("")
  const [album, setAlbum] = useState<{ id: string; title: string } | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
  const [newPhotoCaption, setNewPhotoCaption] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // 获取 params
  useEffect(() => {
    params.then((p) => {
      setAlbumId(p.id)
    })
  }, [params])

  // 加载相册和照片数据
  useEffect(() => {
    if (albumId) {
      setIsLoading(true)
      fetch(`/api/albums/${albumId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setAlbum({
              id: data.data.id,
              title: data.data.title,
            })
            setPhotos(data.data.photos || [])
          } else {
            setMessage("相册不存在")
            setMessageType("error")
          }
        })
        .catch((error) => {
          console.error("Error loading album:", error)
          setMessage("加载相册失败")
          setMessageType("error")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [albumId])

  const handleAddPhoto = async () => {
    if (!newPhotoUrl.trim()) {
      setMessage("请输入图片 URL")
      setMessageType("error")
      return
    }

    setIsAdding(true)
    setMessage("")

    try {
      const response = await fetch(`/api/albums/${albumId}/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photos: [
            {
              url: newPhotoUrl.trim(),
              caption: newPhotoCaption.trim() || null,
            },
          ],
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        // 将新照片添加到列表
        setPhotos((prev) => [...prev, ...result.data])
        setNewPhotoUrl("")
        setNewPhotoCaption("")
        setMessage("照片添加成功!")
        setMessageType("success")
      } else {
        setMessage(result.error || "添加失败")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error adding photo:", error)
      setMessage("添加失败，请重试")
      setMessageType("error")
    } finally {
      setIsAdding(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleRemovePhoto = async (photoId: string) => {
    if (!confirm("确定要删除这张照片吗？")) {
      return
    }

    try {
      const response = await fetch(`/api/albums/${albumId}/photos/${photoId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId))
        setMessage("照片已删除")
        setMessageType("success")
      } else {
        setMessage(result.error || "删除失败")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error deleting photo:", error)
      setMessage("删除失败，请重试")
      setMessageType("error")
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const handleUpdateCaption = (photoId: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/albums"
            className="p-1.5 hover:bg-[#F5F3EF] rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base font-medium">管理照片</h1>
            <p className="text-xs text-[#787672]">
              {album?.title} · {photos.length} 张
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            "flex items-center gap-2 text-xs px-3 py-2 rounded",
            messageType === "error"
              ? "text-red-500 bg-red-50 border border-red-100"
              : "text-accent bg-accent/5 border border-accent/20"
          )}
        >
          <Check className="w-3.5 h-3.5" />
          {message}
        </div>
      )}

      {/* Add Photo */}
      <div className="bg-white border border-[#e4e1db] rounded-lg p-4 shadow-sm">
        <div className="text-xs font-medium mb-3 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          添加新照片
        </div>
        <div className="flex gap-2">
          <Input
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddPhoto()
              }
            }}
            placeholder="图片 URL..."
            className="h-8 flex-1 text-xs bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
          />
          <Input
            value={newPhotoCaption}
            onChange={(e) => setNewPhotoCaption(e.target.value)}
            placeholder="说明（可选）"
            className="h-8 w-32 text-xs bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
          />
          <Button
            onClick={handleAddPhoto}
            disabled={!newPhotoUrl.trim() || isAdding}
            className="h-8 px-3 text-xs bg-accent hover:bg-accent/90 text-white rounded"
          >
            {isAdding ? "添加中..." : "添加"}
          </Button>
        </div>
      </div>

      {/* Photos List */}
      <div className="bg-white border border-[#e4e1db] rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-[#e4e1db] text-xs font-medium text-[#555]">
          照片列表
        </div>
        {photos.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#787672]">暂无照片</div>
        ) : (
          <div className="divide-y divide-[#e4e1db]">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F3EF]/50 transition-colors group"
              >
                <div className="flex items-center gap-2 text-[#a8a6a2] w-8 shrink-0">
                  <GripVertical className="w-4 h-4 cursor-grab text-[#505050]" />
                  <span className="text-xs text-[#787672]">{index + 1}</span>
                </div>
                <div className="w-16 h-16 bg-[#F5F3EF] border border-[#e4e1db] rounded flex items-center justify-center overflow-hidden">
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-5 h-5 text-[#303030]" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <Input
                    value={photo.caption || ""}
                    onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                    placeholder="图片说明"
                    className="h-8 text-xs bg-white border-[#e4e1db] focus:border-accent placeholder:text-[#404040]"
                  />
                  <p className="text-[10px] text-[#555] font-mono truncate mt-1">
                    {photo.url}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#505050] hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
