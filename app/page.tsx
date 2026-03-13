'use client'
import AdminGuard from '@/components/AdminGuard'
import { createClient } from '@/utils/supabase/client'

export default function AdminHub() {
  const supabase = createClient()

  const quickUpdate = async (id: string) => {
    const newTitle = window.prompt("NEW TITLE:")
    if (!newTitle) return

    const { error } = await supabase
      .from('archive_items') // Replace with your actual table name
      .update({ title: newTitle })
      .eq('id', id)

    if (error) alert("FAILED: " + error.message)
    else window.location.reload() // Brutalist refresh: simple and effective
  }

  return (
    <AdminGuard>
      <main className="p-10 bg-white text-black min-h-screen font-mono">
        <header className="border-b-8 border-black pb-4 mb-10">
          <h1 className="text-6xl font-black uppercase italic">Control_Plane_v1.0</h1>
        </header>

        {/* Example CRUD Row */}
        <section className="space-y-4">
          <div className="border-4 border-black p-4 flex justify-between items-center hover:bg-yellow-300 transition-colors">
            <span className="font-bold">ITEM_001.JPG</span>
            <div className="space-x-4">
              <button onClick={() => quickUpdate('1')} className="bg-black text-white px-4 py-2 uppercase font-bold">Edit</button>
              <button className="bg-red-600 text-white px-4 py-2 uppercase font-bold">Delete</button>
            </div>
          </div>
        </section>
      </main>
    </AdminGuard>
  )
}