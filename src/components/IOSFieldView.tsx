import { useState, useEffect } from 'react'
import { 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Menu,
  X,
  Clock,
  Users,
  Zap,
  Target
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
  const [activePanel, setActivePanel] = useState<'timer' | 'possession' | 'actions' | null>(null)
  const [timer, setTimer] = useState(0)

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      // Entrar em tela cheia
      document.documentElement.requestFullscreen?.()
    } else {
      // Sair da tela cheia
      document.exitFullscreen?.()
    }
  }

  const handlePossessionSelect = (teamId: string) => {
    setPossession(teamId)
    setActivePanel(null)
    setShowSidebar(false)
  }

  const handleActionComplete = () => {
    setActivePanel(null)
    setShowSidebar(false)
  }

  const openPanel = (panel: 'timer' | 'possession' | 'actions') => {
    setActivePanel(panel)
    setShowSidebar(true)
  }

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

        {/* Timer Flutuante - Canto Superior Esquerdo */}
        <div className="absolute top-4 left-4">
          <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl px-4 py-2">
            <div className="text-2xl font-mono font-bold text-center">
              {formatTime(timer)}
            </div>
          </div>
        </div>

        {/* Indicador de Posse - Centro Superior */}
        {currentMatch.currentPossession && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-2xl px-4 py-2 flex items-center space-x-2">
              <img 
                src={currentMatch.currentPossession === currentMatch.teamA.id 
                  ? currentMatch.teamA.logoUrl 
                  : currentMatch.teamB.logoUrl
                } 
                alt="Team logo"
                className="w-5 h-5 object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botões Laterais - Esquerda */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 translate-y-8 z-40 flex flex-col space-y-3">
        {/* Cronômetro */}
        <Button
          variant={activePanel === 'timer' ? 'default' : 'outline'}
          size="icon"
          onClick={() => openPanel('timer')}
          className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg"
        >
          <Clock className="h-4 w-4" />
        </Button>
        
        {/* Posse de Bola */}
        <Button
          variant={activePanel === 'possession' ? 'default' : 'outline'}
          size="icon"
          onClick={() => openPanel('possession')}
          className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg"
        >
          <Users className="h-4 w-4" />
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
      </div>

      {/* Painel Lateral Direito */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-72 sm:w-80 bg-background/95 backdrop-blur-md border-l border-border/50 transform transition-transform duration-300 z-30",
        showSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header do Painel */}
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {activePanel === 'timer' && 'Cronômetro'}
              {activePanel === 'possession' && 'Posse de Bola'}
              {activePanel === 'actions' && 'Registrar Ação'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowSidebar(false)
                setActivePanel(null)
              }}
              className="h-7 w-7 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conteúdo do Painel Ativo */}
        <div className="flex-1 overflow-y-auto p-3">
          {activePanel === 'timer' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold mb-3">
                  {formatTime(timer)}
                </div>
                
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                    className="h-10 w-10 rounded-full touch-target"
                  >
                    {currentMatch.isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="h-10 w-10 rounded-full touch-target"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'possession' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handlePossessionSelect(currentMatch.teamA.id)}
                  className={cn(
                    "w-full h-16 flex items-center justify-center p-3 touch-target",
                    currentMatch.currentPossession === currentMatch.teamA.id && 
                    "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <img 
                    src={currentMatch.teamA.logoUrl} 
                    alt={`${currentMatch.teamA.name} logo`}
                    className="w-10 h-10 object-contain"
                  />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handlePossessionSelect(currentMatch.teamB.id)}
                  className={cn(
                    "w-full h-16 flex items-center justify-center p-3 touch-target",
                    currentMatch.currentPossession === currentMatch.teamB.id && 
                    "ring-2 ring-primary bg-primary/10"
                  )}
                >
                  <img 
                    src={currentMatch.teamB.logoUrl} 
                    alt={`${currentMatch.teamB.name} logo`}
                    className="w-10 h-10 object-contain"
                  />
                </Button>
              </div>
            </div>
          )}

          {activePanel === 'actions' && (
            <div className="space-y-4">
              {currentMatch.currentPossession ? (
                <ActionPanel onClose={handleActionComplete} />
              ) : (
                <div className="text-center py-8">
                  <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Selecione a posse de bola primeiro
                  </p>
                </div>
              )}
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