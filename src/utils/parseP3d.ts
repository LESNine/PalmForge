import type { P3dFile, P3dNamelist } from '@/types'

export function parseP3dContent(content: string, filename: string): P3dFile {
  const nestMatch = filename.match(/_N0(\d+)\.p3d$/i)
  const isChildDomain = !!nestMatch
  const nestIndex = nestMatch ? parseInt(nestMatch[1], 10) : null

  const namelists: P3dNamelist[] = []
  const lines = content.split('\n')

  let currentNamelist: P3dNamelist | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('!')) continue

    if (line.startsWith('&')) {
      const name = line.substring(1).trim()
      currentNamelist = { name, parameters: {} }
      continue
    }

    if (line === '/' && currentNamelist) {
      namelists.push(currentNamelist)
      currentNamelist = null
      continue
    }

    if (currentNamelist) {
      const cleaned = line.replace(/,\s*$/, '')
      const eqIdx = cleaned.indexOf('=')
      if (eqIdx > 0) {
        const key = cleaned.substring(0, eqIdx).trim()
        const val = cleaned.substring(eqIdx + 1).trim()
        currentNamelist.parameters[key] = val
      }
    }
  }

  return { filename, isChildDomain, nestIndex, namelists }
}

export function parseP3dFiles(files: { name: string; content: string }[]): P3dFile[] {
  return files.map((f) => parseP3dContent(f.content, f.name))
}
