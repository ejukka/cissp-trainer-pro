'use client'

import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { useProgressStore } from '@/lib/store'
import { questions } from '@/data/questions'
import {
  Shield,
  Database,
  Lock,
  Network,
  Users,
  Activity,
  Code,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Target,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const domains = [
  {
    id: 1,
    name: 'Security and Risk Management',
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    weight: '15%',
    description: 'Risk management, legal and regulatory issues, professional ethics, security policies, and business continuity.',
    keyConcepts: [
      'CIA Triad (Confidentiality, Integrity, Availability)',
      'Quantitative vs Qualitative Risk Analysis',
      'ALE = SLE × ARO formula',
      'Risk treatment strategies: Accept, Mitigate, Transfer, Avoid',
      'Business Impact Analysis (BIA) and RTO/RPO',
      'NIST Risk Management Framework (RMF) steps',
      'ISC² Code of Ethics – four canons in priority order',
      'Separation of duties and dual control',
      'Types of law: Criminal, Civil, Administrative',
      'GDPR, HIPAA, SOX, PCI-DSS compliance frameworks',
    ],
    keyTerms: [
      { term: 'ALE', definition: 'Annual Loss Expectancy = SLE × ARO; expected yearly financial loss from a risk.' },
      { term: 'SLE', definition: 'Single Loss Expectancy = Asset Value × Exposure Factor; loss from one incident.' },
      { term: 'ARO', definition: 'Annualized Rate of Occurrence; how often a threat is expected per year.' },
      { term: 'RTO', definition: 'Recovery Time Objective; maximum acceptable downtime after a disaster.' },
      { term: 'RPO', definition: 'Recovery Point Objective; maximum acceptable data loss (measured in time).' },
      { term: 'BIA', definition: 'Business Impact Analysis; identifies critical functions and recovery priorities.' },
    ],
  },
  {
    id: 2,
    name: 'Asset Security',
    icon: Database,
    color: 'from-green-500 to-emerald-500',
    weight: '10%',
    description: 'Classifying and protecting information assets throughout their lifecycle.',
    keyConcepts: [
      'Data classification levels (government vs. commercial)',
      'Data ownership: Owner, Custodian, User roles',
      'Data lifecycle: Create, Store, Use, Share, Archive, Dispose',
      'Data states: At rest, In transit, In use',
      'Media sanitization: Clearing, Purging, Destruction',
      'Data remanence and secure deletion',
      'Privacy regulations and data handling requirements',
      'Scoping and tailoring NIST SP 800-53 controls',
      'Asset valuation methods for risk calculations',
      'Retention policies and legal hold',
    ],
    keyTerms: [
      { term: 'Data Owner', definition: 'Executive responsible for classifying and protecting data; defines access policies.' },
      { term: 'Data Custodian', definition: 'IT staff who implement the controls specified by the data owner.' },
      { term: 'Data Remanence', definition: 'Residual data on storage media that persists after deletion attempts.' },
      { term: 'Degaussing', definition: 'Destroying magnetic media by disrupting the magnetic field; renders media unusable.' },
      { term: 'Scoping', definition: 'Removing controls that don\'t apply to a specific system.' },
      { term: 'Tailoring', definition: 'Adjusting remaining controls to fit the organization\'s specific environment.' },
    ],
  },
  {
    id: 3,
    name: 'Security Architecture and Engineering',
    icon: Lock,
    color: 'from-purple-500 to-pink-500',
    weight: '13%',
    description: 'Security models, system security evaluation, cryptography, and physical security.',
    keyConcepts: [
      'Bell-LaPadula: Confidentiality (no read up, no write down)',
      'Biba: Integrity (no write up, no read down)',
      'Clark-Wilson: Integrity via well-formed transactions',
      'Brewer-Nash (Chinese Wall): Conflict of interest prevention',
      'Trusted Computing Base (TCB) and security perimeter',
      'Common Criteria EAL levels (EAL1–EAL7)',
      'Cryptography: Symmetric, Asymmetric, Hashing',
      'PKI: Certificates, CAs, CRLs, OCSP',
      'Defense in depth and layered security',
      'Covert channels: Storage and timing',
      'Fail-secure vs fail-open design',
      'Zero-day vulnerabilities',
    ],
    keyTerms: [
      { term: 'TCB', definition: 'Trusted Computing Base; all hardware/software/firmware enforcing the security policy.' },
      { term: 'EAL', definition: 'Evaluation Assurance Level; measures depth of security evaluation (1-7) in Common Criteria.' },
      { term: 'Non-repudiation', definition: 'Assurance that a party cannot deny having sent a message; via digital signatures.' },
      { term: 'Covert Channel', definition: 'Unintended communication path that violates security policy.' },
      { term: 'Fail-Secure', definition: 'System defaults to a secure state on failure (e.g., deny access).' },
      { term: 'PKI', definition: 'Public Key Infrastructure; system of digital certificates, CAs, and policies for key management.' },
    ],
  },
  {
    id: 4,
    name: 'Communication and Network Security',
    icon: Network,
    color: 'from-orange-500 to-red-500',
    weight: '13%',
    description: 'Network architecture, protocols, secure communications, and network attacks.',
    keyConcepts: [
      'OSI model layers and their security relevance',
      'TCP/IP protocols and common vulnerabilities',
      'Firewalls: Packet filter, Stateful, Proxy, NGFW',
      'IDS vs IPS: Detection vs Prevention',
      'VPN technologies: IPsec, SSL/TLS, L2TP',
      'IPsec: AH (auth+integrity) vs ESP (auth+integrity+encryption)',
      'Wireless security: WEP (weak), WPA2/WPA3',
      'IEEE 802.1X port-based access control',
      'NAT and PAT for address translation',
      'DNS security (DNSSEC, DNS poisoning)',
      'Common network attacks: DoS, MitM, ARP spoofing, VLAN hopping',
    ],
    keyTerms: [
      { term: 'IPsec AH', definition: 'Authentication Header; provides authentication, integrity, anti-replay—no encryption.' },
      { term: 'IPsec ESP', definition: 'Encapsulating Security Payload; adds encryption to AH capabilities.' },
      { term: 'Stateful Firewall', definition: 'Tracks connection state; makes decisions based on connection context.' },
      { term: 'NAT', definition: 'Network Address Translation; maps private IPs to public IPs for internet access.' },
      { term: 'VLAN', definition: 'Virtual LAN; logical network segment that separates traffic within a physical network.' },
      { term: '802.1X', definition: 'Port-based network access control; requires authentication before granting network access.' },
    ],
  },
  {
    id: 5,
    name: 'Identity and Access Management',
    icon: Users,
    color: 'from-indigo-500 to-blue-500',
    weight: '13%',
    description: 'Identity management, authentication, authorization, and access control models.',
    keyConcepts: [
      'Authentication factors: Know, Have, Are, Location',
      'Multi-factor authentication (MFA) requirements',
      'Access control models: DAC, MAC, RBAC, ABAC',
      'Kerberos: KDC, TGT, service tickets',
      'SAML, OAuth 2.0, OpenID Connect',
      'Single Sign-On (SSO) and federation',
      'Biometrics: FAR, FRR, CER (EER)',
      'Least privilege and need-to-know principles',
      'Account provisioning and deprovisioning lifecycle',
      'Privileged Access Management (PAM)',
      'LDAP and directory services',
    ],
    keyTerms: [
      { term: 'DAC', definition: 'Discretionary Access Control; object owners control access; most flexible, least secure.' },
      { term: 'MAC', definition: 'Mandatory Access Control; labels and clearances enforced by the system; most rigid.' },
      { term: 'RBAC', definition: 'Role-Based Access Control; access granted based on job roles; common in enterprise.' },
      { term: 'ABAC', definition: 'Attribute-Based Access Control; decisions based on multiple user/resource/environment attributes.' },
      { term: 'CER', definition: 'Crossover Error Rate; where FAR = FRR; lower CER = more accurate biometric system.' },
      { term: 'SAML', definition: 'Security Assertion Markup Language; XML-based protocol for federated identity and SSO.' },
    ],
  },
  {
    id: 6,
    name: 'Security Assessment and Testing',
    icon: Activity,
    color: 'from-yellow-500 to-orange-500',
    weight: '12%',
    description: 'Testing strategies, vulnerability assessments, penetration testing, and security audits.',
    keyConcepts: [
      'Vulnerability assessment vs penetration testing',
      'Black box, white box, gray box testing',
      'Penetration testing phases: Recon, Scanning, Exploitation, Post-exploitation',
      'CVSS scoring: Base, Temporal, Environmental metrics',
      'Static (SAST) vs Dynamic (DAST) application testing',
      'Fuzzing and mutation testing',
      'SOC reports: SOC 1, SOC 2 Type I and Type II',
      'Log review and SIEM analysis',
      'Code review types: peer, formal inspection',
      'Security regression testing',
      'Red team vs blue team vs purple team',
    ],
    keyTerms: [
      { term: 'CVSS', definition: 'Common Vulnerability Scoring System; standardized 0-10 scale for vulnerability severity.' },
      { term: 'SAST', definition: 'Static Application Security Testing; analyzes source code without executing it.' },
      { term: 'DAST', definition: 'Dynamic Application Security Testing; tests running application from the outside.' },
      { term: 'Fuzzing', definition: 'Sending random/malformed input to discover unexpected behavior and vulnerabilities.' },
      { term: 'Privilege Escalation', definition: 'Gaining higher access rights than initially obtained during a test.' },
      { term: 'SOC 2 Type II', definition: 'Audit report evaluating effectiveness of controls over a period of time (6-12 months).' },
    ],
  },
  {
    id: 7,
    name: 'Security Operations',
    icon: Activity,
    color: 'from-teal-500 to-green-500',
    weight: '13%',
    description: 'Incident response, monitoring, forensics, disaster recovery, and physical security.',
    keyConcepts: [
      'Incident response lifecycle: Prepare, Identify, Contain, Eradicate, Recover, Lessons Learned',
      'SOC roles and SIEM tools',
      'Digital forensics: Order of volatility',
      'Chain of custody requirements',
      'IDS/IPS: Signature vs anomaly-based detection',
      'Least privilege and need-to-know access',
      'Media sanitization for reuse vs disposal',
      'Disaster recovery: Hot, warm, cold sites',
      'Patch management and change management',
      'Physical security: CCTV, locks, mantrap, guards',
    ],
    keyTerms: [
      { term: 'Order of Volatility', definition: 'Collect most volatile evidence first: CPU/RAM → network → disk → backups.' },
      { term: 'Chain of Custody', definition: 'Documented record of evidence seizure, transfer, and handling for court admissibility.' },
      { term: 'Hot Site', definition: 'Fully configured DR facility; fastest recovery; most expensive.' },
      { term: 'Cold Site', definition: 'Facility with space/power but no equipment; slowest recovery; least expensive.' },
      { term: 'SIEM', definition: 'Security Information and Event Management; aggregates and correlates security logs.' },
      { term: 'Need to Know', definition: 'Access limited to information required for a specific current task, even among cleared personnel.' },
    ],
  },
  {
    id: 8,
    name: 'Software Development Security',
    icon: Code,
    color: 'from-pink-500 to-rose-500',
    weight: '11%',
    description: 'Secure SDLC, application vulnerabilities, and security in software development practices.',
    keyConcepts: [
      'Secure SDLC phases and security integration points',
      'DevSecOps: shifting security left',
      'OWASP Top 10 vulnerabilities',
      'Threat modeling: STRIDE, PASTA, DREAD',
      'SAST vs DAST vs IAST',
      'Input validation and output encoding',
      'SQL injection and XSS prevention',
      'CSRF protection: tokens and SameSite cookies',
      'Session management best practices',
      'Agile security considerations',
      'Third-party and open-source software risks',
    ],
    keyTerms: [
      { term: 'STRIDE', definition: 'Threat model: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.' },
      { term: 'DevSecOps', definition: 'Integrating security practices into the DevOps pipeline throughout the SDLC.' },
      { term: 'SQL Injection', definition: 'Inserting malicious SQL code into queries to manipulate the database.' },
      { term: 'XSS', definition: 'Cross-Site Scripting; injecting malicious scripts into web pages viewed by others.' },
      { term: 'CSRF', definition: 'Cross-Site Request Forgery; tricking authenticated users into sending unintended requests.' },
      { term: 'IAST', definition: 'Interactive Application Security Testing; combines SAST+DAST by analyzing app during execution with instrumentation.' },
    ],
  },
]

function StudyContent() {
  const searchParams = useSearchParams()
  const initialDomainId = searchParams.get('domain') ? parseInt(searchParams.get('domain')!) : null

  const [expandedDomain, setExpandedDomain] = useState<number | null>(initialDomainId)
  const [activeTab, setActiveTab] = useState<'concepts' | 'terms'>('concepts')
  const { progress } = useProgressStore()

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
              <h1 className="text-3xl md:text-4xl font-bold text-white">Study Mode</h1>
              <p className="text-dark-400 mt-2">Review key concepts and terminology for each domain</p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-sm"
            >
              Dashboard
            </Link>
          </div>

          {/* Domain list */}
          <div className="space-y-4">
            {domains.map((domain) => {
              const Icon = domain.icon
              const domainProgress = Math.round(progress[domain.id] || 0)
              const isExpanded = expandedDomain === domain.id
              const domainQs = questions.filter((q) => q.domainId === domain.id)

              return (
                <motion.div
                  key={domain.id}
                  layout
                  className="glass-dark rounded-xl border border-dark-800 overflow-hidden"
                >
                  {/* Domain header */}
                  <button
                    onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                    className="w-full p-6 flex items-center gap-4 hover:bg-dark-800/30 transition-colors text-left"
                  >
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${domain.color} flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">{domain.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-dark-700 text-dark-400">
                          Weight: {domain.weight}
                        </span>
                        {domainProgress >= 80 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                            Mastered
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-dark-400 mt-1 truncate">{domain.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex-1 max-w-48 bg-dark-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${domain.color}`}
                            style={{ width: `${domainProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-dark-500">{domainProgress}% complete</span>
                        <span className="text-xs text-dark-500">{domainQs.length} questions</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-dark-400" />
                    </motion.div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-6 border-t border-dark-700 pt-4">
                          {/* Tabs */}
                          <div className="flex gap-2">
                            {(['concepts', 'terms'] as const).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  activeTab === tab
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-800 text-dark-400 hover:text-white'
                                }`}
                              >
                                {tab === 'concepts' ? '📋 Key Concepts' : '📖 Key Terms'}
                              </button>
                            ))}
                            <Link
                              href={`/practice?domain=${domain.id}`}
                              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-dark-800 text-dark-300 hover:text-white hover:border-primary-500 border border-dark-700 transition-colors"
                            >
                              <Target className="w-4 h-4" />
                              Practice this domain
                            </Link>
                          </div>

                          {activeTab === 'concepts' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {domain.keyConcepts.map((concept, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-dark-800/50">
                                  <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-dark-200">{concept}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {domain.keyTerms.map((item, i) => (
                                <div key={i} className="p-4 rounded-lg bg-dark-800/50 border border-dark-700">
                                  <p className="font-semibold text-primary-400 text-sm mb-1">{item.term}</p>
                                  <p className="text-xs text-dark-300 leading-relaxed">{item.definition}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Sample question preview */}
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <BookOpen className="w-4 h-4 text-dark-400" />
                              <span className="text-sm text-dark-400">Sample questions from this domain</span>
                            </div>
                            <div className="space-y-2">
                              {domainQs.slice(0, 3).map((q) => (
                                <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-dark-900/50">
                                  <Circle className="w-3 h-3 text-dark-600 mt-1.5 flex-shrink-0" />
                                  <p className="text-xs text-dark-400 leading-relaxed">{q.question}</p>
                                  <span
                                    className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded ${
                                      q.difficulty === 'easy'
                                        ? 'bg-green-500/20 text-green-400'
                                        : q.difficulty === 'medium'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}
                                  >
                                    {q.difficulty}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />}>
      <StudyContent />
    </Suspense>
  )
}
