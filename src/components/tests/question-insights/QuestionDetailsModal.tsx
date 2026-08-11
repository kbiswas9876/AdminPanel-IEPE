'use client'

import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ArrowUpDown, Clock, User, CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import type { QuestionStudentDetail } from '@/lib/actions/question-student-details'
import KatexRenderer from '@/components/ui/KatexRenderer'

interface QuestionDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  questionText: string
  questionNumber: number | null
  category: 'Correct' | 'Incorrect' | 'Skipped'
  studentData: QuestionStudentDetail[]
}

type SortField = 'name' | 'time' | 'status'
type SortDirection = 'asc' | 'desc'

function formatTime(seconds: number | null): string {
  if (seconds == null || seconds === 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}m ${s}s`
}

export default function QuestionDetailsModal({
  isOpen,
  onClose,
  questionText,
  questionNumber,
  category,
  studentData,
}: QuestionDetailsModalProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter students by category (status)
  const filteredStudents = useMemo(() => {
    return studentData.filter(student => {
      if (category === 'Correct') return student.status === 'correct'
      if (category === 'Incorrect') return student.status === 'incorrect'
      if (category === 'Skipped') return student.status === 'skipped'
      return false
    })
  }, [studentData, category])

  // Sort students
  const sortedStudents = useMemo(() => {
    const sorted = [...filteredStudents]
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.studentName.localeCompare(b.studentName)
          break
        case 'time':
          const aTime = a.timeTaken ?? 0
          const bTime = b.timeTaken ?? 0
          comparison = aTime - bTime
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredStudents, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'skipped':
        return <MinusCircle className="h-4 w-4 text-slate-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'incorrect':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'skipped':
        return 'text-slate-700 bg-slate-50 border-slate-200'
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(category.toLowerCase())}
            <span>
              {category} Answers - Question {questionNumber ?? 'N/A'}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Question text - moved outside DialogDescription to avoid nesting div in p */}
        <div className="px-6 pb-4">
          <div className="prose prose-slate max-w-none">
            <KatexRenderer content={questionText} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">No students found in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">{sortedStudents.length}</span> student
                  {sortedStudents.length !== 1 ? 's' : ''} {category.toLowerCase()}
                  {sortedStudents.length !== 1 ? 'ed' : 'd'} this question
                </p>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        #
                      </th>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          Student Name
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th
                        onClick={() => handleSort('time')}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Time Taken
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Answer Chosen
                      </th>
                      <th
                        onClick={() => handleSort('status')}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {sortedStudents.map((student, index) => (
                      <tr key={student.userId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">
                            {student.studentName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-600">{student.studentEmail}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-700 font-medium">
                            {formatTime(student.timeTaken)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-slate-700">
                            {student.userAnswer ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                {student.userAnswer.toUpperCase()}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              student.status
                            )}`}
                          >
                            {getStatusIcon(student.status)}
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

