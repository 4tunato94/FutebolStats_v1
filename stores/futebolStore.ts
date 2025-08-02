import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  players: Player[];
}

export interface GameAction {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  action: string;
  zone: string;
  timestamp: Date;
  minute: number;
  second: number;
  details?: string;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  startTime: Date;
  actions: GameAction[];
  isActive: boolean;
  currentTime: number;
  isPaused: boolean;
  possession: 'teamA' | 'teamB' | null;
}

export interface ActionType {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'offensive' | 'defensive' | 'neutral';
  changePossessionAutomatically?: boolean;
  requiresPlayerSelection?: boolean;
  reverseAction?: boolean;
  multiplePlayersAction?: boolean;
  teamChangeAction?: boolean;
}

const DEFAULT_ACTION_TYPES: ActionType[] = [
  { id: 'goal', name: 'Gol', icon: '⚽', color: '#4CAF50', category: 'offensive', changePossessionAutomatically: true, requiresPlayerSelection: true },
  { id: 'assist', name: 'Assistência', icon: '🎯', color: '#2196F3', category: 'offensive', requiresPlayerSelection: true },
  { id: 'shot_on_target', name: 'Chute no Gol', icon: '🥅', color: '#FF9800', category: 'offensive', requiresPlayerSelection: true },
  { id: 'shot_off_target', name: 'Chute Fora', icon: '📤', color: '#FF5722', category: 'offensive', changePossessionAutomatically: true, requiresPlayerSelection: true },
  { id: 'pass_completed', name: 'Passe Certo', icon: '✅', color: '#8BC34A', category: 'neutral', requiresPlayerSelection: true },
  { id: 'pass_failed', name: 'Passe Errado', icon: '❌', color: '#F44336', category: 'neutral', changePossessionAutomatically: true, requiresPlayerSelection: true },
  { id: 'foul', name: 'Falta', icon: '⚠️', color: '#F44336', category: 'defensive', changePossessionAutomatically: true, reverseAction: true, requiresPlayerSelection: true },
  { id: 'card_yellow', name: 'Cartão Amarelo', icon: '🟨', color: '#FFEB3B', category: 'defensive', requiresPlayerSelection: true },
  { id: 'card_red', name: 'Cartão Vermelho', icon: '🟥', color: '#F44336', category: 'defensive', requiresPlayerSelection: true },
];

interface FutebolStore {
  teams: Team[];
  currentMatch: Match | null;
  appState: 'menu' | 'playing';
  actionTypes: ActionType[];
  
  // Team management
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  
  // Player management
  addPlayer: (teamId: string, player: Omit<Player, 'id'>) => void;
  updatePlayer: (teamId: string, playerId: string, player: Partial<Player>) => void;
  deletePlayer: (teamId: string, playerId: string) => void;
  
  // Match management
  startMatch: (teamAId: string, teamBId: string) => void;
  endMatch: () => void;
  pauseMatch: () => void;
  resumeMatch: () => void;
  updateMatchTime: (time: number) => void;
  setPossession: (team: 'teamA' | 'teamB' | null) => void;
  
  // Game actions
  addAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  updateAction: (actionId: string, updates: Partial<GameAction>) => void;
  deleteAction: (actionId: string) => void;
  
  // App state
  setAppState: (state: 'menu' | 'playing') => void;
}

export const useFutebolStore = create<FutebolStore>((set, get) => ({
  teams: [],
  currentMatch: null,
  appState: 'menu',
  actionTypes: DEFAULT_ACTION_TYPES,

  addTeam: (team) => set((state) => ({
    teams: [...state.teams, { ...team, id: Date.now().toString() }]
  })),

  updateTeam: (id, updatedTeam) => set((state) => ({
    teams: state.teams.map(team => 
      team.id === id ? { ...team, ...updatedTeam } : team
    )
  })),

  deleteTeam: (id) => set((state) => ({
    teams: state.teams.filter(team => team.id !== id)
  })),

  addPlayer: (teamId, player) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId
        ? { ...team, players: [...team.players, { ...player, id: Date.now().toString() }] }
        : team
    )
  })),

  updatePlayer: (teamId, playerId, updatedPlayer) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId
        ? {
            ...team,
            players: team.players.map(player =>
              player.id === playerId ? { ...player, ...updatedPlayer } : player
            )
          }
        : team
    )
  })),

  deletePlayer: (teamId, playerId) => set((state) => ({
    teams: state.teams.map(team =>
      team.id === teamId
        ? { ...team, players: team.players.filter(player => player.id !== playerId) }
        : team
    )
  })),

  startMatch: (teamAId, teamBId) => {
    const { teams } = get();
    const teamA = teams.find(t => t.id === teamAId);
    const teamB = teams.find(t => t.id === teamBId);
    
    if (teamA && teamB) {
      set({
        currentMatch: {
          id: Date.now().toString(),
          teamA,
          teamB,
          startTime: new Date(),
          actions: [],
          isActive: true,
          currentTime: 0,
          isPaused: false,
          possession: null
        },
        appState: 'playing'
      });
    }
  },

  endMatch: () => set({
    currentMatch: null,
    appState: 'menu'
  }),

  pauseMatch: () => set((state) => ({
    currentMatch: state.currentMatch ? { ...state.currentMatch, isPaused: true } : null
  })),

  resumeMatch: () => set((state) => ({
    currentMatch: state.currentMatch ? { ...state.currentMatch, isPaused: false } : null
  })),

  updateMatchTime: (time) => set((state) => ({
    currentMatch: state.currentMatch ? { ...state.currentMatch, currentTime: time } : null
  })),

  setPossession: (team) => set((state) => ({
    currentMatch: state.currentMatch ? { ...state.currentMatch, possession: team } : null
  })),

  addAction: (action) => set((state) => {
    if (!state.currentMatch) return state;
    
    const newAction: GameAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    return {
      currentMatch: {
        ...state.currentMatch,
        actions: [...state.currentMatch.actions, newAction]
      }
    };
  }),

  updateAction: (actionId, updates) => set((state) => {
    if (!state.currentMatch) return state;

    return {
      currentMatch: {
        ...state.currentMatch,
        actions: state.currentMatch.actions.map(action =>
          action.id === actionId ? { ...action, ...updates } : action
        )
      }
    };
  }),

  deleteAction: (actionId) => set((state) => {
    if (!state.currentMatch) return state;

    return {
      currentMatch: {
        ...state.currentMatch,
        actions: state.currentMatch.actions.filter(action => action.id !== actionId)
      }
    };
  }),

  setAppState: (appState) => set({ appState })
}));