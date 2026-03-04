/**
 * Google Sheets Database Utility
 * Connects to a Google Spreadsheet to store your e-commerce data permanently.
 * Acts as a drop-in replacement for the Excel/MongoDB layer.
 */

const { google } = require('googleapis');
require('dotenv').config();

// Authentication setup
const auth = new google.auth.JWT(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Map filenames to Sheet names
const SHEET_MAP = {
  'products.xlsx': 'Products',
  'users.xlsx': 'Users',
  'orders.xlsx': 'Orders',
  'inventory.xlsx': 'Inventory',
  'reviews.xlsx': 'Reviews'
};

/**
 * Helper to get data from a specific sheet
 */
async function getSheetData(sheetName) {
  if (!SPREADSHEET_ID) return [];
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        let value = row[index];
        // Try to parse JSON or numbers
        try {
          if (value && (value.startsWith('[') || value.startsWith('{'))) {
            obj[header] = JSON.parse(value);
          } else if (!isNaN(value) && value !== '') {
            obj[header] = Number(value);
          } else if (value === 'TRUE' || value === 'true') {
            obj[header] = true;
          } else if (value === 'FALSE' || value === 'false') {
            obj[header] = false;
          } else {
            obj[header] = value;
          }
        } catch (e) {
          obj[header] = value;
        }
      });
      return obj;
    });
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error.message);
    return [];
  }
}

/**
 * Helper to write data to a specific sheet
 */
async function setSheetData(sheetName, data) {
  if (!SPREADSHEET_ID) return false;
  if (!data || data.length === 0) return true;

  try {
    const headers = Object.keys(data[0]);
    const rows = [headers];
    data.forEach(item => {
      rows.push(headers.map(header => {
        const val = item[header];
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      }));
    });

    // Clear existing data first
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });

    // Update with new data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      resource: { values: rows },
    });
    return true;
  } catch (error) {
    console.error(`Error writing to sheet ${sheetName}:`, error.message);
    return false;
  }
}

/**
 * Drop-in replacements for original Excel utility
 */
async function readExcel(filename) {
  const sheetName = SHEET_MAP[filename];
  return await getSheetData(sheetName);
}

async function writeExcel(filename, data) {
  const sheetName = SHEET_MAP[filename];
  return await setSheetData(sheetName, data);
}

async function appendRow(filename, row) {
  const currentData = await readExcel(filename);
  currentData.push(row);
  return await writeExcel(filename, currentData);
}

async function updateRow(filename, matchField, matchValue, updates) {
  const data = await readExcel(filename);
  const index = data.findIndex(item => String(item[matchField]) === String(matchValue));
  if (index === -1) return false;
  data[index] = { ...data[index], ...updates };
  return await writeExcel(filename, data);
}

async function deleteRow(filename, matchField, matchValue) {
  const data = await readExcel(filename);
  const filtered = data.filter(item => String(item[matchField]) !== String(matchValue));
  if (filtered.length === data.length) return false;
  return await writeExcel(filename, filtered);
}

async function findRow(filename, matchField, matchValue) {
  const data = await readExcel(filename);
  return data.find(item => String(item[matchField]) === String(matchValue)) || null;
}

async function findRows(filename, matchField, matchValue) {
  const data = await readExcel(filename);
  return data.filter(item => String(item[matchField]) === String(matchValue));
}

module.exports = {
  readExcel,
  writeExcel,
  appendRow,
  updateRow,
  deleteRow,
  findRow,
  findRows,
  DATA_DIR: ''
};
