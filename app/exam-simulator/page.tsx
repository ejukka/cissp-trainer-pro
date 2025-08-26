'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useProgressStore } from '@/lib/store'
import { questions, getRandomQuestions } from '@/data/questions'
import type { Question } from '@/data/questions'
import {
  Timer,
  AlertTriangle,
  Award,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BarChart3,
  PlayCircle,
  Flag,
} from 'lucide-react'
import Link from 'next/link'

const EXAM_DURATION_SECONDS = 3 * 60 * 60 // 3 hours
const EXAM_QUESTIONS = Math.min(questions.length, 50) // Use all available, capped at 50

type ExamState = 'intro' | 'exam' | 'results'

export default function ExamSimulatorPage() {
  const [examState, setExamState] = useState<ExamState>('intro')
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const { addSession, addStudyTime, incrementQuestions, updateProgress } = useProgressStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  const startExam = () => {
    const qs = getRandomQuestions(EXAM_QUESTIONS)
    setExamQuestions(qs)
    setCurrentIndex(0)
    setAnswers({})
    setFlagged(new Set())
    setTimeLeft(EXAM_DURATION_SECONDS)
    setSubmitted(false)
    setResults({})
    setExamState('exam')
    startTimeRef.current = Date.now()
  }

  // Countdown timer
  useEffect(() => {
    if (examState !== 'exam' || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examState, submitted]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(() => {
    if (submitted) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSubmitted(true)

    const resultMap: Record<string, boolean> = {}
    let correctCount = 0

    for (const q of examQuestions) {
      const correct = answers[q.id] === q.correctIndex
      resultMap[q.id] = correct
      if (correct) correctCount++
      incrementQuestions(correct)
    }

    setResults(resultMap)

    // Update domain progress
    const domainMap: Record<number, { correct: number; total: number }> = {}
    for (const q of examQuestions) {
      if (!domainMap[q.domainId]) domainMap[q.domainId] = { correct: 0, total: 0 }
      domainMap[q.domainId].total++
      if (resultMap[q.id]) domainMap[q.domainId].correct++
    }
    for (const [domainId, counts] of Object.entries(domainMap)) {
      updateProgress(parseInt(domainId), (counts.correct / counts.total) * 100)
    }

    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    addStudyTime(Math.round(elapsed / 60))
    addSession({
      date: new Date().toISOString().split('T')[0],
      domainId: null,
      domainName: 'Full Exam',
      totalQuestions: examQuestions.length,
      correctAnswers: correctCount,
      timeSeconds: elapsed,
      mode: 'exam',
    })

    setExamState('results')
  }, [submitted, examQuestions, answers, incrementQuestions, updateProgress, addStudyTime, addSession])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const currentQuestion = examQuestions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isLowTime = timeLeft < 600 // < 10 minutes

  // ─── Intro ────────────────────────────────────────────────────────────────

  if (examState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-white">Exam Simulator</h1>
            </div>

            <div className="glass-dark rounded-xl p-8 border border-dark-800 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto">
                <Award className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">CISSP Practice Exam</h2>
                <p className="text-dark-400">Simulate real exam conditions with timed questions</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Questions', value: EXAM_QUESTIONS.toString() },
                  { label: 'Time Limit', value: '3 hours' },
                  { label: 'Passing Score', value: '70%' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-lg bg-dark-800/50">
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-xs text-dark-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="text-left space-y-2 p-4 rounded-lg bg-dark-800/50">
                <p className="text-sm font-medium text-white mb-2">Before you begin:</p>
                {[
                  'Questions are drawn from all 8 CISSP domains',
                  'You can flag questions to review later',
                  'Navigate freely between questions',
                  'Submit when you are ready (or time runs out)',
                  'Results and explanations shown after submission',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-dark-400">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <motion.button
                onClick={startExam}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 mx-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                <PlayCircle className="w-6 h-6" />
                Start Exam
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  // ─── Results ──────────────────────────────────────────────────────────────

  if (examState === 'results') {
    const correctCount = Object.values(results).filter(Boolean).length
    const score = Math.round((correctCount / examQuestions.length) * 100)
    const passed = score >= 70

    // Per-domain breakdown
    const domainBreakdown = [1, 2, 3, 4, 5, 6, 7, 8].map((domainId) => {
      const domainQs = examQuestions.filter((q) => q.domainId === domainId)
      const correct = domainQs.filter((q) => results[q.id]).length
      return {
        domainId,
        name: domainQs[0]?.domain ?? `Domain ${domainId}`,
        total: domainQs.length,
        correct,
        accuracy: domainQs.length > 0 ? Math.round((correct / domainQs.length) * 100) : 0,
      }
    }).filter((d) => d.total > 0)

    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Result header */}
            <div className="glass-dark rounded-xl p-8 border border-dark-800 text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  passed ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                {passed ? (
                  <Award className="w-10 h-10 text-green-400" />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                )}
              </div>
              <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h2>
              <p className="text-dark-400 mb-6">
                {passed ? 'You passed the practice exam.' : 'You need 70% to pass. Keep studying!'}
              </p>
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-5xl font-bold text-white">{score}%</p>
                  <p className="text-dark-500 text-sm">Final Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {correctCount}/{examQuestions.length}
                  </p>
                  <p className="text-dark-500 text-sm">Correct</p>
                </div>
              </div>
            </div>

            {/* Domain breakdown */}
            <div className="glass-dark rounded-xl p-6 border border-dark-800">
              <h3 className="text-lg font-semibold text-white mb-4">Domain Breakdown</h3>
              <div className="space-y-3">
                {domainBreakdown.map((d) => (
                  <div key={d.domainId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-300 truncate">{d.name}</span>
                      <span className={d.accuracy >= 70 ? 'text-green-400' : 'text-red-400'}>
                        {d.correct}/{d.total} ({d.accuracy}%)
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          d.accuracy >= 70
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-red-500 to-orange-500'
                        }`}
                        style={{ width: `${d.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review answers */}
            <div className="glass-dark rounded-xl p-6 border border-dark-800">
              <h3 className="text-lg font-semibold text-white mb-4">Review Answers</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {examQuestions.map((q, i) => {
                  const isCorrect = results[q.id]
                  const userAnswer = answers[q.id]
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-lg border ${
                        isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm text-white font-medium">
                          Q{i + 1}: {q.question}
                        </p>
                      </div>
                      {!isCorrect && (
                        <div className="ml-6 space-y-1 text-xs">
                          <p className="text-red-400">
                            Your answer: {userAnswer !== undefined ? q.choices[userAnswer] : 'Not answered'}
                          </p>
                          <p className="text-green-400">Correct: {q.choices[q.correctIndex]}</p>
                          <p className="text-dark-400 mt-1">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setExamState('intro')}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 text-white transition-colors"
              >
                Retake Exam
              </button>
              <Link
                href="/analytics"
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  // ─── Exam in progress ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navigation />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4">
          {/* Exam header */}
          <div className="glass-dark rounded-xl p-4 border border-dark-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-dark-400">
                  Q {currentIndex + 1} / {examQuestions.length}
                </span>
                <span className="text-sm text-dark-400">
                  Answered: {answeredCount}/{examQuestions.length}
                </span>
                <span className="text-sm text-dark-400">
                  Flagged: {flagged.size}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center gap-2 text-sm font-mono font-bold ${
                    isLowTime ? 'text-red-400 animate-pulse' : 'text-white'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
                >
                  Submit Exam
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-dark-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all"
                style={{ width: `${(answeredCount / examQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Low time warning */}
          <AnimatePresence>
            {isLowTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/50"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">
                  Less than 10 minutes remaining. Consider submitting soon.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question */}
          {currentQuestion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="glass-dark rounded-xl p-6 md:p-8 border border-dark-800"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        const next = new Set(flagged)
                        if (next.has(currentQuestion.id)) {
                          next.delete(currentQuestion.id)
                        } else {
                          next.add(currentQuestion.id)
                        }
                        setFlagged(next)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        flagged.has(currentQuestion.id)
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-dark-800 text-dark-500 hover:text-dark-300'
                      }`}
                      title="Flag for review"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        currentQuestion.difficulty === 'easy'
                          ? 'bg-green-500/20 text-green-400'
                          : currentQuestion.difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentQuestion.choices.map((choice, index) => {
                    const isSelected = answers[currentQuestion.id] === index
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))
                        }
                        className={`w-full p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                          isSelected
                            ? 'bg-primary-500/20 border-primary-500'
                            : 'bg-dark-800/50 border-dark-700 hover:bg-dark-800 hover:border-dark-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-500'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <p className={isSelected ? 'text-white' : 'text-dark-100'}>{choice}</p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentIndex === 0
                  ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
                  : 'bg-dark-800 hover:bg-dark-700 text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden md:inline">Previous</span>
            </button>

            {/* Question grid navigator */}
            <div className="hidden md:flex flex-wrap gap-1 max-w-sm justify-center">
              {examQuestions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-7 h-7 text-xs rounded transition-colors ${
                    i === currentIndex
                      ? 'bg-primary-500 text-white'
                      : answers[q.id] !== undefined
                      ? flagged.has(q.id)
                        ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                        : 'bg-green-500/20 text-green-400'
                      : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((i) => Math.min(examQuestions.length - 1, i + 1))}
              disabled={currentIndex === examQuestions.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentIndex === examQuestions.length - 1
                  ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
                  : 'bg-dark-800 hover:bg-dark-700 text-white'
              }`}
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
