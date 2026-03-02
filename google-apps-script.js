// ============================================================
// Google Apps Script - Deploy as Web App
// ============================================================
// SETUP:
// 1. Create a new Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Delete everything in Code.gs, paste this entire code
// 4. Click the Run button (play icon) with "seedPlayers" selected
//    - It will ask for permissions — click Allow
//    - This creates the headers and player rows
// 5. Click Deploy > New deployment
// 6. Type: "Web app"
// 7. Execute as: "Me"
// 8. Who has access: "Anyone"
// 9. Click Deploy and copy the URL
// ============================================================

var SHEET_ID = '1L23eKp1xQYV1Mv_vG0Y3WqFn5mNoQXsW8xWM9zERvSI';

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName('Players');
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName('Players');
  }
  return sheet;
}

function rowToPlayer(headers, row) {
  var player = {};
  for (var j = 0; j < headers.length; j++) {
    var key = headers[j];
    var value = row[j];
    if (key === 'signedAt' && value !== '' && value !== null && value !== undefined) {
      value = Number(value);
    }
    if ((value === '' || value === null || value === undefined) &&
        (key === 'nif' || key === 'address' || key === 'playerSignature' || key === 'adminSignature' || key === 'signedAt')) {
      continue; // skip undefined optional fields
    }
    player[key] = value;
  }
  return player;
}

// Handles both GET (read) and GET with ?action=update (write)
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || 'read';

    if (action === 'update') {
      return handleUpdate(params);
    }

    // Default: return all players
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var players = [];

    for (var i = 1; i < data.length; i++) {
      players.push(rowToPlayer(headers, data[i]));
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

// Also support POST as fallback
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    return handleUpdate({
      playerId: body.playerId,
      updates: JSON.stringify(body.updates),
      action: 'update'
    });
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleUpdate(params) {
  var playerId = params.playerId;
  var updates = JSON.parse(params.updates);

  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var idCol = headers.indexOf('id');

  // Find the row
  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idCol] === playerId) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Player not found: ' + playerId }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Update each field
  var keys = Object.keys(updates);
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var value = updates[key];
    var colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(value !== undefined && value !== null ? value : '');
    }
  }

  // Read back updated row
  var updatedRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  var updatedPlayer = rowToPlayer(headers, updatedRow);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: updatedPlayer }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// Run this ONCE to seed the spreadsheet with player data
// Select "seedPlayers" from the dropdown and click Run
// ============================================================
function seedPlayers() {
  var sheet = getSheet();
  sheet.clear();

  var headers = ['id', 'name', 'nick', 'role', 'status', 'team', 'nif', 'address', 'playerSignature', 'adminSignature', 'signedAt'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  var players = [
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

  sheet.getRange(2, 1, players.length, headers.length).setValues(players);

  // Format header row
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');

  Logger.log('Players seeded successfully! Check your spreadsheet.');
}
