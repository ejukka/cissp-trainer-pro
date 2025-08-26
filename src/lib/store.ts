import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  date: string
  domainId: number | null
  domainName: string
  totalQuestions: number
  correctAnswers: number
  timeSeconds: number
  mode: 'mixed' | 'focused' | 'timed' | 'exam'
}

export interface ScheduledSession {
  id: string
  domainId: number | null
  domainName: string
  date: string
  startTime: string
  endTime: string
  completed: boolean
}

// ─── Progress Store ────────────────────────────────────────────────────────────

interface ProgressState {
  progress: Record<number, number>
  studyStreak: number
  totalQuestions: number
  correctAnswers: number
  lastStudyDate: string | null
  achievements: string[]
  sessions: Session[]
  studyTimeMinutes: number
  updateProgress: (domainId: number, progress: number) => void
  incrementQuestions: (correct: boolean) => void
  updateStreak: () => void
  addAchievement: (achievementId: string) => void
  addSession: (session: Omit<Session, 'id'>) => void
  addStudyTime: (minutes: number) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      studyStreak: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      lastStudyDate: null,
      achievements: [],
      sessions: [],
      studyTimeMinutes: 0,

      updateProgress: (domainId, progress) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [domainId]: Math.min(100, Math.max(0, progress)),
          },
        })),

      incrementQuestions: (correct) =>
        set((state) => ({
          totalQuestions: state.totalQuestions + 1,
          correctAnswers: state.correctAnswers + (correct ? 1 : 0),
        })),

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0]
        const lastDate = get().lastStudyDate
        if (!lastDate) {
          set({ studyStreak: 1, lastStudyDate: today })
        } else if (lastDate === today) {
          // same day, no change
        } else {
          const diffDays = Math.round(
            (new Date(today).getTime() - new Date(lastDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
          if (diffDays === 1) {
            set((state) => ({
              studyStreak: state.studyStreak + 1,
              lastStudyDate: today,
            }))
          } else {
            set({ studyStreak: 1, lastStudyDate: today })
          }
        }
      },

      addAchievement: (achievementId) =>
        set((state) => ({
          achievements: state.achievements.includes(achievementId)
            ? state.achievements
            : [...state.achievements, achievementId],
        })),

      addSession: (session) =>
        set((state) => ({
          sessions: [
            { ...session, id: `session-${Date.now()}-${Math.random()}` },
            ...state.sessions,
          ].slice(0, 200),
        })),

      addStudyTime: (minutes) =>
        set((state) => ({ studyTimeMinutes: state.studyTimeMinutes + minutes })),
    }),
    { name: 'cissp-progress' }
  )
)

// ─── Quiz Store ────────────────────────────────────────────────────────────────

interface QuizState {
  currentDomain: number | null
  currentQuestionIndex: number
  answers: Record<string, number>
  results: Record<string, { correct: boolean; correctIndex: number; explanation: string }>
  quizMode: 'mixed' | 'focused' | 'timed' | 'exam'
  setCurrentDomain: (domainId: number | null) => void
  setCurrentQuestionIndex: (index: number) => void
  setAnswer: (questionId: string, answerIndex: number) => void
  setResult: (
    questionId: string,
    result: { correct: boolean; correctIndex: number; explanation: string }
  ) => void
  setQuizMode: (mode: QuizState['quizMode']) => void
  resetQuiz: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  currentDomain: null,
  currentQuestionIndex: 0,
  answers: {},
  results: {},
  quizMode: 'mixed',

  setCurrentDomain: (domainId) => set({ currentDomain: domainId }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setAnswer: (questionId, answerIndex) =>
    set((state) => ({ answers: { ...state.answers, [questionId]: answerIndex } })),
  setResult: (questionId, result) =>
    set((state) => ({ results: { ...state.results, [questionId]: result } })),
  setQuizMode: (mode) => set({ quizMode: mode }),
  resetQuiz: () => set({ currentQuestionIndex: 0, answers: {}, results: {} }),
}))

// ─── Settings Store ────────────────────────────────────────────────────────────

interface SettingsState {
  dailyGoal: number
  showTimer: boolean
  autoAdvance: boolean
  setDailyGoal: (goal: number) => void
  setShowTimer: (show: boolean) => void
  setAutoAdvance: (auto: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      dailyGoal: 10,
      showTimer: true,
      autoAdvance: false,
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setShowTimer: (showTimer) => set({ showTimer }),
      setAutoAdvance: (autoAdvance) => set({ autoAdvance }),
    }),
    { name: 'cissp-settings' }
  )
)

// ─── Schedule Store ────────────────────────────────────────────────────────────

interface ScheduleState {
  scheduledSessions: ScheduledSession[]
  addScheduledSession: (session: Omit<ScheduledSession, 'id'>) => void
  removeScheduledSession: (id: string) => void
  markSessionCompleted: (id: string) => void
}

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      scheduledSessions: [
        {
          id: 'default-1',
          domainId: 1,
          domainName: 'Security and Risk Management',
          date: today,
          startTime: '18:00',
          endTime: '19:30',
          completed: false,
        },
        {
          id: 'default-2',
          domainId: null,
          domainName: 'Practice Exam',
          date: tomorrow,
          startTime: '14:00',
          endTime: '16:00',
          completed: false,
        },
      ],

      addScheduledSession: (session) =>
        set((state) => ({
          scheduledSessions: [
            ...state.scheduledSessions,
            { ...session, id: `sched-${Date.now()}` },
          ],
        })),

      removeScheduledSession: (id) =>
        set((state) => ({
          scheduledSessions: state.scheduledSessions.filter((s) => s.id !== id),
        })),

      markSessionCompleted: (id) =>
        set((state) => ({
          scheduledSessions: state.scheduledSessions.map((s) =>
            s.id === id ? { ...s, completed: true } : s
          ),
        })),
    }),
    { name: 'cissp-schedule' }
  )
)
