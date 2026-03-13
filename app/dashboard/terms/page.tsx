'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

const blank = { term_type_id: '', priority: 0 }

export default function TermsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [termTypes, setTermTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [form, setForm] = useState<any>(blank)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const [{ data: terms }, { data: types }] = await Promise.all([
      supabase.from('terms').select('*, term_types(name)').order('id', { ascending: false }),
      supabase.from('term_types').select('*').order('name'),
    ])
    setRows(terms || [])
    setTermTypes(types || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    setSaving(true)
    const { error } = await supabase.from('terms').insert({
      term_type_id: form.term_type_id || null,
      priority: Number(form.priority),
    })
    setSaving(false)
    if (error) { alert(error.message); return }
    setShowCreate(false); setForm(blank); load()
  }

  async function handleUpdate() {
    setSaving(true)
    const { error } = await supabase.from('terms').update({
      term_type_id: editRow.term_type_id || null,
      priority: Number(editRow.priority),
      modified_datetime_utc: new Date().toISOString(),
    }).eq('id', editRow.id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditRow(null); load()
  }

  async function handleDelete() {
    const { error } = await supabase.from('terms').delete().eq('id', deleteRow.id)
    if (error) { alert(error.message); return }
    setDeleteRow(null); load()
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    { key: 'term_types', label: 'TYPE', render: (v: any) => <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--blue)' }}>{v?.name || '—'}</span> },
    { key: 'priority', label: 'PRIORITY', mono: true },
    { key: 'created_datetime_utc', label: 'CREATED', mono: true, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  function TermForm({ data, onChange }: { data: any, onChange: (k: string, v: any) => void }) {
    return (
      <>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>TERM TYPE</label>
          <select value={data.term_type_id || ''} onChange={e => onChange('term_type_id', e.target.value)} style={{ width: '100%' }}>
            <option value="">— None —</option>
            {termTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>PRIORITY</label>
          <input type="number" value={data.priority ?? 0} onChange={e => onChange('priority', e.target.value)} style={{ width: '100%' }} />
        </div>
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Terms" subtitle="Manage terms and term types" count={rows.length}
        action={
          <button onClick={() => { setForm(blank); setShowCreate(true) }}
            style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, fontSize: 13 }}>
            + New Term
          </button>
        }
      />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} onEdit={setEditRow} onDelete={setDeleteRow} />}
        </div>
      </div>

      {showCreate && (
        <Modal title="New Term" onClose={() => setShowCreate(false)} width={400}>
          <TermForm data={form} onChange={(k, v) => setForm((f: any) => ({ ...f, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </Modal>
      )}

      {editRow && (
        <Modal title="Edit Term" onClose={() => setEditRow(null)} width={400}>
          <TermForm data={editRow} onChange={(k, v) => setEditRow((r: any) => ({ ...r, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleUpdate} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteRow && (
        <Modal title="Delete Term" onClose={() => setDeleteRow(null)} width={380}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Delete term #{deleteRow.id}? This cannot be undone.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleDelete} style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
