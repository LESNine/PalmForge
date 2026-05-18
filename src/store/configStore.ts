import { create } from 'zustand'
import type { ConfigParameter, DomainConfig, PalmParamsIndex, P3dFile } from '@/types'
import { parseP3dContent } from '@/utils/parseP3d'
import { detectDomainFromFilename } from '@/utils/domainUtils'
import paramIndexData from '@/data/palm_params_index.json'

const paramIndex = paramIndexData as PalmParamsIndex

const CATEGORY_NML_MAP: Record<string, string> = {
  'initialization-parameters': 'initialization_parameters',
  'runtime-parameters': 'runtime_parameters',
  'agent-parameters': 'agent_parameters',
  'biometeorology-parameters': 'biometeorology_parameters',
  'bulk-cloud-parameters': 'bulk_cloud_parameters',
  'chemistry-parameters': 'chemistry_parameters',
  'damping-parameters': 'damping_parameters',
  'dust-emission-and-transport-parameters': 'dust_parameters',
  'fastv8-coupler-parameters': 'fastv8_parameters',
  'flow-control-parameters': 'flow_parameters',
  'indoor-parameters': 'indoor_parameters',
  'land-surface-parameters': 'land_surface_parameters',
  'offline-nesting-parameters': 'offline_nesting_parameters',
  'nesting-parameters': 'nesting_parameters',
  'ocean-parameters': 'ocean_parameters',
  'particle-parameters': 'particle_parameters',
  'plant-canopy-parameters': 'plant_canopy_parameters',
  'radiation-parameters': 'radiation_parameters',
  'salsa-parameters': 'salsa_parameters',
  'slurb-parameters': 'slurb_parameters',
  'spectra-parameters': 'spectra_parameters',
  'synthetic-turbulence-generator-parameters': 'synthetic_turbulence_generator_parameters',
  'surface-data-output-parameters': 'surface_data_output_parameters',
  'traffic-module-parameters': 'traffic_parameters',
  'turbulent-inflow-parameters': 'turbulent_inflow_parameters',
  'urban-surface-parameters': 'urban_surface_parameters',
  'user-parameters': 'user_parameters',
  'uv-radiation-parameters': 'uvexposure_parameters',
  'virtual-flight-parameters': 'virtual_flight_parameters',
  'virtual-measurement-parameters': 'virtual_measurement_parameters',
  'wind-turbine-parameters': 'wind_turbine_parameters',
}

const NML_CATEGORY_MAP: Record<string, string> = {}
for (const [k, v] of Object.entries(CATEGORY_NML_MAP)) {
  NML_CATEGORY_MAP[v] = k
}

const REQUIRED_PARAMS: ConfigParameter[] = [
  { name: 'dx', category: 'initialization-parameters', type: 'real', value: '', default_value: null, description: 'Grid spacing in x-direction (m)', description_zh: 'x 方向网格间距 (m)', isRequired: true },
  { name: 'dy', category: 'initialization-parameters', type: 'real', value: '', default_value: null, description: 'Grid spacing in y-direction (m)', description_zh: 'y 方向网格间距 (m)', isRequired: true },
  { name: 'dz', category: 'initialization-parameters', type: 'real', value: '', default_value: null, description: 'Grid spacing in z-direction (m)', description_zh: 'z 方向网格间距 (m)', isRequired: true },
  { name: 'nx', category: 'initialization-parameters', type: 'integer', value: '', default_value: null, description: 'Number of grid points in x-direction', description_zh: 'x 方向网格点数', isRequired: true },
  { name: 'ny', category: 'initialization-parameters', type: 'integer', value: '', default_value: null, description: 'Number of grid points in y-direction', description_zh: 'y 方向网格点数', isRequired: true },
  { name: 'nz', category: 'initialization-parameters', type: 'integer', value: '', default_value: null, description: 'Number of grid points in z-direction', description_zh: 'z 方向网格点数', isRequired: true },
  { name: 'end_time', category: 'initialization-parameters', type: 'real', value: '0.0', default_value: '0.0', description: 'Simulation end time (s)', description_zh: '模拟结束时间 (s)', isRequired: true },
  { name: 'initializing_actions', category: 'initialization-parameters', type: 'character', value: 'inifor', default_value: 'inifor', description: 'Initialization method', description_zh: '初始化方式', isRequired: true },
  { name: 'bc_lr', category: 'initialization-parameters', type: 'character', value: 'cyclic', default_value: 'cyclic', description: 'Boundary condition along x', description_zh: 'x 方向边界条件', isRequired: true },
  { name: 'bc_ns', category: 'initialization-parameters', type: 'character', value: 'cyclic', default_value: 'cyclic', description: 'Boundary condition along y', description_zh: 'y 方向边界条件', isRequired: true },
  { name: 'bc_pt_b', category: 'initialization-parameters', type: 'character', value: 'dirichlet', default_value: 'dirichlet', description: 'Bottom boundary condition of potential temperature', description_zh: '位温底部边界条件', isRequired: true },
  { name: 'bc_pt_t', category: 'initialization-parameters', type: 'character', value: 'initial_gradient', default_value: 'initial_gradient', description: 'Top boundary condition of potential temperature', description_zh: '位温顶部边界条件', isRequired: true },
]

