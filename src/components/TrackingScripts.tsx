import { prisma } from '@/lib/prisma'

export default async function TrackingScripts() {
  const settings = await prisma.siteSettings.findFirst()
  
  if (!settings) return null

  return (
    <>
      {/* Meta Pixel (Facebook Pixel) */}
      {settings.metaPixelId && (
        <>
          <script async src={`https://connect.facebook.net/en_US/fbevents.js`}></script>
          <script dangerouslySetInnerHTML={{__html: `
            fbq('init', '${settings.metaPixelId}');
            fbq('track', 'PageView');
          `}}></script>
          <noscript>
            <img height="1" width="1" style={{display: 'none'}} src={`https://www.facebook.com/tr?id=${settings.metaPixelId}&ev=PageView&noscript=1`} />
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {settings.tiktokPixelId && (
        <>
          <script src="https://analytics.tiktok.com/i18n/pixel/events.js"></script>
          <script dangerouslySetInnerHTML={{__html: `
            tiktok.track('PageView');
            tiktok.instance.track('PageView');
          `}}></script>
        </>
      )}

      {/* Google Analytics */}
      {settings.googleAnalyticsId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}></script>
          <script dangerouslySetInnerHTML={{__html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.googleAnalyticsId}');
          `}}></script>
        </>
      )}
    </>
  )
}
