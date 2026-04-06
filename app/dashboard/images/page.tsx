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

  function FormFields({ data, onChange }: { data: any, onChange: (k: string, v: any) => void }) {
    return (
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wider">Image File (Upload)</label>
          <input type="file" accept="image/*" ref={fileRef} onChange={e => handleFileChange(e, !!editRow)} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-neutral-300 text-sm transition-colors text-left truncate">
            {uploadFile ? uploadFile.name : 'Choose file...'}
          </button>
          {previewUrl && <img src={previewUrl} alt="preview" className="mt-3 max-h-40 rounded-lg border border-neutral-700 object-cover" />}
          {!uploadFile && data.url && <img src={data.url} alt="current" className="mt-3 max-h-40 rounded-lg border border-neutral-700 object-cover" />}
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wider">Or Paste URL</label>
          <input value={data.url || ''} onChange={e => onChange('url', e.target.value)} disabled={!!uploadFile} placeholder="https://..." className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50" />
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wider">Image Description</label>
          <textarea value={data.image_description || ''} onChange={e => onChange('image_description', e.target.value)} rows={3} placeholder="Describe the image..." className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y" />
        </div>

        <div>
          <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase tracking-wider">Additional Context</label>
          <input value={data.additional_context || ''} onChange={e => onChange('additional_context', e.target.value)} placeholder="Optional context..." className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="flex gap-6 pt-2 border-t border-neutral-800">
          <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer hover:text-white">
            <input type="checkbox" checked={!!data.is_public} onChange={e => onChange('is_public', e.target.checked)} className="rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-indigo-500" />
            Public
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer hover:text-white">
            <input type="checkbox" checked={!!data.is_common_use} onChange={e => onChange('is_common_use', e.target.checked)} className="rounded border-neutral-700 bg-neutral-900 text-indigo-500 focus:ring-indigo-500" />
            Common Use
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Image Bank"
          subtitle="Manage, upload, and curate source images"
          count={filtered.length}
          action={
            <button onClick={() => { resetForm(); setShowCreate(true) }} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg text-white text-sm font-semibold shadow-sm">
              + Upload Image
            </button>
          }
        />

        <div className="mt-8">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search descriptions or URLs..."
            className="w-full max-w-sm mb-8 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />

          {loading ? (
            <div className="py-20 text-center text-neutral-500 font-mono text-sm animate-pulse">Loading gallery...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filtered.map(img => (
                <div key={img.id} className="group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm hover:border-neutral-700 transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col">
                  <div className="h-40 bg-neutral-800 relative overflow-hidden">
                    {img.url ? (
                      <img src={img.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-neutral-600 text-xs font-mono">No image</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {img.is_public && <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">PUB</span>}
                      {img.is_common_use && <span className="bg-blue-500/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shadow-sm">COM</span>}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-[10px] text-neutral-500 font-mono mb-2 truncate">
                      ID: {String(img.id ?? '').slice(0, 8)}
                    </div>
                    {img.image_description ? (
                      <div className="text-sm text-neutral-300 mb-4 line-clamp-2 flex-1">
                        {img.image_description}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-600 italic mb-4 flex-1">No description</div>
                    )}
                    <div className="flex gap-2 mt-auto pt-4 border-t border-neutral-800/50">
                      <button onClick={() => { setEditRow(img); setPreviewUrl(''); setUploadFile(null) }} className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 text-xs font-medium transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setDeleteRow(img)} className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals - assuming your generic Modal component takes className or style, but here is standard markup if needed */}
        {showCreate && (
          <Modal title="Upload New Image" onClose={() => { setShowCreate(false); resetForm() }} width={520}>
            <div className="p-1">
              <FormFields data={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))} />
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => { setShowCreate(false); resetForm() }} className="px-4 py-2 hover:bg-neutral-800 rounded-lg text-sm text-neutral-400 transition-colors">Cancel</button>
                <button onClick={handleCreate} disabled={saving || uploading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-lg text-sm text-white font-medium transition-colors">
                  {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {editRow && (
          <Modal title="Edit Image Details" onClose={() => { setEditRow(null); setUploadFile(null); setPreviewUrl('') }} width={520}>
            <div className="p-1">
              <FormFields data={editRow} onChange={(k, v) => setEditRow((r: any) => ({ ...r, [k]: v }))} />
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => { setEditRow(null); setUploadFile(null); setPreviewUrl('') }} className="px-4 py-2 hover:bg-neutral-800 rounded-lg text-sm text-neutral-400 transition-colors">Cancel</button>
                <button onClick={handleUpdate} disabled={saving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm text-white font-medium transition-colors">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {deleteRow && (
          <Modal title="Confirm Deletion" onClose={() => setDeleteRow(null)} width={400}>
            <div className="p-1">
              <p className="text-neutral-400 text-sm mb-6">Are you sure you want to permanently delete this image? This action cannot be undone.</p>
              {deleteRow.url && <img src={deleteRow.url} alt="" className="max-h-32 w-full object-cover rounded-lg border border-neutral-800 mb-6" />}
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteRow(null)} className="px-4 py-2 hover:bg-neutral-800 rounded-lg text-sm text-neutral-400 transition-colors">Cancel</button>
                <button onClick={handleDelete} className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm text-white font-medium transition-colors shadow-sm">Delete Forever</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}
