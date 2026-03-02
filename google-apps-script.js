// ============================================================
// Google Apps Script - Deploy as Web App
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Create a new Google Sheet
// 2. Add these headers in Row 1:
//    id | name | nick | role | status | team | nif | address | playerSignature | adminSignature | signedAt
// 3. Add the initial player data in rows 2-11 (or run the seed function below)
// 4. Go to Extensions > Apps Script
// 5. Paste this entire code into Code.gs
// 6. Click Deploy > New deployment
// 7. Select "Web app", set "Who has access" to "Anyone"
// 8. Copy the deployment URL
// ============================================================

const SHEET_NAME = 'Players';
const HEADERS = ['id', 'name', 'nick', 'role', 'status', 'team', 'nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName(SHEET_NAME);
  }
  return sheet;
}

// GET - Read all players
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const players = [];

    for (let i = 1; i < data.length; i++) {
      const player = {};
      for (let j = 0; j < headers.length; j++) {
        const key = headers[j];
        let value = data[i][j];
        // Convert signedAt back to number
        if (key === 'signedAt' && value !== '' && value !== null) {
          value = Number(value);
        }
        // Keep empty strings as undefined for optional fields
        if (value === '' && ['nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'].includes(key)) {
          value = undefined;
        }
        player[key] = value;
      }
      players.push(player);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: players }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POST - Update a player
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, playerId, updates } = body;

    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('id');

    if (action === 'update' && playerId && updates) {
      // Find the row with matching ID
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][idCol] === playerId) {
          rowIndex = i + 1; // 1-indexed for Sheet API
          break;
        }
      }

      if (rowIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Player not found' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Update each field from updates
      for (const [key, value] of Object.entries(updates)) {
        const colIndex = headers.indexOf(key);
        if (colIndex !== -1) {
          sheet.getRange(rowIndex, colIndex + 1).setValue(value !== undefined && value !== null ? value : '');
        }
      }

      // Read back the updated row
      const updatedRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
      const updatedPlayer = {};
      for (let j = 0; j < headers.length; j++) {
        const key = headers[j];
        let value = updatedRow[j];
        if (key === 'signedAt' && value !== '' && value !== null) {
          value = Number(value);
        }
        if (value === '' && ['nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'].includes(key)) {
          value = undefined;
        }
        updatedPlayer[key] = value;
      }

      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: updatedPlayer }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this function ONCE to seed the sheet with initial player data
function seedPlayers() {
  const sheet = getSheet();
  sheet.clear();

  // Set headers
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Initial player data
  const players = [
    ['p1', 'Paulo Sérgio Ferreira Nunes', 'PEiNE', 'Player', 'pending', 'RaideN', '', '', '', '', ''],
    ['p2', 'Simão Marcelino', 'X0ra', 'Player', 'pending', 'RaideN', '', '', '', '', ''],
    ['p3', 'Gabriel da Silva Correia', 'FRONT', 'Player', 'pending', 'RaideN', '', '', '', '', ''],
    ['p4', 'Esteban Kauã Henrique Santos Pina', 'Esteban', 'Player', 'pending', 'RaideN', '', '', '', '', ''],
    ['p5', 'Diogo Pérez Rodrigues', 'Retrix', 'Player', 'pending', 'RaideN', '', '', '', '', ''],
    ['p6', 'João Jácome Louro', 'wh1ze', 'Player', 'pending', 'KenshiN', '', '', '', '', ''],
    ['p7', 'Simão Martins', 'sw3tyzz', 'Player', 'pending', 'KenshiN', '', '', '', '', ''],
    ['p8', 'João Moura', 'Mouran', 'Player', 'pending', 'KenshiN', '', '', '', '', ''],
    ['p9', 'Vitor Santos', 'Chipxx', 'Player', 'pending', 'KenshiN', '', '', '', '', ''],
    ['p10', 'Leonardo Alegre', 'reo', 'Player', 'pending', 'KenshiN', '', '', '', '', ''],
  ];

  sheet.getRange(2, 1, players.length, HEADERS.length).setValues(players);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');

  // Auto-resize columns (except signature columns which are large)
  for (let i = 1; i <= HEADERS.length; i++) {
    if (i !== 9 && i !== 10) { // Skip playerSignature and adminSignature columns
      sheet.autoResizeColumn(i);
    }
  }

  SpreadsheetApp.getUi().alert('Players seeded successfully!');
}
