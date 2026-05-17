'use client'
import { useSettings } from '@/context/SettingsContext'

export function WhatsAppButton() {
  const { settings } = useSettings()

  if (!settings?.whatsappLink || settings.whatsappLink === '#') return null

  return (
    <a
      href={settings.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        background: '#25D366',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '28px',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)'
      }}
    >
      <i className="fab fa-whatsapp" />
    </a>
  )
}