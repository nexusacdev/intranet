import React from 'react';
import { useDiscordAuth } from '../context/DiscordAuthContext';

const GateWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-agency-black flex items-center justify-center px-4">
    <div className="glass rounded-2xl p-10 max-w-md w-full text-center">
      {children}
    </div>
  </div>
);

const DiscordGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, discordUser } = useDiscordAuth();

  if (authState === 'loading') {
    return (
      <GateWrapper>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-agency-red border-t-transparent rounded-full animate-spin" />
          <p className="text-agency-muted text-sm">Loading...</p>
        </div>
      </GateWrapper>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <GateWrapper>
        <h1 className="text-2xl font-bold text-agency-text mb-2">Agency Dojo Portal</h1>
        <p className="text-agency-muted text-sm mb-8">Sign in with your Discord account to continue.</p>
        <a
          href="/api/auth/login"
          className="inline-flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-8 rounded-xl transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 5a.2.2 0 00-.1 0A59.7 59.7 0 00.2 45.3a.3.3 0 000 .2 58.9 58.9 0 0017.7 9a.2.2 0 00.3-.1 42.2 42.2 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 42 42 0 0035.8 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.4 36.4 0 01-5.5 2.7.2.2 0 00-.1.3 47.4 47.4 0 003.6 5.9.2.2 0 00.3.1 58.7 58.7 0 0017.7-9 .3.3 0 000-.2C69.7 18.6 65.9 10 60.2 5a.2.2 0 00-.1 0zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1 6.5 3.2 6.4 7.1c0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1 6.5 3.2 6.4 7.1c0 3.9-2.8 7.1-6.4 7.1z"/>
          </svg>
          Login with Discord
        </a>
      </GateWrapper>
    );
  }

  if (authState === 'no_guild') {
    return (
      <GateWrapper>
        <h1 className="text-2xl font-bold text-agency-text mb-2">Join the Dojo</h1>
        <p className="text-agency-muted text-sm mb-2">
          Welcome, <span className="text-agency-text font-medium">{discordUser?.globalName || discordUser?.username}</span>!
        </p>
        <p className="text-agency-muted text-sm mb-8">
          You need to be a member of the Agency Dojo Discord server to access this portal.
        </p>
        <a
          href="https://discord.gg/agencyclan"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-8 rounded-xl transition-colors mb-4"
        >
          Join Discord Server
        </a>
        <div>
          <a
            href="/api/auth/logout"
            className="text-agency-muted hover:text-agency-text text-sm transition-colors underline"
          >
            Logout
          </a>
        </div>
      </GateWrapper>
    );
  }

  if (authState === 'no_role') {
    return (
      <GateWrapper>
        <h1 className="text-2xl font-bold text-agency-text mb-2">Access Restricted</h1>
        <p className="text-agency-muted text-sm mb-2">
          Welcome, <span className="text-agency-text font-medium">{discordUser?.globalName || discordUser?.username}</span>!
        </p>
        <p className="text-agency-muted text-sm mb-8">
          You don't have the required role to access this portal. Please contact a staff member if you believe this is an error.
        </p>
        <div>
          <a
            href="/api/auth/logout"
            className="text-agency-muted hover:text-agency-text text-sm transition-colors underline"
          >
            Logout
          </a>
        </div>
      </GateWrapper>
    );
  }

  // authorized
  return <>{children}</>;
};

export default DiscordGate;
