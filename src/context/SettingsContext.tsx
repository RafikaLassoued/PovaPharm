'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Settings = {
  logoUrl?: string
  siteName?: string
  topBarText?: string
  statProducts?: string
  statClients?: string
  statNatural?: string
  freeDeliveryMin?: number
  address?: string
  phone?: string
  whatsapp?: string
  contactEmail?: string
  workingHours?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  whatsappLink?: string
  locationLat?: number
  locationLng?: number
  locationLabel?: string
  smsEnabled?: boolean
  smsApiKey?: string
  adminPhone?: string
  totalLikes?: number
  metaPixelId?: string
  tiktokPixelId?: string
  googleAnalyticsId?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

type SettingsContextType = {
  settings: Settings
  setSettings: (s: Settings) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({})

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used inside SettingsProvider')
  return context
}