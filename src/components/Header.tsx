import { Upload, Download, RotateCcw, Wind } from 'lucide-react'
import { useConfigStore } from '@/store/configStore'
import { generateP3dContent, generateFilename, downloadFile } from '@/utils/generateP3d'
import { readFileAsText } from '@/utils/domainUtils'

export default function Header() {
  const { projectName, setProjectName, domains, importP3dFiles, resetConfig } = useConfigStore()

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.p3d'
    input.onchange = async () => {
      if (!input.files) return
      const files: { name: string; content: string }[] = []
      for (const f of Array.from(input.files)) {
        const content = await readFileAsText(f)
        files.push({ name: f.name, content })
      }
      if (files.length > 0) importP3dFiles(files)
    }
    input.click()
  }

  const handleExportAll = () => {
    for (const domain of domains) {
      const content = generateP3dContent(domain.parameters)
      const filename = generateFilename(projectName, domain.isParent, domain.nestIndex)
      downloadFile(content, filename)
    }
  }

  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#1e293b] flex items-center px-4 gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <Wind className="w-6 h-6 text-amber-400" />
        <span className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          PalmForge
        </span>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <label className="text-xs text-zinc-500">项目名:</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-[#161b22] border border-[#30363d] rounded px-2 py-0.5 text-sm text-zinc-200 w-36 focus:outline-none focus:border-amber-500/50"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
      </div>

      <div className="flex-1" />

      <button
        onClick={resetConfig}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white border border-[#30363d] rounded hover:border-zinc-500 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        重置
      </button>

      <button
        onClick={handleImport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        导入 p3d
      </button>

      <button
        onClick={handleExportAll}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/10 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        导出全部
      </button>
    </header>
  )
}
