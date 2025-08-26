'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { QuizInterface } from '@/components/quiz-interface'
import { useQuizStore, useProgressStore } from '@/lib/store'
import { ChevronLeft, Brain, Target, Clock, Shield, Database, Lock, Network, Users, Activity, Code } from 'lucide-react'
import Link from 'next/link'

const domains = [
  { id: 1, name: 'Security and Risk Management', questions: 10, icon: Shield, color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Asset Security', questions: 8, icon: Database, color: 'from-green-500 to-emerald-500' },
  { id: 3, name: 'Security Architecture and Engineering', questions: 9, icon: Lock, color: 'from-purple-500 to-pink-500' },
  { id: 4, name: 'Communication and Network Security', questions: 8, icon: Network, color: 'from-orange-500 to-red-500' },
  { id: 5, name: 'Identity and Access Management', questions: 8, icon: Users, color: 'from-indigo-500 to-blue-500' },
  { id: 6, name: 'Security Assessment and Testing', questions: 7, icon: Activity, color: 'from-yellow-500 to-orange-500' },
  { id: 7, name: 'Security Operations', questions: 8, icon: Shield, color: 'from-teal-500 to-green-500' },
  { id: 8, name: 'Software Development Security', questions: 8, icon: Code, color: 'from-pink-500 to-rose-500' },
]

export default function PracticePage() {
  const { setCurrentDomain, resetQuiz, setQuizMode } = useQuizStore()
  const { updateStreak } = useProgressStore()
  const [quizMode, setLocalQuizMode] = useState<'select' | 'quiz'>('select')
  const domainSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  const startQuiz = (domainId: number | null, mode: 'mixed' | 'focused' | 'timed') => {
    setCurrentDomain(domainId)
    setQuizMode(mode)
    resetQuiz()
    setLocalQuizMode('quiz')
  }

  const exitQuiz = () => {
    setLocalQuizMode('select')
    resetQuiz()
  }

  const scrollToDomains = () => {
    domainSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 safe-top safe-bottom max-w-7xl">
        <AnimatePresence mode="wait">
          {quizMode === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Practice Mode</h1>
                  <p className="text-dark-400 mt-2">Test your knowledge with interactive questions</p>
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </Link>
              </div>

              {/* Practice mode cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  onClick={() => startQuiz(null, 'mixed')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-6 rounded-xl glass-dark border border-dark-800 hover:border-primary-500 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary-500/20 text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                      <Brain className="w-6 h-6" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                      Recommended
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Mixed Practice</h3>
                  <p className="text-sm text-dark-400">Questions from all 8 domains</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-dark-500">
                    <span>66 questions</span>
                    <span>•</span>
                    <span>All levels</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={scrollToDomains}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-6 rounded-xl glass-dark border border-dark-800 hover:border-secondary-500 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-secondary-500/20 text-secondary-400 group-hover:bg-secondary-500 group-hover:text-white transition-all">
                      <Target className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Focused Practice</h3>
                  <p className="text-sm text-dark-400">Choose a specific domain below</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-dark-500">
                    <span>8 domains</span>
                    <span>•</span>
                    <span>Targeted learning</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => startQuiz(null, 'timed')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-6 rounded-xl glass-dark border border-dark-800 hover:border-accent-500 transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-accent-500/20 text-accent-400 group-hover:bg-accent-500 group-hover:text-white transition-all">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Timed Practice</h3>
                  <p className="text-sm text-dark-400">Simulate exam time pressure</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-dark-500">
                    <span>90 sec / question</span>
                    <span>•</span>
                    <span>Exam conditions</span>
                  </div>
                </motion.button>
              </div>

              {/* Domain selection */}
              <div ref={domainSectionRef} className="glass-dark rounded-xl p-6 border border-dark-800">
                <h2 className="text-xl font-semibold text-white mb-4">Select a Domain</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domains.map((domain) => {
                    const Icon = domain.icon
                    return (
                      <motion.button
                        key={domain.id}
                        onClick={() => startQuiz(domain.id, 'focused')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-lg bg-dark-800/50 hover:bg-dark-800 border border-dark-700 hover:border-primary-500 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${domain.color}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm truncate">{domain.name}</h3>
                            <p className="text-xs text-dark-400 mt-0.5">{domain.questions} questions</p>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-dark-500 rotate-180 flex-shrink-0" />
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizInterface onExit={exitQuiz} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
