'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ChallengeTabsProps {
  challengeId: string
}

const tabs = [
  { name: 'Overview', href: '' },
  { name: 'Participants', href: '/participants' },
  { name: 'Selections', href: '/selections' },
  { name: 'Meals', href: '/meals' },
]

export function ChallengeTabs({ challengeId }: ChallengeTabsProps) {
  const pathname = usePathname()
  const basePath = `/challenges/${challengeId}`

  function isActive(tabHref: string) {
    if (tabHref === '') {
      return pathname === basePath
    }
    return pathname.startsWith(`${basePath}${tabHref}`)
  }

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.name}
              href={`${basePath}${tab.href}`}
              className={cn(
                'py-3 text-sm font-medium border-b-2 transition-colors',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
