"use client"

import { useEffect, useState } from "react"

export function useAutoSave<T extends Record<string, any>>(
  key: string,
  data: T,
  onSave: (data: T) => Promise<void>,
  delay = 30000
) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    // 从 localStorage 恢复草稿
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
  }, [key])

  useEffect(() => {
    // 自动保存到 localStorage
    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data))
    }, delay)

    return () => clearTimeout(timer)
  }, [data, key, delay])

  const save = async () => {
    setIsSaving(true)
    try {
      await onSave(data)
      setLastSaved(new Date())
      localStorage.removeItem(key) // 保存成功后清除本地草稿
    } finally {
      setIsSaving(false)
    }
  }

  return { isSaving, lastSaved, save }
}

// 用于恢复草稿的 hook
export function useDraft<T>(key: string) {
  const [draft, setDraft] = useState<T | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setDraft(JSON.parse(saved))
      } catch {
        setDraft(null)
      }
    }
  }, [key])

  const clearDraft = () => {
    localStorage.removeItem(key)
    setDraft(null)
  }

  return { draft, clearDraft }
}
