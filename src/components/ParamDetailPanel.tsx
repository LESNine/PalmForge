import { X, Type, Hash, ToggleLeft, Quote, BookOpen, Languages } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { useUIStore } from '@/store/uiStore'

export default function ParamDetailPanel() {
  const { detailPanelOpen, setDetailPanelOpen, selectedParameter } = useUIStore()
  const { paramIndex } = useConfigStore()

  if (!detailPanelOpen || !selectedParameter) return null

  let paramInfo: { name: string; type: string; default_value: string | null; description: string; description_zh?: string; categoryName: string } | null = null
  for (const cat of paramIndex.categories) {
    for (const p of cat.parameters) {
      if (p.name === selectedParameter) {
        paramInfo = { ...p, categoryName: cat.name }
        break
      }
    }
    if (paramInfo) break
  }

  if (!paramInfo) {
    return (
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0d1117] border-l border-[#1e293b] z-40 p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-zinc-400">参数详情</span>
          <button onClick={() => setDetailPanelOpen(false)} className="text-zinc-600 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-zinc-600 text-sm">未找到参数信息: {selectedParameter}</p>
      </div>
    )
  }

  const typeIcon = () => {
    switch (paramInfo.type) {
      case 'real': return <Type className="w-3.5 h-3.5" />
      case 'integer': return <Hash className="w-3.5 h-3.5" />
      case 'logical': return <ToggleLeft className="w-3.5 h-3.5" />
      case 'character': return <Quote className="w-3.5 h-3.5" />
      default: return <BookOpen className="w-3.5 h-3.5" />
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-30"
        onClick={() => setDetailPanelOpen(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-[460px] bg-[#0d1117] border-l border-[#1e293b] z-40 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e293b]">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">参数详情</span>
          <button onClick={() => setDetailPanelOpen(false)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <h2
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {paramInfo.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {typeIcon()}
                {paramInfo.type}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {paramInfo.categoryName}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">默认值</h4>
            <div className="bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2">
              <code
                className="text-sm text-amber-300"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {paramInfo.default_value || '(无默认值)'}
              </code>
            </div>
          </div>

          {paramInfo.description_zh && (
            <div>
              <h4 className="text-xs text-emerald-400/80 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Languages className="w-3 h-3" />
                中文说明
              </h4>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-emerald-200/80 leading-relaxed whitespace-pre-wrap">
                  {paramInfo.description_zh}
                </p>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">参数说明 (English)</h4>
            <div className="bg-[#111827] border border-[#1e293b] rounded-lg px-4 py-3">
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {paramInfo.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
