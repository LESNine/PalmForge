import { Grid3X3, Clock, ArrowRightLeft } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { useUIStore } from '@/store/uiStore'
import paramOptionsData from '@/data/palm_param_options.json'

const PARAM_OPTIONS: Record<string, string[]> = {}
if (paramOptionsData.param_options) {
  for (const item of paramOptionsData.param_options) {
    PARAM_OPTIONS[item.param_name] = item.options
  }
}

const GROUPS = [
  {
    key: 'grid',
    label: '网格设置',
    icon: Grid3X3,
    layout: 'two-column' as const,
    leftCol: ['dx', 'dy', 'dz'],
    rightCol: ['nx', 'ny', 'nz'],
    leftLabel: '网格间距',
    rightLabel: '网格数',
  },
  {
    key: 'time',
    label: '时间与初始化',
    icon: Clock,
    layout: 'list' as const,
    params: ['end_time', 'initializing_actions'],
  },
  {
    key: 'boundary',
    label: '边界条件',
    icon: ArrowRightLeft,
    layout: 'list' as const,
    params: ['bc_lr', 'bc_ns', 'bc_pt_b', 'bc_pt_t'],
  },
]

export default function RequiredParams() {
  const { domains, activeDomainId, updateParamValue } = useConfigStore()
  const { setSelectedParameter, setDetailPanelOpen } = useUIStore()
  const domain = domains.find((d) => d.id === activeDomainId)

  if (!domain) return null

  const getParam = (name: string) => domain.parameters.find((p) => p.name === name)

  const renderInput = (pname: string) => {
    const param = getParam(pname)
    if (!param) return null
    const options = PARAM_OPTIONS[pname]

    return (
      <div key={pname} className="flex items-center gap-3">
        <label
          className="text-sm text-zinc-300 w-32 shrink-0 cursor-pointer hover:text-amber-300 transition-colors font-medium"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          onClick={() => {
            setSelectedParameter(pname)
            setDetailPanelOpen(true)
          }}
        >
          {pname}
        </label>
        {options && options.length > 0 ? (
          <select
            value={param.value}
            onChange={(e) => updateParamValue(activeDomainId, pname, e.target.value)}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors appearance-none cursor-pointer"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <option value="">-- 选择 --</option>
            {options.map((opt) => (
              <option key={opt} value={opt.replace(/^\./, '').replace(/\.$/, '')}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={param.value}
            onChange={(e) => updateParamValue(activeDomainId, pname, e.target.value)}
            placeholder={param.default_value || '...'}
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        )}
        <span className="text-xs text-zinc-600 w-10 text-right">
          {param.type === 'character' ? 'str' : param.type === 'real' ? 'float' : param.type === 'integer' ? 'int' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-amber-400/80 uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        必选参数
      </h3>
      {GROUPS.map((group) => {
        const Icon = group.icon
        return (
          <div key={group.key} className="bg-[#111827] border border-[#1e293b] rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d1117] border-b border-[#1e293b]">
              <Icon className="w-4 h-4 text-amber-400/60" />
              <span className="text-sm font-medium text-zinc-300">{group.label}</span>
            </div>
            {group.layout === 'two-column' ? (
              <div className="grid grid-cols-2 gap-6 p-4">
                <div>
                  <div className="text-xs text-zinc-500 mb-2 pl-1">{group.leftLabel}</div>
                  <div className="space-y-2">
                    {group.leftCol!.map((pname) => renderInput(pname))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-2 pl-1">{group.rightLabel}</div>
                  <div className="space-y-2">
                    {group.rightCol!.map((pname) => renderInput(pname))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {group.params!.map((pname) => renderInput(pname))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
