import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}

export interface Team {
  id: string;
  name: string;
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
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  startTime: Date;
  actions: GameAction[];
  isActive: boolean;
}

interface FutebolStore {
  teams: Team[];
  currentMatch: Match | null;
  appState: 'menu' | 'playing';
  
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
  
  // Game actions
  addAction: (action: Omit<GameAction, 'id' | 'timestamp'>) => void;
  
  // App state
  setAppState: (state: 'menu' | 'playing') => void;
}

export const useFutebolStore = create<FutebolStore>((set, get) => ({
  teams: [
    {
      id: '1',
      name: 'Time A',
      colors: { primary: '#FF0000', secondary: '#FFFFFF' },
      players: [
        { id: '1', name: 'João', number: 10, position: 'Atacante' },
        { id: '2', name: 'Pedro', number: 9, position: 'Atacante' },
        { id: '3', name: 'Carlos', number: 8, position: 'Meio-campo' },
      ]
    },
    {
      id: '2',
      name: 'Time B',
      colors: { primary: '#0000FF', secondary: '#FFFFFF' },
      players: [
        { id: '4', name: 'Lucas', number: 10, position: 'Atacante' },
        { id: '5', name: 'Rafael', number: 9, position: 'Atacante' },
        { id: '6', name: 'Bruno', number: 8, position: 'Meio-campo' },
      ]
    }
  ],
  currentMatch: null,
  appState: 'menu',

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
          isActive: true
        },
        appState: 'playing'
      });
    }
  },

  endMatch: () => set({
    currentMatch: null,
    appState: 'menu'
  }),

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

  setAppState: (appState) => set({ appState })
}));