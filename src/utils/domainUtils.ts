export function detectDomainFromFilename(filename: string): { isParent: boolean; nestIndex: number | null; baseName: string } {
  const match = filename.match(/^(.+?)_N0(\d+)\.p3d$/i)
  if (match) {
    const idx = parseInt(match[2], 10)
    return { isParent: idx === 1, nestIndex: idx, baseName: match[1] }
  }
  const base = filename.replace(/\.p3d$/i, '')
  return { isParent: true, nestIndex: 1, baseName: base }
}

export function formatNestLabel(index: number): string {
  return `_N0${index}`
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}
