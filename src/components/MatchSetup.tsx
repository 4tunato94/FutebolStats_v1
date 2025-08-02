import { useState } from 'react'
import { Play, Users, ChevronRight, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useFutebolStore } from '@/stores/futebolStore'
import { TacticalSetup } from '@/components/TacticalSetup'
import { cn } from '@/lib/utils'

export function MatchSetup() {
  const { teams, startMatch } = useFutebolStore()
  const [teamAId, setTeamAId] = useState('')
  const [teamBId, setTeamBId] = useState('')
  const [showTacticalSetup, setShowTacticalSetup] = useState(false)

  const handleStartMatch = () => {
    if (!teamAId || !teamBId) {
      alert('Selecione ambos os times!')
      return
    }
    if (teamAId === teamBId) {
      alert('Selecione times diferentes!')
      return
    }
    startMatch(teamAId, teamBId)
  }

  const handleTacticalSetup = () => {
    if (!teamAId || !teamBId) {
      alert('Selecione ambos os times primeiro!')
      return
    }
    if (teamAId === teamBId) {
      alert('Selecione times diferentes!')
      return
    }
    setShowTacticalSetup(true)
  }

  const selectedTeamA = teams.find(t => t.id === teamAId)
  const selectedTeamB = teams.find(t => t.id === teamBId)
  if (teams.length < 2) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h3 className="text-2xl font-bold mb-4 ios-text-fixed">Times Insuficientes</h3>
        <p className="text-muted-foreground text-lg ios-text-wrap">
          Cadastre pelo menos 2 times para começar uma análise
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="space-y-8">
        <div>
          <Label className="text-lg font-semibold text-muted-foreground ios-text-fixed mb-3 block">Time A</Label>
          <Select value={teamAId} onValueChange={setTeamAId}>
            <SelectTrigger className="h-16 rounded-2xl text-lg touch-target border-2">
              <SelectValue placeholder="Selecione o Time A" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  <div className="flex items-center space-x-4 py-2">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.colors.primary }}
                    />
                    <span className="ios-text-fixed text-base font-medium">{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-lg font-semibold text-muted-foreground ios-text-fixed mb-3 block">Time B</Label>
          <Select value={teamBId} onValueChange={setTeamBId}>
            <SelectTrigger className="h-16 rounded-2xl text-lg touch-target border-2">
              <SelectValue placeholder="Selecione o Time B" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  <div className="flex items-center space-x-4 py-2">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.colors.primary }}
                    />
                    <span className="ios-text-fixed text-base font-medium">{team.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Configuração Tática */}
      {teamAId && teamBId && teamAId !== teamBId && (
        <div className="space-y-6">
          <Button 
            onClick={handleTacticalSetup}
            variant="outline"
            size="xl"
            className="w-full h-18 rounded-2xl text-lg touch-target border-2"
          >
            <Settings className="h-6 w-6 mr-4" />
            <span className="ios-text-fixed">Configurar Táticas</span>
          </Button>
          
          {/* Resumo das configurações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {selectedTeamA && (
              <div className="p-5 border-2 rounded-3xl bg-muted/30">
                <div className="flex items-center space-x-3 mb-3">
                  <img src={selectedTeamA.logoUrl} alt={selectedTeamA.name} className="w-8 h-8" />
                  <span className="font-bold text-base">{selectedTeamA.name}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Formação: {selectedTeamA.formation || 'Não definida'}</p>
                  <p>Titulares: {selectedTeamA.players.filter(p => p.isStarter).length}/11</p>
                  <p>Capitão: {selectedTeamA.players.find(p => p.isCaptain)?.name || 'Não definido'}</p>
                </div>
              </div>
            )}
            
            {selectedTeamB && (
              <div className="p-5 border-2 rounded-3xl bg-muted/30">
                <div className="flex items-center space-x-3 mb-3">
                  <img src={selectedTeamB.logoUrl} alt={selectedTeamB.name} className="w-8 h-8" />
                  <span className="font-bold text-base">{selectedTeamB.name}</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Formação: {selectedTeamB.formation || 'Não definida'}</p>
                  <p>Titulares: {selectedTeamB.players.filter(p => p.isStarter).length}/11</p>
                  <p>Capitão: {selectedTeamB.players.find(p => p.isCaptain)?.name || 'Não definido'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Button 
        onClick={handleStartMatch}
        size="xl"
        className={cn(
          "w-full h-20 rounded-3xl text-xl font-bold touch-target no-select",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200 active:scale-[0.98] shadow-lg"
        )}
        disabled={!teamAId || !teamBId}
      >
        <Play className="h-7 w-7 mr-4" />
        <span className="ios-text-fixed">Iniciar Análise</span>
        <ChevronRight className="h-7 w-7 ml-4" />
      </Button>
      
      {/* Modal de Configuração Tática */}
      {selectedTeamA && selectedTeamB && (
        <TacticalSetup
          isOpen={showTacticalSetup}
          onClose={() => setShowTacticalSetup(false)}
          teamA={selectedTeamA}
          teamB={selectedTeamB}
        />
      )}
    </div>
  )
}