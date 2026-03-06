'use client'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import AdminGuard from '../components/AdminGuard'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // NOTE: These numbers are placeholders for the UI you saw.
  // In a full build, you'd fetch these using useEffect.
  const stats = [
    { label: 'Total Images', value: '5539' },
    { label: 'Captions', value: '70530' },
    { label: 'Users', value: '2043' },
  ]

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white font-sans p-6 md:p-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-white pb-6 mb-12">
          <h1 className="text-7xl font-black italic uppercase tracking-tighter">
            Admin Hub
          </h1>
          <button
            onClick={handleSignOut}
            className="mt-4 md:mt-0 bg-red-600 text-white px-8 py-3 font-black uppercase hover:bg-white hover:text-black transition-all border-4 border-transparent hover:border-black"
          >
            Sign Out
          </button>
        </header>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="border-4 border-white p-6">
              <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                {stat.label}
              </p>
              <p className="text-5xl font-black italic">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* REGISTRY SECTION */}
        <section className="mb-16">
          <h2 className="text-4xl font-black uppercase mb-6 italic underline decoration-red-600">
            User Registry
          </h2>
          <div className="border-4 border-white overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-black uppercase font-black">
                  <th className="p-4">Username</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="font-bold">
                <tr className="border-b border-gray-800">
                  <td className="p-4">Admin_User_01</td>
                  <td className="p-4 text-red-500 uppercase">Superadmin</td>
                  <td className="p-4">2024-01-15</td>
                </tr>
                {/* More rows would be mapped here from your database */}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER NAV */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white text-black p-8 group hover:bg-red-600 hover:text-white transition-all cursor-pointer">
            <h3 className="text-3xl font-black uppercase">Image Assets →</h3>
          </div>
          <div className="bg-white text-black p-8 group hover:bg-red-600 hover:text-white transition-all cursor-pointer">
            <h3 className="text-3xl font-black uppercase">Global Captions →</h3>
          </div>
        </section>
      </main>
    </AdminGuard>
  )
}