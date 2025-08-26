'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  Target,
  Award,
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Zap,
  Shield,
  Lock,
  Users,
  Database,
  Network,
  Activity,
  Code,
} from 'lucide-react'
import Link from 'next/link'
import { useProgressStore, useSettingsStore, useScheduleStore } from '@/lib/store'
import { questions } from '@/data/questions'

const domains = [
  { id: 1, name: 'Security and Risk Management', icon: Shield, color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Asset Security', icon: Database, color: 'from-green-500 to-emerald-500' },
  { id: 3, name: 'Security Architecture and Engineering', icon: Lock, color: 'from-purple-500 to-pink-500' },
  { id: 4, name: 'Communication and Network Security', icon: Network, color: 'from-orange-500 to-red-500' },
  { id: 5, name: 'Identity and Access Management', icon: Users, color: 'from-indigo-500 to-blue-500' },
  { id: 6, name: 'Security Assessment and Testing', icon: Activity, color: 'from-yellow-500 to-orange-500' },
  { id: 7, name: 'Security Operations', icon: Shield, color: 'from-teal-500 to-green-500' },
  { id: 8, name: 'Software Development Security', icon: Code, color: 'from-pink-500 to-rose-500' },
]

export function Dashboard() {
  const { progress, studyStreak, totalQuestions, correctAnswers, studyTimeMinutes, sessions } =
    useProgressStore()
  const { dailyGoal } = useSettingsStore()
  const { scheduledSessions } = useScheduleStore()

  const accuracy =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  const studyHours = (studyTimeMinutes / 60).toFixed(1)

  const masteredDomains = Object.values(progress).filter((p) => p >= 80).length

  // Today's questions answered
  const today = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter((s) => s.date === today)
  const todayQuestions = todaySessions.reduce((sum, s) => sum + s.totalQuestions, 0)
  const dailyProgress = Math.min(100, Math.round((todayQuestions / dailyGoal) * 100))

  const statsCards = [
    {
      label: 'Study Streak',
      value: studyStreak.toString(),
      unit: 'days',
      icon: Zap,
      color: 'text-yellow-500',
      change: studyStreak > 0 ? `Keep it going!` : 'Start your streak today',
    },
    {
      label: 'Questions Answered',
      value: totalQuestions.toString(),
      unit: 'total',
      icon: Brain,
      color: 'text-primary-500',
      change: totalQuestions > 0 ? `${accuracy}% accuracy rate` : 'Start practicing!',
    },
    {
      label: 'Study Time',
      value: studyHours,
      unit: 'hours',
      icon: Clock,
      color: 'text-accent-500',
      change: 'All time',
    },
    {
      label: 'Domains Mastered',
      value: masteredDomains.toString(),
      unit: 'of 8',
      icon: Target,
      color: 'text-secondary-500',
      change: `${Math.round((masteredDomains / 8) * 100)}% complete`,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  }

  // Upcoming sessions (not completed, sorted by date)
  const upcomingSessions = scheduledSessions
    .filter((s) => !s.completed)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`)
      const dateB = new Date(`${b.date}T${b.startTime}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="glass-dark rounded-xl p-6 border border-dark-800 card-hover"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">{stat.label}</p>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <span className="ml-2 text-sm text-dark-400">{stat.unit}</span>
                  </div>
                  <p className="mt-2 text-xs text-dark-500">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-dark-800 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Daily goal progress */}
      {dailyGoal > 0 && (
        <motion.div variants={itemVariants} className="glass-dark rounded-xl p-6 border border-dark-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              <h3 className="text-white font-medium">Daily Goal</h3>
            </div>
            <span className="text-sm text-dark-400">
              {todayQuestions} / {dailyGoal} questions
            </span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ duration: 0.6 }}
              className={`h-3 rounded-full bg-gradient-to-r ${
                dailyProgress >= 100
                  ? 'from-green-500 to-emerald-500'
                  : 'from-primary-500 to-secondary-500'
              }`}
            />
          </div>
          {dailyProgress >= 100 && (
            <p className="text-xs text-green-400 mt-2">
              Daily goal achieved! 🎉
            </p>
          )}
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/practice"
          className="group glass-dark rounded-xl p-6 border border-dark-800 hover:border-primary-500 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Quick Practice</h3>
              <p className="text-sm text-dark-400 mt-1">Start a practice session</p>
            </div>
            <div className="p-3 rounded-lg bg-primary-500/20 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
              <Brain className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <Link
          href="/study"
          className="group glass-dark rounded-xl p-6 border border-dark-800 hover:border-secondary-500 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Study Mode</h3>
              <p className="text-sm text-dark-400 mt-1">Review concepts & notes</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary-500/20 text-secondary-400 group-hover:bg-secondary-500 group-hover:text-white transition-all">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </Link>

        <Link
          href="/exam-simulator"
          className="group glass-dark rounded-xl p-6 border border-dark-800 hover:border-accent-500 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Exam Simulator</h3>
              <p className="text-sm text-dark-400 mt-1">Full practice exam</p>
            </div>
            <div className="p-3 rounded-lg bg-accent-500/20 text-accent-400 group-hover:bg-accent-500 group-hover:text-white transition-all">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Domain Progress */}
      <motion.div variants={itemVariants} className="glass-dark rounded-xl p-6 border border-dark-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Domain Progress</h2>
          <Link
            href="/study"
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            Study all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((domain) => {
            const Icon = domain.icon
            const domainProgress = progress[domain.id] || 0
            const domainQCount = questions.filter((q) => q.domainId === domain.id).length

            return (
              <Link
                key={domain.id}
                href={`/study?domain=${domain.id}`}
                className="group p-4 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${domain.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-sm">{domain.name}</h3>
                      <p className="text-xs text-dark-400 mt-0.5">
                        {domainQCount} questions
                      </p>
                    </div>
                  </div>
                  {domainProgress >= 80 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      Mastered
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-400">Progress</span>
                    <span className="text-dark-300">{Math.round(domainProgress)}%</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${domainProgress}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${domain.color}`}
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Upcoming Study Sessions */}
      <motion.div variants={itemVariants} className="glass-dark rounded-xl p-6 border border-dark-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Upcoming Study Sessions</h2>
          <Link
            href="/schedule"
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            Manage <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="text-center py-6 text-dark-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming sessions. Add one in the Schedule!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session, i) => (
              <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg bg-dark-800/50">
                <div
                  className={`p-2 rounded-lg ${
                    i === 0
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-secondary-500/20 text-secondary-400'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{session.domainName}</p>
                  <p className="text-xs text-dark-400">
                    {session.date === today
                      ? 'Today'
                      : new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                    {', '}
                    {session.startTime} – {session.endTime}
                  </p>
                </div>
                <Link
                  href="/practice"
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    session.date === today
                      ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500 hover:text-white'
                      : 'bg-dark-700 text-dark-400'
                  }`}
                >
                  {session.date === today ? 'Start' : 'Scheduled'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
