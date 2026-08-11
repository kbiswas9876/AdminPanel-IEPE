'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { getSubjectAnalysis } from '@/lib/actions/enhanced-student-analytics'

interface SubjectAnalysisGridProps {
  userId: string
  onRefresh: () => void
}

interface SubjectData {
  subject: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTime: number
  chapters: { chapter: string; questions: number; accuracy: number }[]
}

export function SubjectAnalysisGrid({ userId, onRefresh }: SubjectAnalysisGridProps) {
  const [subjects, setSubjects] = useState<SubjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())

  const fetchSubjects = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      
      const data = await getSubjectAnalysis(userId)
      setSubjects(data)
      setError(null)
    } catch (err) {
      setError('Failed to load subject analysis')
      console.error('Error fetching subjects:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [userId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubjects(true)
    await onRefresh()
    setRefreshing(false)
  }

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject)
    } else {
      newExpanded.add(subject)
    }
    setExpandedSubjects(newExpanded)
  }

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100
  }

  const formatTime = (seconds: number) => {
    return Math.round(seconds)
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-100'
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getAccuracyLevel = (accuracy: number) => {
    if (accuracy >= 80) return 'Excellent'
    if (accuracy >= 60) return 'Good'
    return 'Needs Improvement'
  }

  // Calculate overall statistics
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.totalQuestions, 0)
  const totalCorrect = subjects.reduce((sum, subject) => sum + subject.correctAnswers, 0)
  const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
  const averageTime = subjects.length > 0 
    ? subjects.reduce((sum, subject) => sum + subject.averageTime, 0) / subjects.length 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Subjects studied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(overallAccuracy)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Questions attempted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(averageTime)}s</div>
            <p className="text-xs text-muted-foreground">
              Per question
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Performance Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of performance across different subjects and chapters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subject Data</h3>
              <p className="text-gray-500">No subject-wise performance data available for this student.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.subject} className="border rounded-lg">
                  {/* Subject Header */}
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSubject(subject.subject)}
                  >
                    <div className="flex items-center space-x-4">
                      {expandedSubjects.has(subject.subject) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{subject.subject}</h3>
                        <p className="text-sm text-gray-500">
                          {subject.totalQuestions} questions • {subject.chapters.length} chapters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatScore(subject.accuracy)}%
                        </div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                      </div>
                      <Badge variant="secondary" className={getAccuracyColor(subject.accuracy)}>
                        {getAccuracyLevel(subject.accuracy)}
                      </Badge>
                    </div>
                  </div>

                  {/* Chapter Details */}
                  {expandedSubjects.has(subject.subject) && (
                    <div className="border-t bg-gray-50">
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Chapter Breakdown</h4>
                        <div className="space-y-2">
                          {subject.chapters.map((chapter, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div>
                                <span className="text-sm font-medium text-gray-900">{chapter.chapter}</span>
                                <span className="text-xs text-gray-500 ml-2">({chapter.questions} questions)</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">
                                  {formatScore(chapter.accuracy)}%
                                </span>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${Math.min(chapter.accuracy, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Best Performing Subjects</CardTitle>
            <CardDescription>Subjects with highest accuracy rates</CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .slice(0, 5)
                  .map((subject, index) => (
                    <div key={subject.subject} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        <span className="text-sm font-medium text-green-900">{subject.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-green-600">
                          {formatScore(subject.accuracy)}%
                        </span>
                        <Badge variant="secondary" className="text-green-600 bg-green-100">
                          {subject.totalQuestions} questions
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>Subjects that need more attention</CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects
                  .filter(s => s.accuracy < 70)
                  .sort((a, b) => a.accuracy - b.accuracy)
                  .slice(0, 5)
                  .map((subject, index) => (
                    <div key={subject.subject} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-orange-600">#{index + 1}</span>
                        <span className="text-sm font-medium text-orange-900">{subject.subject}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-orange-600">
                          {formatScore(subject.accuracy)}%
                        </span>
                        <Badge variant="secondary" className="text-orange-600 bg-orange-100">
                          {subject.totalQuestions} questions
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No improvement areas identified</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
    </div>
  )
}
