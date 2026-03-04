require('dotenv').config();

console.log('Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
console.log('Sheet ID:', process.env.GOOGLE_SPREADSHEET_ID);
const pk = process.env.GOOGLE_PRIVATE_KEY || '';
console.log('PK Type:', typeof pk);
console.log('PK Length:', pk.length);
console.log('PK Start:', pk.substring(0, 40));
console.log('Has raw newlines:', pk.includes('\n'));
console.log('Has literal \\n:', pk.includes('\\n'));
