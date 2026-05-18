import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, Plus } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { useUIStore } from '@/store/uiStore'
import type { ConfigParameter, Parameter } from '@/types'

export default function ParamSearchModal() {
  const { searchModalOpen, setSearchModalOpen, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useUIStore()
  const { paramIndex, domains, activeDomainId, addParameter } = useConfigStore()
  const [highlightIdx, setHighlightIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const domain = domains.find((d) => d.id === activeDomainId)
  const existingNames = new Set(domain?.parameters.map((p) => p.name) || [])

  const categories = useMemo(() => {
    return paramIndex.categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: c.parameters.length,
    }))
  }, [paramIndex])

  const filteredParams = useMemo(() => {
    let params: (Parameter & { categoryId: string; categoryName: string })[] = []
    const sourceCategories = selectedCategory
      ? paramIndex.categories.filter((c) => c.id === selectedCategory)
      : paramIndex.categories

    for (const cat of sourceCategories) {
      for (const p of cat.parameters) {
        params.push({ ...p, categoryId: cat.id, categoryName: cat.name })
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const scored = params
        .map((p) => {
          const nameLower = p.name.toLowerCase()
          const descLower = p.description.toLowerCase()
          const descZhLower = (p.description_zh || '').toLowerCase()
          let score = 0
          if (nameLower === q) score = 100
          else if (nameLower.startsWith(q)) score = 80
          else if (nameLower.includes(q)) score = 60
          else if (descZhLower.includes(q)) score = 40
          else if (descLower.includes(q)) score = 20
          else return null
          const idx = nameLower.indexOf(q)
          if (idx === 0) score += 10
          return { param: p, score }
        })
        .filter((x): x is { param: typeof params[0]; score: number } => x !== null)
      scored.sort((a, b) => b.score - a.score)
      params = scored.map((s) => s.param)
    }

    return params
  }, [paramIndex, searchQuery, selectedCategory])

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setHighlightIdx(0)
    }
  }, [searchModalOpen])

  useEffect(() => {
    setHighlightIdx(0)
  }, [searchQuery, selectedCategory])

  const handleAdd = (param: Parameter & { categoryId: string; categoryName: string }) => {
    if (existingNames.has(param.name)) return
    const configParam: ConfigParameter = {
      name: param.name,
      category: param.categoryId,
      type: param.type,
      value: param.default_value || '',
      default_value: param.default_value,
      description: param.description,
      description_zh: param.description_zh,
      isRequired: false,
    }
    addParameter(activeDomainId, configParam)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx((i) => Math.min(i + 1, filteredParams.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filteredParams[highlightIdx]) {
      handleAdd(filteredParams[highlightIdx])
    } else if (e.key === 'Escape') {
      setSearchModalOpen(false)
    }
  }

  if (!searchModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={() => setSearchModalOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-[740px] max-h-[70vh] bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e293b]">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索参数名称、中英文描述..."
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button onClick={() => setSearchModalOpen(false)} className="text-zinc-600 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-[#1e293b] overflow-x-auto px-2 py-1 gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-0.5 text-[10px] rounded whitespace-nowrap transition-colors ${
              !selectedCategory ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id === selectedCategory ? null : c.id)}
              className={`px-2 py-0.5 text-[10px] rounded whitespace-nowrap transition-colors ${
                selectedCategory === c.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredParams.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">未找到匹配参数</div>
          ) : (
            filteredParams.map((param, idx) => {
              const exists = existingNames.has(param.name)
              const zhDesc = param.description_zh
              return (
                <div
                  key={param.categoryId + '-' + param.name}
                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                    idx === highlightIdx ? 'bg-[#161b22]' : 'hover:bg-[#161b22]/50'
                  } ${exists ? 'opacity-40' : ''}`}
                  onClick={() => !exists && handleAdd(param)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm text-zinc-200"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {param.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e293b] text-zinc-500">
                        {param.type}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400/70">
                        {param.categoryName}
                      </span>
                    </div>
                    {zhDesc && (
                      <p className="text-xs text-emerald-400/70 truncate mt-0.5">
                        {zhDesc.substring(0, 100)}{zhDesc.length > 100 ? '...' : ''}
                      </p>
                    )}
                    <p className="text-xs text-zinc-600 truncate mt-0.5">
                      {param.description.substring(0, 120)}...
                    </p>
                  </div>
                  {exists ? (
                    <span className="text-[10px] text-zinc-600">已添加</span>
                  ) : (
                    <Plus className="w-4 h-4 text-cyan-500/60 shrink-0" />
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-[#1e293b] text-[10px] text-zinc-600">
          <span>↑↓ 导航 · Enter 添加 · Esc 关闭</span>
          <span>{filteredParams.length} 个参数</span>
        </div>
      </div>
    </div>
  )
}
