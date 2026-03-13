'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'

export default function AllowedDomainsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [domain, setDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('allowed_signup_domains').select('*').order('apex_domain')
    setRows(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!domain.trim()) return
    setSaving(true)
    const { error } = await supabase.from('allowed_signup_domains').insert({ apex_domain: domain.trim().toLowerCase() })
    setSaving(false)
    if (error) { alert(error.message); return }
    setShowCreate(false); setDomain(''); load()
  }

  async function handleUpdate() {
    setSaving(true)
    const { error } = await supabase.from('allowed_signup_domains').update({ apex_domain: editRow.apex_domain.toLowerCase() }).eq('id', editRow.id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditRow(null); load()
  }

  async function handleDelete() {
    const { error } = await supabase.from('allowed_signup_domains').delete().eq('id', deleteRow.id)
    if (error) { alert(error.message); return }
    setDeleteRow(null); load()
  }

  const columns = [
    { key: 'id', label: 'ID', mono: true },
    {
      key: 'apex_domain', label: 'DOMAIN',
      render: (v: string) => (
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10 }}>@</span>{v}
        </span>
      )
    },
    { key: 'created_datetime_utc', label: 'ADDED', mono: true, render: (v: string) => v ? new Date(v).toLocaleDateString() : '—' },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="Allowed Signup Domains" subtitle="Only emails from these domains can sign up" count={rows.length}
        action={
          <button onClick={() => { setDomain(''); setShowCreate(true) }}
            style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, fontSize: 13 }}>
            + Add Domain
          </button>
        }
      />
      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', maxWidth: 600 }}>
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
            : <DataTable columns={columns} data={rows} onEdit={r => setEditRow({ ...r })} onDelete={setDeleteRow} />}
        </div>
      </div>

      {showCreate && (
        <Modal title="Add Allowed Domain" onClose={() => setShowCreate(false)} width={400}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>APEX DOMAIN</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. columbia.edu" style={{ width: '100%' }} autoFocus />
            <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Enter just the domain, no @ symbol. e.g. <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>columbia.edu</span></p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving || !domain.trim()} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, opacity: !domain.trim() ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Add'}
            </button>
          </div>
        </Modal>
      )}

      {editRow && (
        <Modal title="Edit Domain" onClose={() => setEditRow(null)} width={400}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }}>APEX DOMAIN</label>
            <input value={editRow.apex_domain || ''} onChange={e => setEditRow((r: any) => ({ ...r, apex_domain: e.target.value }))} style={{ width: '100%' }} autoFocus />
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
        <Modal title="Remove Domain" onClose={() => setDeleteRow(null)} width={380}>
          <p style={{ color: 'var(--text2)', marginBottom: 8 }}>Remove <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--green)' }}>{deleteRow.apex_domain}</span>?</p>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 20 }}>New users from this domain will no longer be able to sign up.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteRow(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>Cancel</button>
            <button onClick={handleDelete} style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
