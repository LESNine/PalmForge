import { ChevronDown, ChevronRight, Trash2, Download, Info } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { useUIStore } from '@/store/uiStore'
import { generateP3dContent, generateFilename, downloadFile } from '@/utils/generateP3d'
import type { ConfigParameter } from '@/types'
import paramOptionsData from '@/data/palm_param_options.json'

const PARAM_OPTIONS: Record<string, string[]> = {}
if (paramOptionsData.param_options) {
  for (const item of paramOptionsData.param_options) {
    PARAM_OPTIONS[item.param_name] = item.options
  }
}

export default function AddedParamsList() {
  const { domains, activeDomainId, removeParameter, updateParamValue, projectName } = useConfigStore()
  const { expandedCategories, toggleCategory, setSelectedParameter, setDetailPanelOpen } = useUIStore()
  const domain = domains.find((d) => d.id === activeDomainId)

  if (!domain) return null

  const optionalParams = domain.parameters.filter((p) => !p.isRequired)
  if (optionalParams.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-600 text-sm">
        暂无可选参数，点击下方按钮添加
      </div>
    )
  }

  const grouped: Record<string, ConfigParameter[]> = {}
  for (const p of optionalParams) {
    if (!grouped[p.category]) grouped[p.category] = []
    grouped[p.category].push(p)
  }

  const handleExportDomain = () => {
    const content = generateP3dContent(domain.parameters)
    const filename = generateFilename(projectName, domain.isParent, domain.nestIndex)
    downloadFile(content, filename)
  }

  const categoryNameMap: Record<string, string> = {}
  const { paramIndex } = useConfigStore.getState()
  for (const c of paramIndex.categories) {
    categoryNameMap[c.id] = c.name
  }

  const renderInput = (param: ConfigParameter) => {
    const options = PARAM_OPTIONS[param.name]

    if (options && options.length > 0) {
      if (param.type === 'logical') {
        return (
          <select
            value={param.value}
            onChange={(e) => updateParamValue(activeDomainId, param.name, e.target.value)}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <option value="">-- 选择 --</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      }
      return (
        <div className="flex-1 flex gap-1">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) updateParamValue(activeDomainId, param.name, e.target.value)
            }}
            className="bg-[#0d1117] border border-[#30363d] rounded-md px-2 py-1 text-sm text-zinc-400 focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer w-24"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <option value="">选项...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <input
            type="text"
            value={param.value}
            onChange={(e) => updateParamValue(activeDomainId, param.name, e.target.value)}
            placeholder={param.default_value || '...'}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>
      )
    }

    return (
      <input
        type="text"
        value={param.value}
        onChange={(e) => updateParamValue(activeDomainId, param.name, e.target.value)}
        placeholder={param.default_value || '...'}
        className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 transition-colors"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-cyan-400/80 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          可选参数 ({optionalParams.length})
        </h3>
        <button
          onClick={handleExportDomain}
          className="flex items-center gap-1 px-2 py-1 text-xs text-amber-400/70 border border-amber-500/20 rounded hover:bg-amber-500/10 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          导出当前域
        </button>
      </div>

      {Object.entries(grouped).map(([catId, params]) => {
        const isExpanded = expandedCategories.includes(catId)
        return (
          <div key={catId} className="bg-[#111827] border border-[#1e293b] rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(catId)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#0d1117] hover:bg-[#161b22] transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              )}
              <span className="text-sm font-medium text-zinc-400 flex-1 text-left">
                {categoryNameMap[catId] || catId}
              </span>
              <span className="text-xs text-zinc-600">{params.length}</span>
            </button>

            {isExpanded && (
              <div className="divide-y divide-[#1e293b]/50">
                {params.map((param) => (
                  <div key={param.name} className="px-4 py-2.5 hover:bg-[#161b22]/30 transition-colors group">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedParameter(param.name)
                          setDetailPanelOpen(true)
                        }}
                        className="text-zinc-600 hover:text-cyan-400 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <span
                        className="text-sm text-zinc-300 w-44 shrink-0 truncate font-medium"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        title={param.name}
                      >
                        {param.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#1e293b] text-zinc-500 shrink-0">
                        {param.type}
                      </span>
                      {renderInput(param)}
                      <button
                        onClick={() => removeParameter(activeDomainId, param.name)}
                        className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {param.description_zh && (
                      <p className="text-xs text-emerald-400/50 truncate mt-1 ml-7">
                        {param.description_zh.substring(0, 100)}{param.description_zh.length > 100 ? '...' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
