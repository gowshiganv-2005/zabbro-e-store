const { readExcel } = require('../server/utils/excel');

async function check() {
    try {
        const products = await readExcel('products.xlsx');
        console.log('Total Products:', products.length);
        const categories = [...new Set(products.map(p => p.category))];
        console.log('Categories:', categories);
        products.forEach(p => {
            console.log(`- [${p.category}] ${p.name}`);
        });
    } catch (e) {
        console.error('FAIL:', e.message);
    }
}

check();
