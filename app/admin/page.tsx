'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine,
} from 'recharts'
import {
  Shield, Database, Tag, AlertTriangle, CheckCircle, Info,
  ChevronDown, ChevronUp, Search, Filter, BookOpen, Clock, Zap, Trophy,
  BarChart2, PieChart as PieChartIcon,
} from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { questions } from '@/data/questions'

// ─── Static computations (done once at module level) ───────────────────────────

const DOMAIN_NAMES: Record<number, string> = {
  1: 'Security & Risk Mgmt',
  2: 'Asset Security',
  3: 'Security Architecture',
  4: 'Comm. & Network Sec.',
  5: 'Identity & Access Mgmt',
  6: 'Security Assessment',
  7: 'Security Operations',
  8: 'Software Dev. Security',
}

const DOMAIN_FULL_NAMES: Record<number, string> = {
  1: 'Security and Risk Management',
  2: 'Asset Security',
  3: 'Security Architecture and Engineering',
  4: 'Communication and Network Security',
  5: 'Identity and Access Management',
  6: 'Security Assessment and Testing',
  7: 'Security Operations',
  8: 'Software Development Security',
}

const domainData = [1, 2, 3, 4, 5, 6, 7, 8].map((id) => {
  const qs = questions.filter((q) => q.domainId === id)
  return {
    id,
    name: DOMAIN_NAMES[id],
    fullName: DOMAIN_FULL_NAMES[id],
    count: qs.length,
    easy: qs.filter((q) => q.difficulty === 'easy').length,
    medium: qs.filter((q) => q.difficulty === 'medium').length,
    hard: qs.filter((q) => q.difficulty === 'hard').length,
    color: qs.length >= 9 ? '#10b981' : qs.length === 8 ? '#f59e0b' : '#ef4444',
  }
})

const totalQuestions = questions.length
const totalEasy = questions.filter((q) => q.difficulty === 'easy').length
const totalMedium = questions.filter((q) => q.difficulty === 'medium').length
const totalHard = questions.filter((q) => q.difficulty === 'hard').length

const allTags = questions.flatMap((q) => q.tags)
const uniqueTags = [...new Set(allTags)].sort()
const tagFrequency = uniqueTags.map((tag) => ({
  tag,
  count: allTags.filter((t) => t === tag).length,
})).sort((a, b) => b.count - a.count)

const EXAM_POOL = 50
const examOverlapPct = Math.round((EXAM_POOL / totalQuestions) * 100)

const difficultyData = [
  { name: 'Easy', value: totalEasy, color: '#10b981' },
  { name: 'Medium', value: totalMedium, color: '#f59e0b' },
  { name: 'Hard', value: totalHard, color: '#ef4444' },
]

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#e4e4e7' },
  itemStyle: { color: '#a1a1aa' },
}

const PRACTICE_MODES = [
  { icon: BookOpen, name: 'Mixed Practice', questions: `${totalQuestions}`, draw: 'All questions shuffled', time: 'Untimed', color: 'text-primary-400' },
  { icon: Filter, name: 'Focused Practice', questions: '7–10 per domain', draw: 'Filtered by domainId', time: 'Untimed', color: 'text-secondary-400' },
  { icon: Clock, name: 'Timed Practice', questions: `${totalQuestions}`, draw: 'All questions shuffled', time: '80s warning per Q', color: 'text-accent-400' },
  { icon: Trophy, name: 'Exam Simulator', questions: `${EXAM_POOL} (random)`, draw: `Random from ${totalQuestions}`, time: '3 hours total', color: 'text-yellow-400' },
]