function createParentDomain(): DomainConfig {
  return {
    id: 'parent',
    label: '父域 (N01)',
    isParent: true,
    nestIndex: 1,
    parameters: REQUIRED_PARAMS.map((p) => ({ ...p })),
  }
}

function createChildDomain(index: number): DomainConfig {
  const childParams = REQUIRED_PARAMS.map((p) => ({ ...p, value: '' }))
  childParams.push(
    {
      name: 'nesting',
      category: 'nesting-parameters',
      type: 'logical',
      value: '.TRUE.',
      default_value: '.FALSE.',
      description: 'Flag to activate nesting',
      description_zh: '激活嵌套功能',
      isRequired: false,
    }
  )
  return {
    id: `child-${index}`,
    label: `子域 (N0${index})`,
    isParent: false,
    nestIndex: index,
    parameters: childParams,
  }
}

function computeNpe(nx: number, ny: number): number {
  const candidates = [1, 2, 4, 8, 16, 32, 64, 128]
  for (const npe of candidates) {
    for (let npex = 1; npex <= npe; npex++) {
      const npey = npe / npex
      if (npey !== Math.floor(npey)) continue
      if (nx % npex === 0 && ny % npey === 0) return npe
    }
  }
  return 1
}

function buildDomainLayouts(domains: DomainConfig[]): string {
  const parent = domains.find((d) => d.isParent)
  if (!parent) return ''

  const parentDx = parseFloat(parent.parameters.find((p) => p.name === 'dx')?.value || '0')
  const parentDy = parseFloat(parent.parameters.find((p) => p.name === 'dy')?.value || '0')
  const parentNx = parseInt(parent.parameters.find((p) => p.name === 'nx')?.value || '0', 10)
  const parentNy = parseInt(parent.parameters.find((p) => p.name === 'ny')?.value || '0', 10)
  const parentDomainX = parentDx * (parentNx + 1)
  const parentDomainY = parentDy * (parentNy + 1)

  const lines: string[] = []

  const parentNxVal = parseInt(parent.parameters.find((p) => p.name === 'nx')?.value || '0', 10)
  const parentNyVal = parseInt(parent.parameters.find((p) => p.name === 'ny')?.value || '0', 10)
  const parentNpe = computeNpe(parentNxVal, parentNyVal)
  lines.push(`'N01', 1, -1, ${parentNpe}, 0.0, 0.0, 0.0`)

  for (const d of domains) {
    if (d.isParent) continue
    const idx = d.nestIndex ?? 2
    const dx = parseFloat(d.parameters.find((p) => p.name === 'dx')?.value || '0')
    const dy = parseFloat(d.parameters.find((p) => p.name === 'dy')?.value || '0')
    const nx = parseInt(d.parameters.find((p) => p.name === 'nx')?.value || '0', 10)
    const ny = parseInt(d.parameters.find((p) => p.name === 'ny')?.value || '0', 10)
    const childDomainX = dx * (nx + 1)
    const childDomainY = dy * (ny + 1)

    let llx = 0
    let lly = 0
    if (parentDx > 0 && parentDy > 0 && parentDomainX > 0 && parentDomainY > 0) {
      llx = Math.round((parentDomainX - childDomainX) / 2 / parentDx) * parentDx
      lly = Math.round((parentDomainY - childDomainY) / 2 / parentDy) * parentDy
      llx = Math.max(4 * parentDx, llx)
      lly = Math.max(4 * parentDy, lly)
    }

    const npe = computeNpe(nx, ny)
    const name = idx < 10 ? `N0${idx}` : `N${idx}`
    lines.push(`'${name}', ${idx}, 1, ${npe}, ${llx.toFixed(1)}, ${lly.toFixed(1)}, 0.0`)
  }

  return lines.join(',\n                 ')
}

