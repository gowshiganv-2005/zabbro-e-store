const { google } = require('googleapis');
require('dotenv').config();

async function checkHeaders() {
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth });
    const SPREADSHEET_ID = '1C1yDKqxoiuewBmRcPdzyNp1WHMGZLUj7PeOrhBcAAbo';

    try {
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Products!A1:Z1',
        });
        console.log('Headers:', res.data.values ? res.data.values[0] : 'EMPTY');
    } catch (e) {
        console.error(e.message);
    }
}

checkHeaders();
