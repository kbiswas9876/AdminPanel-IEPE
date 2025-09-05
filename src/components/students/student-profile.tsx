'use client'

import { useState, useEffect } from 'react'
import { getStudentProfile, getStudentTestAttempts, getStudentAnalytics } from '@/lib/actions/student-analytics'
import type { UserProfile, TestAttemptWithDetails, StudentAnalytics } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, User, Mail, Calendar, Shield, BarChart3, Clock, Target, TrendingUp, Award } from 'lucide-react'
import Link from 'next/link'
import { AdminControls } from './admin-controls'

interface StudentProfileProps {
  userId: string
}

export function StudentProfile({ userId }: StudentProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [testAttempts, setTestAttempts] = useState<TestAttemptWithDetails[]>([])
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, attemptsData, analyticsData] = await Promise.all([
          getStudentProfile(userId),
          getStudentTestAttempts(userId),
          getStudentAnalytics(userId)
        ])
        
        setProfile(profileData)
        setTestAttempts(attemptsData)
        setAnalytics(analyticsData)
      } catch (err) {
        setError('Failed to load student data')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleAdminAction = () => {
    // Refresh data after admin action
    const fetchData = async () => {
      try {
        const [profileData, attemptsData, analyticsData] = await Promise.all([
          getStudentProfile(userId),
          getStudentTestAttempts(userId),
          getStudentAnalytics(userId)
        ])
        
        setProfile(profileData)
        setTestAttempts(attemptsData)
        setAnalytics(analyticsData)
      } catch (err) {
        setError('Failed to load student data')
        console.error('Error:', err)
      }
    }

    fetchData()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Shield className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'suspended':
        return <Shield className="h-4 w-4 text-orange-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Suspended
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        )
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/students">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            {error || 'Student not found'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/students">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>
      </div>

      {/* Student Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {profile.full_name || 'No name provided'}
              </CardTitle>
              <CardDescription className="text-lg">
                Student Profile & Performance Analytics
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(profile.status)}
              {getStatusBadge(profile.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{profile.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Registration Date</p>
                <p className="text-sm text-gray-600">
                  {formatDateTime(profile.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Account Status</p>
                <p className="text-sm text-gray-600 capitalize">{profile.status}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalTests}</div>
              <p className="text-xs text-muted-foreground">
                Mock tests completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageScore}</div>
              <p className="text-xs text-muted-foreground">
                Out of 100 points
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageAccuracy}%</div>
              <p className="text-xs text-muted-foreground">
                Average accuracy rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.bestScore}</div>
              <p className="text-xs text-muted-foreground">
                Highest test score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mock Test History */}
      <Card>
        <CardHeader>
          <CardTitle>Mock Test History</CardTitle>
          <CardDescription>
            Complete test attempt history and performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testAttempts.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Attempts</h3>
              <p className="text-gray-500">This student hasn&apos;t taken any mock tests yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Completed On</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testAttempts.map((attempt) => {
                    const accuracy = attempt.total_correct + attempt.total_incorrect > 0 
                      ? ((attempt.total_correct / (attempt.total_correct + attempt.total_incorrect)) * 100).toFixed(1)
                      : '0.0'
                    
                    return (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{attempt.test_name}</p>
                            {attempt.test_description && (
                              <p className="text-sm text-gray-500">{attempt.test_description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-900">{attempt.score}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{accuracy}%</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDuration(attempt.time_taken_seconds)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDateTime(attempt.completed_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // This would link to the student-facing report page
                              // For now, we'll show a placeholder
                              alert(`This would open the full report for attempt ${attempt.id} in the student app`)
                            }}
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            View Full Report
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

      {/* Admin Controls */}
      <AdminControls 
        user={profile} 
        onAction={handleAdminAction}
      />
    </div>
  )
}
