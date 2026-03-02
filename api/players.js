import { GoogleAuth } from 'google-auth-library';

const SPREADSHEET_ID = '1L23eKp1xQYV1Mv_vG0Y3WqFn5mNoQXsW8xWM9zERvSI';
const SHEET_NAME = 'Players';
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function getAccessToken() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function sheetsGet(token, range) {
  const url = `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API GET failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function sheetsPut(token, range, values) {
  const url = `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API PUT failed (${res.status}): ${text}`);
  }
  return res.json();
}

function rowToPlayer(headers, row) {
  const player = {};
  headers.forEach((key, j) => {
    const value = row[j] || '';
    if (value === '' && ['nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'].includes(key)) {
      return;
    }
    player[key] = key === 'signedAt' && value !== '' ? Number(value) : value;
  });
  return player;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(500).json({ success: false, error: 'GOOGLE_SERVICE_ACCOUNT_KEY not set' });
    }

    const token = await getAccessToken();

    if (req.method === 'GET') {
      const data = await sheetsGet(token, `${SHEET_NAME}!A:K`);
      const rows = data.values || [];
      if (rows.length <= 1) {
        return res.status(200).json({ success: true, data: [] });
      }
      const headers = rows[0];
      const players = rows.slice(1).map(row => rowToPlayer(headers, row));
      return res.status(200).json({ success: true, data: players });
    }

    if (req.method === 'POST') {
      const { playerId, updates } = req.body;
      if (!playerId || !updates) {
        return res.status(400).json({ success: false, error: 'Missing playerId or updates' });
      }

      const data = await sheetsGet(token, `${SHEET_NAME}!A:K`);
      const rows = data.values || [];
      const headers = rows[0];
      const idCol = headers.indexOf('id');

      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][idCol] === playerId) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex === -1) {
        return res.status(404).json({ success: false, error: 'Player not found: ' + playerId });
      }

      for (const [key, value] of Object.entries(updates)) {
        const colIndex = headers.indexOf(key);
        if (colIndex === -1) continue;
        const colLetter = String.fromCharCode(65 + colIndex);
        const range = `${SHEET_NAME}!${colLetter}${rowIndex}`;
        await sheetsPut(token, range, [[value != null ? value : '']]);
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
