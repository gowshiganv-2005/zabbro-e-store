const { google } = require('googleapis');
require('dotenv').config();

async function check() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let pk = process.env.GOOGLE_PRIVATE_KEY || '';

    // Strip quotes if they exist (sometimes dotenv might not if they were single-quoted)
    if (pk.startsWith('"') && pk.endsWith('"')) pk = pk.substring(1, pk.length - 1);
    if (pk.startsWith("'") && pk.endsWith("'")) pk = pk.substring(1, pk.length - 1);

    // Re-normalize newlines just in case literal escaped backslash-n exist
    const PRIVATE_KEY = pk.replace(/\\n/g, '\n').trim();

    console.log('--- Auth Debug ---');
    console.log('Email:', email);
    console.log('Key Length:', PRIVATE_KEY.length);
    console.log('Key Sample:', PRIVATE_KEY.substring(0, 30));
    console.log('---');

    const auth = new google.auth.JWT(
        email,
        null,
        PRIVATE_KEY,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    try {
        const creds = await auth.authorize();
        console.log('✅ Auth success');
        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.get({ spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID });
        console.log('Title:', res.data.properties.title);
    } catch (e) {
        console.error('❌ FAIL:', e.message);
    }
}

check();
