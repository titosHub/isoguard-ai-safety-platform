import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { LockClosedIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEntitlements } from '../../entitlements/EntitlementsContext'
import { SOLUTIONS, solutionPath } from '../../solutions/registry'
import { useSector } from '../../solutions/SectorContext'

export default function SolutionsLanding() {
  const navigate = useNavigate()
  const location = useLocation()
  const { activeSolutionId, setActiveSolutionId } = useSector()
  const { loading, error, entitlements, isEntitled, requestAccess } = useEntitlements()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const lockedSectorFromRedirect = (location.state as any)?.lockedSector as string | undefined
  const lockedSolutionFromRedirect = useMemo(() => {
    if (!lockedSectorFromRedirect) return null
    return SOLUTIONS.find((s) => s.id === lockedSectorFromRedirect) ?? null
  }, [lockedSectorFromRedirect])

  const lockedSolutions = useMemo(() => {
    if (!entitlements) return []
    return SOLUTIONS.filter((s) => !entitlements.entitled_sectors.includes(s.id))
  }, [entitlements])

  const closeModal = () => {
    setModalOpen(false)
    setSelectedSectorId(null)
    setMessage('')
    setSubmitting(false)
    setSubmitResult(null)
    setSubmitError(null)
  }

  const submit = async () => {
    if (!selectedSectorId) return
    setSubmitting(true)
    setSubmitError(null)
    setSubmitResult(null)

    try {
      const res = await requestAccess(selectedSectorId, message.trim() || null)
      setSubmitResult(`Request received: ${res.id}`)
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Failed to submit access request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center">
              <img src="/isoguard-logo.svg" alt="IsoGuard.Ai" className="h-10 w-auto" />
            </div>

            <div className="sm:border-l sm:border-dashboard-border sm:pl-6">
              <h1 className="text-2xl font-bold text-white">Select a Solution</h1>
              <p className="mt-1 text-sm text-gray-400 max-w-2xl">
                Choose an industry solution to open the sector-specific dashboard.
              </p>
            </div>
          </div>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white"
            onClick={() => {
              setModalOpen(true)
              setSelectedSectorId(null)
            }}
          >
            <PlusIcon className="w-4 h-4" />
            Add Solution
          </button>
        </div>

        {lockedSectorFromRedirect && (
          <div className="mt-6 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm flex items-center justify-between gap-3">
            <div>
              Your subscription does not include{' '}
              <span className="font-semibold">{lockedSolutionFromRedirect?.name ?? lockedSectorFromRedirect}</span>.
              {' '}Request access to unlock it.
            </div>
            <button
              className="px-3 py-1.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-100 hover:bg-amber-500/25"
              onClick={() => {
                setModalOpen(true)
                setSelectedSectorId(lockedSectorFromRedirect)
              }}
            >
              Request access
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">{error}</div>
        )}

        {loading && (
          <div className="mt-6 text-sm text-gray-400">Checking subscription access…</div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((s, idx) => {
            const entitled = !loading && isEntitled(s.id)
            const isActive = entitled && activeSolutionId === s.id

            const onOpen = () => {
              setActiveSolutionId(s.id)
              navigate(solutionPath(s.id, s.defaultSlug))
            }

            const onLocked = () => {
              setModalOpen(true)
              setSelectedSectorId(s.id)
            }

            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                whileHover={entitled ? { y: -4 } : undefined}
                whileTap={entitled ? { scale: 0.99 } : undefined}
                onClick={entitled ? onOpen : onLocked}
                className={
                  `text-left rounded-2xl border ${s.accent.border} bg-gradient-to-br ${s.accent.from} ${s.accent.to} p-6 transition-colors ` +
                  (entitled ? 'hover:border-primary-500/40' : 'opacity-60 cursor-not-allowed')
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gray-900/40 border border-gray-700">
                      <s.icon className={`w-6 h-6 ${s.accent.icon}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-white">{s.name}</h2>
                        {isActive && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-primary-600/20 text-primary-300 border border-primary-500/30">
                            Current
                          </span>
                        )}
                        {!loading && !entitled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-900/40 text-gray-200 border border-gray-700">
                            <LockClosedIcon className="w-3.5 h-3.5" />
                            Locked
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{s.shortDescription}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    {loading ? 'Loading access…' : entitled ? 'Open dashboard' : 'Request access'}
                  </span>
                  <span className="text-sm font-medium text-white">→</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-8 text-xs text-gray-500">
          Subscribed solutions are active; locked ones can be unlocked via upgrade / admin approval.
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative w-full max-w-lg rounded-2xl border border-dashboard-border bg-dashboard-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Add / Unlock a Solution</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Request activation for additional sector solutions.
                </p>
              </div>
              <button className="p-2 text-gray-400 hover:text-white" onClick={closeModal}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {!selectedSectorId ? (
              <div className="mt-5 space-y-3">
                {lockedSolutions.length === 0 ? (
                  <div className="text-sm text-gray-300">No additional solutions available.</div>
                ) : (
                  lockedSolutions.map((s) => (
                    <button
                      key={s.id}
                      className="w-full text-left p-3 rounded-xl border border-dashboard-border hover:bg-dashboard-bg transition-colors"
                      onClick={() => setSelectedSectorId(s.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white font-medium">{s.name}</div>
                        <div className="text-xs text-gray-400">Request access</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="text-sm text-gray-300">
                  Request access to <span className="font-semibold">{selectedSectorId}</span>.
                </div>

                <textarea
                  className="w-full h-24 rounded-lg bg-dashboard-bg border border-dashboard-border text-gray-200 p-3 text-sm"
                  placeholder="Optional message (e.g. trial request, procurement contact, urgency, sites)…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                {submitError && (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                    {submitError}
                  </div>
                )}
                {submitResult && (
                  <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 text-sm">
                    {submitResult}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <button
                    className="px-4 py-2 rounded-lg border border-dashboard-border text-gray-200 hover:bg-dashboard-bg"
                    onClick={() => setSelectedSectorId(null)}
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    className="btn-primary"
                    onClick={submit}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Request Access'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
