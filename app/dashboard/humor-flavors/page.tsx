'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

export default function HumorFlavorsPage() {
  const [flavors, setFlavors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [steps, setSteps] = useState<any[]>([])
  const [stepsLoading, setStepsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('humor_flavors').select('*').order('id')
      .then(({ data }) => { setFlavors(data || []); setLoading(false) })
  }, [])

  async function viewSteps(flavor: any) {
    setSelected(flavor)
    setStepsLoading(true)
    const { data } = await supabase
      .from('humor_flavor_steps')
      .select('*, humor_flavor_step_types(slug, description), llm_models(name, provider_model_id)')
      .eq('humor_flavor_id', flavor.id)
      .order('order_by')
    setSteps(data || [])
    setStepsLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Humor Flavors" subtitle="Read-only — click a flavor to see its prompt steps" count={flavors.length} />
      <div style={{ padding: '20px 32px' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {flavors.map(flavor => (
              <div key={flavor.id} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
                padding: '20px', cursor: 'pointer', transition: 'border-color 0.15s',
              }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                onClick={() => viewSteps(flavor)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 500,
                    color: 'var(--accent)', background: 'rgba(255,85,0,0.1)',
                    border: '1px solid rgba(255,85,0,0.25)', padding: '3px 10px', borderRadius: 4,
                  }}>{flavor.slug}</span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--text3)' }}>#{flavor.id}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{flavor.description || 'No description'}</p>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
                  Click to view prompt steps →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <Modal title={`Steps — ${selected.slug}`} onClose={() => { setSelected(null); setSteps([]) }} width={720}>
          {stepsLoading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)' }}>Loading steps...</div>
          ) : steps.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13 }}>No steps found for this flavor.</div>
          ) : (
            <div>
              {steps.map((step, i) => (
                <div key={step.id} style={{
                  marginBottom: 16, padding: 16,
                  background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{
                      background: 'var(--accent)', color: '#fff',
                      fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
                      padding: '2px 8px', borderRadius: 4, flexShrink: 0,
                    }}>STEP {step.order_by}</span>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                      {step.humor_flavor_step_types?.slug || step.description || `Step ${i + 1}`}
                    </span>
                    {step.llm_models?.name && (
                      <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--blue)' }}>
                        {step.llm_models.name}
                      </span>
                    )}
                    {step.llm_temperature != null && (
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--yellow)' }}>
                        temp={step.llm_temperature}
                      </span>
                    )}
                  </div>
                  {step.llm_system_prompt && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4, letterSpacing: '0.08em' }}>SYSTEM PROMPT</div>
                      <pre style={{
                        fontSize: 12, color: 'var(--text2)', background: 'var(--bg2)',
                        border: '1px solid var(--border)', borderRadius: 6,
                        padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        maxHeight: 120, overflow: 'auto', margin: 0,
                      }}>{step.llm_system_prompt}</pre>
                    </div>
                  )}
                  {step.llm_user_prompt && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4, letterSpacing: '0.08em' }}>USER PROMPT</div>
                      <pre style={{
                        fontSize: 12, color: 'var(--text2)', background: 'var(--bg2)',
                        border: '1px solid var(--border)', borderRadius: 6,
                        padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        maxHeight: 120, overflow: 'auto', margin: 0,
                      }}>{step.llm_user_prompt}</pre>
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
