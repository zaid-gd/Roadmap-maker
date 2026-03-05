const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert 10px fonts to 12px (text-xs) to meet readability specs
    content = content.replace(/text-\[10px\]/g, 'text-xs');
    
    // text-text-muted -> text-text-secondary for better contrast everywhere
    content = content.replace(/text-text-muted/g, 'text-text-secondary');

    // Section Titles "Section titles: 20-24px, font-weight 600, color #E8EAF0"
    // Search for <h2> and <h3> with text-xl or similar and make sure they have font-semibold and text-text-primary
    content = content.replace(/(<h[23][^>]*className="[^"]*font-bold)/g, '$1 text-text-primary');

    fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir('app');
walkDir('components');
