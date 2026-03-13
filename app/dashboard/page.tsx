import { createServerSupabaseClient } from '@/lib/supabase-server'

async function getStats(supabase: any) {
  const [
    { count: totalUsers },
    { count: totalImages },
    { count: totalCaptions },
    { count: captionRequests },
    { count: publicCaptions },
    { count: featuredCaptions },
    { count: llmResponses },
    { count: totalTerms },
    { data: topCaptions },
    { data: recentRequests },
    { data: flavorMix },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('caption_requests').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('llm_model_responses').select('*', { count: 'exact', head: true }),
    supabase.from('terms').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('content, like_count').order('like_count', { ascending: false }).limit(5),
    supabase.from('caption_requests').select('created_datetime_utc').order('created_datetime_utc', { ascending: false }).limit(30),
    supabase.from('humor_flavor_mix').select('humor_flavor_id, caption_count, humor_flavors(slug, description)'),
  ])

  return { totalUsers, totalImages, totalCaptions, captionRequests, publicCaptions, featuredCaptions, llmResponses, totalTerms, topCaptions, recentRequests, flavorMix }
}

function StatCard({ label, value, sub, color = 'var(--accent)' }: any) {
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: color,
      }} />
      <div style={{ fontSize: 28, fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text)', marginBottom: 4 }}>
        {value?.toLocaleString() ?? '—'}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const stats = await getStats(supabase)

  const publicPct = stats.totalCaptions ? Math.round((stats.publicCaptions! / stats.totalCaptions!) * 100) : 0
  const featuredPct = stats.totalCaptions ? Math.round((stats.featuredCaptions! / stats.totalCaptions!) * 100) : 0

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>
          Humor caption pipeline — system overview
        </p>
      </div>

      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Users" value={stats.totalUsers} color="var(--blue)" />
        <StatCard label="Images" value={stats.totalImages} color="var(--accent)" />
        <StatCard label="Captions Generated" value={stats.totalCaptions} sub={`${publicPct}% public`} color="var(--green)" />
        <StatCard label="Caption Requests" value={stats.captionRequests} color="var(--yellow)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        <StatCard label="LLM API Calls" value={stats.llmResponses} color="#a855f7" />
        <StatCard label="Featured Captions" value={stats.featuredCaptions} sub={`${featuredPct}% of total`} color="var(--accent2)" />
        <StatCard label="Public Captions" value={stats.publicCaptions} color="var(--green)" />
        <StatCard label="Terms" value={stats.totalTerms} color="var(--text2)" />
      </div>

      {/* Two col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* Top captions */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Top Captions by Likes</h2>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>TOP 5</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {stats.topCaptions?.map((c: any, i: number) => (
              <div key={i} style={{
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 11,
                  color: i === 0 ? 'var(--accent)' : 'var(--text3)',
                  width: 20,
                  flexShrink: 0,
                }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.content || '(no content)'}
                </span>
                <span style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 12,
                  color: 'var(--green)',
                  flexShrink: 0,
                }}>♥ {c.like_count ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Humor Mix */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Active Humor Mix</h2>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>FLAVOR CONFIG</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {stats.flavorMix?.length === 0 && (
              <div style={{ padding: '20px', color: 'var(--text3)', fontSize: 13 }}>No flavor mix configured</div>
            )}
            {stats.flavorMix?.map((f: any, i: number) => (
              <div key={f.id} style={{
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderBottom: i < stats.flavorMix!.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                    {f.humor_flavors?.slug || `Flavor #${f.humor_flavor_id}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {f.humor_flavors?.description?.slice(0, 60)}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,85,0,0.12)',
                  border: '1px solid rgba(255,85,0,0.3)',
                  borderRadius: 4,
                  padding: '3px 10px',
                  fontSize: 12,
                  color: 'var(--accent)',
                  fontFamily: 'IBM Plex Mono, monospace',
                  flexShrink: 0,
                }}>×{f.caption_count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline ratio */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Pipeline Conversion</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 32, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
          {[
            { label: 'Requests', value: stats.captionRequests ?? 0, color: 'var(--blue)' },
            { label: 'LLM Calls', value: stats.llmResponses ?? 0, color: '#a855f7' },
            { label: 'Captions', value: stats.totalCaptions ?? 0, color: 'var(--green)' },
            { label: 'Public', value: stats.publicCaptions ?? 0, color: 'var(--accent)' },
          ].map((item, i, arr) => {
            const total = arr[0].value || 1
            const pct = Math.max((item.value / total) * 100, 2)
            return (
              <div
                key={item.label}
                style={{ width: `${pct}%`, background: item.color, height: '100%', minWidth: 4 }}
                title={`${item.label}: ${item.value}`}
              />
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Requests', value: stats.captionRequests, color: 'var(--blue)' },
            { label: 'LLM Calls', value: stats.llmResponses, color: '#a855f7' },
            { label: 'Captions', value: stats.totalCaptions, color: 'var(--green)' },
            { label: 'Public', value: stats.publicCaptions, color: 'var(--accent)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'IBM Plex Mono, monospace' }}>{item.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
