import { useState } from 'react'
import { Target, Grid3X3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFutebolStore } from '@/stores/futebolStore'
import { ActionType } from '@/types/futebol'
import { PlayerSelector } from './PlayerSelector'
import { useCapacitor } from '@/hooks/useCapacitor'
import { ImpactStyle } from '@capacitor/haptics'
import { cn } from '@/lib/utils'

interface ActionPanelProps {
  onClose?: () => void
}

export function ActionPanel({ onClose }: ActionPanelProps) {
  const { currentMatch, actionTypes, addAction } = useFutebolStore()
  const { hapticFeedback } = useCapacitor()
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)

  if (!currentMatch) return null

  const handleActionClick = (actionType: ActionType) => {
    hapticFeedback(ImpactStyle.Medium)
    
    if (!currentMatch.currentPossession) {
      // Usar evento customizado para notificação
      window.dispatchEvent(new CustomEvent('showNotification', {
        detail: { message: 'Selecione o time que está com a posse de bola!', type: 'warning' }
      }))
      return
    }

    if (actionType.requiresPlayer) {
      setSelectedAction(actionType)
    } else {
      // Determinar qual time registra a ação (normal ou reversa)
      const targetTeamId = actionType.reverseAction 
        ? (currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id)
        : currentMatch.currentPossession

      // Ação direta do time
      addAction({
        type: 'specific',
        teamId: targetTeamId,
        zone: { row: 7, col: 10 }, // Centro do campo por padrão (14/2 = 7, 20/2 = 10)
        actionName: actionType.name
      })

      // Verificar se há contra-ação
      if (actionType.counterAction) {
        const counterActionType = actionTypes.find(at => at.id === actionType.counterAction)
        if (counterActionType) {
          const opposingTeamId = currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id
          
          addAction({
            type: 'specific',
            teamId: opposingTeamId,
            zone: { row: 6, col: 10 },
            actionName: counterActionType.name
          })
        }
      }
      
      // Se a ação muda a posse automaticamente, fechar o painel
      if (onClose) {
        onClose()
      }
    }
  }

  const handlePlayerAction = (playerId: string) => {
    if (selectedAction && currentMatch.currentPossession) {
      // Determinar qual time registra a ação (normal ou reversa)
      const targetTeamId = selectedAction.reverseAction 
        ? (currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id)
        : currentMatch.currentPossession

      addAction({
        type: 'specific',
        teamId: targetTeamId,
        playerId,
        zone: { row: 6, col: 10 }, // Centro do campo por padrão (13/2 ≈ 6, 20/2 = 10)
        actionName: selectedAction.name
      })

      // Verificar se há contra-ação
      if (selectedAction.counterAction) {
        const counterActionType = actionTypes.find(at => at.id === selectedAction.counterAction)
        if (counterActionType) {
          const opposingTeamId = currentMatch.currentPossession === currentMatch.teamA.id 
            ? currentMatch.teamB.id 
            : currentMatch.teamA.id
          
          addAction({
            type: 'specific',
            teamId: opposingTeamId,
            zone: { row: 7, col: 10 },
            actionName: counterActionType.name
          })
        }
      }
      
      setSelectedAction(null)
      
      // Se a ação muda a posse automaticamente, fechar o painel
      if (onClose) {
        onClose()
      }
    }
  }

  // Determinar qual time deve aparecer no seletor de jogadores
  const getTeamForPlayerSelection = () => {
    if (!selectedAction || !currentMatch.currentPossession) return null
    
    // Se a ação é reversa, mostrar jogadores do time adversário
    if (selectedAction.reverseAction) {
      return currentMatch.currentPossession === currentMatch.teamA.id 
        ? currentMatch.teamB 
        : currentMatch.teamA
    }
    
    // Caso normal: mostrar jogadores do time com posse
    return currentMatch.currentPossession === currentMatch.teamA.id 
      ? currentMatch.teamA 
      : currentMatch.teamB
  }

  const teamForPlayerSelection = getTeamForPlayerSelection()

  // Função para formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <div className="space-y-6">
      {currentMatch.currentPossession ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
            {actionTypes.filter(actionType => actionType && actionType.id).map((actionType) => (
              <Button
                key={actionType.id}
                variant="outline"
                onClick={() => handleActionClick(actionType)}
                className={cn(
                  "h-20 rounded-2xl flex flex-col items-center justify-center p-4 touch-target no-select",
                  "border-2 border-border/50 hover:border-primary/50",
                  "transition-all duration-200 active:scale-[0.95]",
                  "bg-card hover:bg-accent"
                )}
              >
                <span className="text-2xl mb-2">{actionType.icon}</span>
                <span className="text-sm font-semibold text-center leading-tight ios-text-wrap px-2">
                  {actionType.name}
                </span>
                {actionType.changesPossession && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                )}
              </Button>
            ))}
          </div>
          
          {/* Informações adicionais */}
          <div className="mt-6 p-5 bg-muted/20 rounded-2xl border-2 border-border/30">
            <div className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Ações disponíveis:</span>
                <span className="font-bold text-base">{actionTypes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Tempo atual:</span>
                <span className="font-mono font-bold text-base">{formatTime(currentMatch.currentTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Ações registradas:</span>
                <span className="font-bold text-base">{currentMatch.actions.length}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground ios-text-wrap">
            Selecione a posse de bola para registrar ações
          </p>
        </div>
      )}
      </div>

      {/* Seletor de Jogador */}
      {selectedAction && teamForPlayerSelection && (
        <PlayerSelector
          team={teamForPlayerSelection}
          action={selectedAction}
          onSelectPlayer={handlePlayerAction}
          onCancel={() => setSelectedAction(null)}
        />
      )}
    </>
  )
}