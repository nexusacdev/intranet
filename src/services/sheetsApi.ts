import { Player } from '../../types';

const API_URL = import.meta.env.VITE_SHEETS_API_URL as string;

export async function fetchPlayers(): Promise<Player[]> {
  if (!API_URL) {
    console.warn('VITE_SHEETS_API_URL not set — using local mock data');
    return [];
  }

  const res = await fetch(API_URL);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch players');
  }

  return json.data as Player[];
}

export async function updatePlayerInSheet(
  playerId: string,
  updates: Partial<Player>,
): Promise<Player> {
  if (!API_URL) {
    throw new Error('VITE_SHEETS_API_URL not configured');
  }

  // Use GET with query params to avoid CORS/redirect issues with POST
  const params = new URLSearchParams({
    action: 'update',
    playerId,
    updates: JSON.stringify(updates),
  });

  const res = await fetch(`${API_URL}?${params.toString()}`);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'Failed to update player');
  }

  return json.data as Player;
}
