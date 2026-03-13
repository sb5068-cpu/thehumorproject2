'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

// Note: update TABLE_NAME below if your table is named differently
const TABLE_NAME = 'whitelist_email_addresses'

export default function WhitelistedEmailsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [emailInput, setEmailInput] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data, error: err } = await supabase.from(TABLE_NAME).select('*').order('id', { ascending: false })
    if (err) { setError(err.message); setLoading(false); return }
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!emailInput.trim()) return
    setSaving(true)
    const insertData: any = {}
    // Try to detect email column name
    if (rows.length > 0) {
      const emailCol = Object.keys(rows[0]).find(k => k.includes('email'))
      if (emailCol) insertData[emailCol] = emailInput.trim().toLowerCase()
    } else {
      insertData['email'] = emailInput.trim().toLowerCase()
    }
    const { error: err } = await supabase.from(TABLE_NAME).insert(insertData)
    setSaving(false)
    if (err) { alert(err.message); return }
    setShowCreate(false); setEmailInput(''); load()
  }

  async function handleDelete() {
    const { error: err } = await supabase.from(TABLE_NAME).delete().eq('id', deleteRow.id)
    if (err) { alert(err.message); return }
    setDeleteRow(null); load()
  }

  // Dynamically generate columns from data
  const columns = rows.length > 0
    ? Object.keys(rows[0])
        .filter(k => k !== 'id')
        .map(k => ({
          key: k,
          label: k.toUpperCase().replace(/_/g, ' '),
          mono: k.includes('id') || k.includes('datetime') || k.includes('email'),
          render: k.includes('datetime')
            ? (v: string) => v ? new Date(v).toLocaleDateString() : '—'
            : undefined,
        }))
    : [{ key: 'email', label: 'EMAIL', mono: true }]

  const emailCol = rows.length > 0 ? Object.keys(rows[0]).find(k => k.includes('email')) || 'email' : 'email'

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Whitelisted Emails" subtitle="Individual emails allowed to sign up" count={rows.length}
        action={
          <button onClick={() => { setEmailInput(''); setShowCreate(true) }}
            style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, fontSize: 13 }}>
            + Add Email
          </button>
        }
      />
      <div style={{ padding: '20px 32px' }}>
        {error && (
          <div style={{ background: '#1a0a0a', border: '1px solid var(--red)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#fca5a5', fontSize: 13 }}>
            ⚠ Error loading table "{TABLE_NAME}": {error}
            <br /><span style={{ fontSize: 11, opacity: 0.7 }}>Check that this table exists in your Supabase database.</span>
          </div>
        )}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', maxWidth: 700 }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} onEdit={r => setEditRow({ ...r })} onDelete={setDeleteRow} />}
        </div>
      </div>

      {showCreate && (
        <Modal title="Add Whitelisted Email" onClose={() => setShowCreate(false)} width={420}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>EMAIL ADDRESS</label>
            <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="user@example.com" style={{ width: '100%' }} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving || !emailInput.trim()} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, opacity: !emailInput.trim() ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Add'}
            </button>
          </div>
        </Modal>
      )}

      {editRow && (
        <Modal title="Edit Whitelisted Email" onClose={() => setEditRow(null)} width={420}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>EMAIL ADDRESS</label>
            <input type="email" value={editRow[emailCol] || ''} onChange={e => setEditRow((r: any) => ({ ...r, [emailCol]: e.target.value }))} style={{ width: '100%' }} autoFocus />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={async () => {
              setSaving(true)
              const { error: err } = await supabase.from(TABLE_NAME).update({ [emailCol]: editRow[emailCol] }).eq('id', editRow.id)
              setSaving(false)
              if (err) { alert(err.message); return }
              setEditRow(null); load()
            }} disabled={saving} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {deleteRow && (
        <Modal title="Remove Email" onClose={() => setDeleteRow(null)} width={380}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>Remove <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--accent)' }}>{deleteRow[emailCol]}</span> from the whitelist?</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleDelete} style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
