const { google } = require('googleapis');
require('dotenv').config();

async function check() {
    const pk = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        pk,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    try {
        console.log('Authorizing...');
        const creds = await auth.authorize();
        console.log('✅ Access Token generated');

        const sheets = google.sheets({ version: 'v4', auth });
        const res = await sheets.spreadsheets.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID
        });
        console.log('✅ Sheet Title:', res.data.properties.title);
    } catch (e) {
        console.error('❌ Auth Error:', e.message);
        if (e.response && e.response.data) {
            console.error('Context:', JSON.stringify(e.response.data));
        }
    }
}

check();