function lookupParamInfo(paramName: string): { type: string; default_value: string | null; description: string; description_zh?: string; category: string } | null {
  for (const cat of paramIndex.categories) {
    for (const p of cat.parameters) {
      if (p.name === paramName) {
        return { type: p.type, default_value: p.default_value, description: p.description, description_zh: p.description_zh, category: cat.id }
      }
    }
  }
  return null
}

function p3dToConfigParams(p3d: P3dFile): ConfigParameter[] {
  const params: ConfigParameter[] = []
  const seen = new Set<string>()

  for (const nml of p3d.namelists) {
    const categoryId = NML_CATEGORY_MAP[nml.name] || 'initialization-parameters'
    for (const [key, rawVal] of Object.entries(nml.parameters)) {
      if (seen.has(key)) continue
      seen.add(key)
      const info = lookupParamInfo(key)
      const isReq = REQUIRED_PARAMS.some((r) => r.name === key)
      let value = rawVal
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      params.push({
        name: key,
        category: info?.category || categoryId,
        type: info?.type || 'real',
        value,
        default_value: info?.default_value ?? null,
        description: info?.description || '',
        description_zh: info?.description_zh,
        isRequired: isReq,
      })
    }
  }

  for (const rp of REQUIRED_PARAMS) {
    if (!seen.has(rp.name)) {
      params.unshift({ ...rp })
    }
  }

  return params
}

interface ConfigStore {
  projectName: string
  domains: DomainConfig[]
  activeDomainId: string
  paramIndex: PalmParamsIndex

  setProjectName: (name: string) => void
  setActiveDomain: (id: string) => void
  addChildDomain: () => void
  removeChildDomain: (id: string) => void

  getActiveDomain: () => DomainConfig | undefined
  updateParamValue: (domainId: string, paramName: string, value: string) => void
  addParameter: (domainId: string, param: ConfigParameter) => void
  removeParameter: (domainId: string, paramName: string) => void
  getDomainLayouts: () => string

  importP3dFiles: (files: { name: string; content: string }[]) => void
  resetConfig: () => void
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  projectName: 'example',
  domains: [createParentDomain()],
  activeDomainId: 'parent',
  paramIndex,

  setProjectName: (name) => set({ projectName: name }),
  setActiveDomain: (id) => set({ activeDomainId: id }),

  addChildDomain: () => {
    const { domains } = get()
    const existingIndices = domains.filter((d) => !d.isParent).map((d) => d.nestIndex ?? 0)
    let nextIdx = 2
    while (existingIndices.includes(nextIdx)) nextIdx++
    const newDomain = createChildDomain(nextIdx)

    const parentDomain = domains.find((d) => d.isParent)
    let updatedParent = parentDomain
    if (parentDomain) {
      const hasNesting = parentDomain.parameters.some((p) => p.name === 'domain_layouts')
      if (!hasNesting) {
        updatedParent = {
          ...parentDomain,
          parameters: [
            ...parentDomain.parameters,
            {
              name: 'domain_layouts',
              category: 'nesting-parameters',
              type: 'character',
              value: buildDomainLayouts([...domains, newDomain]),
              default_value: null,
              description: 'Domain layout specification for nested domains',
              description_zh: '嵌套域布局规格',
              isRequired: false,
            },
          ],
        }
      } else {
        updatedParent = {
          ...parentDomain,
          parameters: parentDomain.parameters.map((p) =>
            p.name === 'domain_layouts'
              ? { ...p, value: buildDomainLayouts([...domains, newDomain]) }
              : p
          ),
        }
      }
    }

    const newDomains = domains.map((d) => (d.isParent && updatedParent ? updatedParent : d))
    set({ domains: [...newDomains, newDomain], activeDomainId: newDomain.id })
  },

