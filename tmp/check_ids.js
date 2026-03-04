const { readExcel } = require('../server/utils/excel');
const PRODUCTS_FILE = 'products.xlsx';

async function check() {
    try {
        const products = await readExcel(PRODUCTS_FILE);
        console.log('Total Products:', products.length);
        console.log('Sample IDs:', products.slice(0, 5).map(p => `"${p.id}"`));
    } catch (e) {
        console.error(e);
    }
}

check();
