'use client'

import React from 'react'
import { Award, Target, TrendingUp, Users, CheckCircle, XCircle, Circle, FileQuestion } from 'lucide-react'

interface MockTestMetrics {
  totalQuestions: number
  attempted: number
  correct: number
  incorrect: number
  skipped: number
  marksObtained: number
  totalMarks: number
  scorePercentage: number
  percentile: number
  rank: number | null
  totalTestTakers: number
}

interface MockTestKPICardsProps {
  metrics: MockTestMetrics
  title?: string
}

export default function MockTestKPICards({ metrics, title = "Performance Metrics" }: MockTestKPICardsProps) {
  const {
    totalQuestions,
    attempted,
    correct,
    incorrect,
    skipped,
    marksObtained,
    totalMarks,
    scorePercentage,
    percentile,
    rank,
    totalTestTakers
  } = metrics

  const KPICards = [
    {
      title: 'Total Questions',
      value: totalQuestions.toString(),
      icon: FileQuestion,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Attempted',
      value: attempted.toString(),
      icon: Target,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Correct',
      value: correct.toString(),
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Incorrect',
      value: incorrect.toString(),
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Skipped',
      value: skipped.toString(),
      icon: Circle,
      color: 'gray',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600'
    },
    {
      title: 'Score',
      value: `${marksObtained}/${totalMarks}`,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Percentage',
      value: `${scorePercentage.toFixed(2)}%`,
      icon: Target,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Percentile',
      value: `${percentile}th`,
      icon: Award,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-700'
    },
    {
      title: 'Rank',
      value: rank ? `#${rank} / ${totalTestTakers}` : 'N/A',
      icon: Users,
      color: 'teal',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600'
    }
  ]

  // Split cards into two rows: Top 5 basic metrics, bottom 4 competitive metrics
  const basicMetrics = KPICards.slice(0, 5)
  const competitiveMetrics = KPICards.slice(5, 9)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Mock Test Analytics</h2>
        <p className="text-sm text-gray-600">Competitive performance overview</p>
      </div>

      {/* Competitive Metrics Section - Prominent Display */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Competitive Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          {competitiveMetrics.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${card.iconColor} p-2 rounded-lg bg-white/50`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Metrics Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Attempt Summary</h3>
        <div className="grid grid-cols-5 gap-4">
          {basicMetrics.map((card, index) => (
            <div
              key={index}
              className={`${card.bgColor} p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow`}
            >
              <div className="text-center">
                <div className={`${card.iconColor} inline-flex p-3 rounded-lg bg-white/50 mb-2`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

