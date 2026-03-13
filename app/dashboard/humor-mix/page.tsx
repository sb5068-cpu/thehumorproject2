'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

export default function HumorMixPage() {
  const [mix, setMix] = useState<any[]>([])
  const [flavors, setFlavors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editRow, setEditRow] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const [{ data: mixData }, { data: flavorData }] = await Promise.all([
      supabase.from('humor_flavor_mix').select('*, humor_flavors(slug, description)').order('id'),
      supabase.from('humor_flavors').select('id, slug').order('slug'),
    ])
    setMix(mixData || [])
    setFlavors(flavorData || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleUpdate() {
    setSaving(true)
    const { error } = await supabase.from('humor_flavor_mix').update({
      caption_count: Number(editRow.caption_count),
      humor_flavor_id: Number(editRow.humor_flavor_id),
    }).eq('id', editRow.id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditRow(null); load()
  }

  const totalCaptions = mix.reduce((sum, m) => sum + (m.caption_count || 0), 0)

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Humor Mix" subtitle="Configure how many captions to generate per flavor" count={mix.length} />
      <div style={{ padding: '20px 32px' }}>
        {totalCaptions > 0 && (
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
            padding: '16px 20px', marginBottom: 20,
          }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em' }}>
              CAPTION DISTRIBUTION ({totalCaptions} total per request)
            </div>
            <div style={{ display: 'flex', height: 24, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
              {mix.map((m, i) => {
                const pct = (m.caption_count / totalCaptions) * 100
                const colors = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--yellow)', '#a855f7', '#ec4899']
                return (
                  <div key={m.id} title={`${m.humor_flavors?.slug}: ${m.caption_count}`}
                    style={{ width: `${pct}%`, background: colors[i % colors.length], minWidth: 4 }} />
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {mix.map((m, i) => {
                const colors = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--yellow)', '#a855f7', '#ec4899']
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[i % colors.length] }} />
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{m.humor_flavors?.slug || `Flavor ${m.humor_flavor_id}`}</span>
                    <span style={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text)' }}>×{m.caption_count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'FLAVOR', 'DESCRIPTION', 'CAPTION COUNT', 'ACTIONS'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text3)', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mix.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text3)' }}>{m.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>
                        {m.humor_flavors?.slug || `#${m.humor_flavor_id}`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text2)', maxWidth: 300 }}>{m.humor_flavors?.description?.slice(0, 80) || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600,
                        color: 'var(--text)', background: 'var(--bg3)',
                        border: '1px solid var(--border)', borderRadius: 6, padding: '4px 12px',
                      }}>×{m.caption_count}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setEditRow({ ...m })}
                        style={{ padding: '5px 14px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 5, color: 'var(--text2)', fontSize: 12 }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editRow && (
        <Modal title="Edit Humor Mix Entry" onClose={() => setEditRow(null)} width={400}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>HUMOR FLAVOR</label>
            <select value={editRow.humor_flavor_id} onChange={e => setEditRow((r: any) => ({ ...r, humor_flavor_id: e.target.value }))} style={{ width: '100%' }}>
              {flavors.map(f => <option key={f.id} value={f.id}>{f.slug}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>CAPTION COUNT</label>
            <input type="number" min={0} max={20} value={editRow.caption_count}
              onChange={e => setEditRow((r: any) => ({ ...r, caption_count: e.target.value }))} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditRow(null)}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleUpdate} disabled={saving}
              style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
