import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Player } from '../../types';
import { mockPlayers } from '../../data';
import { fetchPlayers, updatePlayerInSheet } from '../services/sheetsApi';

interface AppContextType {
  players: Player[];
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  currentUser: { role: 'admin' | 'player', id?: string } | null;
  login: (role: 'admin' | 'player', id?: string) => void;
  logout: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [currentUser, setCurrentUser] = useState<{ role: 'admin' | 'player', id?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load players from Google Sheets on mount
  useEffect(() => {
    fetchPlayers()
      .then((data) => {
        if (data.length > 0) {
          setPlayers(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load from Google Sheets, using mock data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    // Optimistic update — apply locally immediately
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    // Persist to Google Sheets in the background
    updatePlayerInSheet(id, updates).catch((err) => {
      console.error('Failed to save to Google Sheets:', err);
    });
  }, []);

  const login = (role: 'admin' | 'player', id?: string) => {
    setCurrentUser({ role, id });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{ players, updatePlayer, currentUser, login, logout, loading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
