'use client'

import { ReactNode } from 'react'
import { Table } from '@/components/ui/table'

interface MobileResponsiveTableProps {
  children: ReactNode
  className?: string
}

export function MobileResponsiveTable({ children, className = '' }: MobileResponsiveTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="min-w-full">
        <Table>
          {children}
        </Table>
      </div>
    </div>
  )
}

// Mobile Card View for Table Rows
interface MobileTableCardProps {
  children: ReactNode
  className?: string
}

export function MobileTableCard({ children, className = '' }: MobileTableCardProps) {
  return (
    <div className={`lg:hidden bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// Mobile Card Row
interface MobileCardRowProps {
  label: string
  value: ReactNode
  className?: string
}

export function MobileCardRow({ label, value, className = '' }: MobileCardRowProps) {
  return (
    <div className={`flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0 ${className}`}>
      <span className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0 mr-4">{label}:</span>
      <div className="text-sm text-gray-900 min-w-0 flex-1 text-right">{value}</div>
    </div>
  )
}
