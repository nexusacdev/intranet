import React, { createContext, useContext, useState, useEffect } from 'react';

export type AuthState = 'loading' | 'unauthenticated' | 'no_guild' | 'no_role' | 'authorized';

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  globalName: string | null;
  guildMember: boolean;
  hasRequiredRole: boolean;
}

interface DiscordAuthContextType {
  authState: AuthState;
  discordUser: DiscordUser | null;
}

const DiscordAuthContext = createContext<DiscordAuthContextType | undefined>(undefined);

export const DiscordAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          setAuthState('unauthenticated');
          return;
        }

        setDiscordUser(data.user);

        if (!data.user.guildMember) {
          setAuthState('no_guild');
        } else if (!data.user.hasRequiredRole) {
          setAuthState('no_role');
        } else {
          setAuthState('authorized');
        }
      })
      .catch(() => {
        setAuthState('unauthenticated');
      });
  }, []);

  return (
    <DiscordAuthContext.Provider value={{ authState, discordUser }}>
      {children}
    </DiscordAuthContext.Provider>
  );
};

export const useDiscordAuth = () => {
  const ctx = useContext(DiscordAuthContext);
  if (!ctx) throw new Error('useDiscordAuth must be used within DiscordAuthProvider');
  return ctx;
};