// ─── Custom bar fill based on count ──────────────────────────────────────────
const CustomBarLabel = (props: { x?: number; y?: number; width?: number; height?: number; value?: number }) => {
  const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props
  return (
    <text x={x + width + 6} y={y + height / 2 + 5} fill="#a1a1aa" fontSize={12}>
      {value}
    </text>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  // Question browser state
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState<number | 'all'>('all')
  const [diffFilter, setDiffFilter] = useState<string>('all')
  const [tagSearch, setTagSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false
      if (domainFilter !== 'all' && q.domainId !== domainFilter) return false
      if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false
      if (tagSearch && !q.tags.some((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))) return false
      return true
    })
  }, [search, domainFilter, diffFilter, tagSearch])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navigation />

      <main className="container mx-auto px-4 py-8 safe-top safe-bottom max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-secondary-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-secondary-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Panel</h1>
              </div>
              <p className="text-dark-400 ml-13">Question Bank &amp; Content Analysis</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700">
              <Database className="w-4 h-4 text-dark-400" />
              <span className="text-dark-300 text-sm">{totalQuestions} questions · 8 domains</span>
            </div>
          </div>

          {/* ── Overview Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Questions', value: totalQuestions.toString(), sub: 'across all domains', icon: BookOpen, color: 'text-primary-400', bg: 'bg-primary-500/10' },
              { label: 'CISSP Domains', value: '8', sub: 'fully covered', icon: Shield, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
              { label: 'Unique Tags', value: uniqueTags.length.toString(), sub: `${allTags.length} total tag instances`, icon: Tag, color: 'text-accent-400', bg: 'bg-accent-500/10' },
              { label: 'Exam Pool Reuse', value: `${examOverlapPct}%`, sub: `${EXAM_POOL}/${totalQuestions} questions`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            ].map((card) => (
              <div key={card.label} className="glass-dark rounded-xl p-5 border border-dark-800">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-dark-400 mt-1 font-medium">{card.label}</p>
                <p className="text-xs text-dark-500 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Domain Breakdown ── */}
          <div className="glass-dark rounded-xl border border-dark-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary-400" />
              <h2 className="font-semibold text-white">Domain Breakdown</h2>
              <span className="ml-auto text-xs text-dark-500">Target: 8+ questions per domain</span>
            </div>

            <div className="p-6">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={domainData}
                  layout="vertical"
                  margin={{ top: 0, right: 40, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                  <XAxis type="number" domain={[0, 12]} tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#3f3f46' }} />
                  <YAxis type="category" dataKey="name" width={145} tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    {...TOOLTIP_STYLE}
                    formatter={(value: number, _: string, entry: { payload: typeof domainData[0] }) => [
                      `${value} questions (E:${entry.payload.easy} M:${entry.payload.medium} H:${entry.payload.hard})`,
                      'Count',
                    ]}
                  />
                  <ReferenceLine x={8} stroke="#6366f1" strokeDasharray="4 4" label={{ value: 'target', fill: '#818cf8', fontSize: 11, position: 'insideTopRight' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} label={<CustomBarLabel />}>
                    {domainData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Domain table */}
            <div className="overflow-x-auto border-t border-dark-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-800 bg-dark-900/50">
                    <th className="text-left px-6 py-3 text-dark-400 font-medium">Domain</th>
                    <th className="text-center px-3 py-3 text-dark-400 font-medium">Total</th>
                    <th className="text-center px-3 py-3 text-dark-400 font-medium">% of Bank</th>
                    <th className="text-center px-3 py-3 text-green-500 font-medium">Easy</th>
                    <th className="text-center px-3 py-3 text-yellow-500 font-medium">Medium</th>
                    <th className="text-center px-3 py-3 text-red-500 font-medium">Hard</th>
                  </tr>
                </thead>
                <tbody>
                  {domainData.map((d, i) => (
                    <tr key={d.id} className={`border-b border-dark-800/50 ${i % 2 === 0 ? '' : 'bg-dark-900/20'}`}>
                      <td className="px-6 py-3 text-dark-200">{d.fullName}</td>
                      <td className="px-3 py-3 text-center">
                        <span style={{ color: d.color }} className="font-semibold">{d.count}</span>
                      </td>
                      <td className="px-3 py-3 text-center text-dark-400">{Math.round((d.count / totalQuestions) * 100)}%</td>
                      <td className="px-3 py-3 text-center text-green-400">{d.easy}</td>
                      <td className="px-3 py-3 text-center text-yellow-400">{d.medium}</td>
                      <td className="px-3 py-3 text-center text-red-400">{d.hard}</td>
                    </tr>
                  ))}
                  <tr className="bg-dark-900/50 font-semibold">
                    <td className="px-6 py-3 text-dark-300">Total</td>
                    <td className="px-3 py-3 text-center text-white">{totalQuestions}</td>
                    <td className="px-3 py-3 text-center text-dark-400">100%</td>
                    <td className="px-3 py-3 text-center text-green-400">{totalEasy}</td>
                    <td className="px-3 py-3 text-center text-yellow-400">{totalMedium}</td>
                    <td className="px-3 py-3 text-center text-red-400">{totalHard}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Difficulty Distribution ── */}
          <div className="glass-dark rounded-xl border border-dark-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-800 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent-400" />
              <h2 className="font-semibold text-white">Difficulty Distribution</h2>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${Math.round(percent * 100)}%`}
                      labelLine={{ stroke: '#52525b' }}
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v} questions`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-4">
                {difficultyData.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-dark-200 text-sm font-medium">{d.name}</span>
                      </div>
                      <span className="text-dark-300 text-sm">{d.value} / {totalQuestions} ({Math.round((d.value / totalQuestions) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-dark-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${(d.value / totalQuestions) * 100}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-400 text-xs font-medium flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Real CISSP exam skews 70%+ toward hard &amp; medium difficulty. Current hard ratio is {Math.round((totalHard / totalQuestions) * 100)}%.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Content Gaps ── */}
          <div className="glass-dark rounded-xl border border-dark-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="font-semibold text-white">Content Gaps &amp; Recommendations</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: AlertTriangle,
                  severity: 'red',
                  title: 'Domain 6 is short',
                  body: 'Security Assessment & Testing has only 7 questions — below the 8–10 target. Consider adding 1–3 more questions covering SAST/DAST, pen test methodologies, or audit types.',
                },
                {
                  icon: AlertTriangle,
                  severity: 'yellow',
                  title: 'Hard questions underrepresented',
                  body: `Only ${totalHard} hard questions (${Math.round((totalHard / totalQuestions) * 100)}% of bank). The real CISSP exam uses complex scenario-based questions. Aim for 30–35% hard to better reflect exam conditions.`,
                },
                {
                  icon: AlertTriangle,
                  severity: 'yellow',
                  title: 'High exam pool overlap',
                  body: `Exam Simulator draws ${EXAM_POOL} from ${totalQuestions} questions (${examOverlapPct}% reuse). Expanding to 100+ questions would make repeated exam runs feel unique. Real CISSP draws 125–175 from a much larger pool.`,
                },
                {
                  icon: Info,
                  severity: 'blue',
                  title: 'Inconsistent answer count',
                  body: 'One question has 5 answer choices while all others have 4. Standardising to 4 choices improves consistency and matches CISSP exam format.',
                },
              ].map((gap) => {
                const colors = {
                  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-400', title: 'text-red-300' },
                  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', title: 'text-yellow-300' },
                  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-400', title: 'text-blue-300' },
                }[gap.severity]

                return (
                  <div key={gap.title} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      <gap.icon className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className={`font-semibold text-sm ${colors.title} mb-1`}>{gap.title}</p>
                        <p className="text-dark-300 text-sm leading-relaxed">{gap.body}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Practice Modes Config ── */}
          <div className="glass-dark rounded-xl border border-dark-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-400" />
              <h2 className="font-semibold text-white">Practice Modes Configuration</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-dark-800">
              {PRACTICE_MODES.map((mode) => (
                <div key={mode.name} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <mode.icon className={`w-5 h-5 ${mode.color}`} />
                    <span className="text-white font-medium text-sm">{mode.name}</span>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-dark-500 text-xs uppercase tracking-wide">Questions</dt>
                      <dd className="text-dark-200 font-medium">{mode.questions}</dd>
                    </div>
                    <div>
                      <dt className="text-dark-500 text-xs uppercase tracking-wide">Draw Method</dt>
                      <dd className="text-dark-200">{mode.draw}</dd>
                    </div>
                    <div>
                      <dt className="text-dark-500 text-xs uppercase tracking-wide">Time Limit</dt>
                      <dd className="text-dark-200">{mode.time}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>

          {/* ── Top Tags ── */}
          <div className="glass-dark rounded-xl border border-dark-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-800 flex items-center gap-2">
              <Tag className="w-5 h-5 text-secondary-400" />
              <h2 className="font-semibold text-white">Top Tags</h2>
              <span className="ml-auto text-xs text-dark-500">{uniqueTags.length} unique · {allTags.length} total instances</span>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {tagFrequency.slice(0, 30).map(({ tag, count }) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-dark-800 text-dark-200 border border-dark-700"
                  >
                    {tag}
                    {count > 1 && (
                      <span className="bg-dark-700 text-dark-400 rounded-full px-1.5 py-0.5 text-[10px]">{count}</span>
                    )}
                  </span>
                ))}
                {tagFrequency.length > 30 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs text-dark-500 bg-dark-900 border border-dark-800">
                    +{tagFrequency.length - 30} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Question Browser ── */}
          <div className="glass-dark rounded-xl border border-dark-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-800 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-400" />
                <h2 className="font-semibold text-white">Question Browser</h2>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-dark-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search text…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setExpandedId(null) }}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-dark-800 border border-dark-700 rounded-lg text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={domainFilter === 'all' ? 'all' : String(domainFilter)}
                  onChange={(e) => { setDomainFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setExpandedId(null) }}
                  className="py-1.5 px-3 text-sm bg-dark-800 border border-dark-700 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All domains</option>
                  {[1,2,3,4,5,6,7,8].map((id) => (
                    <option key={id} value={id}>D{id}: {DOMAIN_NAMES[id]}</option>
                  ))}
                </select>
                <select
                  value={diffFilter}
                  onChange={(e) => { setDiffFilter(e.target.value); setExpandedId(null) }}
                  className="py-1.5 px-3 text-sm bg-dark-800 border border-dark-700 rounded-lg text-dark-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 text-dark-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Tag filter…"
                    value={tagSearch}
                    onChange={(e) => { setTagSearch(e.target.value); setExpandedId(null) }}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-dark-800 border border-dark-700 rounded-lg text-dark-200 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              <span className="text-xs text-dark-400 whitespace-nowrap">
                {filteredQuestions.length} / {totalQuestions} shown
              </span>
            </div>

            <div className="divide-y divide-dark-800/60">
              {filteredQuestions.length === 0 ? (
                <div className="px-6 py-12 text-center text-dark-500">No questions match your filters.</div>
              ) : (
                filteredQuestions.map((q) => {
                  const isExpanded = expandedId === q.id
                  const diffColors: Record<string, string> = {
                    easy: 'bg-green-500/15 text-green-400 border-green-500/20',
                    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
                    hard: 'bg-red-500/15 text-red-400 border-red-500/20',
                  }

                  return (
                    <div key={q.id}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-dark-800/30 transition-colors text-left"
                      >
                        <span className="text-xs text-dark-500 font-mono mt-0.5 w-16 shrink-0">{q.id}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-dark-200 text-sm truncate pr-4">
                            {q.question}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-dark-500">D{q.domainId}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${diffColors[q.difficulty]}`}>
                              {q.difficulty}
                            </span>
                            {q.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-800 text-dark-400">{tag}</span>
                            ))}
                            {q.tags.length > 3 && (
                              <span className="text-[10px] text-dark-600">+{q.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-dark-500 shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-dark-500 shrink-0 mt-0.5" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 ml-19 space-y-3 border-t border-dark-800/50 pt-3 bg-dark-900/30">
                              <p className="text-white text-sm font-medium">{q.question}</p>
                              <div className="space-y-1.5">
                                {q.choices.map((choice, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
                                      idx === q.correctIndex
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                                        : 'bg-dark-800/50 text-dark-300'
                                    }`}
                                  >
                                    <span className={`font-mono text-xs mt-0.5 w-4 shrink-0 ${idx === q.correctIndex ? 'text-green-400' : 'text-dark-500'}`}>
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    {choice}
                                    {idx === q.correctIndex && (
                                      <CheckCircle className="w-3.5 h-3.5 text-green-400 ml-auto mt-0.5 shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50">
                                <p className="text-xs text-dark-400 font-semibold uppercase tracking-wide mb-1">Explanation</p>
                                <p className="text-dark-300 text-sm leading-relaxed">{q.explanation}</p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {q.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-dark-800 text-dark-400 border border-dark-700">{tag}</span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  )
}
