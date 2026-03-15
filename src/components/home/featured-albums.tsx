"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Camera, ArrowRight, ImageIcon } from "lucide-react"

interface Album {
  id: string | number
  title: string
  count: number
  href: string
  coverImage?: string
}

interface FeaturedAlbumsProps {
  albums: Album[]
  showMoreLink?: {
    href: string
    label: string
  }
}

export function FeaturedAlbums({
  albums,
  showMoreLink = { href: "/albums", label: "全部" }
}: FeaturedAlbumsProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">摄影相册</h2>
          <p className="text-sm text-muted-foreground mt-1">镜头下的美好瞬间</p>
        </div>
        <Link
          href={showMoreLink.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {showMoreLink.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={album.href}
            className="group relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10"
          >
            {album.coverImage ? (
              <img
                src={album.coverImage}
                alt={album.title}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ImageIcon className="h-6 w-6 text-primary/40" />
                </div>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-medium text-white text-sm truncate">
                {album.title}
              </h3>
              <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                <Camera className="h-3 w-3" />
                {album.count} 张照片
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
