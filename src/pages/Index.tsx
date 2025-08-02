
import { useState, useEffect } from 'react'
import { Home, History, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFutebolStore } from '@/stores/futebolStore'
import { TeamManager } from '@/components/TeamManager'
import { MatchSetup } from '@/components/MatchSetup'
import { StatsHeatMapTabs } from '@/components/StatsHeatMapTabs'
import { GameHistory } from '@/components/GameHistory'
import { ActionTypeManager } from '@/components/ActionTypeManager'
import { IOSHeader } from '@/components/IOSHeader'
import { IOSTabBar } from '@/components/IOSTabBar'
import { IOSCard } from '@/components/IOSCard'
import { IOSFieldView } from '@/components/IOSFieldView'
import { useCapacitor } from '@/hooks/useCapacitor'

const Index = () => {
  const { appState, currentMatch, endMatch, setAppState } = useFutebolStore()
  const { isNative } = useCapacitor()
  const [activeTab, setActiveTab] = useState('setup')
  
  if (appState === 'playing' && currentMatch) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        <IOSHeader
          title="Partida"
          subtitle={`${currentMatch.teamA.name} vs ${currentMatch.teamB.name}`}
          onBack={endMatch}
          className="z-40 flex-shrink-0"
        />
        
        <div className="flex-1 overflow-hidden relative min-h-0">
          <IOSFieldView />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <IOSHeader
        title="⚽ FutebolStats"
        subtitle="Análise Tática em Tempo Real"
        className="flex-shrink-0"
      />
      
      <div className="flex-1 overflow-y-auto pb-20 min-h-0">
        <div className="p-4 space-y-6 pb-safe">
          {activeTab === 'setup' && (
            <IOSCard 
              title="Iniciar Partida" 
              icon={<Home className="h-6 w-6 text-primary" />}
              className="shadow-lg"
            >
              <MatchSetup />
            </IOSCard>
          )}
          
          {activeTab === 'teams' && (
            <IOSCard 
              title="Gerenciar Times" 
              icon={<Users className="h-6 w-6 text-primary" />}
              className="shadow-lg"
            >
              <TeamManager />
            </IOSCard>
          )}
          
          {activeTab === 'actions' && (
            <IOSCard 
              title="Ações do Jogo" 
              icon={<Zap className="h-6 w-6 text-primary" />}
              className="shadow-lg"
            >
              <ActionTypeManager />
            </IOSCard>
          )}
          
          {activeTab === 'history' && (
            <IOSCard 
              title="Histórico de Jogos" 
              icon={<History className="h-6 w-6 text-primary" />}
              className="shadow-lg"
            >
              <GameHistory />
            </IOSCard>
          )}
        </div>
      </div>
      
      <IOSTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="flex-shrink-0"
      />
    </div>
  );
};

export default Index;
