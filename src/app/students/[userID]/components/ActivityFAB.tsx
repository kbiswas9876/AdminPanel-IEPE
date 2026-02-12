'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical, Filter, Download, RefreshCw, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActivityFABProps {
  onFilter: () => void
  onExport: () => void
  onRefresh: () => void
  onDateRange: () => void
}

export function ActivityFAB({ onFilter, onExport, onRefresh, onDateRange }: ActivityFABProps) {
  const [open, setOpen] = useState(false)

  const actions = [
    { icon: Calendar, label: 'Date Range', onClick: onDateRange },
    { icon: Filter, label: 'Filter', onClick: onFilter },
    { icon: Download, label: 'Export', onClick: onExport },
    { icon: RefreshCw, label: 'Refresh', onClick: onRefresh },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Buttons */}
      <AnimatePresence>
        {open && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-2">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="shadow-lg"
                  onClick={() => {
                    action.onClick()
                    setOpen(false)
                  }}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setOpen(!open)}
        >
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <MoreVertical className="h-6 w-6" />
          </motion.div>
        </Button>
      </motion.div>
    </div>
  )
}

