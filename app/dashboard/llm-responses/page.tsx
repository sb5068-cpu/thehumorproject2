'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

export default function LLMResponsesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('llm_model_responses')
      .select('*, llm_models(name, llm_providers(name))')
      .order('created_datetime_utc', { ascending: false })
      .limit(200)
      .then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="LLM Responses" subtitle="Read-only log of all model responses" count={rows.length} />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['MODEL', 'PROVIDER', 'TEMP', 'TIME (s)', 'CHAIN ID', 'RESPONSE PREVIEW', 'CREATED', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text3)', letterSpacing: '0.08em', position: 'sticky', top: 0, background: 'var(--bg2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--blue)' }}>{r.llm_models?.name || '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text2)' }}>{r.llm_models?.llm_providers?.name || '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--yellow)' }}>{r.llm_temperature ?? '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--green)' }}>{r.processing_time_seconds ?? '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text3)' }}>{r.llm_prompt_chain_id ?? '—'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text2)', maxWidth: 240 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.llm_model_response?.slice(0, 80) || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <button onClick={() => setSelected(r)}
                        style={{ padding: '4px 12px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 5, color: 'var(--blue)', fontSize: 12 }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <Modal title="LLM Response Detail" onClose={() => setSelected(null)} width={680}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              ['Model', selected.llm_models?.name],
              ['Provider', selected.llm_models?.llm_providers?.name],
              ['Temperature', selected.llm_temperature],
              ['Processing Time', selected.processing_time_seconds != null ? `${selected.processing_time_seconds}s` : null],
              ['Chain ID', selected.llm_prompt_chain_id],
              ['Request ID', selected.caption_request_id],
            ].map(([label, value]) => (
              <div key={label as string} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'IBM Plex Mono, monospace' }}>{value ?? '—'}</div>
              </div>
            ))}
          </div>
          {selected.llm_system_prompt && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em', marginBottom: 4 }}>SYSTEM PROMPT</div>
              <pre style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 120, overflow: 'auto', margin: 0 }}>
                {selected.llm_system_prompt}
              </pre>
            </div>
          )}
          {selected.llm_user_prompt && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em', marginBottom: 4 }}>USER PROMPT</div>
              <pre style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 120, overflow: 'auto', margin: 0 }}>
                {selected.llm_user_prompt}
              </pre>
            </div>
          )}
          {selected.llm_model_response && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em', marginBottom: 4 }}>RESPONSE</div>
              <pre style={{ fontSize: 12, color: 'var(--green)', background: 'var(--bg3)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200, overflow: 'auto', margin: 0 }}>
                {selected.llm_model_response}
              </pre>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
