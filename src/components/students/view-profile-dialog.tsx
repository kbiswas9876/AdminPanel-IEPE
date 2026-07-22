'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Eye, User, Mail, Phone, Calendar, MapPin, BookOpen, UserCheck, Shield } from 'lucide-react'
import type { UserProfile } from '@/lib/supabase/admin'

interface ViewProfileDialogProps {
  user: UserProfile
}

export function ViewProfileDialog({ user }: ViewProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
          <Eye className="h-4 w-4 mr-1 text-blue-600" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <User className="h-5 w-5 text-blue-600" />
            Student Registration Profile
          </DialogTitle>
          <DialogDescription>
            Full profile details submitted during registration:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          {/* Full Name & Email */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Full Name</span>
              <span className="font-bold text-slate-900">{user.full_name || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="font-semibold text-slate-500">Email Address</span>
              <span className="font-bold text-blue-600">{user.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="font-semibold text-slate-500">Phone Number (+91)</span>
              <span className="font-bold text-slate-900">{user.phone_number || 'Not provided'}</span>
            </div>
          </div>

          {/* Academic & Target Exam Details */}
          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 space-y-2 text-blue-950">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-700">Target Competitive Exam</span>
              <span className="font-bold text-blue-900">{user.target_exam || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-blue-100/80 pt-2">
              <span className="font-semibold text-blue-700">Student Category</span>
              <span className="font-bold text-blue-900">{user.student_category || 'General'}</span>
            </div>
          </div>

          {/* Location & Personal Info */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">State</span>
              <span className="font-bold text-slate-900">{user.state || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="font-semibold text-slate-500">City / Location</span>
              <span className="font-bold text-slate-900">{user.city || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="font-semibold text-slate-500">Date of Birth</span>
              <span className="font-bold text-slate-900">{user.date_of_birth || 'Not provided'}</span>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-[11px] text-gray-600 flex justify-between">
            <span>Status: <strong className="uppercase text-amber-700">{user.status}</strong></span>
            <span>Registration: {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
