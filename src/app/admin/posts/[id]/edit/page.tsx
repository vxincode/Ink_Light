"use client"

import { useEffect, useState } from "react"
import PostEditor from "@/components/admin/post-editor"

export default function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("")

  useEffect(() => {
    params.then((p) => {
      setId(p.id)
    })
  }, [params])

  if (!id) {
    return null
  }

  return <PostEditor postId={id} />
}
