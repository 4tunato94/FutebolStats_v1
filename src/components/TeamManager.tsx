import { useState } from 'react'
import { Plus, Edit, Trash, Users, Upload, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useFutebolStore } from '@/stores/futebolStore'
import { Team, Player } from '@/types/futebol'
import { PlayerManager } from './PlayerManager'

export function TeamManager() {
  const { teams, addTeam, updateTeam, deleteTeam } = useFutebolStore()
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    logoFile: null as File | null,
    logoUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.logoFile && !formData.logoUrl) {
      alert('O logo do time é obrigatório!')
      return
    }
    
    let logoUrl = formData.logoUrl
    
    // Se há um arquivo de logo, converter para base64
    if (formData.logoFile) {
      logoUrl = await convertFileToBase64(formData.logoFile)
    }
    
    if (editingTeam) {
      updateTeam(editingTeam.id, {
        name: formData.name,
        logoUrl: logoUrl,
        colors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor
        }
      })
    } else {
      const newTeam: Team = {
        id: Date.now().toString(),
        name: formData.name,
        logoUrl: logoUrl,
        colors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor
        },
        players: []
      }
      addTeam(newTeam)
    }
    
    resetForm()
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const resetForm = () => {
    setFormData({ name: '', primaryColor: '#3B82F6', secondaryColor: '#1E40AF', logoFile: null, logoUrl: '' })
    setEditingTeam(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      primaryColor: team.colors.primary,
      secondaryColor: team.colors.secondary,
      logoFile: null,
      logoUrl: team.logoUrl || ''
    })
    setIsDialogOpen(true)
  }

  const handleImportPlayers = (teamId: string, text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const players: Player[] = lines.map((line, index) => {
      const parts = line.trim().split(',').map(part => part.trim())
      
      if (parts.length < 4) {
        // Formato incompleto, usar valores padrão
        const number = parseInt(parts[0]) || (index + 1)
        const name = parts[1] || `Jogador ${number}`
        const position = parts[2] || 'Campo'
        const role = parts[3] || 'Titular'
        return {
          id: `${teamId}-${number}`,
          number,
          name,
          position,
          role
        }
      } else {
        // Formato completo: número, nome, posição, função
        const number = parseInt(parts[0]) || (index + 1)
        const name = parts[1] || `Jogador ${number}`
        const position = parts[2] || 'Campo'
        const role = parts[3] || 'Titular'
        
        return {
          id: `${teamId}-${number}`,
          number,
          name,
          position,
          role
        }
      }
    })
    
    updateTeam(teamId, { players })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gerenciamento de Times</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="field" size="xl" className="rounded-2xl touch-target">
              <Plus className="h-6 w-6 mr-2" />
              Novo Time
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-2xl h-full sm:h-auto rounded-t-3xl sm:rounded-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? 'Editar Time' : 'Novo Time'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-lg font-semibold">Nome do Time</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Barcelona FC"
                  className="h-14 text-lg rounded-2xl mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="logoFile" className="text-lg font-semibold">Escudo do Time *</Label>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center space-x-3">
                    <Input
                      id="logoFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setFormData(prev => ({ ...prev, logoFile: file, logoUrl: '' }))
                      }}
                      className="flex-1 h-14 text-lg rounded-2xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => document.getElementById('logoFile')?.click()}
                      className="h-14 w-14 rounded-2xl"
                    >
                      <Image className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  {/* Preview da imagem */}
                  {(formData.logoFile || formData.logoUrl) && (
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 border-2 rounded-2xl flex items-center justify-center bg-muted">
                        {formData.logoFile ? (
                          <img 
                            src={URL.createObjectURL(formData.logoFile)} 
                            alt="Preview"
                            className="w-14 h-14 object-contain rounded-xl"
                          />
                        ) : formData.logoUrl ? (
                          <img 
                            src={formData.logoUrl} 
                            alt="Preview"
                            className="w-14 h-14 object-contain rounded-xl"
                          />
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setFormData(prev => ({ ...prev, logoFile: null, logoUrl: '' }))}
                        className="rounded-2xl"
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primary" className="text-lg font-semibold">Cor Primária</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input
                      id="primary"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-20 h-14 rounded-2xl"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3B82F6"
                      className="h-14 text-lg rounded-2xl"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondary" className="text-lg font-semibold">Cor Secundária</Label>
                  <div className="flex items-center space-x-3 mt-2">
                    <Input
                      id="secondary"
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-20 h-14 rounded-2xl"
                    />
                    <Input
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#1E40AF"
                      className="h-14 text-lg rounded-2xl"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  size="xl"
                  className="rounded-2xl"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="field" 
                  size="xl"
                  className="rounded-2xl"
                >
                  {editingTeam ? 'Atualizar' : 'Criar'} Time
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {teams.map((team) => (
          <Card key={team.id} className="shadow-lg rounded-3xl border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-4">
                  <img 
                    src={team.logoUrl} 
                    alt={`${team.name} logo`}
                    className="w-12 h-12 object-contain rounded-xl"
                  />
                  <span className="text-xl font-bold">{team.name}</span>
                </CardTitle>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleEdit(team)}
                    className="h-12 w-12 rounded-2xl touch-target"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => deleteTeam(team.id)}
                    className="h-12 w-12 rounded-2xl touch-target"
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-3 text-base text-muted-foreground">
                <Users className="h-5 w-5" />
                <span className="font-medium">{team.players.length} jogadores</span>
              </div>
              
              <div className="flex space-x-3">
                <div 
                  className="w-12 h-12 rounded-xl border-2 border-white shadow-md"
                  style={{ backgroundColor: team.colors.primary }}
                  title="Cor Primária"
                />
                <div 
                  className="w-12 h-12 rounded-xl border-2 border-white shadow-md"
                  style={{ backgroundColor: team.colors.secondary }}
                  title="Cor Secundária"
                />
              </div>
              
              <PlayerManager 
                team={team}
                onImportPlayers={(text) => handleImportPlayers(team.id, text)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {teams.length === 0 && (
        <Card className="text-center py-16 rounded-3xl border-2">
          <CardContent>
            <Users className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-2xl font-bold mb-4">Nenhum time cadastrado</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Comece criando seu primeiro time para começar a análise
            </p>
            <Button 
              variant="field" 
              size="xl" 
              onClick={() => setIsDialogOpen(true)}
              className="rounded-2xl"
            >
              <Plus className="h-6 w-6 mr-2" />
              Criar Primeiro Time
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}