import XLSX from 'xlsx';
import path from 'path';

const folderPath = path.join(process.cwd(), 'Vishwa Products (23Dec)');
const files = ['Apparels.xlsx', 'Footwear.xlsx'];

files.forEach(file => {
    console.log(`\n--- Inspecting: ${file} ---`);
    try {
        const workbook = XLSX.readFile(path.join(folderPath, file));
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (data.length > 0) {
            console.log('Headers:', Object.keys(data[0]));
            console.log('Sample Row 1:', JSON.stringify(data[0], null, 2));
            if (data.length > 1) {
                console.log('Sample Row 2:', JSON.stringify(data[1], null, 2));
            }

            // Check for specific products to see variant structure
            const products = [...new Set(data.map(r => r['PRODUCT NAME']))];
            console.log(`Unique products count: ${products.length}`);

            const firstProduct = products[0];
            const variants = data.filter(r => r['PRODUCT NAME'] === firstProduct);
            console.log(`Variants for "${firstProduct}": ${variants.length}`);
            variants.forEach(v => {
                console.log(`  - SKU: ${v['SKU']}, Size: ${v['Size']}, MRP: ${v['MRP']}`);
            });

        } else {
            console.log('Sheet is empty.');
        }
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});
