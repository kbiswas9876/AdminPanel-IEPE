'use client'

import dynamic from 'next/dynamic'
import { AdvancedTipTapEditorProps } from './AdvancedTipTapEditor'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import AdvancedTipTapEditor to ensure it's only rendered on the client
const AdvancedTipTapEditor = dynamic(() => import('./AdvancedTipTapEditor').then(mod => mod.AdvancedTipTapEditor), {
  ssr: false,
  loading: () => <Skeleton className="min-h-[200px] w-full rounded-lg" />,
})

export function ClientOnlyAdvancedTipTapEditor(props: AdvancedTipTapEditorProps) {
  return <AdvancedTipTapEditor {...props} />
}
