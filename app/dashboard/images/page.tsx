'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editRow, setEditRow] = useState<any>(null)
  const [deleteRow, setDeleteRow] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [form, setForm] = useState({
    url: '', is_public: true, is_common_use: false,
    additional_context: '', image_description: '',
  })

  async function load() {
    const { data } = await supabase.from('images').select('*').order('created_datetime_utc', { ascending: false }).limit(200)
    setImages(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setForm({ url: '', is_public: true, is_common_use: false, additional_context: '', image_description: '' })
    setUploadFile(null)
    setPreviewUrl('')
  }

  async function handleUpload() {
    if (!uploadFile) return null
    setUploading(true)
    const ext = uploadFile.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, uploadFile)
    setUploading(false)
    if (error) { alert('Upload failed: ' + error.message); return null }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
    return publicUrl
  }

  async function handleCreate() {
    setSaving(true)
    let url = form.url
    if (uploadFile) {
      const uploaded = await handleUpload()
      if (!uploaded) { setSaving(false); return }
      url = uploaded
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('images').insert({
      url, is_public: form.is_public, is_common_use: form.is_common_use,
      additional_context: form.additional_context || null,
      image_description: form.image_description || null,
      profile_id: user?.id,
    })
    setSaving(false)
    if (error) { alert(error.message); return }
    setShowCreate(false); resetForm(); load()
  }

  async function handleUpdate() {
    setSaving(true)
    let url = editRow.url
    if (uploadFile) {
      const uploaded = await handleUpload()
      if (!uploaded) { setSaving(false); return }
      url = uploaded
    }
    const { error } = await supabase.from('images').update({
      url, is_public: editRow.is_public, is_common_use: editRow.is_common_use,
      additional_context: editRow.additional_context || null,
      image_description: editRow.image_description || null,
      modified_datetime_utc: new Date().toISOString(),
    }).eq('id', editRow.id)
    setSaving(false)
    if (error) { alert(error.message); return }
    setEditRow(null); setUploadFile(null); setPreviewUrl(''); load()
  }

  async function handleDelete() {
    const { error } = await supabase.from('images').delete().eq('id', deleteRow.id)
    if (error) { alert(error.message); return }
    setDeleteRow(null); load()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, isEdit = false) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFile(file)
    const reader = new FileReader()
    reader.onload = ev => setPreviewUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
    if (!isEdit) setForm(f => ({ ...f, url: '' }))
    else setEditRow((r: any) => ({ ...r, url: '' }))
  }

  const filtered = images.filter(img =>
    (img.url || '').toLowerCase().includes(search.toLowerCase()) ||
    (img.image_description || '').toLowerCase().includes(search.toLowerCase())
  )

  const fieldStyle: React.CSSProperties = { marginBottom: 14 }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 5, letterSpacing: '0.08em' }

  function FormFields({ data, onChange }: { data: any, onChange: (k: string, v: any) => void }) {
    return (
      <>
        <div style={fieldStyle}>
          <label style={labelStyle}>IMAGE FILE (UPLOAD)</label>
          <input type="file" accept="image/*" ref={fileRef} onChange={e => handleFileChange(e, !!editRow)}
            style={{ display: 'none' }} />
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ padding: '8px 16px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', fontSize: 13 }}>
            {uploadFile ? uploadFile.name : 'Choose file...'}
          </button>
          {previewUrl && (
            <img src={previewUrl} alt="preview"
              style={{ display: 'block', marginTop: 8, maxHeight: 120, maxWidth: '100%', borderRadius: 6, border: '1px solid var(--border)' }} />
          )}
          {!uploadFile && data.url && (
            <img src={data.url} alt="current"
              style={{ display: 'block', marginTop: 8, maxHeight: 120, maxWidth: '100%', borderRadius: 6, border: '1px solid var(--border)' }} />
          )}
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>OR PASTE URL</label>
          <input value={data.url || ''} onChange={e => onChange('url', e.target.value)}
            placeholder="https://..." style={{ width: '100%' }} disabled={!!uploadFile} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>IMAGE DESCRIPTION</label>
          <textarea value={data.image_description || ''} onChange={e => onChange('image_description', e.target.value)}
            rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="Describe the image..." />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>ADDITIONAL CONTEXT</label>
          <input value={data.additional_context || ''} onChange={e => onChange('additional_context', e.target.value)}
            style={{ width: '100%' }} placeholder="Optional context..." />
        </div>
        <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!data.is_public} onChange={e => onChange('is_public', e.target.checked)} />
            Public
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={!!data.is_common_use} onChange={e => onChange('is_common_use', e.target.checked)} />
            Common Use
          </label>
        </div>
      </>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageHeader
        title="Images" subtitle="Create, view, edit and delete images" count={filtered.length}
        action={
          <button onClick={() => { resetForm(); setShowCreate(true) }}
            style={{ padding: '8px 18px', background: 'var(--accent)', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 500, fontSize: 13 }}>
            + Upload Image
          </button>
        }
      />

      <div style={{ padding: '20px 32px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search images..." style={{ width: 320, marginBottom: 16 }} />

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(img => (
              <div key={img.id} style={{
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
              }}>
                <div style={{ height: 140, background: 'var(--bg3)', overflow: 'hidden', position: 'relative' }}>
                  {img.url ? (
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontSize: 12 }}>No image</div>
                  )}
                  <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
                    {img.is_public && <span style={{ background: 'rgba(34,197,94,0.85)', color: '#fff', fontSize: 9, padding: '2px 5px', borderRadius: 3, fontFamily: 'IBM Plex Mono, monospace' }}>PUBLIC</span>}
                    {img.is_common_use && <span style={{ background: 'rgba(59,130,246,0.85)', color: '#fff', fontSize: 9, padding: '2px 5px', borderRadius: 3, fontFamily: 'IBM Plex Mono, monospace' }}>COMMON</span>}
                  </div>
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {img.id?.slice(0, 8)}...
                  </div>
                  {img.image_description && (
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {img.image_description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditRow(img); setPreviewUrl(''); setUploadFile(null) }}
                      style={{ flex: 1, padding: '5px 0', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 5, color: 'var(--text2)', fontSize: 12 }}>
                      Edit
                    </button>
                    <button onClick={() => setDeleteRow(img)}
                      style={{ flex: 1, padding: '5px 0', background: 'transparent', border: '1px solid var(--border2)', borderRadius: 5, color: 'var(--text2)', fontSize: 12 }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Upload New Image" onClose={() => { setShowCreate(false); resetForm() }} width={520}>
          <FormFields data={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => { setShowCreate(false); resetForm() }}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving || uploading}
              style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Create'}
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editRow && (
        <Modal title="Edit Image" onClose={() => { setEditRow(null); setUploadFile(null); setPreviewUrl('') }} width={520}>
          <FormFields data={editRow} onChange={(k, v) => setEditRow((r: any) => ({ ...r, [k]: v }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={() => { setEditRow(null); setUploadFile(null); setPreviewUrl('') }}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>
              Cancel
            </button>
            <button onClick={handleUpdate} disabled={saving}
              style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteRow && (
        <Modal title="Delete Image" onClose={() => setDeleteRow(null)} width={400}>
          <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
            Are you sure you want to delete this image? This cannot be undone.
          </p>
          {deleteRow.url && (
            <img src={deleteRow.url} alt="" style={{ maxHeight: 100, maxWidth: '100%', borderRadius: 6, marginBottom: 20, border: '1px solid var(--border)' }} />
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteRow(null)}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)' }}>
              Cancel
            </button>
            <button onClick={handleDelete}
              style={{ padding: '8px 20px', background: 'var(--red)', border: 'none', borderRadius: 6, color: '#fff', fontWeight: 500 }}>
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
