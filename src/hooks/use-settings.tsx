"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteAvatar: string
  seoKeywords: string
  githubUrl: string
  twitterUrl: string
  email: string
  allowComments: boolean
  allowRegister: boolean
}

interface SettingsContextType {
  settings: SiteSettings
  isLoading: boolean
  refreshSettings: () => void
}

const defaultSettings: SiteSettings = {
  siteName: "墨迹",
  siteDescription: "记录生活的片刻时光",
  siteAvatar: "",
  seoKeywords: "",
  githubUrl: "",
  twitterUrl: "",
  email: "",
  allowComments: true,
  allowRegister: false,
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
  refreshSettings: () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()

      if (data.success && data.data) {
        setSettings({
          siteName: data.data.siteName || defaultSettings.siteName,
          siteDescription: data.data.siteDescription || defaultSettings.siteDescription,
          siteAvatar: data.data.siteAvatar || "",
          seoKeywords: data.data.seoKeywords || "",
          githubUrl: data.data.githubUrl || "",
          twitterUrl: data.data.twitterUrl || "",
          email: data.data.email || "",
          allowComments: data.data.allowComments ?? true,
          allowRegister: data.data.allowRegister ?? false,
        })
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
