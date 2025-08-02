import { useState } from 'react'
import { Target, Grid3X3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFutebolStore } from '@/stores/futebolStore'
import { ActionType } from '@/types/futebol'
import { PlayerSelector } from './PlayerSelector'
import { cn } from '@/lib/utils'

interface ActionPanelProps {
  onClose?: () => void
}

export function ActionPanel({ onClose }: ActionPanelProps) {
  const { currentMatch, actionTypes, addAction } = useFutebolStore()
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)

  if (!currentMatch) return null

  const handleActionClick = (actionType: ActionType) => {
    if (!currentMatch.currentPossession) {
      alert('Selecione o time que está com a posse de bola!')
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
            zone: { row: 7, col: 10 },
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
        zone: { row: 7, col: 10 }, // Centro do campo por padrão
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
      <div className="space-y-4">
      {currentMatch.currentPossession ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {actionTypes.filter(actionType => actionType && actionType.id).map((actionType) => (
              <Button
                key={actionType.id}
                variant="outline"
                onClick={() => handleActionClick(actionType)}
                className={cn(
                  "h-14 rounded-xl flex flex-col items-center justify-center p-2 touch-target no-select",
                  "border-2 border-border/50 hover:border-primary/50",
                  "transition-all duration-200 active:scale-[0.95]",
                  "bg-card hover:bg-accent"
                )}
              >
                <span className="text-base mb-1">{actionType.icon}</span>
                <span className="text-xs font-medium text-center leading-tight ios-text-wrap px-1">
                  {actionType.name}
                </span>
                {actionType.changesPossession && (
                  <div className="w-1 h-1 bg-primary rounded-full mt-1"></div>
                )}
              </Button>
            ))}
          </div>
          
          {/* Informações adicionais */}
          <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-border/30">
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Ações disponíveis:</span>
                <span className="font-medium">{actionTypes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tempo atual:</span>
                <span className="font-mono font-medium">{formatTime(currentMatch.currentTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ações registradas:</span>
                <span className="font-medium">{currentMatch.actions.length}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground ios-text-wrap">
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