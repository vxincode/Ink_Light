"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight, Loader2 } from "lucide-react"

interface Album {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  photoCount: number
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch("/api/albums?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAlbums(data.data)
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="pt-16 pb-12">
        <div className="px-6 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            摄影相册
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-medium leading-tight mb-3">
            用镜头捕捉<span className="italic text-accent">瞬间</span>
          </h1>
          <p className="text-muted-foreground max-w-md">
            光影之间，是时间的痕迹。每一张照片，都是一个值得被记住的瞬间。
          </p>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="py-8 border-t">
        <div className="px-6 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : albums.length === 0 ? (
            <div className="py-24 text-center text-sm text-muted-foreground">暂无相册</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="group block relative aspect-[4/3] bg-muted overflow-hidden rounded-lg"
                >
                  {album.coverImage ? (
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <span className="text-4xl text-muted-foreground/30">📷</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                    <h3 className="font-medium text-sm text-white truncate">{album.title}</h3>
                    <span className="text-xs text-white/70">{album.photoCount} 张</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
