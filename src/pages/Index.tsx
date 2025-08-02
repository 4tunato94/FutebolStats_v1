
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
  const [isMobileFullscreen, setIsMobileFullscreen] = useState(false)
  
  // Detectar dispositivo móvel e configurar fullscreen
  useEffect(() => {
    const isMobileDevice = () => {
      const userAgent = navigator.userAgent
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    }
    
    const setupMobileFullscreen = async () => {
      if (!isMobileDevice()) return
      
      // Configurar viewport dinamicamente
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui, shrink-to-fit=no')
      }
      
      // Aplicar estilos de fullscreen
      document.documentElement.style.height = '100vh'
      document.documentElement.style.height = '-webkit-fill-available'
      document.body.style.height = '100vh'
      document.body.style.height = '-webkit-fill-available'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = '0'
      document.body.style.left = '0'
      document.body.style.margin = '0'
      document.body.style.padding = '0'
      
      // Esconder barra de endereços
      const hideAddressBar = () => {
        setTimeout(() => {
          window.scrollTo(0, 1)
          document.body.scrollTop = 1
        }, 0)
      }
      
      hideAddressBar()
      
      // Múltiplas tentativas
      setTimeout(hideAddressBar, 100)
      setTimeout(hideAddressBar, 300)
      setTimeout(hideAddressBar, 500)
      setTimeout(hideAddressBar, 1000)
      
      // Listeners para manter fullscreen
      const handleOrientationChange = () => {
        setTimeout(() => {
          hideAddressBar()
          document.body.style.height = '100vh'
          document.body.style.height = '-webkit-fill-available'
        }, 100)
      }
      
      window.addEventListener('orientationchange', handleOrientationChange)
      window.addEventListener('resize', hideAddressBar)
      
      setIsMobileFullscreen(true)
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange)
        window.removeEventListener('resize', hideAddressBar)
        document.documentElement.style.height = ''
        document.body.style.height = ''
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        document.body.style.left = ''
      }
    }
    
    setupMobileFullscreen()
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
      <div className={`min-h-screen bg-background flex flex-col ios-field-container ${isMobileFullscreen ? 'mobile-fullscreen' : ''}`}>
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
    <div className={`min-h-screen bg-background flex flex-col ${isMobileFullscreen ? 'mobile-fullscreen' : ''}`}>
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
