'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Clock, 
  Target, 
  TrendingUp,
  Search,
  Eye,
  ExternalLink,
  RefreshCw,
  Filter
} from 'lucide-react'
import { getQuestionPerformance } from '@/lib/actions/enhanced-student-analytics'
import type { QuestionPerformanceDetail, QuestionFilters } from '@/lib/supabase/admin'

interface QuestionPerformanceGridProps {
  userId: string
  onRefresh: () => void
}

export function QuestionPerformanceGrid({ userId, onRefresh }: QuestionPerformanceGridProps) {
  const [questions, setQuestions] = useState<QuestionPerformanceDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<QuestionFilters>({})
  const [refreshing, setRefreshing] = useState(false)

  const fetchQuestions = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      
      const data = await getQuestionPerformance(userId, filters)
      setQuestions(data)
      setError(null)
    } catch (err) {
      setError('Failed to load question performance')
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [userId, filters])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchQuestions(true)
    await onRefresh()
    setRefreshing(false)
  }

  const handleFilterChange = (key: keyof QuestionFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value || undefined
    }))
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100
  }

  const getSuccessRate = (correctAttempts: number, attempts: number) => {
    return attempts > 0 ? (correctAttempts / attempts) * 100 : 0
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'hard':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
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

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question =>
    question.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.book_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.chapter_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique subjects and chapters for filter options
  const subjects = [...new Set(questions.map(q => q.book_source))].sort()
  const chapters = [...new Set(questions.map(q => q.chapter_name))].sort()
  const difficulties = [...new Set(questions.map(q => q.difficulty))].sort()

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
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique questions attempted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.length > 0 
                ? formatScore(questions.reduce((sum, q) => sum + getSuccessRate(q.correctAttempts, q.attempts), 0) / questions.length)
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.reduce((sum, q) => sum + q.attempts, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Question attempts made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {questions.length > 0 
                ? Math.round(questions.reduce((sum, q) => sum + q.averageTime, 0) / questions.length)
                : 0
              }s
            </div>
            <p className="text-xs text-muted-foreground">
              Per question attempt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.subject || ''} onValueChange={(value) => handleFilterChange('subject', value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.difficulty || ''} onValueChange={(value) => handleFilterChange('difficulty', value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="correct">Correct</SelectItem>
              <SelectItem value="incorrect">Incorrect</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Question Performance Analysis</CardTitle>
          <CardDescription>
            Detailed performance metrics for each question attempted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Found</h3>
              <p className="text-gray-500">No questions match the current filters.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Last Status</TableHead>
                    <TableHead>Last Attempted</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => {
                    const successRate = getSuccessRate(question.correctAttempts, question.attempts)
                    
                    return (
                      <TableRow key={question.questionId}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {question.questionText.length > 100 
                                ? `${question.questionText.substring(0, 100)}...`
                                : question.questionText
                              }
                            </p>
                            <p className="text-xs text-gray-500">ID: {question.questionId}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{question.book_source}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{question.chapter_name}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{question.attempts}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatScore(successRate)}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(successRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {Math.round(question.averageTime)}s
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(question.recentStatus)}>
                            {question.recentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDateTime(question.lastAttempted)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Link to Student Portal solution page
                              const solutionUrl = `http://localhost:3001/analysis/${question.questionId}/solutions`
                              window.open(solutionUrl, '_blank')
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
