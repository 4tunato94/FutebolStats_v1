import { User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Team, ActionType } from '@/types/futebol'
import { cn } from '@/lib/utils'

interface PlayerSelectorProps {
  team: Team
  action: ActionType
  onSelectPlayer: (playerId: string) => void
  onCancel: () => void
}

export function PlayerSelector({ team, action, onSelectPlayer, onCancel }: PlayerSelectorProps) {
  return (
    <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-end">
      <div className="w-full bg-background rounded-t-3xl border-t-2 border-border/50 animate-in slide-in-from-bottom-full duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-3">
          <div className="w-12 h-1.5 bg-muted-foreground/40 rounded-full" />
        </div>
        
      <div className="px-6 py-5 border-b-2 border-border/50 flex items-center justify-between min-h-[80px]">
        <div className="flex items-center space-x-4">
          <span className="text-4xl flex-shrink-0">{action.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl ios-text-fixed">{action.name}</h3>
            <p className="text-base text-muted-foreground ios-text-fixed">Selecione o jogador</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={onCancel}
          className="h-14 w-14 rounded-full touch-target flex-shrink-0"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
        <div className="p-6 max-h-[70vh] overflow-y-auto pb-safe">
        {team.players.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 ios-scroll">
            {team.players
              .sort((a, b) => a.number - b.number)
              .map((player) => (
                <Button
                  key={player.id}
                  variant="outline"
                  onClick={() => onSelectPlayer(player.id)}
                  className={cn(
                      "h-20 w-20 rounded-3xl flex items-center justify-center touch-target no-select",
                    "border-2 border-border/50 hover:border-primary/50 shadow-md",
                    "transition-all duration-200 active:scale-[0.95]"
                  )}
                >
                    <span className="text-2xl font-bold ios-text-fixed">
                      {player.number}
                    </span>
                </Button>
              ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <User className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <p className="text-lg text-muted-foreground ios-text-wrap">
              Nenhum jogador cadastrado para {team.name}
            </p>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}