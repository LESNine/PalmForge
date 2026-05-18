export interface Parameter {
  name: string
  type: 'real' | 'integer' | 'logical' | 'character' | 'derived data-type'
  default_value: string | null
  description: string
  description_zh?: string
}

export interface Category {
  id: string
  name: string
  parameters: Parameter[]
}

export interface PalmParamsIndex {
  categories: Category[]
}

export interface ConfigParameter {
  name: string
  category: string
  type: string
  value: string
  default_value: string | null
  description: string
  description_zh?: string
  isRequired: boolean
}

export interface DomainConfig {
  id: string
  label: string
  isParent: boolean
  nestIndex: number | null
  parameters: ConfigParameter[]
}

export interface PalmConfig {
  projectName: string
  domains: DomainConfig[]
  activeDomainId: string
  lastModified: number
}

export interface P3dNamelist {
  name: string
  parameters: Record<string, string>
}

export interface P3dFile {
  filename: string
  isChildDomain: boolean
  nestIndex: number | null
  namelists: P3dNamelist[]
}
