'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useScheduleStore } from '@/lib/store'
import type { ScheduledSession } from '@/lib/store'
import {
  Calendar,
  Plus,
  Trash2,
  Check,
  ChevronLeft,
  Clock,
  BookOpen,
  X,
} from 'lucide-react'
import Link from 'next/link'

const DOMAIN_OPTIONS = [
  { id: null, name: 'Practice Exam (Mixed)' },
  { id: 1, name: 'Security and Risk Management' },
  { id: 2, name: 'Asset Security' },
  { id: 3, name: 'Security Architecture and Engineering' },
  { id: 4, name: 'Communication and Network Security' },
  { id: 5, name: 'Identity and Access Management' },
  { id: 6, name: 'Security Assessment and Testing' },
  { id: 7, name: 'Security Operations' },
  { id: 8, name: 'Software Development Security' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === tomorrow) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function groupByDate(sessions: ScheduledSession[]) {
  const map: Record<string, ScheduledSession[]> = {}
  for (const s of sessions) {
    if (!map[s.date]) map[s.date] = []
    map[s.date].push(s)
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
}

export default function SchedulePage() {
  const { scheduledSessions, addScheduledSession, removeScheduledSession, markSessionCompleted } =
    useScheduleStore()

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    domainId: null as number | null,
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '19:30',
  })

  const handleAdd = () => {
    const domain = DOMAIN_OPTIONS.find((d) => d.id === form.domainId)
    addScheduledSession({
      domainId: form.domainId,
      domainName: domain?.name ?? 'Study Session',
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      completed: false,
    })
    setShowAdd(false)
  }

  const upcoming = scheduledSessions.filter((s) => !s.completed)
  const completed = scheduledSessions.filter((s) => s.completed)
  const grouped = groupByDate(upcoming)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Study Schedule</h1>
              <p className="text-dark-400 mt-1">Plan and track your study sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-sm">
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Session
              </button>
            </div>
          </div>

          {/* Add session modal */}
          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-dark rounded-xl p-6 border border-primary-500/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">New Study Session</h3>
                  <button onClick={() => setShowAdd(false)} className="text-dark-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-dark-400 mb-1">Domain / Topic</label>
                    <select
                      value={form.domainId ?? ''}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          domainId: e.target.value === '' ? null : parseInt(e.target.value),
                        }))
                      }
                      className="w-full bg-dark-800 text-white border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {DOMAIN_OPTIONS.map((d) => (
                        <option key={String(d.id)} value={d.id ?? ''}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      min={today}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full bg-dark-800 text-white border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">Start</label>
                      <input
                        type="time"
                        value={form.startTime}
                        onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                        className="w-full bg-dark-800 text-white border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-dark-400 mb-1">End</label>
                      <input
                        type="time"
                        value={form.endTime}
                        onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                        className="w-full bg-dark-800 text-white border border-dark-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm transition-colors"
                  >
                    Add Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upcoming sessions */}
          {grouped.length === 0 ? (
            <div className="glass-dark rounded-xl p-10 border border-dark-800 text-center">
              <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400 mb-4">No upcoming sessions scheduled.</p>
              <button
                onClick={() => setShowAdd(true)}
                className="px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm transition-colors"
              >
                Schedule your first session
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([date, dateSessions]) => (
                <div key={date}>
                  <h2 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(date)}
                    {date === today && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                        Today
                      </span>
                    )}
                  </h2>
                  <div className="space-y-3">
                    {dateSessions
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((session) => (
                        <motion.div
                          key={session.id}
                          layout
                          className="glass-dark rounded-xl p-5 border border-dark-800 flex items-center gap-4"
                        >
                          <div className="p-3 rounded-lg bg-primary-500/20 flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-primary-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{session.domainName}</p>
                            <div className="flex items-center gap-2 text-xs text-dark-400 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {session.startTime} – {session.endTime}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {date === today && (
                              <Link
                                href="/practice"
                                className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 hover:bg-primary-500 hover:text-white transition-all"
                              >
                                Start
                              </Link>
                            )}
                            <button
                              onClick={() => markSessionCompleted(session.id)}
                              className="p-2 rounded-lg bg-dark-700 hover:bg-green-500/20 hover:text-green-400 text-dark-400 transition-colors"
                              title="Mark complete"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeScheduledSession(session.id)}
                              className="p-2 rounded-lg bg-dark-700 hover:bg-red-500/20 hover:text-red-400 text-dark-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed sessions */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-dark-600 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Completed ({completed.length})
              </h2>
              <div className="space-y-2">
                {completed.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/30 border border-dark-800 opacity-50"
                  >
                    <div className="p-2 rounded-lg bg-green-500/20 flex-shrink-0">
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-300 truncate">{session.domainName}</p>
                      <p className="text-xs text-dark-600">
                        {formatDate(session.date)} • {session.startTime}
                      </p>
                    </div>
                    <button
                      onClick={() => removeScheduledSession(session.id)}
                      className="p-2 rounded-lg text-dark-600 hover:text-dark-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
