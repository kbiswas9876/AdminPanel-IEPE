'use client'

import React from 'react'

export interface ChapterPerformance {
  chapterName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  accuracy: number; // percentage (0-100)
  timePerQuestion: number; // seconds per question
}

export interface ChapterWisePerformanceTableProps {
  chapters: ChapterPerformance[];
  className?: string;
}

const formatAccuracy = (value: number) => `${Math.round(value)}%`;

const formatTimePerQuestion = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
};

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 70) return 'text-green-600 dark:text-green-400';
  if (accuracy >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export default function ChapterWisePerformanceTable({ chapters, className }: ChapterWisePerformanceTableProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-0 backdrop-blur-xl ${className || ''}`}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Chapter-wise Performance</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <table className="min-w-full divide-y divide-slate-200/50 dark:divide-slate-700/50">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800">
              <tr>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Chapter Name</th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Total</th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Attempted</th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Correct</th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Incorrect</th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Accuracy</th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Time/Question</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {chapters && chapters.length > 0 ? (
                chapters.map((item, idx) => (
                  <tr
                    key={`${item.chapterName}-${idx}`}
                    className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 text-center">
                      {item.chapterName}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 text-center font-medium">
                      {item.totalQuestions}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 text-center font-medium">
                      {item.attempted}
                    </td>
                    <td className="px-4 py-4 text-sm text-green-600 dark:text-green-400 text-center font-bold">
                      {item.correct}
                    </td>
                    <td className="px-4 py-4 text-sm text-red-600 dark:text-red-400 text-center font-bold">
                      {item.incorrect}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      <span className={`font-bold text-lg ${getAccuracyColor(item.accuracy)}`}>
                        {formatAccuracy(item.accuracy)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 text-center font-medium whitespace-nowrap">
                      {formatTimePerQuestion(item.timePerQuestion)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No chapter performance data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer note showing attempted/correct totals could be added if needed */}
      </div>
    </div>
  );
}

