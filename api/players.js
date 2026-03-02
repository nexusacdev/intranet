const { google } = require('googleapis');

const SPREADSHEET_ID = '1L23eKp1xQYV1Mv_vG0Y3WqFn5mNoQXsW8xWM9zERvSI';
const SHEET_NAME = 'Players';
const HEADERS = ['id', 'name', 'nick', 'role', 'status', 'team', 'nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'];

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getPlayers(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:K`,
  });

  const rows = res.data.values || [];
  if (rows.length <= 1) return [];

  const headers = rows[0];
  return rows.slice(1).map(row => {
    const player = {};
    headers.forEach((key, j) => {
      const value = row[j] || '';
      if (value === '' && ['nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'].includes(key)) {
        return; // skip empty optional fields
      }
      if (key === 'signedAt' && value !== '') {
        player[key] = Number(value);
      } else {
        player[key] = value;
      }
    });
    return player;
  });
}

async function updatePlayer(sheets, playerId, updates) {
  // Read current data to find the row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:K`,
  });

  const rows = res.data.values || [];
  const headers = rows[0];
  const idCol = headers.indexOf('id');

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol] === playerId) {
      rowIndex = i + 1; // 1-indexed for Sheets API
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error('Player not found: ' + playerId);
  }

  // Update specific cells
  const requests = [];
  for (const [key, value] of Object.entries(updates)) {
    const colIndex = headers.indexOf(key);
    if (colIndex === -1) continue;

    // Convert column index to letter (A, B, C, ...)
    const colLetter = String.fromCharCode(65 + colIndex);
    const range = `${SHEET_NAME}!${colLetter}${rowIndex}`;

    requests.push(
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[value !== undefined && value !== null ? value : '']],
        },
      })
    );
  }

  await Promise.all(requests);
  return { success: true };
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    if (req.method === 'GET') {
      const players = await getPlayers(sheets);
      return res.status(200).json({ success: true, data: players });
    }

    if (req.method === 'POST') {
      const { playerId, updates } = req.body;
      if (!playerId || !updates) {
        return res.status(400).json({ success: false, error: 'Missing playerId or updates' });
      }
      await updatePlayer(sheets, playerId, updates);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
