
import { useState, useEffect } from 'react'
import { Settings, Home, History, Zap, Users, BarChart3, Smartphone } from 'lucide-react'
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

const Index = () => {
  const { appState, currentMatch, endMatch, setAppState } = useFutebolStore()
  const [activeTab, setActiveTab] = useState('setup')
  const [isMobile, setIsMobile] = useState(false)
  const [showDevicePreview, setShowDevicePreview] = useState(false)
  
  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobile(checkMobile)
  }, [])

  const toggleDevicePreview = () => {
    setShowDevicePreview(!showDevicePreview)
    
    if (!showDevicePreview) {
      // Aplicar estilos de device preview
      document.body.style.cssText = `
        margin: 0;
        padding: 20px;
        background: #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `
      
      const root = document.getElementById('root')
      if (root) {
        root.style.cssText = `
          width: 375px;
          height: 812px;
          border: 8px solid #333;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0,0,0,0.3);
          background: white;
          position: relative;
        `
      }
    } else {
      // Remover estilos de device preview
      document.body.style.cssText = ''
      const root = document.getElementById('root')
      if (root) {
        root.style.cssText = ''
      }
    }
  }
  if (appState === 'playing' && currentMatch) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <IOSHeader
          title="Partida"
          subtitle={`${currentMatch.teamA.name} vs ${currentMatch.teamB.name}`}
          onBack={endMatch}
          className="z-40"
        />
        
        <div className="flex-1 overflow-hidden relative">
          <IOSFieldView />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <IOSHeader
        title="⚽ FutebolStats"
        subtitle="Análise Tática em Tempo Real"
        onMore={toggleDevicePreview}
      />
      
      {/* Botão flutuante de device preview */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant={showDevicePreview ? "default" : "outline"}
          size="icon"
          onClick={toggleDevicePreview}
          className="rounded-full shadow-lg"
        >
          <Smartphone className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {activeTab === 'setup' && (
            <IOSCard title="Iniciar Partida" icon={<Home className="h-5 w-5 text-primary" />}>
              <MatchSetup />
            </IOSCard>
          )}
          
          {activeTab === 'teams' && (
            <IOSCard title="Gerenciar Times" icon={<Users className="h-5 w-5 text-primary" />}>
              <TeamManager />
            </IOSCard>
          )}
          
          {activeTab === 'actions' && (
            <IOSCard title="Ações do Jogo" icon={<Zap className="h-5 w-5 text-primary" />}>
              <ActionTypeManager />
            </IOSCard>
          )}
          
          {activeTab === 'history' && (
            <IOSCard title="Histórico de Jogos" icon={<History className="h-5 w-5 text-primary" />}>
              <GameHistory />
            </IOSCard>
          )}
        </div>
      </div>
      
      <IOSTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default Index;
