const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const folderPath = path.join(process.cwd(), 'Vishwa Products (23Dec)');
const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    console.log(`\n--- Inspecting: ${file} ---`);
    const workbook = XLSX.readFile(path.join(folderPath, file));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length > 0) {
        console.log('Headers:', data[0]);
        if (data.length > 1) {
            console.log('Sample Rows (up to 20):');
            data.slice(1, 21).forEach((row, i) => {
                console.log(`Row ${i + 1}: SKU: ${row[1]} | Image: ${row[2]} | Name: ${row[3]}`);
            });
        }
    } else {
        console.log('Sheet is empty.');
    }
});
