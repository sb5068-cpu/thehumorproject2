'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

const blank = { image_description: '', caption: '', explanation: '', priority: 0, image_id: '' }

export default function CaptionExamplesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [form, setForm] = useState<any>(blank)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('caption_examples').select('*').order('priority').limit(300)
    setRows(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setSaving(true)
    const { error } = await supabase.from('caption_examples').insert({
      image_description: form.image_description || null,
      caption: form.caption,
      explanation: form.explanation || null,
      priority: Number(form.priority),
      image_id: form.image_id || null,
    })
    setSaving(false)
    if (error) { alert(error.message); return }
    setShowCreate(false); setForm(blank); load()
  }

  async function handleUpdate() {
    setSaving(true)
    const { error } = await supabase.from('caption_examples').update({
      image_description: editRow.image_description || null,
      caption: editRow.caption,
      explanation: editRow.explanation || null,
      priority: Number(editRow.priority),
      image_id: editRow.image_id || null,
      modified_datetime_utc: new Date().toISOString(),
    }).eq('id', editRow.id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditRow(null); load()
  }

  async function handleDelete() {
    const { error } = await supabase.from('caption_examples').delete().eq('id', deleteRow.id)
    if (error) { alert(error.message); return }
    setDeleteRow(null); load()
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'caption', label: 'CAPTION', render: (v: string) => <span title={v}>{v?.slice(0, 60)}{v?.length > 60 ? '…' : ''}</span> },
    { key: 'image_description', label: 'IMAGE DESC', render: (v: string) => <span title={v} style={{ color: 'var(--text2)' }}>{v?.slice(0, 50)}{v?.length > 50 ? '…' : ''}</span> },
    { key: 'priority', label: 'PRIORITY', mono: true },
    { key: 'created_datetime_utc', label: 'CREATED', mono: true, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }

  function ExForm({ data, onChange }: { data: any, onChange: (k: string, v: any) => void }) {
    return (
      <>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>CAPTION *</label>
          <textarea value={data.caption || ''} onChange={e => onChange('caption', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="The caption text..." />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>IMAGE DESCRIPTION</label>
          <textarea value={data.image_description || ''} onChange={e => onChange('image_description', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="Describe the image this caption is for..." />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>EXPLANATION</label>
          <textarea value={data.explanation || ''} onChange={e => onChange('explanation', e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} placeholder="Why is this caption funny?" />
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>PRIORITY</label>
            <input type="number" value={data.priority ?? 0} onChange={e => onChange('priority', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>IMAGE ID (UUID)</label>
            <input value={data.image_id || ''} onChange={e => onChange('image_id', e.target.value)} style={{ width: '100%' }} placeholder="Optional image UUID" />
          </div>
        </div>
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Caption Examples" subtitle="Training examples for the LLM pipeline" count={rows.length}
        action={
          <button onClick={() => { setForm(blank); setShowCreate(true) }}
            style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, fontSize: 13 }}>
            + New Example
          </button>
        }
      />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} onEdit={r => setEditRow({ ...r })} onDelete={setDeleteRow} />}
        </div>
      </div>

      {showCreate && (
        <Modal title="New Caption Example" onClose={() => setShowCreate(false)} width={560}>
          <ExForm data={form} onChange={(k, v) => setForm((f: any) => ({ ...f, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </Modal>
      )}

      {editRow && (
        <Modal title="Edit Caption Example" onClose={() => setEditRow(null)} width={560}>
          <ExForm data={editRow} onChange={(k, v) => setEditRow((r: any) => ({ ...r, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleUpdate} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteRow && (
        <Modal title="Delete Example" onClose={() => setDeleteRow(null)} width={380}>
          <p style={{ color: 'var(--text2)', marginBottom: 12 }}>Delete this caption example?</p>
          <p style={{ fontStyle: 'italic', color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>{deleteRow.caption?.slice(0, 100)}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleDelete} style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
