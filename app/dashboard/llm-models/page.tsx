'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

const blank = { name: '', llm_provider_id: '', provider_model_id: '', is_temperature_supported: true }

export default function LLMModelsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [form, setForm] = useState<any>(blank)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const [{ data: models }, { data: provs }] = await Promise.all([
      supabase.from('llm_models').select('*, llm_providers(name)').order('id'),
      supabase.from('llm_providers').select('*').order('name'),
    ])
    setRows(models || [])
    setProviders(provs || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    setSaving(true)
    const { error } = await supabase.from('llm_models').insert({
      name: form.name, llm_provider_id: Number(form.llm_provider_id) || null,
      provider_model_id: form.provider_model_id || null,
      is_temperature_supported: form.is_temperature_supported,
    })
    setSaving(false)
    if (error) { alert(error.message); return }
    setShowCreate(false); setForm(blank); load()
  }

  async function handleUpdate() {
    setSaving(true)
    const { error } = await supabase.from('llm_models').update({
      name: editRow.name, llm_provider_id: Number(editRow.llm_provider_id) || null,
      provider_model_id: editRow.provider_model_id || null,
      is_temperature_supported: editRow.is_temperature_supported,
    }).eq('id', editRow.id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditRow(null); load()
  }

  async function handleDelete() {
    const { error } = await supabase.from('llm_models').delete().eq('id', deleteRow.id)
    if (error) { alert(error.message); return }
    setDeleteRow(null); load()
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'NAME', render: (v: string) => <strong>{v}</strong> },
    { key: 'llm_providers', label: 'PROVIDER', render: (v: any) => <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--blue)' }}>{v?.name || '—'}</span> },
    { key: 'provider_model_id', label: 'MODEL ID', mono: true, render: (v: string) => <span style={{ fontSize: 11 }}>{v || '—'}</span> },
    {
      key: 'is_temperature_supported', label: 'TEMP',
      render: (v: boolean) => <span style={{ color: v ? 'var(--green)' : 'var(--text3)' }}>{v ? '✓' : '—'}</span>
    },
  ]

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }

  function ModelForm({ data, onChange }: { data: any, onChange: (k: string, v: any) => void }) {
    return (
      <>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>DISPLAY NAME *</label>
          <input value={data.name || ''} onChange={e => onChange('name', e.target.value)} style={{ width: '100%' }} placeholder="e.g. GPT-4o" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>PROVIDER</label>
          <select value={data.llm_provider_id || ''} onChange={e => onChange('llm_provider_id', e.target.value)} style={{ width: '100%' }}>
            <option value="">— None —</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>PROVIDER MODEL ID</label>
          <input value={data.provider_model_id || ''} onChange={e => onChange('provider_model_id', e.target.value)} style={{ width: '100%' }} placeholder="e.g. gpt-4o-2024-08-06" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!data.is_temperature_supported} onChange={e => onChange('is_temperature_supported', e.target.checked)} />
            Temperature Supported
          </label>
        </div>
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="LLM Models" subtitle="Manage language models used in the caption pipeline" count={rows.length}
        action={
          <button onClick={() => { setForm(blank); setShowCreate(true) }}
            style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, fontSize: 13 }}>
            + New Model
          </button>
        }
      />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} onEdit={r => setEditRow({ ...r, llm_provider_id: r.llm_provider_id?.toString() })} onDelete={setDeleteRow} />}
        </div>
      </div>

      {showCreate && (
        <Modal title="New LLM Model" onClose={() => setShowCreate(false)} width={480}>
          <ModelForm data={form} onChange={(k, v) => setForm((f: any) => ({ ...f, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </Modal>
      )}

      {editRow && (
        <Modal title="Edit LLM Model" onClose={() => setEditRow(null)} width={480}>
          <ModelForm data={editRow} onChange={(k, v) => setEditRow((r: any) => ({ ...r, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleUpdate} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteRow && (
        <Modal title="Delete Model" onClose={() => setDeleteRow(null)} width={380}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Delete model <strong style={{ color: 'var(--text)' }}>{deleteRow.name}</strong>? This may break flavor steps that reference it.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleDelete} style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
