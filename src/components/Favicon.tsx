'use client'

import { useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'

const defaultIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232E5F8A'/%3E%3Ctext x='50' y='58' font-size='50' text-anchor='middle' fill='%23fff' font-family='Arial,sans-serif'%3E%F0%9F%8C%BF%3C/text%3E%3C/svg%3E`

function updateFavicon(href: string) {
  const selectors = ['link[rel="icon"]', 'link[rel="shortcut icon"]', 'link[rel="apple-touch-icon"]']
  const existing = selectors.flatMap(selector => Array.from(document.head.querySelectorAll<HTMLLinkElement>(selector)))
  existing.forEach(link => link.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.href = href
  document.head.appendChild(link)
}

export function Favicon() {
  const { settings } = useSettings()

  useEffect(() => {
    const href = settings.logoUrl || defaultIcon
    updateFavicon(href)
  }, [settings.logoUrl])

  return null
}
