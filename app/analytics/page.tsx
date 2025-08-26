'use client'

import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useProgressStore } from '@/lib/store'
import { questions } from '@/data/questions'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  Target,
  Brain,
  Clock,
  Award,
  Zap,
  ChevronLeft,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

const DOMAIN_NAMES: Record<number, string> = {
  1: 'Risk Mgmt',
  2: 'Asset Sec',
  3: 'Architecture',
  4: 'Network Sec',
  5: 'IAM',
  6: 'Assessment',
  7: 'Operations',
  8: 'SW Dev',
}

const DOMAIN_COLORS = [
  '#0ea5e9', '#10b981', '#8b5cf6', '#f97316',
  '#6366f1', '#eab308', '#14b8a6', '#ec4899',
]

const DIFFICULTY_COLORS = { easy: '#10b981', medium: '#eab308', hard: '#ef4444' }

export default function AnalyticsPage() {
  const { progress, totalQuestions, correctAnswers, studyStreak, studyTimeMinutes, sessions } =
    useProgressStore()

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  const studyHours = (studyTimeMinutes / 60).toFixed(1)

  // Per-domain accuracy from sessions
  const domainAccuracy = [1, 2, 3, 4, 5, 6, 7, 8].map((domainId) => {
    const domainSessions = sessions.filter((s) => s.domainId === domainId)
    const total = domainSessions.reduce((sum, s) => sum + s.totalQuestions, 0)
    const correct = domainSessions.reduce((sum, s) => sum + s.correctAnswers, 0)
    return {
      domain: DOMAIN_NAMES[domainId],
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      total,
      progress: Math.round(progress[domainId] || 0),
    }
  })

  // Score history (last 10 sessions)
  const scoreHistory = sessions
    .slice(0, 10)
    .reverse()
    .map((session, i) => ({
      name: `#${i + 1}`,
      score: session.totalQuestions > 0
        ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
        : 0,
      questions: session.totalQuestions,
      date: session.date,
    }))

  // Difficulty breakdown from all domain sessions
  const difficultyStats = ['easy', 'medium', 'hard'].map((diff) => {
    const diffQuestions = questions.filter((q) => q.difficulty === diff)
    return {
      name: diff.charAt(0).toUpperCase() + diff.slice(1),
      value: diffQuestions.length,
      color: DIFFICULTY_COLORS[diff as keyof typeof DIFFICULTY_COLORS],
    }
  })

  // Weak areas: domains with lowest accuracy (only if attempted)
  const weakAreas = domainAccuracy
    .filter((d) => d.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  // Recent sessions
  const recentSessions = sessions.slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Analytics</h1>
              <p className="text-dark-400 mt-2">Track your performance and identify areas for improvement</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Overall Accuracy', value: `${accuracy}%`, icon: Target, color: 'text-primary-500' },
              { label: 'Total Questions', value: totalQuestions.toString(), icon: Brain, color: 'text-secondary-500' },
              { label: 'Study Hours', value: studyHours, icon: Clock, color: 'text-accent-500' },
              { label: 'Current Streak', value: `${studyStreak}d`, icon: Zap, color: 'text-yellow-500' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-dark rounded-xl p-5 border border-dark-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-dark-400 text-sm">{stat.label}</p>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain progress bar chart */}
            <div className="glass-dark rounded-xl p-6 border border-dark-800">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                Domain Progress
              </h2>
              {totalQuestions === 0 ? (
                <div className="flex items-center justify-center h-48 text-dark-500 text-sm">
                  Complete some practice sessions to see domain progress.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={domainAccuracy} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="domain" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(val: number) => [`${val}%`, 'Progress']}
                    />
                    <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                      {domainAccuracy.map((_, i) => (
                        <Cell key={i} fill={DOMAIN_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Score history line chart */}
            <div className="glass-dark rounded-xl p-6 border border-dark-800">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary-400" />
                Score History
              </h2>
              {scoreHistory.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-dark-500 text-sm">
                  Complete practice sessions to see your score trend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={scoreHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(val: number) => [`${val}%`, 'Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ fill: '#0ea5e9', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Domain accuracy */}
            <div className="glass-dark rounded-xl p-6 border border-dark-800">
              <h2 className="text-lg font-semibold text-white mb-4">Domain Accuracy</h2>
              {sessions.length === 0 ? (
                <p className="text-dark-500 text-sm">No sessions yet.</p>
              ) : (
                <div className="space-y-3">
                  {domainAccuracy
                    .filter((d) => d.total > 0)
                    .sort((a, b) => b.accuracy - a.accuracy)
                    .map((d, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-dark-300">{d.domain}</span>
                          <span className="text-dark-400">{d.accuracy}%</span>
                        </div>
                        <div className="w-full bg-dark-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                            style={{ width: `${d.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Difficulty breakdown pie */}
            <div className="glass-dark rounded-xl p-6 border border-dark-800">
              <h2 className="text-lg font-semibold text-white mb-4">Question Difficulty</h2>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={difficultyStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {difficultyStats.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
                    formatter={(val: number, name: string) => [val, name]}
                  />
                  <Legend formatter={(val) => <span style={{ color: '#a1a1aa', fontSize: 12 }}>{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Weak areas */}
            <div className="glass-dark rounded-xl p-6 border border-dark-800">
              <h2 className="text-lg font-semibold text-white mb-4">Focus Areas</h2>
              {weakAreas.length === 0 ? (
                <p className="text-dark-500 text-sm">Complete sessions across domains to identify weak areas.</p>
              ) : (
                <div className="space-y-4">
                  {weakAreas.map((area, i) => (
                    <div key={i} className="p-3 rounded-lg bg-dark-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{area.domain}</span>
                        <span className="text-xs text-red-400">{area.accuracy}%</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${area.accuracy}%` }}
                        />
                      </div>
                      <Link
                        href="/practice"
                        className="text-xs text-primary-400 hover:text-primary-300 mt-1 inline-block"
                      >
                        Practice →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="glass-dark rounded-xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-dark-400" />
              Recent Sessions
            </h2>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-dark-500">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No sessions yet. Start practicing to see your history here!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-dark-500 border-b border-dark-700">
                      <th className="text-left py-2 pr-4">Date</th>
                      <th className="text-left py-2 pr-4">Domain</th>
                      <th className="text-left py-2 pr-4">Mode</th>
                      <th className="text-right py-2 pr-4">Score</th>
                      <th className="text-right py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((session) => {
                      const acc =
                        session.totalQuestions > 0
                          ? Math.round((session.correctAnswers / session.totalQuestions) * 100)
                          : 0
                      const mins = Math.floor(session.timeSeconds / 60)
                      const secs = session.timeSeconds % 60
                      return (
                        <tr key={session.id} className="border-b border-dark-800 hover:bg-dark-800/30">
                          <td className="py-3 pr-4 text-dark-400">{session.date}</td>
                          <td className="py-3 pr-4 text-dark-200">{session.domainName}</td>
                          <td className="py-3 pr-4">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-400 capitalize">
                              {session.mode}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <span
                              className={
                                acc >= 80
                                  ? 'text-green-400'
                                  : acc >= 60
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }
                            >
                              {session.correctAnswers}/{session.totalQuestions} ({acc}%)
                            </span>
                          </td>
                          <td className="py-3 text-right text-dark-400">
                            {mins}:{secs.toString().padStart(2, '0')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
