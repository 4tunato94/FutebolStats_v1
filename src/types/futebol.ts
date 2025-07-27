export interface Player {
  id: string
  number: number
  name: string
  position: string
  role: string
}

export interface Team {
  id: string
  name: string
  logo?: string
  logoUrl: string
  colors: {
    primary: string
    secondary: string
  }
  players: Player[]
}

export interface GameAction {
  id: string
  type: 'possession' | 'specific'
  teamId: string
  playerId?: string
  zone: { row: number; col: number }
  timestamp: number
  actionName?: string
}

export interface Match {
  id: string
  teamA: Team
  teamB: Team
  actions: GameAction[]
  startTime: Date
  currentTime: number
  isPlaying: boolean
  currentPossession: string | null
}

export interface ActionType {
  id: string
  name: string
  requiresPlayer: boolean
  icon: string
  counterAction?: string // ID da ação que deve ser registrada no time adversário
  reverseAction?: boolean // Se true, registra a ação no time adversário ao invés do time com posse
  changesPossession?: boolean // Se true, muda automaticamente a posse para o time adversário
}

export interface ZoneStats {
  teamA: number
  teamB: number
  total: number
}

export interface SavedGame {
  id: string
  teamA: Team
  teamB: Team
  actions: GameAction[]
  startTime: Date
  endTime: Date
  duration: number
}

export interface GameStats {
  possession: {
    teamA: number
    teamB: number
  }
  actions: {
    teamA: number
    teamB: number
  }
  specificActions: Record<string, { teamA: number; teamB: number }>
}

export type AppState = 'setup' | 'playing' | 'fullscreen' | 'reports' | 'history'