  removeChildDomain: (id) => {
    const { domains, activeDomainId } = get()
    const filtered = domains.filter((d) => d.id !== id)

    const parentDomain = filtered.find((d) => d.isParent)
    if (parentDomain) {
      const hasNesting = filtered.some((d) => !d.isParent)
      if (!hasNesting) {
        const cleaned = {
          ...parentDomain,
          parameters: parentDomain.parameters.filter((p) => p.name !== 'domain_layouts'),
        }
        const idx = filtered.findIndex((d) => d.isParent)
        filtered[idx] = cleaned
      } else {
        const updated = {
          ...parentDomain,
          parameters: parentDomain.parameters.map((p) =>
            p.name === 'domain_layouts'
              ? { ...p, value: buildDomainLayouts(filtered) }
              : p
          ),
        }
        const idx = filtered.findIndex((d) => d.isParent)
        filtered[idx] = updated
      }
    }

    if (activeDomainId === id) {
      set({ domains: filtered, activeDomainId: 'parent' })
    } else {
      set({ domains: filtered })
    }
  },

  getActiveDomain: () => {
    const { domains, activeDomainId } = get()
    return domains.find((d) => d.id === activeDomainId)
  },

  updateParamValue: (domainId, paramName, value) => {
    set((state) => {
      const newDomains = state.domains.map((d) =>
        d.id === domainId
          ? { ...d, parameters: d.parameters.map((p) => (p.name === paramName ? { ...p, value } : p)) }
          : d
      )
      const gridParams = ['dx', 'dy', 'dz', 'nx', 'ny', 'nz']
      if (gridParams.includes(paramName)) {
        const parentIdx = newDomains.findIndex((d) => d.isParent)
        if (parentIdx >= 0) {
          const hasLayouts = newDomains[parentIdx].parameters.some((p) => p.name === 'domain_layouts')
          if (hasLayouts) {
            newDomains[parentIdx] = {
              ...newDomains[parentIdx],
              parameters: newDomains[parentIdx].parameters.map((p) =>
                p.name === 'domain_layouts'
                  ? { ...p, value: buildDomainLayouts(newDomains) }
                  : p
              ),
            }
          }
        }
      }
      return { domains: newDomains }
    })
  },

  addParameter: (domainId, param) => {
    set((state) => ({
      domains: state.domains.map((d) =>
        d.id === domainId
          ? { ...d, parameters: [...d.parameters.filter((p) => p.name !== param.name), param] }
          : d
      ),
    }))
  },

  removeParameter: (domainId, paramName) => {
    set((state) => ({
      domains: state.domains.map((d) =>
        d.id === domainId
          ? { ...d, parameters: d.parameters.filter((p) => p.name !== paramName) }
          : d
      ),
    }))
  },

  getDomainLayouts: () => {
    return buildDomainLayouts(get().domains)
  },

  importP3dFiles: (files) => {
    const p3dFiles = files.map((f) => parseP3dContent(f.content, f.name))

    let projectName = get().projectName
    const newDomains: DomainConfig[] = []
    let parentDomain: DomainConfig | null = null
    const childDomains: DomainConfig[] = []

    for (const p3d of p3dFiles) {
      const info = detectDomainFromFilename(p3d.filename)
      if (info.baseName) projectName = info.baseName
      const configParams = p3dToConfigParams(p3d)

      if (p3d.isChildDomain && p3d.nestIndex !== null) {
        const idx = p3d.nestIndex
        childDomains.push({
          id: idx === 1 ? 'parent' : `child-${idx}`,
          label: idx === 1 ? '父域 (N01)' : `子域 (N0${idx})`,
          isParent: idx === 1,
          nestIndex: idx,
          parameters: configParams,
        })
      } else {
        parentDomain = {
          id: 'parent',
          label: '父域 (N01)',
          isParent: true,
          nestIndex: 1,
          parameters: configParams,
        }
      }
    }

    if (parentDomain) newDomains.push(parentDomain)
    if (!parentDomain && childDomains.length > 0) {
      const n01 = childDomains.find((d) => d.nestIndex === 1)
      if (n01) {
        n01.id = 'parent'
        n01.label = '父域 (N01)'
        n01.isParent = true
        newDomains.push(n01)
        childDomains.splice(childDomains.indexOf(n01), 1)
      } else {
        newDomains.push(createParentDomain())
      }
    }
    if (!parentDomain && childDomains.length === 0) {
      newDomains.push(createParentDomain())
    }
    newDomains.push(...childDomains)

    set({ projectName, domains: newDomains, activeDomainId: 'parent' })
  },

  resetConfig: () => {
    set({
      projectName: 'example',
      domains: [createParentDomain()],
      activeDomainId: 'parent',
    })
  },
}))
