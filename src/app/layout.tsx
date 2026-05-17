import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toast } from '@/components/ui/Toast'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { SettingsProvider } from '@/context/SettingsContext'
import { Favicon } from '@/components/Favicon'
import TrackingScripts from '@/components/TrackingScripts'

export const metadata: Metadata = {
  title: 'Pova Pharm | Parafarm Store',
  description: 'Premium beauty products crafted with natural ingredients for radiant, healthy skin.',
  keywords: 'cosmetics, beauty, skincare, makeup, natural, premium, Algeria',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <TrackingScripts />
      </head>
      <body>
        <SettingsProvider>
          <Favicon />
          <Header />
          <main>{children}</main>
          <Footer />
          <Toast />
          <WhatsAppButton />
        </SettingsProvider>
      </body>
    </html>
  )
}

