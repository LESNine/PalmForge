import type { ConfigParameter, P3dNamelist } from '@/types'

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

function formatValue(param: ConfigParameter): string {
  const v = param.value
  if (param.name === 'domain_layouts') {
    return v
  }
  if (param.type === 'character') {
    if (v.startsWith("'") && v.endsWith("'")) return v
    return `'${v}'`
  }
  if (param.type === 'logical') {
    const upper = v.toUpperCase()
    if (upper === '.T.' || upper === '.TRUE.' || upper === 'TRUE') return '.T.'
    if (upper === '.F.' || upper === '.FALSE.' || upper === 'FALSE') return '.F.'
    return v
  }
  return v
}

function adjustGridValue(name: string, value: string): string {
  if ((name === 'nx' || name === 'ny') && value.trim() !== '') {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) {
      return String(num - 1)
    }
  }
  return value
}

export function generateP3dContent(parameters: ConfigParameter[]): string {
  const namelistGroups: Record<string, ConfigParameter[]> = {}

  for (const param of parameters) {
    const nmlName = CATEGORY_NML_MAP[param.category] || 'initialization_parameters'
    if (!namelistGroups[nmlName]) namelistGroups[nmlName] = []
    namelistGroups[nmlName].push(param)
  }

  const orderedNames = [
    'initialization_parameters',
    'runtime_parameters',
    'agent_parameters',
    'biometeorology_parameters',
    'bulk_cloud_parameters',
    'chemistry_parameters',
    'damping_parameters',
    'dust_parameters',
    'fastv8_parameters',
    'flow_parameters',
    'indoor_parameters',
    'land_surface_parameters',
    'offline_nesting_parameters',
    'nesting_parameters',
    'ocean_parameters',
    'particle_parameters',
    'plant_canopy_parameters',
    'radiation_parameters',
    'salsa_parameters',
    'slurb_parameters',
    'spectra_parameters',
    'synthetic_turbulence_generator_parameters',
    'surface_data_output_parameters',
    'traffic_parameters',
    'turbulent_inflow_parameters',
    'urban_surface_parameters',
    'user_parameters',
    'uvexposure_parameters',
    'virtual_flight_parameters',
    'virtual_measurement_parameters',
    'wind_turbine_parameters',
  ]

  const parts: string[] = []

  for (const nmlName of orderedNames) {
    const params = namelistGroups[nmlName]
    if (!params || params.length === 0) continue

    const lines = params.map((p) => {
      const val = adjustGridValue(p.name, formatValue(p))
      if (p.name === 'domain_layouts') {
        return ` ${p.name} = ${val},`
      }
      return ` ${p.name} = ${val},`
    })
    parts.push(`&${nmlName}\n${lines.join('\n')}\n/`)
  }

  if (parts.length === 0) {
    return `&initialization_parameters\n/\n`
  }

  return parts.join('\n\n') + '\n'
}

export function generateFilename(projectName: string, isParent: boolean, nestIndex: number | null): string {
  if (isParent) return `${projectName}.p3d`
  return `${projectName}_N0${nestIndex}.p3d`
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
