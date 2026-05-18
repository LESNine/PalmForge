import { Plus, X, Globe, Layers } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'

export default function DomainTabs() {
  const { domains, activeDomainId, setActiveDomain, addChildDomain, removeChildDomain } = useConfigStore()

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-[#0d1117] border-b border-[#1e293b] overflow-x-auto shrink-0">
      {domains.map((d) => {
        const nestLabel = d.nestIndex ? `N0${d.nestIndex}` : 'N01'
        return (
          <div
            key={d.id}
            onClick={() => setActiveDomain(d.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-sm cursor-pointer transition-all select-none ${
              activeDomainId === d.id
                ? d.isParent
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 border-b-transparent'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 border-b-transparent'
              : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-[#161b22]'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {d.isParent ? <Globe className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            <span>{d.label}</span>
            {!d.isParent && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeChildDomain(d.id)
                }}
                className="ml-1 text-zinc-600 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )
      })}
      <button
        onClick={addChildDomain}
        className="flex items-center gap-1 px-2 py-1.5 text-sm text-cyan-500/70 hover:text-cyan-400 border border-dashed border-cyan-500/30 rounded hover:border-cyan-500/50 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        添加子域
      </button>
    </div>
  )
}
