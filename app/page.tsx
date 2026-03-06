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

  // FETCH DATA (READ)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, is_superadmin')
        .limit(10)
      if (profileData) setProfiles(profileData)

      const { data: imageData } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)
      if (imageData) setImages(imageData)

      const { data: captionData } = await supabase
        .from('captions')
        .select('id, content')
        .limit(10)
      if (captionData) setCaptions(captionData)

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // --- IMAGE CRUD LOGIC ---

  // CREATE
  const handleCreateImage = async () => {
    const url = window.prompt("Enter new Image URL:")
    if (!url) return

    const { data, error } = await supabase
      .from('images')
      .insert([{ url: url }])
      .select()

    if (error) {
      alert(`Error: ${error.message}`)
    } else if (data) {
      setImages([data[0], ...images])
      alert("Image created!")
    }
  }

  // UPDATE
  const handleUpdateImage = async (id: string, currentUrl: string) => {
    const newUrl = window.prompt("Edit Image URL:", currentUrl)
    if (!newUrl || newUrl === currentUrl) return

    const { error } = await supabase
      .from('images')
      .update({ url: newUrl })
      .eq('id', id)

    if (error) {
      alert(`Error updating: ${error.message}`)
    } else {
      setImages(images.map(img => img.id === id ? { ...img, url: newUrl } : img))
      alert("Image updated!")
    }
  }

  // DELETE
  const handleDeleteImage = async (id: string) => {
    const confirmed = window.confirm("Are you sure? This will permanently delete this image.")
    if (!confirmed) return

    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id)

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      setImages(images.filter((img) => img.id !== id))
    }
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
        <header className="flex justify-between items-center border-b-8 border-white pb-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase">Admin Hub</h1>
          <button
            onClick={handleSignOut}
            className="bg-red-600 px-6 py-2 font-black uppercase hover:bg-white hover:text-black transition-all border-4 border-transparent hover:border-black"
          >
            Sign Out
          </button>
        </header>

        {loading ? (
          <div className="text-2xl font-black animate-pulse uppercase">Syncing with Database...</div>
        ) : (
          <div className="space-y-16">

            {/* 1. READ USERS */}
            <section>
              <h2 className="text-3xl font-black uppercase mb-4 text-red-600 italic underline">User Registry</h2>
              <div className="border-4 border-white overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white text-black uppercase font-black">
                    <tr>
                      <th className="p-3">Username</th>
                      <th className="p-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold">
                    {profiles.map(p => (
                      <tr key={p.id} className="border-b border-zinc-800">
                        <td className="p-3 uppercase">{p.username || 'Unknown User'}</td>
                        <td className="p-3">{p.is_superadmin ? 'SUPERADMIN' : 'USER'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 2. CRUD IMAGES */}
            <section className="border-4 border-blue-600 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black uppercase text-blue-600 italic">Image Assets</h2>
                <button
                  onClick={handleCreateImage}
                  className="bg-blue-600 text-white px-6 py-2 font-black uppercase hover:bg-white hover:text-blue-600 transition-all"
                >
                  + Add New Image
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map(img => (
                  <div key={img.id} className="border-2 border-zinc-700 bg-zinc-900 p-4">
                    <div className="aspect-video bg-zinc-800 mb-4 flex items-center justify-center text-xs text-zinc-500 overflow-hidden">
                      {img.url ? (
                        <img src={img.url} alt="asset" className="object-cover w-full h-full" />
                      ) : 'NO IMAGE URL'}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleUpdateImage(img.id, img.url)}
                        className="w-full bg-zinc-700 py-1 font-black text-xs hover:bg-white hover:text-black uppercase"
                      >
                        Edit Asset
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="w-full bg-red-900 py-1 font-black text-xs hover:bg-red-600 uppercase"
                      >
                        Delete Asset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. READ CAPTIONS */}
            <section>
              <h2 className="text-3xl font-black uppercase mb-4 text-green-500 italic underline">Global Captions</h2>
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