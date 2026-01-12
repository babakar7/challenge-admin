'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, ChevronDown, UtensilsCrossed } from 'lucide-react'
import { ChallengeSwitcher } from './challenge-switcher'
import { CreateChallengePanel } from '@/components/challenges/create-challenge-panel'
import type { Profile } from '@/types/database'

interface Cohort {
  id: string
  name: string
  start_date: string
  is_active: boolean | null
}

interface HeaderProps {
  user: Profile
  cohorts: Cohort[]
}

export function Header({ user, cohorts }: HeaderProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <>
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        {/* Left: Logo + Challenge Switcher */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-primary-foreground font-semibold text-sm">R</span>
            </div>
            <span className="font-medium text-foreground text-sm hidden sm:block">Revive</span>
          </Link>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <ChallengeSwitcher
            cohorts={cohorts}
            onCreateClick={() => setCreateOpen(true)}
          />

          <div className="h-6 w-px bg-border hidden sm:block" />

          <Link
            href="/meal-programs"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:block">Meal Programs</span>
          </Link>
        </div>

        {/* Right: User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-auto py-2 px-2 hover:bg-secondary rounded-lg"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-accent text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {user.full_name || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-muted-foreground">
              <User className="mr-2 h-4 w-4" />
              <span className="capitalize">{user.role.replace('_', ' ')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <CreateChallengePanel
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
