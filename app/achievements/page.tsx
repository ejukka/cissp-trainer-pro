'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useProgressStore } from '@/lib/store'
import {
  Trophy,
  Star,
  Zap,
  Brain,
  Shield,
  Target,
  Clock,
  Award,
  BookOpen,
  TrendingUp,
  ChevronLeft,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

interface AchievementDef {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  checkUnlocked: (state: {
    totalQuestions: number
    correctAnswers: number
    studyStreak: number
    studyTimeMinutes: number
    progress: Record<number, number>
    sessions: Array<{ correctAnswers: number; totalQuestions: number }>
    achievements: string[]
  }) => boolean
}

const achievementDefs: AchievementDef[] = [
  {
    id: 'first-question',
    title: 'First Steps',
    description: 'Answer your first question',
    icon: Star,
    color: 'from-yellow-400 to-amber-500',
    checkUnlocked: (s) => s.totalQuestions >= 1,
  },
  {
    id: 'ten-correct',
    title: 'Quick Learner',
    description: 'Get 10 questions correct',
    icon: Brain,
    color: 'from-blue-400 to-cyan-500',
    checkUnlocked: (s) => s.correctAnswers >= 10,
  },
  {
    id: 'fifty-questions',
    title: 'Dedicated Student',
    description: 'Answer 50 questions',
    icon: BookOpen,
    color: 'from-green-400 to-emerald-500',
    checkUnlocked: (s) => s.totalQuestions >= 50,
  },
  {
    id: 'hundred-questions',
    title: 'Centurion',
    description: 'Answer 100 questions',
    icon: Award,
    color: 'from-purple-400 to-violet-500',
    checkUnlocked: (s) => s.totalQuestions >= 100,
  },
  {
    id: 'streak-3',
    title: 'Consistent',
    description: 'Maintain a 3-day study streak',
    icon: Zap,
    color: 'from-orange-400 to-yellow-500',
    checkUnlocked: (s) => s.studyStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Streak Master',
    description: 'Maintain a 7-day study streak',
    icon: Zap,
    color: 'from-red-400 to-orange-500',
    checkUnlocked: (s) => s.studyStreak >= 7,
  },
  {
    id: 'streak-30',
    title: 'Iron Will',
    description: 'Maintain a 30-day study streak',
    icon: Zap,
    color: 'from-rose-500 to-red-600',
    checkUnlocked: (s) => s.studyStreak >= 30,
  },
  {
    id: 'domain-mastered-1',
    title: 'Domain Expert',
    description: 'Master any domain (≥80% progress)',
    icon: Shield,
    color: 'from-teal-400 to-green-500',
    checkUnlocked: (s) => Object.values(s.progress).some((p) => p >= 80),
  },
  {
    id: 'domain-mastered-4',
    title: 'Half Way There',
    description: 'Master 4 domains',
    icon: Target,
    color: 'from-indigo-400 to-blue-500',
    checkUnlocked: (s) => Object.values(s.progress).filter((p) => p >= 80).length >= 4,
  },
  {
    id: 'all-domains',
    title: 'CISSP Ready',
    description: 'Master all 8 domains',
    icon: Trophy,
    color: 'from-yellow-400 to-amber-400',
    checkUnlocked: (s) => Object.values(s.progress).filter((p) => p >= 80).length >= 8,
  },
  {
    id: 'accuracy-90',
    title: 'Sharp Mind',
    description: 'Achieve 90% overall accuracy (min 20 questions)',
    icon: TrendingUp,
    color: 'from-cyan-400 to-blue-500',
    checkUnlocked: (s) =>
      s.totalQuestions >= 20 &&
      s.totalQuestions > 0 &&
      s.correctAnswers / s.totalQuestions >= 0.9,
  },
  {
    id: 'hour-study',
    title: 'In The Zone',
    description: 'Accumulate 1 hour of study time',
    icon: Clock,
    color: 'from-pink-400 to-rose-500',
    checkUnlocked: (s) => s.studyTimeMinutes >= 60,
  },
  {
    id: 'ten-hours',
    title: 'Marathon Runner',
    description: 'Accumulate 10 hours of study time',
    icon: Clock,
    color: 'from-violet-400 to-purple-500',
    checkUnlocked: (s) => s.studyTimeMinutes >= 600,
  },
  {
    id: 'perfect-session',
    title: 'Perfect Score',
    description: 'Score 100% on a session with at least 5 questions',
    icon: Star,
    color: 'from-amber-400 to-yellow-500',
    checkUnlocked: (s) =>
      s.sessions.some(
        (sess) => sess.totalQuestions >= 5 && sess.correctAnswers === sess.totalQuestions
      ),
  },
]

export default function AchievementsPage() {
  const state = useProgressStore()
  const { addAchievement } = state

  // Check and award achievements automatically
  useEffect(() => {
    for (const achievement of achievementDefs) {
      if (!state.achievements.includes(achievement.id) && achievement.checkUnlocked(state)) {
        addAchievement(achievement.id)
      }
    }
  }, [state, addAchievement])

  const unlocked = achievementDefs.filter((a) => state.achievements.includes(a.id))
  const locked = achievementDefs.filter((a) => !state.achievements.includes(a.id))
  const progress = Math.round((unlocked.length / achievementDefs.length) * 100)

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
              <h1 className="text-3xl md:text-4xl font-bold text-white">Achievements</h1>
              <p className="text-dark-400 mt-2">
                {unlocked.length} of {achievementDefs.length} unlocked
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Overall progress */}
          <div className="glass-dark rounded-xl p-6 border border-dark-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className="font-semibold text-white">Overall Progress</span>
              </div>
              <span className="text-dark-400 text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
              />
            </div>
          </div>

          {/* Unlocked achievements */}
          {unlocked.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Unlocked ({unlocked.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {unlocked.map((achievement, i) => {
                  const Icon = achievement.icon
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-dark rounded-xl p-5 border border-dark-700 text-center"
                    >
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-white text-sm">{achievement.title}</h3>
                      <p className="text-xs text-dark-400 mt-1">{achievement.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Locked achievements */}
          {locked.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-dark-500 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-dark-600" />
                Locked ({locked.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {locked.map((achievement, i) => {
                  const Icon = achievement.icon
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-dark rounded-xl p-5 border border-dark-800 text-center opacity-50"
                    >
                      <div className="w-14 h-14 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6 text-dark-500" />
                      </div>
                      <h3 className="font-semibold text-dark-400 text-sm">{achievement.title}</h3>
                      <p className="text-xs text-dark-600 mt-1">{achievement.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
