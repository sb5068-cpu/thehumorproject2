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

      // READ Profiles (Users)
      const { data: profileData } = await supabase.from('profiles').select('*').limit(5)
      if (profileData) setProfiles(profileData)

      // READ Images
      const { data: imageData } = await supabase.from('images').select('*').limit(5)
      if (imageData) setImages(imageData)

      // READ Captions
      const { data: captionData } = await supabase.from('captions').select('*').limit(5)
      if (captionData) setCaptions(captionData)

      setLoading(false)
    }
    fetchData()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // Placeholder for the "Create" function we will build next
  const addImage = () => alert("Create Image Modal coming next!")

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
        <header className="flex justify-between items-center border-b-8 border-white pb-6 mb-12">
          <h1 className="text-6xl font-black italic uppercase italic">Admin Hub</h1>
          <button onClick={handleSignOut} className="bg-red-600 px-6 py-2 font-black uppercase hover:bg-white hover:text-black transition-all">
            Sign Out
          </button>
        </header>

        {/* 1. READ PROFILES (USERS) */}
        <section className="mb-12">
          <h2 className="text-3xl font-black uppercase mb-4 text-red-600">User Registry (Read Only)</h2>
          <div className="border-2 border-white">
            <table className="w-full text-left">
              <thead className="bg-white text-black uppercase font-black">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Username</th>
                  <th className="p-2">Superadmin?</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800">
                    <td className="p-2 text-xs truncate max-w-[100px]">{p.id}</td>
                    <td className="p-2 font-bold">{p.username || 'Anonymous'}</td>
                    <td className="p-2">{p.is_superadmin ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. CREATE/READ/UPDATE/DELETE IMAGES */}
        <section className="mb-12 border-4 border-blue-600 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-black uppercase text-blue-600">Image Assets (Full CRUD)</h2>
            <button onClick={addImage} className="bg-blue-600 px-4 py-2 font-black uppercase hover:bg-white hover:text-blue-600 transition-all">
              + Add New Image
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map(img => (
              <div key={img.id} className="bg-zinc-900 p-4 flex justify-between items-center border border-zinc-700">
                <div>
                  <p className="font-bold truncate max-w-[200px]">{img.url || 'No URL'}</p>
                  <p className="text-xs text-zinc-500">ID: {img.id}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-zinc-700 px-2 py-1 hover:bg-white hover:text-black">EDIT</button>
                  <button className="text-xs bg-red-900 px-2 py-1 hover:bg-red-600">DEL</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. READ CAPTIONS */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-4 text-green-500">Global Captions (Read Only)</h2>
          <div className="space-y-2">
            {captions.map(c => (
              <div key={c.id} className="p-3 border-l-4 border-green-500 bg-zinc-900 italic">
                "{c.content || c.text}"
              </div>
            ))}
          </div>
        </section>
      </main>
    </AdminGuard>
  )
}