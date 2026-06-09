'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RankingAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('ranking-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        () => { router.refresh() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  return null
}
