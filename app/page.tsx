'use client'
import AdminGuard from '@/components/AdminGuard'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ images: 0, captions: 0, users: 0 })
  const [profiles, setProfiles] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [captions, setCaptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --- CRUD OPERATIONS ---

  // 1. DELETE Image (The 'D' in CRUD)
  const deleteImage = async (id: string) => {
    const confirmDelete = confirm("⚠️ Permanently delete this image?")
    if (!confirmDelete) return

    const { error } = await supabase.from('images').delete().eq('id', id)
    if (error) alert(error.message)
    else setImages(images.filter(img => img.id !== id))
  }

  // 2. UPDATE Image Name (The 'U' in CRUD)
  const renameImage = async (id: string, oldName: string) => {
    const newName = prompt("Enter new name for this image:", oldName)
    if (!newName || newName === oldName) return

    const { error } = await supabase.from('images').update({ name: newName }).eq('id', id)
    if (error) alert(error.message)
    else setImages(images.map(img => img.id === id ? { ...img, name: newName } : img))
  }

  // --- DATA FETCHING (READ) ---
  useEffect(() => {
    async function fetchData() {
      const { count: imgCount } = await supabase.from('images').select('*', { count: 'exact', head: true })
      const { count: capCount } = await supabase.from('captions').select('*', { count: 'exact', head: true })
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      setStats({ images: imgCount || 0, captions: capCount || 0, users: userCount || 0 })

      const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      const { data: imageData } = await supabase.from('images').select('*').order('created_at', { ascending: false })
      const { data: captionData } = await supabase.from('captions').select('*').order('created_at', { ascending: false })

      setProfiles(profilesData || [])
      setImages(imageData || [])
      setCaptions(captionData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <AdminGuard>
      <main className="p-8 bg-zinc-50 min-h-screen font-sans pb-20">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-6xl font-black uppercase italic mb-2 tracking-tighter">
            ADMIN <span className="text-blue-600">HUB</span>
          </h1>
          <div className="h-2 w-48 bg-black"></div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black uppercase text-xs">Total Images</p>
            <p className="text-5xl font-black">{stats.images}</p>
          </div>
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black uppercase text-xs">Captions</p>
            <p className="text-5xl font-black">{stats.captions}</p>
          </div>
          <div className="bg-green-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black uppercase text-xs">Users</p>
            <p className="text-5xl font-black">{stats.users}</p>
          </div>
        </div>

        {/* USER REGISTRY (READ Users) */}
        <section className="mb-20">
          <h2 className="text-3xl font-black uppercase italic mb-6 underline">User Registry</h2>
          <div className="border-4 border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-100 border-b-4 border-black">
                <tr>
                  <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Username</th>
                  <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Role</th>
                  <th className="p-4 font-black uppercase text-sm">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(u => (
                  <tr key={u.id} className="border-b-2 border-zinc-100">
                    <td className="p-4 font-bold">{u.username || 'Anonymous'}</td>
                    <td className="p-4 uppercase text-[10px] font-black">{u.is_superadmin ? 'Admin' : 'User'}</td>
                    <td className="p-4 text-xs text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* IMAGE MANAGEMENT (CRUD Images) */}
        <section className="mb-20">
          <h2 className="text-3xl font-black uppercase italic mb-6 underline decoration-red-500">Image Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {images.map(img => (
              <div key={img.id} className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <img src={img.url} className="w-full h-32 object-cover border-2 border-black mb-2" alt="meme" />
                <p className="font-black text-xs truncate mb-4">{img.name || 'No Name'}</p>
                <div className="flex gap-2">
                  <button onClick={() => renameImage(img.id, img.name)} className="flex-1 bg-zinc-200 border-2 border-black font-black text-[10px] py-1 uppercase hover:bg-white">Edit</button>
                  <button onClick={() => deleteImage(img.id)} className="flex-1 bg-red-500 text-white border-2 border-black font-black text-[10px] py-1 uppercase hover:bg-red-600">Del</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CAPTION FEED (READ Captions) */}
        <section>
          <h2 className="text-3xl font-black uppercase italic mb-6 underline decoration-blue-500">Global Captions</h2>
          <div className="space-y-4">
            {captions.map(cap => (
              <div key={cap.id} className="bg-blue-50 border-2 border-black p-4 flex justify-between items-center">
                <p className="font-bold italic">"{cap.content}"</p>
                <span className="text-[10px] font-mono text-zinc-500">Img ID: {cap.image_id?.slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </section>

      </main>
    </AdminGuard>
  )
}