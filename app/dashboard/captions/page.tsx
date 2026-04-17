'use client'
import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'

function StatCard({ label, value, sub, color = 'var(--accent)' }: { label: string; value: string | number | null; sub?: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '16px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ fontSize: 24, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text)', marginBottom: 4 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function CaptionStats({ captions }: { captions: any[] }) {
  const stats = useMemo(() => {
    if (!captions.length) return null

    const totalLikes = captions.reduce((sum, c) => sum + (c.like_count ?? 0), 0)
    const rated = captions.filter(c => (c.like_count ?? 0) > 0)
    const ratedPct = Math.round((rated.length / captions.length) * 100)
    const avgLikesPerRated = rated.length ? (totalLikes / rated.length).toFixed(1) : '0'

    // Flavor breakdown
    const byFlavor: Record<string, { slug: string; total: number; likes: number }> = {}
    for (const c of captions) {
      const slug = c.humor_flavors?.slug || '(none)'
      if (!byFlavor[slug]) byFlavor[slug] = { slug, total: 0, likes: 0 }
      byFlavor[slug].total++
      byFlavor[slug].likes += c.like_count ?? 0
    }
    const flavorRows = Object.values(byFlavor)
      .map(f => ({ ...f, avg: f.total ? f.likes / f.total : 0 }))
      .sort((a, b) => b.avg - a.avg)

    // Like distribution buckets
    const buckets = [
      { label: '0', min: 0, max: 0 },
      { label: '1', min: 1, max: 1 },
      { label: '2–5', min: 2, max: 5 },
      { label: '6–10', min: 6, max: 10 },
      { label: '11+', min: 11, max: Infinity },
    ]
    const distribution = buckets.map(b => ({
      label: b.label,
      count: captions.filter(c => {
        const n = c.like_count ?? 0
        return n >= b.min && n <= b.max
      }).length,
    }))
    const distMax = Math.max(...distribution.map(d => d.count), 1)

    return { totalLikes, rated: rated.length, ratedPct, avgLikesPerRated, flavorRows, distribution, distMax }
  }, [captions])

  if (!stats) return null

  return (
    <div style={{ padding: '0 32px 24px' }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Captions" value={captions.length.toLocaleString()} color="var(--blue)" />
        <StatCard
          label="Rated Captions"
          value={stats.rated.toLocaleString()}
          sub={`${stats.ratedPct}% of total`}
          color="var(--green)"
        />
        <StatCard label="Total Likes" value={stats.totalLikes.toLocaleString()} color="var(--accent)" />
        <StatCard
          label="Avg Likes / Rated"
          value={stats.avgLikesPerRated}
          sub="among captions with ≥1 like"
          color="var(--yellow)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

        {/* Flavor breakdown */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600 }}>Likes by Flavor</h2>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>AVG LIKES</span>
          </div>
          <div style={{ padding: '4px 0' }}>
            {stats.flavorRows.map((f, i) => {
              const maxAvg = stats.flavorRows[0]?.avg || 1
              const barPct = maxAvg ? Math.round((f.avg / maxAvg) * 100) : 0
              return (
                <div key={f.slug} style={{
                  padding: '8px 16px',
                  borderBottom: i < stats.flavorRows.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'IBM Plex Mono, monospace' }}>{f.slug}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {f.likes} likes · {f.total} captions · avg {f.avg.toFixed(1)}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barPct}%`, background: 'var(--green)', borderRadius: 2 }} />
                  </div>
                </div>
              )
            })}
            {stats.flavorRows.length === 0 && (
              <div style={{ padding: 16, color: 'var(--text3)', fontSize: 12 }}>No flavor data</div>
            )}
          </div>
        </div>

        {/* Like distribution */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 13, fontWeight: 600 }}>Like Distribution</h2>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>CAPTIONS</span>
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
              {stats.distribution.map(bucket => {
                const heightPct = Math.round((bucket.count / stats.distMax) * 100)
                return (
                  <div key={bucket.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {bucket.count.toLocaleString()}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: `${Math.max(heightPct, 2)}%`,
                        background: bucket.label === '0' ? 'var(--border)' : 'var(--accent)',
                        borderRadius: '3px 3px 0 0',
                      }}
                      title={`${bucket.label} likes: ${bucket.count} captions`}
                    />
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {stats.distribution.map(bucket => (
                <div key={bucket.label} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--text2)', fontFamily: 'IBM Plex Mono, monospace' }}>
                  {bucket.label}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>likes per caption</div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
      {!loading && <CaptionStats captions={captions} />}
      <div style={{ padding: '0 32px 20px' }}>
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
