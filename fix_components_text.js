const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure text-text-secondary is readable 14px
    // Find generic <p> and <span> with text-xs, replace with text-sm
    content = content.replace(/<p className="([^"]*)text-xs([^"]*)">/g, '<p className="$1text-sm$2">');
    content = content.replace(/<span className="([^"]*)text-xs([^"]*)">/g, '<span className="$1text-[12px]$2">');
    // But then fix text-[10px] to 12px everywhere just in case
    content = content.replace(/text-\[10px\]/g, 'text-[12px]');

    // For cards/surfaces: #1A1D27 and card borders: #2A2D3A
    // Find all 'bg-white/5' or 'bg-obsidian/40' -> bg-obsidian-surface
    content = content.replace(/bg-obsidian\/40/g, 'bg-obsidian-surface');
    content = content.replace(/bg-obsidian\/50/g, 'bg-obsidian-surface');
    
    // borders
    content = content.replace(/border-white\/5/g, 'border-border');
    content = content.replace(/border-white\/10/g, 'border-border-subtle');
    
    // Card Titles
    // "Card titles: 16px, font-weight 600"
    content = content.replace(/<h[34] className="([^"]*)font-display text-xl([^"]*)">/g, '<h4 className="$1font-display text-base font-semibold text-text-primary$2">');
    content = content.replace(/<h[34] className="([^"]*)font-bold text-sm([^"]*)">/g, '<h4 className="$1font-semibold text-base text-text-primary$2">');
    content = content.replace(/<h[34] className="([^"]*)text-sm text-white line-clamp-1([^"]*)">/g, '<h4 className="$1text-base font-semibold text-text-primary line-clamp-1$2">');
    content = content.replace(/<span className="([^"]*)text-sm text-white line-clamp-1([^"]*)">/g, '<span className="$1text-base font-semibold text-text-primary line-clamp-1$2">');
    

    fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir('app');
walkDir('components');

console.log('done text size fix');
