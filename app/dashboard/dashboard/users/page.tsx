'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'

export default function UsersPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_datetime_utc', { ascending: false })
      .then(({ data }) => { setProfiles(data || []); setLoading(false) })
  }, [])

  const filtered = profiles.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'email', label: 'EMAIL' },
    { key: 'first_name', label: 'FIRST NAME' },
    { key: 'last_name', label: 'LAST NAME' },
    {
      key: 'is_superadmin', label: 'SUPERADMIN',
      render: (v: boolean) => (
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
          color: v ? 'var(--green)' : 'var(--text3)',
          background: v ? 'rgba(34,197,94,0.1)' : 'var(--bg3)',
          border: `1px solid ${v ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
          padding: '2px 8px', borderRadius: 4,
        }}>{v ? 'YES' : 'NO'}</span>
      )
    },
    {
      key: 'is_in_study', label: 'IN STUDY',
      render: (v: boolean) => (
        <span style={{ color: v ? 'var(--green)' : 'var(--text3)', fontSize: 12 }}>{v ? '✓' : '—'}</span>
      )
    },
    {
      key: 'is_matrix_admin', label: 'MATRIX ADMIN',
      render: (v: boolean) => (
        <span style={{ color: v ? 'var(--yellow)' : 'var(--text3)', fontSize: 12 }}>{v ? '✓' : '—'}</span>
      )
    },
    {
      key: 'created_datetime_utc', label: 'JOINED', mono: true,
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '—'
    },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Profiles" subtitle="Read-only user directory" count={filtered.length} />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ width: 320 }}
          />
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : (
            <DataTable columns={columns} data={filtered} />
          )}
        </div>
      </div>
    </div>
  )
}
