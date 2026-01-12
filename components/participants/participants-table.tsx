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
import { MoreHorizontal, Trash2, Flame } from 'lucide-react'
import { deleteUser } from '@/lib/actions/users'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name} from this challenge?`)) {
      return
    }

    const result = await deleteUser(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Participant removed')
      router.refresh()
    }
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <p className="text-muted-foreground">No participants yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add participants to this challenge to get started
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Streak</TableHead>
            <TableHead>Last Check-in</TableHead>
            {canManage && <TableHead className="w-[50px]"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => {
            const streak = participant.streaks
            const lastCheckIn = streak?.last_check_in_date
              ? formatDistanceToNow(new Date(streak.last_check_in_date), { addSuffix: true })
              : 'Never'

            return (
              <TableRow key={participant.id} className="cursor-pointer">
                <TableCell>
                  <Link
                    href={`/challenges/${cohortId}/participants/${participant.id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {participant.full_name || 'Unnamed'}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {participant.email}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{streak?.current_streak ?? 0}</span>
                    <span className="text-muted-foreground text-sm">days</span>
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
                          Remove
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
  )
}
