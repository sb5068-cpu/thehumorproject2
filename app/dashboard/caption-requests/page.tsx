'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'

export default function CaptionRequestsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('caption_requests').select('*, profiles(email, first_name, last_name), images(url)').order('created_datetime_utc', { ascending: false }).limit(500)
      .then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [])

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    {
      key: 'profiles', label: 'USER',
      render: (v: any) => v ? `${v.first_name || ''} ${v.last_name || ''}`.trim() || v.email : '—'
    },
    {
      key: 'image_id', label: 'IMAGE',
      render: (_: any, row: any) => row.images?.url
        ? <img src={row.images.url} alt="" style={{ height: 36, width: 48, objectFit: 'cover', borderRadius: 4 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        : <span style={{ color: 'var(--text3)', fontSize: 11 }}>{row.image_id?.slice(0, 8)}...</span>
    },
    { key: 'created_datetime_utc', label: 'CREATED', mono: true, render: (v: string) => v ? new Date(v).toLocaleString() : '—' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Caption Requests" subtitle="Read-only pipeline request log" count={rows.length} />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} />}
        </div>
      </div>
    </div>
  )
}
