'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  Minus, 
  ExternalLink,
  BarChart3,
  Timer,
  BookOpen
} from 'lucide-react'
import { getSessionDetail } from '@/lib/actions/enhanced-student-analytics'
import type { SessionDetail } from '@/lib/supabase/admin'

interface DetailedSessionViewProps {
  sessionId: number
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function DetailedSessionView({ sessionId, isOpen, onClose, userId }: DetailedSessionViewProps) {
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionDetail()
    }
  }, [isOpen, sessionId])

  const fetchSessionDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSessionDetail(sessionId.toString())
      setSession(data)
    } catch (err) {
      setError('Failed to load session details')
      console.error('Error fetching session detail:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'skipped':
        return <Minus className="h-4 w-4 text-gray-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'correct':
        return <Badge variant="default" className="bg-green-100 text-green-800">Correct</Badge>
      case 'incorrect':
        return <Badge variant="destructive">Incorrect</Badge>
      case 'skipped':
        return <Badge variant="secondary">Skipped</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getSolutionUrl = (resultId: number) => {
    // Link to Student Portal solution page
    return `http://localhost:3001/analysis/${resultId}/solutions`
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Session Details</span>
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of test session performance
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {session && (
          <div className="max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Session Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Session Overview</span>
                    <Badge variant="outline" className="text-sm">
                      {session.sessionType === 'practice' ? 'Practice Test' : 'Mock Test'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{session.score}%</div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{session.accuracy}%</div>
                      <div className="text-sm text-gray-500">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{session.totalQuestions}</div>
                      <div className="text-sm text-gray-500">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{formatTime(session.timeSpent)}</div>
                      <div className="text-sm text-gray-500">Time Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">{session.correct}</span>
                      </div>
                      <div className="text-sm text-gray-500">Correct</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-2xl font-bold text-red-600">{session.incorrect}</span>
                      </div>
                      <div className="text-sm text-gray-500">Incorrect</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Minus className="h-5 w-5 text-gray-400" />
                        <span className="text-2xl font-bold text-gray-600">{session.skipped}</span>
                      </div>
                      <div className="text-sm text-gray-500">Skipped</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question-by-Question Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Question Breakdown</span>
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of each question attempted
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.answerLog.map((answer, index) => (
                      <div key={answer.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">Q{index + 1}</span>
                            {getStatusIcon(answer.status)}
                            {getStatusBadge(answer.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Timer className="h-4 w-4" />
                              <span>{formatTime(answer.time_taken)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-gray-500">User Answer</Label>
                            <p className="font-medium">
                              {answer.user_answer || 'No answer provided'}
                            </p>
                          </div>
                          {answer.status === 'incorrect' && (
                            <div>
                              <Label className="text-xs text-gray-500">Correct Answer</Label>
                              <p className="font-medium text-green-600">
                                {/* This would need to be fetched from questions table */}
                                Not available
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(getSolutionUrl(session.id), '_blank')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Solution
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(getSolutionUrl(session.id), '_blank')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Solutions
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}