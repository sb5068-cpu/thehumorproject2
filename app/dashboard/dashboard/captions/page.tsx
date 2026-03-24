'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'

export default function CaptionsPage() {
  const [captions, setCaptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('captions').select('*, humor_flavors(slug)').order('created_datetime_utc', { ascending: false }).limit(500)
      .then(({ data }) => { setCaptions(data || []); setLoading(false) })
  }, [])

  const filtered = captions.filter(c =>
    (c.content || '').toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'content', label: 'CAPTION', render: (v: string) => <span title={v}>{v?.slice(0, 80)}{v?.length > 80 ? '…' : ''}</span> },
    {
      key: 'is_public', label: 'PUBLIC',
      render: (v: boolean) => <span style={{ color: v ? 'var(--green)' : 'var(--text3)' }}>{v ? '✓' : '—'}</span>
    },
    {
      key: 'is_featured', label: 'FEATURED',
      render: (v: boolean) => <span style={{ color: v ? 'var(--yellow)' : 'var(--text3)' }}>{v ? '★' : '—'}</span>
    },
    { key: 'like_count', label: 'LIKES', mono: true, render: (v: number) => v ?? 0 },
    { key: 'humor_flavors', label: 'FLAVOR', render: (v: any) => <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text2)' }}>{v?.slug || '—'}</span> },
    { key: 'created_datetime_utc', label: 'CREATED', mono: true, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Captions" subtitle="Read-only caption browser" count={filtered.length} />
      <div style={{ padding: '20px 32px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search captions..." style={{ width: 320, marginBottom: 16 }} />
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={filtered} />}
        </div>
      </div>
    </div>
  )
}
