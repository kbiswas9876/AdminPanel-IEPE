'use client'

import React from 'react'
import { ListChecks, CheckCircle, Target, Clock, BookOpen, XCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export interface KPIMetrics {
  score: number
  totalQuestions: number
  attempted: number
  correct: number
  incorrect: number
  accuracy: number // percentage
  percentage: number // percentage
  timeTaken: string // MM:SS
}

export interface KPICardsProps {
  metrics: KPIMetrics
  className?: string
}

const formatPercent = (value: number) => `${Math.round(value)}%`

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  accent: 'amber' | 'cyan' | 'emerald' | 'violet' | 'blue'
}

const StatCard = ({ icon, value, label, accent }: StatCardProps) => {
  const accentMap: Record<StatCardProps['accent'], { 
    bg: string; 
    text: string; 
    ring: string; 
    gradient: string;
    iconBg: string;
  }> = {
    amber: { 
      bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30', 
      text: 'text-amber-700 dark:text-amber-300', 
      ring: 'ring-amber-200/50 dark:ring-amber-700/50',
      gradient: 'from-amber-400 to-orange-500',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800/50 dark:to-orange-800/50'
    },
    cyan: { 
      bg: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30', 
      text: 'text-cyan-700 dark:text-cyan-300', 
      ring: 'ring-cyan-200/50 dark:ring-cyan-700/50',
      gradient: 'from-cyan-400 to-blue-500',
      iconBg: 'bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-800/50 dark:to-blue-800/50'
    },
    emerald: { 
      bg: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30', 
      text: 'text-emerald-700 dark:text-emerald-300', 
      ring: 'ring-emerald-200/50 dark:ring-emerald-700/50',
      gradient: 'from-emerald-400 to-green-500',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800/50 dark:to-green-800/50'
    },
    violet: { 
      bg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30', 
      text: 'text-violet-700 dark:text-violet-300', 
      ring: 'ring-violet-200/50 dark:ring-violet-700/50',
      gradient: 'from-violet-400 to-purple-500',
      iconBg: 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-800/50 dark:to-purple-800/50'
    },
    blue: { 
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30', 
      text: 'text-blue-700 dark:text-blue-300', 
      ring: 'ring-blue-200/50 dark:ring-blue-700/50',
      gradient: 'from-blue-400 to-indigo-500',
      iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50'
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-3xl border-0 ${accentMap[accent].bg} backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 h-40 flex flex-col`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent" />
      
      {/* Animated background gradient */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${accentMap[accent].gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
      <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tr ${accentMap[accent].gradient} opacity-5 group-hover:opacity-15 transition-opacity duration-500`} />

      <div className="relative p-6 flex flex-col items-center justify-center h-full text-center">
        {/* Icon with enhanced styling */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accentMap[accent].iconBg} ring-1 ${accentMap[accent].ring} shadow-sm group-hover:shadow-md transition-shadow duration-300 mb-4`}>
          <span className={`w-7 h-7 ${accentMap[accent].text} group-hover:scale-110 transition-transform duration-300`}>{icon}</span>
        </div>
        
        {/* Content */}
        <div className="flex flex-col items-center">
          <div className={`text-4xl font-bold tracking-tight ${accentMap[accent].text} group-hover:scale-105 transition-transform duration-300 mb-2`}>
            {value}
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 opacity-80 text-center">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function KPICards({ metrics, className }: KPICardsProps) {
  const items: StatCardProps[] = [
    { icon: <BookOpen className="w-6 h-6" />, value: metrics.totalQuestions, label: 'Total Questions', accent: 'blue' },
    { icon: <ListChecks className="w-6 h-6" />, value: metrics.attempted, label: 'Attempted', accent: 'cyan' },
    { icon: <CheckCircle2 className="w-6 h-6" />, value: metrics.correct, label: 'Correct', accent: 'emerald' },
    { icon: <XCircle className="w-6 h-6" />, value: metrics.incorrect, label: 'Incorrect', accent: 'amber' },
    { icon: <CheckCircle className="w-6 h-6" />, value: formatPercent(metrics.accuracy), label: 'Accuracy', accent: 'emerald' },
    { icon: <Target className="w-6 h-6" />, value: formatPercent(metrics.percentage), label: 'Percentage', accent: 'violet' },
    { icon: <Clock className="w-6 h-6" />, value: metrics.timeTaken, label: 'Time Taken', accent: 'blue' },
  ]

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 ${className || ''}`}>
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
        >
          <StatCard {...item} />
        </motion.div>
      ))}
    </div>
  )
}

