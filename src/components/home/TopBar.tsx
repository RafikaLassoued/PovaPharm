'use client'
// تصحيح الاستيراد: استخدم النسخة العادية لضمان ظهور التنبيه
import { toast } from "react-hot-toast" 

interface Promo {
  code: string
  discount: number
}

interface Props {
  settings: any
  promos: Promo[]
}

export function TopBar({ settings, promos }: Props) {

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    
    // التنبيه سيظهر الآن بشكل جميل
    toast.success(`تم نسخ الكوبون: ${code}`, {
      duration: 3000,
      icon: '🎉',
      style: {
        direction: 'rtl',
        fontFamily: 'inherit'
      }
    });
  };

  const items = [
  { 
    type: 'delivery', 
    text: settings?.topBarText 
        ||'Free delivery on orders over 000 DZD' 
  },
    ...promos.map(p => ({
      type: 'promo',
      code: p.code,
      text: `Use code ${p.code} for ${Math.round(p.discount * 100)}% off`,
    })),
  ]

  const doubled = [...items, ...items, ...items]

  return (
    <>
      <style>{`
        @keyframes topbar-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .topbar-track {
          display: flex;
          align-items: center;
          gap: 0;
          animation: topbar-scroll 30s linear infinite;
          white-space: nowrap;
          width: max-content;
        }
        .topbar-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div style={{
        background: 'var(--blue)',
        color: '#fff',
        overflow: 'hidden',
        height: 36,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, var(--blue), transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, var(--blue), transparent)', zIndex: 2 }} />

        <div className="topbar-track">
          {doubled.map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 28px', fontSize: 13, fontWeight: 500, letterSpacing: '.3px' }}>
              {item.type === 'delivery' && (
                <>
                  <span style={{ fontSize: 15 }}>🚚</span>
                  <span>{item.text}</span>
                </>
              )}
              {item.type === 'promo' && (
                <div 
                  // هنا ربطنا وظيفة النسخ عند الضغط
                  onClick={() => handleCopyCode((item as any).code)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                  title="Click to copy code"
                >
                  <span style={{ fontSize: 14 }}>🏷️</span>
                  <span>{item.text}</span>
                  <span style={{
                    background: '#fff',
                    color: 'var(--blue)',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {(item as any).code}
                  </span>
                </div>
              )}
              {item.type === 'info' && (
                <span style={{ color: 'rgba(255,255,255,.85)' }}>{item.text}</span>
              )}
              <span style={{ color: 'rgba(255,255,255,.3)', marginLeft: 16, fontSize: 16 }}>•</span>
            </span>
          ))}
        </div>
      </div>
    </>
  )
}