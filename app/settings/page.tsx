'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useSettingsStore, useProgressStore } from '@/lib/store'
import { useTheme } from '@/components/theme-provider'
import {
  Moon,
  Sun,
  Monitor,
  Target,
  Timer,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { dailyGoal, showTimer, autoAdvance, setDailyGoal, setShowTimer, setAutoAdvance } =
    useSettingsStore()
  const { totalQuestions, correctAnswers } = useProgressStore()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [goalInput, setGoalInput] = useState(dailyGoal.toString())

  const handleGoalChange = (val: string) => {
    setGoalInput(val)
    const num = parseInt(val)
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setDailyGoal(num)
    }
  }

  const handleResetProgress = () => {
    // Clear localStorage for progress store
    localStorage.removeItem('cissp-progress')
    window.location.reload()
  }

  const themeOptions = [
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-dark-400 mt-1">Customize your study experience</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Appearance */}
          <div className="glass-dark rounded-xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
            <div>
              <p className="text-sm text-dark-400 mb-3">Theme</p>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon
                  const isActive = theme === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : 'text-dark-400'}`} />
                      <span className={`text-sm font-medium ${isActive ? 'text-primary-400' : 'text-dark-400'}`}>
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Study preferences */}
          <div className="glass-dark rounded-xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4">Study Preferences</h2>

            <div className="space-y-5">
              {/* Daily goal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/20">
                    <Target className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Daily Question Goal</p>
                    <p className="text-xs text-dark-500">Questions to answer each day</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGoalChange(Math.max(1, dailyGoal - 5).toString())}
                    className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-dark-600 text-white flex items-center justify-center"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={goalInput}
                    onChange={(e) => handleGoalChange(e.target.value)}
                    min={1}
                    max={100}
                    className="w-14 text-center bg-dark-700 text-white rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={() => handleGoalChange(Math.min(100, dailyGoal + 5).toString())}
                    className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-dark-600 text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="h-px bg-dark-700" />

              {/* Show timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent-500/20">
                    <Timer className="w-4 h-4 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Show Timer</p>
                    <p className="text-xs text-dark-500">Display time per question during practice</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTimer(!showTimer)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showTimer ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      showTimer ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="h-px bg-dark-700" />

              {/* Auto-advance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary-500/20">
                    <ChevronRight className="w-4 h-4 text-secondary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Auto-Advance</p>
                    <p className="text-xs text-dark-500">Automatically move to next question after answering</p>
                  </div>
                </div>
                <button
                  onClick={() => setAutoAdvance(!autoAdvance)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoAdvance ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      autoAdvance ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="glass-dark rounded-xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                <p className="text-2xl font-bold text-white">{totalQuestions}</p>
                <p className="text-xs text-dark-500 mt-1">Questions Answered</p>
              </div>
              <div className="p-4 rounded-lg bg-dark-800/50 text-center">
                <p className="text-2xl font-bold text-white">
                  {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </p>
                <p className="text-xs text-dark-500 mt-1">Overall Accuracy</p>
              </div>
            </div>
          </div>

          {/* Data management */}
          <div className="glass-dark rounded-xl p-6 border border-dark-800">
            <h2 className="text-lg font-semibold text-white mb-4">Data</h2>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-3 w-full p-4 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors text-left"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-400">Reset All Progress</p>
                  <p className="text-xs text-dark-500">Clear all progress, sessions, and achievements</p>
                </div>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-sm font-medium text-red-400">Are you sure? This cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetProgress}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition-colors"
                  >
                    Yes, reset everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* App info */}
          <div className="text-center text-dark-600 text-xs pb-4">
            CISSP Trainer Pro v1.0.0 &nbsp;•&nbsp; Built with Next.js 15
          </div>
        </motion.div>
      </main>
    </div>
  )
}
