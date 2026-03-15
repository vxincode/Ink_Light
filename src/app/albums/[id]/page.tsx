"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Grid3X3, List, Calendar, Eye, Image as ImageIcon, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"

interface Photo {
  id: string
  url: string
  caption: string | null
  order: number
}

interface Album {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  photos: Photo[]
  createdAt: string
  views: number
}

export default function AlbumPage() {
  const params = useParams()
  const router = useRouter()
  const [album, setAlbum] = useState<Album | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"waterfall" | "grid">("grid")
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    if (!params.id) return

    setIsLoading(true)
    fetch(`/api/albums/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAlbum(data.data)
        } else {
          router.push("/albums")
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!album) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <Link
                href="/albums"
                className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-medium truncate">{album.title}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(album.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {album.views || 0} 次浏览
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {album.photos?.length || 0} 张照片
                  </Badge>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg shrink-0 ml-2">
              <button
                onClick={() => setViewMode("waterfall")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "waterfall" ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
                title="瀑布流"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-background/50"
                )}
                title="网格"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {album.description && (
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl">
              {album.description}
            </p>
          )}
        </div>
      </div>

      {/* Photos */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {!album.photos || album.photos.length === 0 ? (
          <div className="py-24 text-center text-sm text-muted-foreground">暂无照片</div>
        ) : viewMode === "waterfall" ? (
          // 瀑布流布局
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="w-full h-auto object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                {photo.caption && (
                  <div className="mt-2">
                    <p className="text-sm truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // 网格布局
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-accent/50">
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.caption || ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhoto.url ? (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || ""}
                className="max-w-full max-h-[80vh] mx-auto object-contain rounded-lg"
              />
            ) : (
              <div className="bg-card border rounded-lg overflow-hidden shadow-2xl">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <ImageIcon className="h-20 w-20 text-muted-foreground/50" />
                </div>
              </div>
            )}
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-4 text-sm">
                {selectedPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
