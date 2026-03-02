import { Player } from '../../types';

const API_URL = '/api/players';

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const res = await fetch(API_URL, { credentials: 'same-origin' });
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch players');
    }

    return json.data as Player[];
  } catch (err) {
    console.warn('API not available, falling back to sheet CSV:', err);
    return fetchPlayersFromCSV();
  }
}

// Fallback: read directly from public Google Sheet CSV
async function fetchPlayersFromCSV(): Promise<Player[]> {
  const SHEET_ID = '1L23eKp1xQYV1Mv_vG0Y3WqFn5mNoQXsW8xWM9zERvSI';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

  const res = await fetch(url);
  const csv = await res.text();
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));

  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const player: Record<string, string | number | undefined> = {};

    headers.forEach((key, j) => {
      const raw = (values[j] || '').replace(/^"|"$/g, '');
      if (raw === '' && ['nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'].includes(key)) {
        return;
      }
      if (key === 'signedAt' && raw !== '') {
        player[key] = Number(raw);
      } else {
        player[key] = raw;
      }
    });

    return player as unknown as Player;
  });
}

export async function updatePlayerInSheet(
  playerId: string,
  updates: Partial<Player>,
): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ playerId, updates }),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'Failed to update player');
  }
}
