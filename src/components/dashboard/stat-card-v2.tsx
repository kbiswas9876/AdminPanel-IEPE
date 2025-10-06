'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface StatCardV2Props {
  title: string
  value: number
  description?: string
  trend?: {
    direction: 'up' | 'down'
    percentage: number
    label: string
  }
  sparklineData?: number[]
  icon: LucideIcon
  iconBg: string
  href: string
  badge?: {
    text: string
    variant: 'default' | 'warning' | 'error'
  }
  isUrgent?: boolean
}

export function StatCardV2({
  title,
  value,
  description,
  trend,
  sparklineData,
  icon: Icon,
  iconBg,
  href,
  badge,
  isUrgent = false
}: StatCardV2Props) {
  const chartData = sparklineData?.map(v => ({ value: v })) || []

  return (
    <Link href={href} className="group block h-full">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative overflow-hidden rounded-3xl border-2 p-6 h-full min-h-[280px]",
          "bg-white backdrop-blur-xl shadow-lg transition-all duration-300",
          "flex flex-col justify-between",
          isUrgent
            ? "border-orange-200 bg-gradient-to-br from-orange-50/50 to-red-50/30 hover:border-orange-300"
            : "border-slate-200/60 hover:border-blue-300/60",
          "hover:shadow-2xl hover:shadow-blue-500/10"
        )}
      >
        {/* Top Row: Icon + Badge */}
        <div className="flex items-start justify-between mb-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
              iconBg
            )}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>

          {badge && (
            <Badge
              className={cn(
                "text-xs font-bold shadow-sm",
                badge.variant === 'error' && "bg-red-100 text-red-700 border-red-300 animate-pulse",
                badge.variant === 'warning' && "bg-orange-100 text-orange-700 border-orange-300 animate-pulse",
                badge.variant === 'default' && "bg-blue-100 text-blue-700 border-blue-300"
              )}
            >
              {badge.text}
            </Badge>
          )}
        </div>

        {/* Content Container - flex-grow to push sparkline to bottom */}
        <div className="flex-grow">
          {/* Main Stat Number */}
          <div className="mb-4">
            <div className={cn(
              "text-5xl font-extrabold tabular-nums tracking-tight",
              isUrgent ? "text-orange-900" : "text-slate-900"
            )}>
              <AnimatedNumber value={value} />
            </div>

            {/* Trend Indicator */}
            {trend && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2 mt-3"
              >
                {trend.direction === 'up' ? (
                  <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-green-100">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-red-100">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                )}
                <span className={cn(
                  "text-sm font-bold",
                  trend.direction === 'up' ? "text-green-600" : "text-red-600"
                )}>
                  {trend.direction === 'up' ? '+' : '-'}{trend.percentage}%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {trend.label}
                </span>
              </motion.div>
            )}
          </div>

          {/* Title & Description */}
          <div className="mb-4">
            <h3 className={cn(
              "text-base font-bold mb-1 transition-colors",
              isUrgent ? "text-orange-800 group-hover:text-orange-600" : "text-slate-900 group-hover:text-blue-600"
            )}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-slate-600 font-medium">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Sparkline Chart - Always renders to maintain consistent height */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="h-12 -mx-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          {sparklineData && sparklineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isUrgent ? "#f97316" : "#3b82f6"}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full" />
          )}
        </motion.div>

        {/* Hover Arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute bottom-6 right-6 transition-all duration-300"
        >
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-lg",
            isUrgent ? "bg-orange-100" : "bg-blue-100"
          )}>
            <ArrowRight className={cn(
              "h-4 w-4",
              isUrgent ? "text-orange-600" : "text-blue-600"
            )} />
          </div>
        </motion.div>

        {/* Subtle gradient overlay on hover */}
        <div className={cn(
          "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          isUrgent
            ? "bg-gradient-to-br from-orange-400/5 to-red-400/5"
            : "bg-gradient-to-br from-blue-400/5 to-indigo-400/5"
        )} />
      </motion.div>
    </Link>
  )
}

