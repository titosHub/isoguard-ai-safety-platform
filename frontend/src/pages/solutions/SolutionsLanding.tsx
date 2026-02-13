import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SOLUTIONS, solutionPath } from '../../solutions/registry'
import { useSector } from '../../solutions/SectorContext'

export default function SolutionsLanding() {
  const navigate = useNavigate()
  const { activeSolutionId, setActiveSolutionId } = useSector()

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="max-w-6xl mx-auto px-6 py-10">
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

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((s, idx) => {
            const isActive = activeSolutionId === s.id

            return (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setActiveSolutionId(s.id)
                  navigate(solutionPath(s.id, s.defaultSlug))
                }}
                className={`text-left rounded-2xl border ${s.accent.border} bg-gradient-to-br ${s.accent.from} ${s.accent.to} p-6 hover:border-primary-500/40 transition-colors`}
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
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{s.shortDescription}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Open dashboard</span>
                  <span className="text-sm font-medium text-white">→</span>
                </div>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-8 text-xs text-gray-500">
          The sidebar will automatically adapt to the active solution context.
        </div>
      </div>
    </div>
  )
}
