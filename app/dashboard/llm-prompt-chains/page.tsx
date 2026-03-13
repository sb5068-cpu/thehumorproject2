'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

export default function LLMPromptChainsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('llm_prompt_chains').select('*, caption_requests(id, image_id)').order('id', { ascending: false }).limit(300)
      .then(({ data }) => { setRows(data || []); setLoading(false) })
  }, [])

  async function viewResponses(chain: any) {
    setSelected(chain)
    setResponsesLoading(true)
    const { data } = await supabase
      .from('llm_model_responses')
      .select('*, llm_models(name)')
      .eq('llm_prompt_chain_id', chain.id)
      .order('created_datetime_utc')
    setResponses(data || [])
    setResponsesLoading(false)
  }

  const columns = [
    { key: 'id', label: 'CHAIN ID', mono: true },
    { key: 'caption_request_id', label: 'REQUEST ID', mono: true },
    { key: 'created_datetime_utc', label: 'CREATED', mono: true, render: (v: string) => v ? new Date(v).toLocaleString() : '—' },
    {
      key: 'id', label: 'RESPONSES',
      render: (_: any, row: any) => (
        <button onClick={() => viewResponses(row)}
          style={{ padding: '4px 12px', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 5, color: 'var(--blue)', fontSize: 12 }}>
          View →
        </button>
      )
    },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="LLM Prompt Chains" subtitle="Read-only audit trail of prompt chain executions" count={rows.length} />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} />}
        </div>
      </div>

      {selected && (
        <Modal title={`Chain #${selected.id} — LLM Responses`} onClose={() => { setSelected(null); setResponses([]) }} width={740}>
          {responsesLoading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : responses.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13 }}>No responses found for this chain.</div>
          ) : (
            <div>
              {responses.map((r, i) => (
                <div key={r.id} style={{ marginBottom: 16, padding: 16, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text3)' }}>#{i + 1}</span>
                    {r.llm_models?.name && <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', padding: '2px 8px', borderRadius: 4 }}>{r.llm_models.name}</span>}
                    {r.llm_temperature != null && <span style={{ fontSize: 11, color: 'var(--yellow)', fontFamily: 'IBM Plex Mono, monospace' }}>temp={r.llm_temperature}</span>}
                    {r.processing_time_seconds != null && <span style={{ fontSize: 11, color: 'var(--green)', fontFamily: 'IBM Plex Mono, monospace' }}>{r.processing_time_seconds}s</span>}
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace' }}>{r.created_datetime_utc ? new Date(r.created_datetime_utc).toLocaleTimeString() : ''}</span>
                  </div>
                  {r.llm_model_response && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4, letterSpacing: '0.08em' }}>RESPONSE</div>
                      <pre style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 150, overflow: 'auto', margin: 0 }}>
                        {r.llm_model_response}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
