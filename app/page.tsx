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

      // Basic Read for all three tables
      const { data: pData } = await supabase.from('profiles').select('*')
      if (pData) setProfiles(pData)

      const { data: iData } = await supabase.from('images').select('*').limit(20)
      if (iData) setImages(iData)

      const { data: cData } = await supabase.from('captions').select('*').limit(20)
      if (cData) setCaptions(cData)

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login' // Hard redirect to fix the sign-out issue
  }

  const handleDeleteImage = async (id: any) => {
    if (!window.confirm("Delete image?")) return
    const { error } = await supabase.from('images').delete().eq('id', id)
    if (error) alert(error.message)
    else setImages(images.filter(img => img.id !== id))
  }

  const handleCreateImage = async () => {
    const url = window.prompt("Image URL:")
    if (!url) return
    const { data, error } = await supabase.from('images').insert([{ url }]).select()
    if (error) alert(error.message)
    else if (data) setImages([data[0], ...images])
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white p-8">
        <header className="flex justify-between border-b-4 border-white pb-4 mb-8">
          <h1 className="text-4xl font-black uppercase">Admin Hub</h1>
          <button onClick={handleSignOut} className="bg-red-600 px-4 py-1 font-bold uppercase">Sign Out</button>
        </header>

        {loading ? (
          <p className="animate-pulse">LOADING...</p>
        ) : (
          <div className="space-y-12">
            {/* USERS */}
            <section>
              <h2 className="text-2xl font-bold uppercase mb-2">Users</h2>
              <div className="bg-zinc-900 p-4 border border-zinc-700">
                {profiles.map(p => <div key={p.id}>{p.username || p.email || p.id}</div>)}
              </div>
            </section>

            {/* IMAGES */}
            <section className="border-4 border-blue-600 p-4">
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold uppercase">Images</h2>
                <button onClick={handleCreateImage} className="bg-blue-600 px-3 py-1 text-sm font-bold">+ ADD</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="bg-zinc-800 p-2 border border-zinc-600">
                    <img src={img.url} className="w-full aspect-square object-cover mb-2" alt="" />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="w-full bg-red-700 text-[10px] py-1 font-bold hover:bg-red-500"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* CAPTIONS */}
            <section>
              <h2 className="text-2xl font-bold uppercase mb-2 text-green-500">Captions</h2>
              <div className="space-y-2">
                {captions.map(c => (
                  <div key={c.id} className="bg-zinc-900 p-2 border-l-4 border-green-500 italic text-sm">
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