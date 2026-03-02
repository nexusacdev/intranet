import React, { createContext, useContext, useState } from 'react';
import { Player } from '../../types';
import { mockPlayers } from '../../data';

interface AppContextType {
  players: Player[];
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  currentUser: { role: 'admin' | 'player', id?: string } | null;
  login: (role: 'admin' | 'player', id?: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [currentUser, setCurrentUser] = useState<{ role: 'admin' | 'player', id?: string } | null>(null);

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const login = (role: 'admin' | 'player', id?: string) => {
    setCurrentUser({ role, id });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{ players, updatePlayer, currentUser, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
