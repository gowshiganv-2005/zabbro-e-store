const { google } = require('googleapis');
require('dotenv').config();

async function check() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let pk = process.env.GOOGLE_PRIVATE_KEY || '';
    if (pk.startsWith('"') && pk.endsWith('"')) pk = pk.substring(1, pk.length - 1);
    const PRIVATE_KEY = pk.replace(/\\n/g, '\n').trim();

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: email,
            private_key: PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    try {
        const client = await auth.getClient();
        console.log('✅ Client obtained');
        const sheets = google.sheets({ version: 'v4', auth: client });
        const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID });
        console.log('Sheet Title:', res.data.properties.title);
    } catch (e) {
        console.error('❌ FAIL:', e.message);
    }
}

check();
