'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const sections = [
  {
    label: 'OVERVIEW',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: '▦' }],
  },
  {
    label: 'USERS',
    items: [
      { href: '/dashboard/users', label: 'Profiles', icon: '◉' },
      { href: '/dashboard/allowed-domains', label: 'Allowed Domains', icon: '◈' },
      { href: '/dashboard/whitelisted-emails', label: 'Whitelisted Emails', icon: '◇' },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { href: '/dashboard/images', label: 'Images', icon: '▣' },
      { href: '/dashboard/captions', label: 'Captions', icon: '▤' },
      { href: '/dashboard/caption-requests', label: 'Caption Requests', icon: '▥' },
      { href: '/dashboard/caption-examples', label: 'Caption Examples', icon: '▧' },
    ],
  },
  {
    label: 'HUMOR ENGINE',
    items: [
      { href: '/dashboard/humor-flavors', label: 'Humor Flavors', icon: '◆' },
      { href: '/dashboard/humor-mix', label: 'Humor Mix', icon: '◈' },
      { href: '/dashboard/terms', label: 'Terms', icon: '▨' },
    ],
  },
  {
    label: 'LLM PIPELINE',
    items: [
      { href: '/dashboard/llm-providers', label: 'LLM Providers', icon: '◎' },
      { href: '/dashboard/llm-models', label: 'LLM Models', icon: '○' },
      { href: '/dashboard/llm-prompt-chains', label: 'Prompt Chains', icon: '◌' },
      { href: '/dashboard/llm-responses', label: 'LLM Responses', icon: '◍' },
    ],
  },
]

export default function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflow: 'auto',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--accent)',
          color: '#fff',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 10,
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: 3,
          letterSpacing: '0.12em',
          marginBottom: 8,
        }}>ADMIN</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Humor Pipeline</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflow: 'auto' }}>
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10,
              fontFamily: 'IBM Plex Mono, monospace',
              color: 'var(--text3)',
              letterSpacing: '0.12em',
              padding: '0 8px',
              marginBottom: 4,
            }}>{section.label}</div>
            {section.items.map(item => {
              const active = item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 8px',
                    borderRadius: 6,
                    color: active ? 'var(--accent)' : 'var(--text2)',
                    background: active ? 'rgba(255,85,0,0.08)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    transition: 'all 0.1s',
                  }}
                >
                  <span style={{ fontSize: 12, opacity: 0.8 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userEmail}
        </div>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '7px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text2)',
            fontSize: 12,
            textAlign: 'left',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
