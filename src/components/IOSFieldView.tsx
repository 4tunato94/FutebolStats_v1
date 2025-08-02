import { useState, useEffect } from 'react'
import { useCapacitor } from '@/hooks/useCapacitor'
import { ImpactStyle } from '@capacitor/haptics'
import { 
  Maximize2, 
  Minimize2, 
  Clock,
  Users,
  Zap,
  History,
  X,
  AlertCircle,
  Edit,
  Trash2,
  User,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
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
  const { currentMatch, togglePlayPause, updateTimer, setPossession, removeAction, actionTypes } = useFutebolStore()
  const { isNative, isReady, hapticFeedback, lockOrientation } = useCapacitor()
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [activePanel, setActivePanel] = useState<'actions' | 'history' | null>(null)
  const [timer, setTimer] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLandscape, setIsLandscape] = useState(true)
  const [editingAction, setEditingAction] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    teamId?: string
    actionName?: string
    playerId?: string
    timestamp?: number
  }>({})

  // Detectar dispositivo móvel
  const isMobile = isNative || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  // Forçar fullscreen e paisagem no mobile
  useEffect(() => {
    if (!isMobile || !isReady) return

    // Se for app nativo, usar APIs do Capacitor
    if (isNative) {
      lockOrientation('LANDSCAPE')
      return
    }

    const setupMobileFullscreen = () => {
      // Configurar viewport
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
      }

      // Aplicar estilos de fullscreen
      document.documentElement.style.cssText = `
        height: 100vh !important;
        height: -webkit-fill-available !important;
        width: 100vw !important;
        overflow: hidden !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      `
      
      document.body.style.cssText = `
        height: 100vh !important;
        height: -webkit-fill-available !important;
        width: 100vw !important;
        overflow: hidden !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #2d5016 !important;
      `

      // Forçar paisagem se estiver em portrait
      const forceOrientation = () => {
        const isPortrait = window.innerHeight > window.innerWidth
        
        if (isPortrait) {
          // Rotacionar via CSS
          document.body.style.transform = 'rotate(90deg)'
          document.body.style.transformOrigin = 'center center'
          document.body.style.width = '100vh'
          document.body.style.height = '100vw'
          document.body.style.position = 'fixed'
          document.body.style.top = '50%'
          document.body.style.left = '50%'
          document.body.style.marginTop = '-50vw'
          document.body.style.marginLeft = '-50vh'
        } else {
          // Resetar se já estiver em paisagem
          document.body.style.transform = ''
          document.body.style.transformOrigin = ''
          document.body.style.width = '100vw'
          document.body.style.height = '100vh'
          document.body.style.top = '0'
          document.body.style.left = '0'
          document.body.style.marginTop = '0'
          document.body.style.marginLeft = '0'
        }
        
        setIsLandscape(!isPortrait)
      }

      // Aplicar imediatamente
      forceOrientation()

      // Esconder barra de endereços (Safari)
      const hideAddressBar = () => {
        setTimeout(() => {
          window.scrollTo(0, 1)
          if (document.body.scrollTop !== undefined) {
            document.body.scrollTop = 1
          }
        }, 0)
      }

      // Múltiplas tentativas para esconder UI
      hideAddressBar()
      setTimeout(hideAddressBar, 100)
      setTimeout(hideAddressBar, 300)
      setTimeout(hideAddressBar, 500)
      setTimeout(hideAddressBar, 1000)
      setTimeout(hideAddressBar, 2000)

      // Listeners para mudanças de orientação
      const handleOrientationChange = () => {
        setTimeout(() => {
          forceOrientation()
          hideAddressBar()
        }, 100)
      }

      window.addEventListener('orientationchange', handleOrientationChange)
      window.addEventListener('resize', handleOrientationChange)
      
      // Prevenir zoom
      const preventZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault()
        }
      }
      
      document.addEventListener('touchstart', preventZoom, { passive: false })
      document.addEventListener('touchmove', preventZoom, { passive: false })

      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange)
        window.removeEventListener('resize', handleOrientationChange)
        document.removeEventListener('touchstart', preventZoom)
        document.removeEventListener('touchmove', preventZoom)
      }
    }

    const cleanup = setupMobileFullscreen()
    return cleanup
  }, [isMobile])

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

  const exitAnalysis = () => {
    if (isMobile) {
      // Restaurar estilos
      document.documentElement.style.cssText = ''
      document.body.style.cssText = ''
      
      // Restaurar viewport
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
      }
    }
    
    // Voltar para a tela principal
    setTimeout(() => {
      window.history.back()
    }, 100)
  }

  // Função para obter informações do jogador
  const getPlayerInfo = (teamId: string, playerId: string | undefined) => {
    if (!playerId || !currentMatch) return null
    
    const team = teamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB
    const player = team.players.find(p => p.id === playerId)
    
    if (!player) return null
    
    return `#${player.number} ${player.name} • ${player.position}`
  }

  const handlePossessionSelect = (teamId: string) => {
    setPossession(teamId)
    hapticFeedback(ImpactStyle.Light)
  }

  const handleActionComplete = () => {
    setActivePanel(null)
    setShowSidebar(false)
    hapticFeedback(ImpactStyle.Medium)
  }

  const openPanel = (panel: 'actions' | 'history') => {
    setActivePanel(panel)
    setShowSidebar(true)
  }

  const handleEditAction = (action: any) => {
    setEditingAction(action.id)
    setEditForm({
      teamId: action.teamId,
      actionName: action.actionName,
      playerId: action.playerId,
      timestamp: action.timestamp
    })
  }

  const handleSaveEdit = () => {
    if (!editingAction || !currentMatch) return
    
    const { updateAction } = useFutebolStore.getState()
    updateAction(editingAction, editForm)
    
    setEditingAction(null)
    setEditForm({})
    showNotification('Ação atualizada', 'success')
  }

  const handleCancelEdit = () => {
    setEditingAction(null)
    setEditForm({})
  }

  const togglePossession = () => {
    hapticFeedback(ImpactStyle.Light)
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
      "fixed inset-0 z-50 bg-black overflow-hidden",
      isMobile && "mobile-fullscreen-field"
    )}>
      {/* Campo Principal */}
      <div className={cn(
        "flex-1 relative flex items-center justify-center",
        "w-screen h-screen p-0"
      )}>
        <FieldGrid isFullscreen={isFullscreen} />
        
        {/* Sistema de Notificações Customizado */}
        {notifications.length > 0 && (
          <div className={cn(
            "fixed left-1/2 transform -translate-x-1/2 z-50 space-y-2 pointer-events-none",
            isLandscape ? "top-2" : "top-4"
          )}>
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
        <div className={cn(
          "absolute right-4",
          isLandscape ? "bottom-2" : "bottom-4"
        )}>
          <Button
            variant="destructive"
            size="icon"
            onClick={exitAnalysis}
            className={cn(
              "rounded-full bg-destructive/90 backdrop-blur-sm border-destructive/50 touch-target shadow-lg active:scale-95 transition-transform hover:bg-destructive",
              isLandscape ? "h-10 w-10" : "h-12 w-12"
            )}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cronômetro Central */}
        <div className={cn(
          "absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-30",
          isLandscape ? "top-4" : "top-6"
        )}>
          <div className="bg-background/95 backdrop-blur-md border-2 border-border/50 rounded-3xl px-6 py-3 shadow-lg">
            <div className={cn(
              "font-mono font-bold text-center",
              isLandscape ? "text-base" : "text-lg"
            )}>
              {formatTime(timer)}
            </div>
          </div>
        </div>
      </div>

      {/* Botões Laterais - Canto Inferior Esquerdo */}
      <div className={cn(
        "absolute left-4 z-40 flex",
        isLandscape ? "bottom-4 space-x-3" : "bottom-6 space-x-4"
      )}>
        {/* Cronômetro */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleTimerClick}
          className={cn(
            "rounded-full bg-background/95 backdrop-blur-md border-2 border-border/50 touch-target shadow-lg active:scale-95 transition-transform",
            isLandscape ? "h-14 w-14" : "h-16 w-16"
          )}
        >
          <Clock className={cn(
            isLandscape ? "h-6 w-6" : "h-7 w-7"
          )} />
        </Button>
        
        {/* Posse de Bola - Mostra logo do time selecionado */}
        <Button
          variant="outline"
          size="lg"
          onClick={togglePossession}
          className={cn(
            "rounded-full bg-background/95 backdrop-blur-md border-2 border-border/50 touch-target shadow-lg p-2 active:scale-95 transition-transform",
            isLandscape ? "h-14 w-14" : "h-16 w-16"
          )}
        >
          {currentPossessionTeam ? (
            <img 
              src={currentPossessionTeam.logoUrl} 
              alt={`${currentPossessionTeam.name} logo`}
              className={cn(
                "object-contain",
                isLandscape ? "w-8 h-8" : "w-10 h-10"
              )}
            />
          ) : (
            <Users className={cn(
              isLandscape ? "h-6 w-6" : "h-7 w-7"
            )} />
          )}
        </Button>
        
        {/* Registro de Ação */}
        <Button
          variant={activePanel === 'actions' ? 'default' : 'outline'}
          size="lg"
          onClick={() => openPanel('actions')}
          className={cn(
            "rounded-full bg-background/95 backdrop-blur-md border-2 border-border/50 touch-target shadow-lg active:scale-95 transition-transform",
            isLandscape ? "h-14 w-14" : "h-16 w-16"
          )}
        >
          <Zap className={cn(
            isLandscape ? "h-6 w-6" : "h-7 w-7"
          )} />
        </Button>

        {/* Histórico de Ações */}
        <Button
          variant={activePanel === 'history' ? 'default' : 'outline'}
          size="lg"
          onClick={() => openPanel('history')}
          className={cn(
            "rounded-full bg-background/95 backdrop-blur-md border-2 border-border/50 touch-target shadow-lg active:scale-95 transition-transform",
            isLandscape ? "h-14 w-14" : "h-16 w-16"
          )}
        >
          <History className={cn(
            isLandscape ? "h-6 w-6" : "h-7 w-7"
          )} />
        </Button>
      </div>

      {/* Painel Lateral Direito - Menor */}
      <div className={cn(
        "fixed right-0 top-0 h-full bg-background/95 backdrop-blur-md border-l-2 border-border/50 transform transition-transform duration-300 z-30",
        isLandscape ? "w-64" : "w-80 sm:w-96",
        showSidebar ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header do Painel */}
        <div className="p-5 border-b-2 border-border/50">
          <div className="flex items-center justify-between">
            <h2 className={cn(
              "font-semibold",
              isLandscape ? "text-base" : "text-lg"
            )}>
              {activePanel === 'actions' && 'Registrar Ação'}
              {activePanel === 'history' && 'Histórico de Ações'}
            </h2>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setShowSidebar(false)
                setActivePanel(null)
              }}
              className={cn(
                "rounded-full",
                isLandscape ? "h-10 w-10" : "h-12 w-12"
              )}
            >
              <X className={cn(
                isLandscape ? "h-5 w-5" : "h-6 w-6"
              )} />
            </Button>
          </div>
        </div>

        {/* Conteúdo do Painel Ativo */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          isLandscape ? "p-4" : "p-5"
        )}>
          {activePanel === 'actions' && (
            <div className={cn(
              isLandscape ? "space-y-4" : "space-y-6"
            )}>
              <div className="text-center mb-4">
                <h3 className={cn(
                  "font-semibold text-muted-foreground mb-2",
                  isLandscape ? "text-sm" : "text-base"
                )}>Registrar Ação</h3>
                {currentMatch.currentPossession && (
                  <div className="p-3 bg-muted/30 rounded-2xl text-center">
                    <span className={cn(
                      "font-medium",
                      isLandscape ? "text-sm" : "text-base"
                    )}>{currentPossessionTeam?.name}</span>
                  </div>
                )}
              </div>
              {currentMatch.currentPossession ? (
                <ActionPanel onClose={handleActionComplete} />
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className={cn(
                    "text-muted-foreground",
                    isLandscape ? "text-sm" : "text-base"
                  )}>
                    Selecione a posse de bola primeiro
                  </p>
                </div>
              )}
            </div>
          )}

          {activePanel === 'history' && (
            <div className={cn(
              isLandscape ? "space-y-4" : "space-y-6"
            )}>
              <div className="text-center mb-4">
                <h3 className={cn(
                  "font-semibold text-muted-foreground mb-2",
                  isLandscape ? "text-sm" : "text-base"
                )}>
                  Últimas ações registradas
                </h3>
                <div className={cn(
                  "text-muted-foreground",
                  isLandscape ? "text-sm" : "text-base"
                )}>
                  Total: {currentMatch.actions.length} ações
                </div>
              </div>
              
              {/* Lista das últimas 10 ações */}
              <div className={cn(
                "overflow-y-auto",
                isLandscape ? "space-y-3 max-h-64" : "space-y-4 max-h-96"
              )}>
                {currentMatch.actions
                  .slice(-8)
                  .reverse()
                  .map((action, index) => {
                    const team = action.teamId === currentMatch.teamA.id ? currentMatch.teamA : currentMatch.teamB
                    const playerInfo = getPlayerInfo(action.teamId, action.playerId)
                    const isEditing = editingAction === action.id
                    
                    return (
                      <div key={action.id} className={cn(
                        "rounded-2xl bg-muted/30 border-2 border-border/30",
                        isLandscape ? "p-3" : "p-4"
                      )}>
                        {isEditing ? (
                          <div className={cn(
                            isLandscape ? "space-y-3" : "space-y-4"
                          )}>
                            {/* Edição de Time */}
                            <div>
                              <label className={cn(
                                "font-medium text-muted-foreground",
                                isLandscape ? "text-sm" : "text-base"
                              )}>Time</label>
                              <Select
                                value={editForm.teamId || action.teamId}
                                onValueChange={(value) => setEditForm(prev => ({ ...prev, teamId: value }))}
                              >
                                <SelectTrigger className={cn(
                                  "text-sm rounded-xl",
                                  isLandscape ? "h-10" : "h-12"
                                )}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={currentMatch.teamA.id}>{currentMatch.teamA.name}</SelectItem>
                                  <SelectItem value={currentMatch.teamB.id}>{currentMatch.teamB.name}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Edição de Ação */}
                            {action.type === 'specific' && (
                              <div>
                                <label className={cn(
                                  "font-medium text-muted-foreground",
                                  isLandscape ? "text-sm" : "text-base"
                                )}>Ação</label>
                                <Select
                                  value={editForm.actionName || action.actionName || ''}
                                  onValueChange={(value) => setEditForm(prev => ({ ...prev, actionName: value }))}
                                >
                                  <SelectTrigger className={cn(
                                    "text-sm rounded-xl",
                                    isLandscape ? "h-10" : "h-12"
                                  )}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {actionTypes.map(actionType => (
                                      <SelectItem key={actionType.id} value={actionType.name}>
                                        {actionType.icon} {actionType.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            {/* Edição de Jogador */}
                            {action.type === 'specific' && action.playerId && (
                              <div>
                                <label className={cn(
                                  "font-medium text-muted-foreground",
                                  isLandscape ? "text-sm" : "text-base"
                                )}>Jogador</label>
                                <Select
                                  value={editForm.playerId || action.playerId || ''}
                                  onValueChange={(value) => setEditForm(prev => ({ ...prev, playerId: value }))}
                                >
                                  <SelectTrigger className={cn(
                                    "text-sm rounded-xl",
                                    isLandscape ? "h-10" : "h-12"
                                  )}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {((editForm.teamId === currentMatch.teamA.id || (!editForm.teamId && action.teamId === currentMatch.teamA.id)) 
                                      ? currentMatch.teamA.players 
                                      : currentMatch.teamB.players
                                    ).map(player => (
                                      <SelectItem key={player.id} value={player.id}>
                                        #{player.number} {player.name} • {player.position}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            {/* Edição de Tempo */}
                            <div>
                              <label className={cn(
                                "font-medium text-muted-foreground",
                                isLandscape ? "text-sm" : "text-base"
                              )}>Tempo</label>
                              <div className="flex space-x-3">
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    value={Math.floor((editForm.timestamp !== undefined ? editForm.timestamp : action.timestamp) / 60)}
                                    onChange={(e) => {
                                      const mins = parseInt(e.target.value) || 0
                                      const secs = (editForm.timestamp !== undefined ? editForm.timestamp : action.timestamp) % 60
                                      setEditForm(prev => ({ ...prev, timestamp: mins * 60 + secs }))
                                    }}
                                    className={cn(
                                      "text-sm rounded-xl",
                                      isLandscape ? "h-10" : "h-12"
                                    )}
                                    min="0"
                                    placeholder="Min"
                                  />
                                </div>
                                <span className={cn(
                                  "text-muted-foreground self-center",
                                  isLandscape ? "text-sm" : "text-base"
                                )}>:</span>
                                <div className="flex-1">
                                  <Input
                                    type="number"
                                    value={(editForm.timestamp !== undefined ? editForm.timestamp : action.timestamp) % 60}
                                    onChange={(e) => {
                                      const secs = parseInt(e.target.value) || 0
                                      const mins = Math.floor((editForm.timestamp !== undefined ? editForm.timestamp : action.timestamp) / 60)
                                      setEditForm(prev => ({ ...prev, timestamp: mins * 60 + secs }))
                                    }}
                                    className={cn(
                                      "text-sm rounded-xl",
                                      isLandscape ? "h-10" : "h-12"
                                    )}
                                    min="0"
                                    max="59"
                                    placeholder="Seg"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Botões de Ação */}
                            <div className="flex space-x-3">
                              <Button
                                variant="default"
                                size="lg"
                                onClick={handleSaveEdit}
                                className={cn(
                                  "flex-1 text-sm rounded-xl",
                                  isLandscape ? "h-10" : "h-12"
                                )}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                              </Button>
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={handleCancelEdit}
                                className={cn(
                                  "flex-1 text-sm rounded-xl",
                                  isLandscape ? "h-10" : "h-12"
                                )}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "font-medium truncate",
                                isLandscape ? "text-sm" : "text-base"
                              )}>
                                {action.actionName || (action.type === 'possession' ? 'Posse de Bola' : 'Ação')}
                              </div>
                              <div className={cn(
                                "text-muted-foreground mt-1",
                                isLandscape ? "text-sm" : "text-base"
                              )}>
                                {team.name} • {formatTime(action.timestamp)}
                              </div>
                              {playerInfo && (
                                <div className={cn(
                                  "text-primary mt-1 flex items-center",
                                  isLandscape ? "text-sm" : "text-base"
                                )}>
                                  <User className="h-4 w-4 mr-2" />
                                  {playerInfo}
                                </div>
                              )}
                            </div>
                            <div className={cn(
                              "flex flex-col ml-2",
                              isLandscape ? "space-y-1" : "space-y-2"
                            )}>
                              <Button
                                variant="ghost"
                                size="lg"
                                onClick={() => handleEditAction(action)}
                                className={cn(
                                  "text-muted-foreground hover:text-foreground",
                                  isLandscape ? "h-8 w-8" : "h-10 w-10"
                                )}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="lg"
                                onClick={() => {
                                  removeAction(action.id)
                                  showNotification('Ação removida', 'success')
                                }}
                                className={cn(
                                  "text-muted-foreground hover:text-destructive",
                                  isLandscape ? "h-8 w-8" : "h-10 w-10"
                                )}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                
                {currentMatch.actions.length === 0 && (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className={cn(
                      "text-muted-foreground",
                      isLandscape ? "text-sm" : "text-base"
                    )}>
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
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => {
            setShowSidebar(false)
            setActivePanel(null)
          }}
        />
      )}
    </div>
  )
}