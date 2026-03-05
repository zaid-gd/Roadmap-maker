const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Due to previous replacements, we might have <h3 class...> ... </h4> or <h4 class...> ... </h3>
    // Let's use a regex that matches <h3 and <h4 and pairs them correctly
    // Since we just replaced </h3> with </h4> blindly in WorkspaceShell, let's fix it by making sure all <h[34] opening tags match their closing tags
    
    // Actually, a simpler approach: 
    // find all opening <h[1-6] and make sure the closing tag is the same
    
    let regex = /<(h[1-6])([^>]*)>([\s\S]*?)<\/(h[1-6])>/g;
    content = content.replace(regex, (match, openTag, attrs, innerText, closeTag) => {
        if (openTag !== closeTag) {
            return `<${openTag}${attrs}>${innerText}</${openTag}>`;
        }
        return match;
    });

    // We also replaced blindly in WorkspaceShell `</h3>` -> `</h4>`, so what about valid <h3> that got closed with </h4>?
    // Let's just fix WorkspaceShell specifically first
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

console.log('done fixing tags');
