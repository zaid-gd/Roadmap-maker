const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // "Badge text must always be clearly readable — adjust badge backgrounds if needed"
    // Badges usually have px-2 py-0.5 and rounded
    // E.g., <span className={`text-[12px] uppercase font-bold px-2 py-0.5 rounded border ${color}`}>
    // We want the colors of badges to have enough contrast against background.
    
    // Replace text-text-secondary with text-text-primary for badge text
    // We already did text-text-muted -> text-text-secondary earlier
    // For anything with px-2 py-1 or px-2 py-0.5 and text-[12px]
    
    content = content.replace(/text-text-secondary(.*)px-2 py-0.5/g, 'text-text-primary$1px-2 py-0.5');
    
    // For "Active sidebar items: white text on indigo background"
    // "Hover: #E8EAF0 text, #21253A background" (bg-obsidian-hover)
    
    // Check Sidebar active items in WorkspaceShell
    
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

console.log('done badge fix');
