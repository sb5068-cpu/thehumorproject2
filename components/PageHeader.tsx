'use client'

interface PageHeaderProps {
  title: string
  subtitle?: string
  count?: number
  action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, count, action }: PageHeaderProps) {
  return (
    <div style={{
      padding: '24px 32px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg2)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>{title}</h1>
          {count !== undefined && (
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 11,
              color: 'var(--text3)',
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              padding: '2px 8px',
              borderRadius: 4,
            }}>{count.toLocaleString()}</span>
          )}
        </div>
        {subtitle && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
