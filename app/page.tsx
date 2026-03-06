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

      // 1. Profiles with Superadmin column
      const { data: pData } = await supabase.from('profiles').select('id, email, username, is_superadmin').limit(10)
      if (pData) setProfiles(pData)

      // 2. Images (Limiting to 20 for speed)
      const { data: iData } = await supabase.from('images').select('*').limit(20)
      if (iData) setImages(iData)

      // 3. Captions
      const { data: cData } = await supabase.from('captions').select('*').limit(10)
      if (cData) setCaptions(cData)

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleCreateImage = async () => {
    const url = window.prompt("Image URL:")
    if (!url) return
    const { data, error } = await supabase.from('images').insert([{ url }]).select()
    if (error) alert(error.message)
    else if (data) setImages([data[0], ...images])
  }

  const handleUpdateImage = async (id: any, currentUrl: string) => {
    const newUrl = window.prompt("Edit Image URL:", currentUrl)
    if (!newUrl || newUrl === currentUrl) return
    const { error } = await supabase.from('images').update({ url: newUrl }).eq('id', id)
    if (error) alert(error.message)
    else setImages(images.map(img => img.id === id ? { ...img, url: newUrl } : img))
  }

  const handleDeleteImage = async (id: any) => {
    if (!window.confirm("Delete this image?")) return
    const { error } = await supabase.from('images').delete().eq('id', id)
    if (error) alert(error.message)
    else setImages(images.filter(img => img.id !== id))
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white p-6 md:p-12">
        <header className="flex justify-between items-center border-b-8 border-white pb-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase">Admin Hub</h1>
          <button onClick={handleSignOut} className="bg-red-600 px-6 py-2 font-black uppercase hover:bg-white hover:text-black border-4 border-black">
            Sign Out
          </button>
        </header>

        {loading ? (
          <div className="text-2xl font-black animate-pulse">SYNCING DATA...</div>
        ) : (
          <div className="space-y-16">

            {/* USER REGISTRY */}
            <section>
              <h2 className="text-3xl font-black uppercase mb-4 text-red-600 italic underline">User Registry</h2>
              <div className="border-4 border-white overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white text-black uppercase font-black">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Superadmin?</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold">
                    {profiles.map(p => (
                      <tr key={p.id} className="border-b border-zinc-800">
                        <td className="p-3 text-[10px] font-mono">{p.id}</td>
                        <td className="p-3 uppercase text-sm">{p.username || p.email || 'Active User'}</td>
                        <td className="p-3 text-sm">{p.is_superadmin ? '✅ YES' : '❌ NO'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* IMAGE ASSETS */}
            <section className="border-4 border-blue-600 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black uppercase text-blue-600">Image Assets</h2>
                <button onClick={handleCreateImage} className="bg-blue-600 px-4 py-2 font-black uppercase">+ Add</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.length > 0 ? images.map((img) => (
                  <div key={img.id} className="bg-zinc-900 border border-zinc-700 p-2">
                    <div className="aspect-square w-full mb-2 bg-black border border-zinc-800 overflow-hidden flex flex-col items-center justify-center text-[8px] text-zinc-500 break-all p-1">
                      {img.url ? (
                        <img src={img.url} className="w-full h-full object-cover mb-1" alt="asset" onError={(e) => e.currentTarget.style.display='none'} />
                      ) : null}
                      {/* Displays the URL text as a backup if image fails */}
                      <span className="text-center">{img.url || 'No URL'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button onClick={() => handleUpdateImage(img.id, img.url)} className="bg-zinc-700 py-1 text-[10px] font-bold uppercase hover:bg-white hover:text-black">Edit</button>
                      <button onClick={() => handleDeleteImage(img.id)} className="bg-red-900 py-1 text-[10px] font-bold uppercase hover:bg-red-600 text-white">Delete</button>
                    </div>
                  </div>
                )) : <p className="italic text-zinc-600">No images returned from database.</p>}
              </div>
            </section>

            {/* CAPTIONS */}
            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-green-500 italic">Global Captions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {captions.map(c => (
                  <div key={c.id} className="p-4 bg-zinc-900 border-l-8 border-green-500 font-bold italic">
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