'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Trophy, Medal, Award, Clock, Eye, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { StudentRanking } from '@/lib/actions/test-reports'
import { StudentReportModal } from './StudentReportModal'

interface StudentRankingsTabProps {
  testId: number
  rankings: StudentRanking[]
}

export function StudentRankingsTab({ testId, rankings }: StudentRankingsTabProps) {
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rankFilter, setRankFilter] = useState<'all' | 'top10' | 'top25' | 'bottom25'>('all')

  const handleViewDetails = (attemptId: number) => {
    setSelectedAttemptId(attemptId)
    setModalOpen(true)
  }

  // Filter and search logic
  const filteredRankings = useMemo(() => {
    let filtered = [...rankings]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply rank filter
    if (rankFilter !== 'all') {
      const totalStudents = rankings.length
      if (rankFilter === 'top10') {
        filtered = filtered.filter(s => s.rank <= Math.max(10, Math.ceil(totalStudents * 0.1)))
      } else if (rankFilter === 'top25') {
        filtered = filtered.filter(s => s.rank <= Math.ceil(totalStudents * 0.25))
      } else if (rankFilter === 'bottom25') {
        filtered = filtered.filter(s => s.rank > Math.floor(totalStudents * 0.75))
      }
    }

    return filtered
  }, [rankings, searchTerm, rankFilter])
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />
    return null
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    if (rank === 2) return 'bg-slate-50 text-slate-700 border-slate-200'
    if (rank === 3) return 'bg-orange-50 text-orange-700 border-orange-200'
    return 'bg-slate-50 text-slate-600 border-slate-200'
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-4 border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value as typeof rankFilter)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
            >
              <option value="all">All Students</option>
              <option value="top10">Top 10 Students</option>
              <option value="top25">Top 25%</option>
              <option value="bottom25">Bottom 25%</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Rankings Table */}
      <Card className="border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Student Rankings ({filteredRankings.length} of {rankings.length} shown)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Ranked by score, then by time taken
          </p>
        </div>

        {filteredRankings.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {rankings.length === 0 
                ? 'No student submissions yet' 
                : 'No students match your search or filter criteria'}
            </p>
            {rankings.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSearchTerm(''); setRankFilter('all'); }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRankings.map((student) => (
                  <tr 
                    key={student.attemptId} 
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(student.rank)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRankBadgeColor(student.rank)}`}>
                          #{student.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {student.studentName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {student.studentEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900">
                        {student.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                            style={{ width: `${Math.min(student.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {student.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Clock className="h-4 w-4" />
                        {formatTime(student.timeSeconds)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(student.attemptId)}
                        className="h-8 gap-1.5 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Student Report Modal */}
      <StudentReportModal
        attemptId={selectedAttemptId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedAttemptId(null)
        }}
      />
    </div>
  )
}

