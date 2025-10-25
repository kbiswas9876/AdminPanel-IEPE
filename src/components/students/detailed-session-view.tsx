'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  MinusCircle,
  ExternalLink,
  X
} from 'lucide-react'
import { getSessionDetail } from '@/lib/actions/enhanced-student-analytics'
import type { SessionDetail } from '@/lib/supabase/admin'

interface DetailedSessionViewProps {
  sessionId: number
  onClose: () => void
}

export function DetailedSessionView({ sessionId, onClose }: DetailedSessionViewProps) {
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true)
        const data = await getSessionDetail(sessionId.toString())
        setSession(data)
        setError(null)
      } catch (err) {
        setError('Failed to load session details')
        console.error('Error fetching session:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'incorrect':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'skipped':
        return <MinusCircle className="h-4 w-4 text-gray-600" />
      default:
        return <MinusCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'text-green-600 bg-green-100'
      case 'incorrect':
        return 'text-red-600 bg-red-100'
      case 'skipped':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>Loading session information...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !session) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>Error loading session</DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error || 'Session not found'}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                {session.testName || `${session.sessionType} Session`}
              </DialogTitle>
              <DialogDescription>
                Detailed breakdown of test performance
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatScore(session.score)}%</div>
                <p className="text-xs text-muted-foreground">
                  {session.correct} correct out of {session.totalQuestions}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatScore(session.accuracy)}%</div>
                <p className="text-xs text-muted-foreground">
                  Based on answered questions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(session.timeSpent)}</div>
                <p className="text-xs text-muted-foreground">
                  Total time spent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDateTime(session.submittedAt)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Submission time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Question Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Question-by-Question Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis of each question attempted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.answerLog.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Answer Data</h3>
                  <p className="text-gray-500">No detailed answer information available for this session.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Q#</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>User Answer</TableHead>
                        <TableHead>Time Taken</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.answerLog.map((answer, index) => (
                        <TableRow key={answer.id}>
                          <TableCell>
                            <span className="font-medium text-gray-900">
                              {index + 1}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(answer.status)}
                              <Badge variant="secondary" className={getStatusColor(answer.status)}>
                                {answer.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {answer.user_answer || 'No answer provided'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {Math.round(answer.time_taken)}s
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Link to Student Portal solution page for this specific question
                                const solutionUrl = `http://localhost:3001/analysis/${session.id}/solutions?question=${answer.question_id}`
                                window.open(solutionUrl, '_blank')
                              }}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Solution
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{session.correct}</div>
                <p className="text-xs text-muted-foreground">
                  {session.totalQuestions > 0 ? Math.round((session.correct / session.totalQuestions) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Incorrect Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{session.incorrect}</div>
                <p className="text-xs text-muted-foreground">
                  {session.totalQuestions > 0 ? Math.round((session.incorrect / session.totalQuestions) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Skipped Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{session.skipped}</div>
                <p className="text-xs text-muted-foreground">
                  {session.totalQuestions > 0 ? Math.round((session.skipped / session.totalQuestions) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                // Link to Student Portal solution page
                const solutionUrl = `http://localhost:3001/analysis/${session.id}/solutions`
                window.open(solutionUrl, '_blank')
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Solutions
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
