import { useState, useEffect } from 'react'
import { 
  Maximize2, 
  Minimize2, 
  Clock,
  Users,
  Zap,
  History,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldGrid } from '@/components/FieldGrid'
import { useFutebolStore } from '@/stores/futebolStore'
import { ActionPanel } from '@/components/ActionPanel'
import { cn } from '@/lib/utils'

export function IOSFieldView() {
  const { currentMatch, togglePlayPause, updateTimer, setPossession } = useFutebolStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activePanel, setActivePanel] = useState<'actions' | 'history' | null>(null)
  const [timer, setTimer] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)

  // Sincronizar estado fullscreen com o navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (currentMatch?.isPlaying) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1
          updateTimer(newTime)
          return newTime
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentMatch?.isPlaying, updateTimer])

  useEffect(() => {
    if (currentMatch) {
      setTimer(currentMatch.currentTime)
    }
  }, [currentMatch])

  if (!currentMatch) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetTimer = () => {
    setTimer(0)
    updateTimer(0)
  }

  const handleTimerClick = () => {
    const now = Date.now()
    const timeDiff = now - lastClickTime
    
    if (timeDiff < 300) {
      // Duplo clique - resetar
      resetTimer()
    } else {
      // Clique simples - play/pause
      togglePlayPause()
    }
    
    setLastClickTime(now)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Entrar em tela cheia
      document.documentElement.requestFullscreen?.()
    } else {
      // Sair da tela cheia
      document.exitFullscreen?.()
    }
  }

  const handlePossessionSelect = (teamId: string) => {
    setPossession(teamId)
  }

  const handleActionComplete = () => {
    setActivePanel(null)
    setShowSidebar(false)
  }

  const openPanel = (panel: 'actions' | 'history') => {
    setActivePanel(panel)
    setShowSidebar(true)
  }

  const togglePossession = () => {
    if (!currentMatch.currentPossession) {
      // Se nenhum time está selecionado, selecionar o time A
      setPossession(currentMatch.teamA.id)
    } else if (currentMatch.currentPossession === currentMatch.teamA.id) {
      // Se time A está selecionado, alternar para time B
      setPossession(currentMatch.teamB.id)
    } else {
      // Se time B está selecionado, alternar para time A
      setPossession(currentMatch.teamA.id)
    }
  }

  // Determinar qual time está com a posse para mostrar no botão
  const currentPossessionTeam = currentMatch.currentPossession === currentMatch.teamA.id 
    ? currentMatch.teamA 
    : currentMatch.currentPossession === currentMatch.teamB.id 
      ? currentMatch.teamB 
      : null

  return (
    <div className={cn(
      "flex h-full relative overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 bg-background"
    )}>
      {/* Campo Principal */}
      <div className="flex-1 relative">
        <FieldGrid isFullscreen={isFullscreen} />
        
        {/* Controles Flutuantes - Canto Superior Direito */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
            className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Cronômetro Central */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl px-4 py-2">
            <div className="text-sm font-mono font-bold text-center">
              {formatTime(timer)}
            </div>
          </div>
        </div>
      </div>

      {/* Botões Laterais - Canto Inferior Esquerdo */}
      <div className="absolute left-4 bottom-4 z-40 flex space-x-3">
        {/* Cronômetro */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleTimerClick}
          className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg"
        >
          <Clock className="h-4 w-4" />
        </Button>
        
        {/* Posse de Bola - Mostra logo do time selecionado */}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePossession}
          className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg p-1"
        >
          {currentPossessionTeam ? (
            <img 
              src={currentPossessionTeam.logoUrl} 
              alt={`${currentPossessionTeam.name} logo`}
              className="w-6 h-6 object-contain"
            />
          ) : (
            <Users className="h-4 w-4" />
          )}
        </Button>
        
        {/* Registro de Ação */}
        <Button
          variant={activePanel === 'actions' ? 'default' : 'outline'}
          size="icon"
          onClick={() => openPanel('actions')}
          className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg"
        >
          <Zap className="h-4 w-4" />
        </Button>

        {/* Histórico de Ações */}
        <Button
          variant={activePanel === 'history' ? 'default' : 'outline'}
          size="icon"
          onClick={() => openPanel('history')}
          className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg"
        >
          <History className="h-4 w-4" />
        </Button>
      </div>

      {/* Painel Lateral Direito - Menor */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-56 sm:w-64 bg-background/95 backdrop-blur-md border-l border-border/50 transform transition-transform duration-300 z-30",
        showSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header do Painel */}
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {activePanel === 'actions' && 'Registrar Ação'}
              {activePanel === 'history' && 'Histórico de Ações'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSidebar(false)
                setActivePanel(null)
              }}
              className="h-6 w-6 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Conteúdo do Painel Ativo */}
        <div className="flex-1 overflow-y-auto p-3">
          {activePanel === 'actions' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">Registrar Ação</h3>
                {currentMatch.currentPossession && (
                  <div className="flex items-center justify-center space-x-2 p-2 bg-muted/30 rounded-lg">
                    <img 
                      src={currentPossessionTeam?.logoUrl} 
                      alt={currentPossessionTeam?.name}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-xs font-medium">{currentPossessionTeam?.name}</span>
                  </div>
                )}
              </div>
              {currentMatch.currentPossession ? (
                <ActionPanel onClose={handleActionComplete} />
              ) : (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Selecione a posse de bola primeiro
                  </p>
                </div>
              )}
            </div>
          )}

          {activePanel === 'history' && (
            <div className="space-y-3">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Últimas ações registradas
                </h3>
                <div className="text-xs text-muted-foreground">
                  Total: {currentMatch.actions.length} ações
                </div>
              </div>
              
              {/* Lista das últimas 10 ações */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {currentMatch.actions
                  .slice(-10)
                  .reverse()
                  .map((action, index) => {
                    const team = action.teamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB
                    return (
                      <div key={action.id} className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                        <img 
                          src={team.logoUrl} 
                          alt={team.name}
                          className="w-5 h-5 object-contain flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {action.actionName || (action.type === 'possession' ? 'Posse de Bola' : 'Ação')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.name} • {formatTime(action.timestamp)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                
                {currentMatch.actions.length === 0 && (
                  <div className="text-center py-8">
                    <History className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                    Nenhuma ação registrada ainda
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para fechar painel */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => {
            setShowSidebar(false)
            setActivePanel(null)
          }}
        />
      )}
    </div>
  )
}