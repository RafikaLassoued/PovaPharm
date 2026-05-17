'use client'
import { useLang } from '@/store/lang'
import { useEffect } from 'react'

export function LangSwitcher() {
  const { lang, setLang, dir } = useLang()

  // تطبيق الاتجاه على الصفحة
  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [lang, dir])

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 20,
        background: 'var(--beige)', border: '1.5px solid var(--beige-dark)',
        cursor: 'pointer', fontFamily: 'Jost,sans-serif',
        fontSize: 13, fontWeight: 600, color: 'var(--text-mid)',
        transition: 'var(--transition)',
      }}
      title="Switch Language / تغيير اللغة"
    >
      <span style={{ fontSize: 16 }}>{lang === 'en' ? '🇩🇿' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
    </button>
  )
}

// Component يطبق الاتجاه عند تحميل الصفحة
export function DirApplier() {
  const { lang, dir } = useLang()
  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [lang, dir])
  return null
}
