import { Plus } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export default function AddParamButton() {
  const { setSearchModalOpen } = useUIStore()

  return (
    <button
      onClick={() => setSearchModalOpen(true)}
      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-cyan-500/20 rounded-lg text-cyan-400/70 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
    >
      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
      <span className="text-sm">添加参数</span>
    </button>
  )
}
