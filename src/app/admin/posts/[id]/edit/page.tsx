"use client"

import { useEffect, useState } from "react"
import PostEditor from "@/components/admin/post-editor"
import { Loader2 } from "lucide-react"

export default function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  if (!id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <PostEditor postId={id} />
}
