"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Eye, Image, Pencil, Trash2, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Album {
  id: string
  title: string
  coverImage: string | null
  isPublic: boolean
  photoCount: number
  createdAt: string
}

export default function AdminAlbumsPage() {
  const [albumList, setAlbumList] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  // 加载相册列表
  useEffect(() => {
    setIsLoading(true)
    fetch("/api/albums?public=false&limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAlbumList(data.data)
        } else {
          setMessage("加载相册失败")
          setMessageType("error")
        }
      })
      .catch((error) => {
        console.error("Error loading albums:", error)
        setMessage("加载相册失败")
        setMessageType("error")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个相册吗？相册中的照片也会被删除。")) {
      return
    }

    try {
      const response = await fetch(`/api/albums/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setAlbumList(albumList.filter((a) => a.id !== id))
        setMessage("相册已删除")
        setMessageType("success")
      } else {
        setMessage(result.error || "删除失败")
        setMessageType("error")
      }
    } catch (error) {
      console.error("Error deleting album:", error)
      setMessage("删除失败，请重试")
      setMessageType("error")
    }

    setTimeout(() => setMessage(""), 3000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, ".")
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium">相册</h1>
          <p className="text-xs text-[#787672]">{albumList.length} 个相册</p>
        </div>
        <Link
          href="/admin/albums/new"
          className="h-8 px-3 text-xs flex items-center gap-1.5 text-white rounded-md transition-colors"
          style={{ backgroundColor: 'rgb(201, 169, 98)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(181, 149, 78)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(201, 169, 98)'}
        >
          <Plus className="w-3.5 h-3.5" />
          新建
        </Link>
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

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : albumList.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[#787672] mb-4">暂无相册</p>
          <Link
            href="/admin/albums/new/edit"
            className="text-xs text-accent hover:underline"
          >
            创建第一个相册
          </Link>
        </div>
      ) : (
        <>
          {/* Albums Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albumList.map((album) => (
              <div
                key={album.id}
                className="group bg-white border border-[#e4e1db] rounded-lg overflow-hidden hover:border-accent/50 transition-colors shadow-sm"
              >
                {/* Cover */}
                <Link
                  href={`/admin/albums/${album.id}/edit`}
                  className="aspect-[3/2] bg-[#F5F3EF] flex items-center justify-center block overflow-hidden"
                >
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-[#d4d0c8]" />
                  )}
                </Link>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      href={`/admin/albums/${album.id}/edit`}
                      className="text-sm font-medium hover:text-accent transition-colors"
                    >
                      {album.title}
                    </Link>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded shrink-0",
                        album.isPublic
                          ? "bg-accent/10 text-accent"
                          : "bg-[#F5F3EF] text-[#787672]"
                      )}
                    >
                      {album.isPublic ? "公开" : "私密"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#a8a6a2]">
                      {album.photoCount} 张 · {formatDate(album.createdAt)}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/albums/${album.id}`}
                        target="_blank"
                        className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                      >
                        <Eye className="w-3 h-3 text-[#a8a6a2] hover:text-accent" />
                      </Link>
                      <Link
                        href={`/admin/albums/${album.id}/photos`}
                        className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                      >
                        <Image className="w-3 h-3 text-[#a8a6a2] hover:text-accent" />
                      </Link>
                      <Link
                        href={`/admin/albums/${album.id}/edit`}
                        className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                      >
                        <Pencil className="w-3 h-3 text-[#a8a6a2] hover:text-accent" />
                      </Link>
                      <button
                        onClick={() => handleDelete(album.id)}
                        className="p-1.5 hover:bg-[#e4e1db]/50 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-[#a8a6a2] hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
