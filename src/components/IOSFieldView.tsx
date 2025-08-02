import { useState, useEffect } from 'react'
import { 
  Maximize2, 
  Minimize2, 
  Clock,
  Users,
  Zap,
  History,
  X,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldGrid } from '@/components/FieldGrid'
import { useFutebolStore } from '@/stores/futebolStore'
import { ActionPanel } from '@/components/ActionPanel'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  message: string
  type: 'error' | 'success' | 'warning' | 'info'
  duration?: number
}

export function IOSFieldView() {
  const { currentMatch, togglePlayPause, updateTimer, setPossession } = useFutebolStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activePanel, setActivePanel] = useState<'actions' | 'history' | null>(null)
  const [timer, setTimer] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLandscape, setIsLandscape] = useState(false)

  // Detectar se é Safari no iPhone
  const isSafariIPhone = () => {
    const userAgent = navigator.userAgent
    return /iPhone/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
  }

  // Detectar orientação
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }

    checkOrientation()
    window.addEventListener('orientationchange', checkOrientation)
    window.addEventListener('resize', checkOrientation)

    return () => {
      window.removeEventListener('orientationchange', checkOrientation)
      window.removeEventListener('resize', checkOrientation)
    }
  }, [])

  // Configurar fullscreen e orientação quando o componente monta
  useEffect(() => {
    const setupFullscreen = async () => {
      try {
        if (isSafariIPhone()) {
          // Para Safari iPhone, usar viewport meta e CSS
          const viewport = document.querySelector('meta[name="viewport"]')
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
          }
          
          // Forçar orientação paisagem no Safari iPhone
          if ('screen' in window && 'orientation' in (window.screen as any)) {
            try {
              await (window.screen as any).orientation.lock('landscape')
            } catch (e) {
              console.log('Orientation lock not supported')
            }
          }
          
          // Simular fullscreen com CSS
          document.body.style.overflow = 'hidden'
          setIsFullscreen(true)
        } else {
          // Para outros navegadores, usar fullscreen API
          const docEl = document.documentElement
          if (docEl.requestFullscreen) {
            await docEl.requestFullscreen()
          } else if ((docEl as any).webkitRequestFullscreen) {
            await (docEl as any).webkitRequestFullscreen()
          } else if ((docEl as any).mozRequestFullScreen) {
            await (docEl as any).mozRequestFullScreen()
          } else if ((docEl as any).msRequestFullscreen) {
            await (docEl as any).msRequestFullscreen()
          }
        }
      } catch (error) {
        console.warn('Fullscreen setup failed:', error)
        // Fallback: simular fullscreen
        document.body.style.overflow = 'hidden'
        setIsFullscreen(true)
      }
    }

    setupFullscreen()

    return () => {
      // Cleanup
      document.body.style.overflow = ''
    }
  }, [])

  // Sincronizar estado fullscreen com o navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Verificar diferentes propriedades de fullscreen
      const isFullscreenActive = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isFullscreenActive)
    }

    // Adicionar listeners para diferentes navegadores
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Sistema de notificações customizado
  const showNotification = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info', duration = 3000) => {
    const id = Date.now().toString()
    const notification: Notification = { id, message, type, duration }
    
    setNotifications(prev => [...prev, notification])
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Interceptar alerts nativos quando em fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const originalAlert = window.alert
      window.alert = (message: string) => {
        showNotification(message, 'warning')
      }
      
      // Escutar eventos customizados de notificação
      const handleCustomNotification = (event: CustomEvent) => {
        const { message, type } = event.detail
        showNotification(message, type)
      }
      
      window.addEventListener('showNotification', handleCustomNotification as EventListener)
      
      return () => {
        window.alert = originalAlert
        window.removeEventListener('showNotification', handleCustomNotification as EventListener)
      }
    } else {
      // Também escutar eventos quando não está em fullscreen
      const handleCustomNotification = (event: CustomEvent) => {
        const { message, type } = event.detail
        showNotification(message, type)
      }
      
      window.addEventListener('showNotification', handleCustomNotification as EventListener)
      
      return () => {
        window.removeEventListener('showNotification', handleCustomNotification as EventListener)
      }
    }
  }, [isFullscreen])
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
    try {
      if (!document.fullscreenElement) {
        // Entrar em tela cheia - tentar diferentes métodos
        const docEl = document.documentElement
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen()
        } else if ((docEl as any).webkitRequestFullscreen) {
          // Safari
          (docEl as any).webkitRequestFullscreen()
        } else if ((docEl as any).mozRequestFullScreen) {
          // Firefox
          (docEl as any).mozRequestFullScreen()
        } else if ((docEl as any).msRequestFullscreen) {
          // IE/Edge
          (docEl as any).msRequestFullscreen()
        }
      } else {
        // Sair da tela cheia - tentar diferentes métodos
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          // Safari
          (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          // Firefox
          (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          // IE/Edge
          (document as any).msExitFullscreen()
        }
      }
    } catch (error) {
      console.warn('Fullscreen not supported or failed:', error)
      // Fallback: simular fullscreen com CSS
      setIsFullscreen(!isFullscreen)
    }
  }

  const exitAnalysis = () => {
    try {
      if (isSafariIPhone()) {
        // Para Safari iPhone, restaurar viewport e orientação
        const viewport = document.querySelector('meta[name="viewport"]')
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
        }
        
        // Restaurar overflow
        document.body.style.overflow = ''
        
        // Tentar desbloquear orientação
        if ('screen' in window && 'orientation' in (window.screen as any)) {
          try {
            (window.screen as any).orientation.unlock()
          } catch (e) {
            console.log('Orientation unlock not supported')
          }
        }
      } else {
        // Para outros navegadores, sair do fullscreen
        if (document.fullscreenElement) {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen()
          } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen()
          } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen()
          }
        }
      }
    } catch (error) {
      console.warn('Exit fullscreen failed:', error)
    }
    
    // Voltar para a tela principal
    setTimeout(() => {
      window.history.back()
    }, 100)
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

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'error': return 'bg-red-500/90 text-white border-red-600'
      case 'success': return 'bg-green-500/90 text-white border-green-600'
      case 'warning': return 'bg-yellow-500/90 text-black border-yellow-600'
      case 'info': return 'bg-blue-500/90 text-white border-blue-600'
      default: return 'bg-gray-500/90 text-white border-gray-600'
    }
  }
  return (
    <div className={cn(
      "flex h-full relative",
      isFullscreen ? "fixed inset-0 z-50 bg-black safari-fullscreen safari-viewport-fill overflow-hidden" : "overflow-hidden",
      isSafariIPhone() && isFullscreen && "safari-iphone-fullscreen"
    )}>
      {/* Campo Principal */}
      <div className={cn(
        "flex-1 relative flex items-center justify-center",
        isFullscreen && "w-screen h-screen p-2",
        isSafariIPhone() && isFullscreen && isLandscape && "safari-landscape-field"
      )}>
        <FieldGrid isFullscreen={isFullscreen} />
        
        {/* Sistema de Notificações Customizado */}
        {notifications.length > 0 && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 pointer-events-none">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-center space-x-2 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2 fade-in-0 duration-300",
                  getNotificationColor(notification.type),
                  "pointer-events-auto"
                )}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">{notification.message}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNotification(notification.id)}
                  className="h-6 w-6 ml-2 hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Controles Flutuantes - Canto Superior Direito */}
        {/* Botão de Sair - Canto Inferior Direito */}
        <div className="absolute bottom-4 right-4">
          <Button
            variant="destructive"
            size="icon"
            onClick={exitAnalysis}
            className="h-12 w-12 rounded-full bg-destructive/90 backdrop-blur-sm border-destructive/50 touch-target shadow-lg active:scale-95 transition-transform hover:bg-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cronômetro Central */}
        <div className={cn(
          "absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-30",
          isFullscreen ? "top-4" : "top-2"
        )}>
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
          className="h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg active:scale-95 transition-transform"
        >
          <Clock className="h-5 w-5" />
        </Button>
        
        {/* Posse de Bola - Mostra logo do time selecionado */}
        <Button
          variant="outline"
          size="icon"
          onClick={togglePossession}
          className="h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg p-1 active:scale-95 transition-transform"
        >
          {currentPossessionTeam ? (
            <img 
              src={currentPossessionTeam.logoUrl} 
              alt={`${currentPossessionTeam.name} logo`}
              className="w-7 h-7 object-contain"
            />
          ) : (
            <Users className="h-5 w-5" />
          )}
        </Button>
        
        {/* Registro de Ação */}
        <Button
          variant={activePanel === 'actions' ? 'default' : 'outline'}
          size="icon"
          onClick={() => openPanel('actions')}
          className="h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg active:scale-95 transition-transform"
        >
          <Zap className="h-5 w-5" />
        </Button>

        {/* Histórico de Ações */}
        <Button
          variant={activePanel === 'history' ? 'default' : 'outline'}
          size="icon"
          onClick={() => openPanel('history')}
          className="h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm border-border/50 touch-target shadow-lg active:scale-95 transition-transform"
        >
          <History className="h-5 w-5" />
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