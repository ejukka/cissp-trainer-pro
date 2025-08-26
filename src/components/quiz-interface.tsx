'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore, useProgressStore, useSettingsStore } from '@/lib/store'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  BookOpen,
  Timer,
  Award,
  BarChart3,
  AlertTriangle,
} from 'lucide-react'
import { questions } from '@/data/questions'
import Link from 'next/link'

interface QuizInterfaceProps {
  onExit: () => void
}

export function QuizInterface({ onExit }: QuizInterfaceProps) {
  const {
    currentDomain,
    currentQuestionIndex,
    answers,
    results,
    quizMode,
    setCurrentQuestionIndex,
    setAnswer,
    setResult,
  } = useQuizStore()

  const { incrementQuestions, updateProgress, addSession, addStudyTime } = useProgressStore()
  const { showTimer } = useSettingsStore()

  const [showExplanation, setShowExplanation] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timedWarning, setTimedWarning] = useState(false)
  const sessionStartRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const domainQuestions = currentDomain
    ? questions.filter((q) => q.domainId === currentDomain)
    : questions

  const currentQuestion = domainQuestions[currentQuestionIndex]
  const hasAnswered = !!(currentQuestion && results[currentQuestion.id])
  const isCorrect = hasAnswered && results[currentQuestion.id].correct

  // Per-question timer
  useEffect(() => {
    setTimeSpent(0)
    setTimedWarning(false)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => {
        const next = prev + 1
        if (quizMode === 'timed' && next >= 80) setTimedWarning(true)
        return next
      })
      setTotalTime((prev) => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQuestionIndex, quizMode])

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return

    const correct = selectedAnswer === currentQuestion.correctIndex

    setAnswer(currentQuestion.id, selectedAnswer)
    setResult(currentQuestion.id, {
      correct,
      correctIndex: currentQuestion.correctIndex,
      explanation: currentQuestion.explanation,
    })

    incrementQuestions(correct)
    setShowExplanation(true)

    // Update domain progress: count correct answers INCLUDING this one
    if (currentDomain) {
      const prevCorrect = domainQuestions.filter((q) => results[q.id]?.correct).length
      const newCorrect = prevCorrect + (correct ? 1 : 0)
      const progressPercentage = (newCorrect / domainQuestions.length) * 100
      updateProgress(currentDomain, progressPercentage)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < domainQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  // Save session when quiz completes
  const isQuizComplete =
    currentQuestionIndex === domainQuestions.length - 1 && hasAnswered

  useEffect(() => {
    if (isQuizComplete) {
      if (timerRef.current) clearInterval(timerRef.current)
      const correctCount = Object.values(results).filter((r) => r.correct).length + (isCorrect ? 0 : 0)
      const sessionSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000)
      addStudyTime(Math.round(sessionSeconds / 60))
      addSession({
        date: new Date().toISOString().split('T')[0],
        domainId: currentDomain,
        domainName: currentDomain
          ? (domainQuestions[0]?.domain ?? 'Mixed')
          : 'Mixed',
        totalQuestions: domainQuestions.length,
        correctAnswers: Object.values(results).filter((r) => r.correct).length,
        timeSeconds: sessionSeconds,
        mode: quizMode,
      })
    }
  }, [isQuizComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">No questions available for this domain.</p>
        <button
          onClick={onExit}
          className="mt-4 px-6 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  const scoreCorrect = Object.values(results).filter((r) => r.correct).length
  const scoreTotal = Object.keys(results).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-dark rounded-xl p-4 border border-dark-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
              aria-label="Exit quiz"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm text-dark-400">
                Question {currentQuestionIndex + 1} of {domainQuestions.length}
              </p>
              <p className="text-xs text-dark-500 mt-0.5">{currentQuestion.domain}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showTimer && (
              <div
                className={`flex items-center gap-2 text-sm ${
                  timedWarning ? 'text-red-400 animate-pulse' : ''
                }`}
              >
                <Timer className="w-4 h-4 text-dark-400" />
                <span className="text-dark-300">{formatTime(timeSpent)}</span>
              </div>
            )}
            <div className="text-sm text-dark-400">
              Score: {scoreCorrect}/{scoreTotal}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-dark-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((currentQuestionIndex + 1) / domainQuestions.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
            className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
          />
        </div>
      </div>

      {/* Timed warning banner */}
      <AnimatePresence>
        {timedWarning && !hasAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/50"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">Time running out — select an answer!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-dark rounded-xl p-6 md:p-8 border border-dark-800"
        >
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
              <span
                className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${
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

            {/* Answer options */}
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectAnswer = hasAnswered && index === currentQuestion.correctIndex
                const isWrongAnswer =
                  hasAnswered &&
                  index === answers[currentQuestion.id] &&
                  !results[currentQuestion.id].correct

                return (
                  <motion.button
                    key={index}
                    whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                    whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={hasAnswered}
                    className={`
                      w-full p-4 rounded-lg text-left transition-all duration-200
                      ${
                        !hasAnswered && isSelected
                          ? 'bg-primary-500/20 border-2 border-primary-500'
                          : 'bg-dark-800/50 border-2 border-dark-700'
                      }
                      ${!hasAnswered && !isSelected ? 'hover:bg-dark-800 hover:border-dark-600' : ''}
                      ${isCorrectAnswer ? 'bg-green-500/20 border-green-500' : ''}
                      ${isWrongAnswer ? 'bg-red-500/20 border-red-500' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${isSelected && !hasAnswered ? 'border-primary-500 bg-primary-500' : 'border-dark-500'}
                          ${isCorrectAnswer ? 'border-green-500 bg-green-500' : ''}
                          ${isWrongAnswer ? 'border-red-500 bg-red-500' : ''}
                        `}
                      >
                        {isSelected && !hasAnswered && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                        {isCorrectAnswer && <Check className="w-4 h-4 text-white" />}
                        {isWrongAnswer && <X className="w-4 h-4 text-white" />}
                      </div>
                      <p
                        className={`
                          ${isCorrectAnswer ? 'text-green-400' : ''}
                          ${isWrongAnswer ? 'text-red-400' : ''}
                          ${!hasAnswered ? 'text-dark-100' : ''}
                        `}
                      >
                        {choice}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && hasAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-yellow-500/10 border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <BookOpen
                      className={`w-5 h-5 mt-1 flex-shrink-0 ${
                        isCorrect ? 'text-green-400' : 'text-yellow-400'
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium mb-2 ${
                          isCorrect ? 'text-green-400' : 'text-yellow-400'
                        }`}
                      >
                        {isCorrect ? 'Correct!' : 'Explanation:'}
                      </p>
                      <p className="text-dark-200 text-sm leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentQuestionIndex === 0
              ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
              : 'bg-dark-800 hover:bg-dark-700 text-white'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden md:inline">Previous</span>
        </button>

        {!hasAnswered ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedAnswer !== null
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-dark-800 text-dark-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                Correct!
              </span>
            ) : (
              <span className="flex items-center gap-2 text-red-400">
                <X className="w-5 h-5" />
                Incorrect
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === domainQuestions.length - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            currentQuestionIndex === domainQuestions.length - 1
              ? 'bg-dark-800 text-dark-500 cursor-not-allowed'
              : 'bg-dark-800 hover:bg-dark-700 text-white'
          }`}
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Quiz Complete */}
      {isQuizComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-xl p-6 border border-dark-800 text-center"
        >
          <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
          <p className="text-dark-300 mb-1">
            You scored{' '}
            <span className="text-white font-semibold">
              {Object.values(results).filter((r) => r.correct).length}
            </span>{' '}
            out of {domainQuestions.length}
          </p>
          <p className="text-dark-500 text-sm mb-6">
            Accuracy:{' '}
            {Math.round(
              (Object.values(results).filter((r) => r.correct).length /
                domainQuestions.length) *
                100
            )}
            % &nbsp;•&nbsp; Time: {formatTime(totalTime)}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={onExit}
              className="px-6 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-white transition-colors"
            >
              Exit Quiz
            </button>
            <Link
              href="/analytics"
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  )
}
