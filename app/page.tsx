'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminGuard from '../components/AdminGuard'

export default function AdminDashboard() {
  const router = useRouter()
  const [images, setImages] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [captions, setCaptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // 1. Fetch Profiles (Users)
      const { data: pData } = await supabase.from('profiles').select('*').limit(5)
      if (pData) setProfiles(pData)

      // 2. Fetch Images (using 'url')
      const { data: iData } = await supabase.from('images').select('*').order('created_at', { ascending: false }).limit(6)
      if (iData) setImages(iData)

      // 3. Fetch Captions (using 'content')
      const { data: cData } = await supabase.from('captions').select('*').limit(10)
      if (cData) setCaptions(cData)

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // --- IMAGE CRUD ---
  const handleCreateImage = async () => {
    const url = window.prompt("Paste the new Image URL:")
    if (!url) return
    const { data, error } = await supabase.from('images').insert([{ url }]).select()
    if (error) alert(error.message)
    else if (data) setImages([data[0], ...images])
  }

  const handleUpdateImage = async (id: string, currentUrl: string) => {
    const newUrl = window.prompt("Update Image URL:", currentUrl)
    if (!newUrl || newUrl === currentUrl) return
    const { error } = await supabase.from('images').update({ url: newUrl }).eq('id', id)
    if (error) alert(error.message)
    else setImages(images.map(img => img.id === id ? { ...img, url: newUrl } : img))
  }

  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("Permanently delete this image?")) return
    const { error } = await supabase.from('images').delete().eq('id', id)
    if (error) alert(error.message)
    else setImages(images.filter(img => img.id !== id))
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
        <header className="flex justify-between items-center border-b-8 border-white pb-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Admin Hub</h1>
          <button onClick={handleSignOut} className="bg-red-600 px-6 py-2 font-black uppercase hover:bg-white hover:text-black border-4 border-transparent hover:border-black transition-all">
            Sign Out
          </button>
        </header>

        {loading ? (
          <div className="text-2xl font-black animate-pulse uppercase">Accessing Database...</div>
        ) : (
          <div className="space-y-20">

            {/* USER REGISTRY */}
            <section>
              <h2 className="text-3xl font-black uppercase mb-4 text-red-600 italic underline decoration-4">User Registry</h2>
              <div className="border-4 border-white">
                <table className="w-full text-left">
                  <thead className="bg-white text-black uppercase font-black">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => (
                      <tr key={p.id} className="border-b border-zinc-800">
                        <td className="p-3 font-mono text-xs">{p.id}</td>
                        <td className="p-3 text-zinc-400">{p.username || p.email || 'Active User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. CRUD IMAGES */}
            <section className="border-4 border-blue-600 p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-black uppercase text-blue-600 italic">Image Assets</h2>
                <button
                  onClick={handleCreateImage}
                  className="bg-blue-600 text-white px-6 py-2 font-black uppercase hover:bg-white hover:text-blue-600 transition-all shadow-[4px_4px_0px_white]"
                >
                  + Add Asset
                </button>
              </div>

              {/* Check if images exists and has items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {images && images.length > 0 ? (
                  images.map((img) => (
                    <div key={img?.id || Math.random()} className="border-2 border-zinc-700 bg-zinc-900 p-4">
                      <div className="aspect-video w-full bg-black mb-4 overflow-hidden border border-zinc-800 flex items-center justify-center">
                        {img?.url ? (
                          <img
                            src={img.url}
                            alt="asset"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <span className="text-zinc-600 text-[10px] uppercase font-bold">No URL Data</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateImage(img?.id, img?.url || '')}
                          className="bg-zinc-800 py-2 text-xs font-black uppercase hover:bg-white hover:text-black transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteImage(img?.id)}
                          className="bg-red-900 py-2 text-xs font-black uppercase hover:bg-red-600 text-white transition-colors"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Debugging: Show the ID underneath if buttons are missing */}
                      <p className="text-[10px] text-zinc-600 mt-2 font-mono truncate">ID: {img?.id}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800">
                    <p className="text-xl font-black uppercase text-zinc-500 italic">No image assets returned from database</p>
                  </div>
                )}
              </div>
            </section>

            {/* GLOBAL CAPTIONS */}
            <section>
              <h2 className="text-3xl font-black uppercase mb-6 text-green-500 italic underline decoration-4">Global Captions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {captions.map(c => (
                  <div key={c.id} className="p-6 bg-zinc-900 border-l-[12px] border-green-500 font-bold italic text-xl shadow-lg">
                    "{c.content}"
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </AdminGuard>
  )
}