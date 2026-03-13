'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

export default function LLMProvidersPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('llm_providers').select('*').order('id')
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true)
    const { error } = await supabase.from('llm_providers').insert({ name: name.trim() })
    setSaving(false)
    if (error) { alert(error.message); return }
    setShowCreate(false); setName(''); load()
  }

  async function handleUpdate() {
    setSaving(true)
    const { error } = await supabase.from('llm_providers').update({ name: editRow.name }).eq('id', editRow.id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditRow(null); load()
  }

  async function handleDelete() {
    const { error } = await supabase.from('llm_providers').delete().eq('id', deleteRow.id)
    if (error) { alert(error.message); return }
    setDeleteRow(null); load()
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'NAME', render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { key: 'created_datetime_utc', label: 'CREATED', mono: true, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="LLM Providers" subtitle="Manage AI model providers (OpenAI, Anthropic, etc.)" count={rows.length}
        action={
          <button onClick={() => { setName(''); setShowCreate(true) }}
            style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, fontSize: 13 }}>
            + New Provider
          </button>
        }
      />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} onEdit={r => { setEditRow({ ...r }) }} onDelete={setDeleteRow} />}
        </div>
      </div>

      {showCreate && (
        <Modal title="New LLM Provider" onClose={() => setShowCreate(false)} width={400}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>PROVIDER NAME</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. OpenAI, Anthropic, Google" style={{ width: '100%' }} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving || !name.trim()} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, opacity: !name.trim() ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </Modal>
      )}

      {editRow && (
        <Modal title="Edit LLM Provider" onClose={() => setEditRow(null)} width={400}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>PROVIDER NAME</label>
            <input value={editRow.name || ''} onChange={e => setEditRow((r: any) => ({ ...r, name: e.target.value }))} style={{ width: '100%' }} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleUpdate} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteRow && (
        <Modal title="Delete Provider" onClose={() => setDeleteRow(null)} width={380}>
          <p style={{ color: 'var(--text2)', marginBottom: 8 }}>Delete provider <strong style={{ color: 'var(--text)' }}>{deleteRow.name}</strong>?</p>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 20 }}>Warning: this may break LLM models that reference this provider.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleDelete} style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
