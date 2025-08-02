
import { useState, useEffect } from 'react'
import { Settings, Home, History, Zap, Users, BarChart3 } from 'lucide-react'
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
  
  // Detectar Safari iPhone e forçar fullscreen/landscape
  useEffect(() => {
    const isSafariIPhone = () => {
      const userAgent = navigator.userAgent
      const isIPhone = /iPhone/.test(userAgent)
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/CriOS/.test(userAgent)
      return isIPhone && isSafari
    }
    
    if (isSafariIPhone()) {
      // Aplicar classe para forçar fullscreen
      document.body.classList.add('safari-auto-fullscreen', 'safari-no-scroll')
      
      // Configurar viewport para fullscreen
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui')
      }
      
      // Tentar forçar orientação paisagem
      if ('screen' in window && 'orientation' in (window.screen as any)) {
        try {
          (window.screen as any).orientation.lock('landscape').catch(() => {
            console.log('Orientation lock not supported')
          })
        } catch (e) {
          console.log('Orientation API not available')
        }
      }
      
      // Cleanup ao desmontar
      return () => {
        document.body.classList.remove('safari-auto-fullscreen', 'safari-no-scroll')
      }
    }
  }, [])

  // Prevent zoom on iOS
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }
    
    document.addEventListener('touchstart', preventDefault, { passive: false })
    document.addEventListener('touchmove', preventDefault, { passive: false })
    
    return () => {
      document.removeEventListener('touchstart', preventDefault)
      document.removeEventListener('touchmove', preventDefault)
    }
  }, [])

  if (appState === 'playing' && currentMatch) {
    return (
      <div className="min-h-screen bg-background flex flex-col ios-field-container">
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
      />
      
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
