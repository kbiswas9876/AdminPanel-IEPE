'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, Save, X } from 'lucide-react'

interface UnsavedChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white rounded-2xl border-none shadow-2xl">
        {/* Premium Header with Icon */}
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl font-bold text-center text-slate-900">
            Unsaved Changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-slate-600 text-base leading-relaxed px-2">
            You have unsaved changes that will be lost if you leave this page. 
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Premium Action Buttons */}
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <AlertDialogCancel
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <X className="h-4 w-4 mr-2 inline-block" />
            Stay on Page
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <AlertTriangle className="h-4 w-4 mr-2 inline-block" />
            Leave Anyway
          </AlertDialogAction>
        </AlertDialogFooter>

        {/* Premium Info Badge */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <p className="text-xs text-center text-slate-600 flex items-center justify-center gap-2">
            <Save className="h-3.5 w-3.5 text-blue-600" />
            <span>Tip: Save your changes before navigating away</span>
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

