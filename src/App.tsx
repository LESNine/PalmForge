import Header from '@/components/Header'
import DomainTabs from '@/components/DomainTabs'
import RequiredParams from '@/components/RequiredParams'
import AddedParamsList from '@/components/AddedParamsList'
import AddParamButton from '@/components/AddParamButton'
import ParamSearchModal from '@/components/ParamSearchModal'
import ParamDetailPanel from '@/components/ParamDetailPanel'

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-[#0a0f1a] text-zinc-200 overflow-hidden">
      <Header />
      <DomainTabs />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          <RequiredParams />
          <AddedParamsList />
          <AddParamButton />
        </div>
      </div>
      <ParamSearchModal />
      <ParamDetailPanel />
    </div>
  )
}
