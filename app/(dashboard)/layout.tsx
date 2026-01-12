import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'

async function getCohorts() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cohorts')
    .select('id, name, start_date, is_active')
    .order('start_date', { ascending: false })
  return data ?? []
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || !['super_admin', 'viewer'].includes(user.role)) {
    redirect('/login')
  }

  const cohorts = await getCohorts()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} cohorts={cohorts} />
      <main className="p-8">
        {children}
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
          },
        }}
      />
    </div>
  )
}
