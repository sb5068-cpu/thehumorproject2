'use client'
import AdminGuard from '@/components/AdminGuard'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ images: 0, captions: 0, users: 0 })
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Stats
      const { count: imgCount } = await supabase.from('images').select('*', { count: 'exact', head: true })
      const { count: capCount } = await supabase.from('captions').select('*', { count: 'exact', head: true })
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

      setStats({ images: imgCount || 0, captions: capCount || 0, users: userCount || 0 })

      // 2. Fetch User Profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, email, is_superadmin, created_at')
        .order('created_at', { ascending: false })

      setProfiles(profilesData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <AdminGuard>
      <main className="p-8 bg-zinc-50 min-h-screen font-sans">
        {/* --- HEADER --- */}
        <div className="mb-12">
          <h1 className="text-6xl font-black uppercase italic mb-2 tracking-tighter">
            Control <span className="text-blue-600">Panel</span>
          </h1>
          <p className="font-bold text-zinc-500 uppercase tracking-widest text-sm">Authorized Personnel Only</p>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black uppercase text-xs mb-1">Total Assets</p>
            <p className="text-5xl font-black">{stats.images}</p>
          </div>
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black uppercase text-xs mb-1">Total Captions</p>
            <p className="text-5xl font-black">{stats.captions}</p>
          </div>
          <div className="bg-green-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black uppercase text-xs mb-1">Total Users</p>
            <p className="text-5xl font-black">{stats.users}</p>
          </div>
        </div>

        {/* --- USER MANAGEMENT TABLE (READ) --- */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-black uppercase italic underline decoration-blue-500">User Registry</h2>
            <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase">Read Only Access</span>
          </div>

          <div className="overflow-x-auto border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b-4 border-black">
                  <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Username</th>
                  <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Email</th>
                  <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Role</th>
                  <th className="p-4 font-black uppercase text-sm">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((user) => (
                  <tr key={user.id} className="border-b-2 border-zinc-200 hover:bg-zinc-50">
                    <td className="p-4 font-bold border-r-2 border-zinc-200">{user.username || 'Anonymous'}</td>
                    <td className="p-4 font-medium border-r-2 border-zinc-200 text-zinc-600">{user.email}</td>
                    <td className="p-4 border-r-2 border-zinc-200">
                      {user.is_superadmin ? (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded font-black text-[10px] uppercase border border-red-600">Superadmin</span>
                      ) : (
                        <span className="bg-zinc-100 text-zinc-500 px-2 py-1 rounded font-black text-[10px] uppercase border border-zinc-300">User</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-mono text-zinc-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminGuard>
  )
}