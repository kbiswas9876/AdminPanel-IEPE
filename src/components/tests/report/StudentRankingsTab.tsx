'use client'

import { Card } from '@/components/ui/card'
import { Trophy, Medal, Award, Clock, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StudentRanking } from '@/lib/actions/test-reports'

interface StudentRankingsTabProps {
  testId: number
  rankings: StudentRanking[]
}

export function StudentRankingsTab({ testId, rankings }: StudentRankingsTabProps) {
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
      {/* Rankings Table */}
      <Card className="border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Student Rankings ({rankings.length} participants)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Ranked by score, then by time taken
          </p>
        </div>

        {rankings.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No student submissions yet</p>
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
                {rankings.map((student) => (
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
                        disabled
                        className="h-8 gap-1.5"
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

      {/* Coming Soon Notice */}
      {rankings.length > 0 && (
        <Card className="p-6 border-blue-200 bg-blue-50/50 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-100 border border-blue-200">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Detailed Student Reports Coming Soon
              </h4>
              <p className="text-sm text-blue-700">
                Click "View Details" to see each student's complete answer sheet with question-by-question breakdown, 
                correct/incorrect answers, and time spent on each question. This feature will be available once 
                detailed answer tracking is implemented.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

