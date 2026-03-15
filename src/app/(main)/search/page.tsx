"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, FileText, ImageIcon, Loader2 } from "lucide-react"

interface SearchResult {
  posts: {
    id: string
    title: string
    excerpt: string | null
    category: string
    createdAt: string
  }[]
  albums: {
    id: string
    title: string
    description: string | null
    photoCount: number
  }[]
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({ posts: [], albums: [] })
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
      const data = await response.json()

      if (data.success && data.data) {
        setResults({
          posts: data.data.posts || [],
          albums: data.data.albums || [],
        })
      } else {
        setResults({ posts: [], albums: [] })
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults({ posts: [], albums: [] })
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query.trim())
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      ESSAY: "生活随笔",
      TRAVEL: "旅游日志",
    }
    return labels[category] || category
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, "-")
  }

  const totalResults = results.posts.length + results.albums.length

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* 搜索框 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、相册..."
            className="h-10 pl-10 text-sm bg-white border-[#e4e1db] focus:border-accent"
          />
        </div>
      </form>

      {/* Loading */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* 搜索结果 */}
      {hasSearched && !isSearching && (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {totalResults > 0 ? `找到 ${totalResults} 个结果` : "没有找到相关内容"}
          </p>

          {/* 文章结果 */}
          {results.posts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                文章 ({results.posts.length})
              </h2>
              <div className="space-y-3">
                {results.posts.map((post) => (
                  <Card key={post.id} className="border border-[#e4e1db] hover:border-accent/50 hover:shadow-sm transition-all rounded-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.createdAt)}</span>
                        <Badge variant="outline" className="ml-auto text-[10px] px-2 py-0.5 border-[#e4e1db]">
                          {getCategoryLabel(post.category)}
                        </Badge>
                      </div>
                      <Link href={`/posts/${post.id}`}>
                        <h3 className="text-sm font-medium mb-2 hover:text-accent transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 相册结果 */}
          {results.albums.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                相册 ({results.albums.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {results.albums.map((album) => (
                  <Link key={album.id} href={`/albums/${album.id}`}>
                    <Card className="border border-[#e4e1db] hover:border-accent/50 hover:shadow-md transition-all rounded-lg overflow-hidden">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="text-sm font-medium truncate">{album.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{album.photoCount} 张照片</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 无结果 */}
          {totalResults === 0 && (
            <Card className="p-8 text-center border border-[#e4e1db] rounded-lg">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground mb-4">没有找到相关内容</p>
              <div className="flex justify-center gap-4">
                <Link href="/posts/essay" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  生活随笔
                </Link>
                <Link href="/posts/travel" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  旅游日志
                </Link>
                <Link href="/albums" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  相册
                </Link>
              </div>
            </Card>
          )}
        </>
      )}

      {/* 热门搜索 */}
      {!hasSearched && (
        <Card className="p-6 border border-[#e4e1db] rounded-lg shadow-sm">
          <h3 className="text-sm font-medium mb-4">热门搜索</h3>
          <div className="flex flex-wrap gap-2">
            {["京都", "摄影", "极简生活", "旅行", "樱花"].map((term) => (
              <Badge
                key={term}
                variant="secondary"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-xs px-3 py-1.5"
                onClick={() => {
                  setQuery(term)
                  performSearch(term)
                }}
              >
                {term}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
