'use client'
import { useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'

export default function TrackingScripts() {
  const { settings } = useSettings()

  useEffect(() => {
    if (!settings) return

    const scripts: HTMLScriptElement[] = []

    const addScript = (src: string, async = true) => {
      const script = document.createElement('script')
      script.src = src
      script.async = async
      document.head.appendChild(script)
      scripts.push(script)
      return script
    }

    const addInlineScript = (code: string) => {
      const script = document.createElement('script')
      script.textContent = code
      document.head.appendChild(script)
      scripts.push(script)
      return script
    }

    if (settings.metaPixelId) {
      addScript('https://connect.facebook.net/en_US/fbevents.js')
      addInlineScript(`
        fbq('init', '${settings.metaPixelId}');
        fbq('track', 'PageView');
      `)
    }

    if (settings.tiktokPixelId) {
      addScript('https://analytics.tiktok.com/i18n/pixel/events.js')
      addInlineScript(`
        tiktok.track('PageView');
        tiktok.instance.track('PageView');
      `)
    }

    if (settings.googleAnalyticsId) {
      addScript(`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`)
      addInlineScript(`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.googleAnalyticsId}');
      `)
    }

    return () => {
      scripts.forEach(script => {
        if (script.parentNode) script.parentNode.removeChild(script)
      })
    }
  }, [settings])

  return null
}
