"use client"

import { useState, useEffect } from "react"

interface AdminStatus {
  isAdmin: boolean
  isLoading: boolean
}

export function useIsAdmin(): AdminStatus {
  const [status, setStatus] = useState<AdminStatus>({
    isAdmin: false,
    isLoading: true,
  })

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setStatus({
          isAdmin: data.success && data.isAdmin === true,
          isLoading: false,
        })
      })
      .catch(() => {
        setStatus({ isAdmin: false, isLoading: false })
      })
  }, [])

  return status
}
