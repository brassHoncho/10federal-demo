import { useEffect, useState } from 'react'
import TopNav from './components/shell/TopNav'
import HeaderStrip from './components/shell/HeaderStrip'
import Footer from './components/shell/Footer'
import CopilotDock from './components/shell/CopilotDock'
import OverviewTab from './tabs/OverviewTab'
import AccountingTab from './tabs/AccountingTab'
import OperationsTab from './tabs/OperationsTab'
import MarketingTab from './tabs/MarketingTab'
import InvestmentsTab from './tabs/InvestmentsTab'
import ConstructionTab from './tabs/ConstructionTab'
import RoadmapTab from './tabs/RoadmapTab'
import SettingsTab from './tabs/SettingsTab'

export type TabId =
  | 'overview'
  | 'accounting'
  | 'operations'
  | 'marketing'
  | 'investments'
  | 'construction'
  | 'roadmap'
  | 'settings'

const TABS: Record<TabId, () => React.ReactElement | null> = {
  overview: OverviewTab,
  accounting: AccountingTab,
  operations: OperationsTab,
  marketing: MarketingTab,
  investments: InvestmentsTab,
  construction: ConstructionTab,
  roadmap: RoadmapTab,
  settings: SettingsTab,
}

function readTabFromHash(): TabId {
  const h = window.location.hash.slice(1) as TabId
  return h in TABS ? h : 'overview'
}

export default function App() {
  const [tab, setTab] = useState<TabId>(readTabFromHash())

  useEffect(() => {
    const onHash = () => setTab(readTabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (window.location.hash !== `#${tab}`) {
      window.location.hash = `#${tab}`
    }
  }, [tab])

  const ActiveTab = TABS[tab]

  return (
    <div className="min-h-screen flex flex-col bg-10f-bg text-10f-text">
      <HeaderStrip />
      <TopNav active={tab} onChange={setTab} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 pb-40">
        <ActiveTab />
      </main>
      <Footer />
      <CopilotDock activeTab={tab} />
    </div>
  )
}
