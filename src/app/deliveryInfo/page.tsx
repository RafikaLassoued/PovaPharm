'use client'   // مطلوب لاستخدام useState و useEffect

import { useState, useEffect } from 'react'

export default function DeliveryInfo() {
  const [content, setContent] = useState('Loading...')

  useEffect(() => {
    // API ترجع محتوى معلومات التوصيل
    fetch('/api/admin/update-info')
      .then(r => r.json())
      .then(data => setContent(data.deliveryInfo || 'No content available'))
      .catch(() => setContent('Failed to load content'))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20, fontFamily: 'Jost,sans-serif' }}>
      <h1>Delivery Info</h1>
      <p style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{content}</p>
    </div>
  )
}