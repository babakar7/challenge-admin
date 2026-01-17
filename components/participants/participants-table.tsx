'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, Flame, Users, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { deleteUser } from '@/lib/actions/users'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState, useMemo } from 'react'

interface Participant {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string | null
  streaks: {
    current_streak: number | null
    last_check_in_date: string | null
  } | null
}

interface ParticipantsTableProps {
  participants: Participant[]
  cohortId: string
  canManage: boolean
}

export function ParticipantsTable({ participants, cohortId, canManage }: ParticipantsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [streakFilter, setStreakFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredParticipants = useMemo(() => {
    let result = participants

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(p =>
        p.full_name?.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query)
      )
    }

    // Streak filter
    if (streakFilter === 'active') {
      result = result.filter(p => (p.streaks?.current_streak ?? 0) > 0)
    } else if (streakFilter === 'inactive') {
      result = result.filter(p => (p.streaks?.current_streak ?? 0) === 0)
    }

    return result
  }, [participants, search, streakFilter])

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Êtes-vous sûr de vouloir retirer ${name} de ce challenge ?`)) {
      return
    }

    const result = await deleteUser(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Participant retiré')
      router.refresh()
    }
  }

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-card rounded-xl border border-border">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Aucun participant</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Ajoutez des participants à ce challenge en utilisant le bouton ci-dessus.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou courriel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={streakFilter} onValueChange={(v) => setStreakFilter(v as typeof streakFilter)}>
          <SelectTrigger className="w-35">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Série active</SelectItem>
            <SelectItem value="inactive">Sans série</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredParticipants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border">
          <Search className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucun participant ne correspond à « {search} »</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Nom</TableHead>
            <TableHead>Courriel</TableHead>
            <TableHead>Série</TableHead>
            <TableHead>Dernier check-in</TableHead>
            {canManage && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredParticipants.map((participant) => {
            const streak = participant.streaks
            const lastCheckIn = streak?.last_check_in_date
              ? formatDistanceToNow(new Date(streak.last_check_in_date), { addSuffix: true, locale: fr })
              : 'Jamais'

            return (
              <TableRow key={participant.id} className="cursor-pointer">
                <TableCell>
                  <Link
                    href={`/challenges/${cohortId}/participants/${participant.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {participant.full_name || 'Sans nom'}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {participant.email}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{streak?.current_streak ?? 0}</span>
                    <span className="text-muted-foreground text-sm">jours</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {lastCheckIn}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(participant.id, participant.full_name || participant.email)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Retirer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
        </div>
      )}
    </div>
  )
}
