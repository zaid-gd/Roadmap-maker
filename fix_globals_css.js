const fs = require('fs');

const cssPath = 'app/globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

// Colors
content = content.replace(/--color-obsidian: #0F1117;/g, '--color-obsidian: #0F1117;'); // Page background: #0F1117
content = content.replace(/--color-obsidian-light: #13151F;/g, '--color-obsidian-light: #13151F;'); // Sidebar: #13151F
content = content.replace(/--color-obsidian-surface: #1A1D27;/g, '--color-obsidian-surface: #1A1D27;'); // Cards/surfaces: #1A1D27
content = content.replace(/--color-obsidian-elevated: #1A1D27;/g, '--color-obsidian-elevated: #1A1D27;'); // (Same as surface)
content = content.replace(/--color-obsidian-hover: #21253A;/g, '--color-obsidian-hover: #21253A;'); // Hover states: #21253A

content = content.replace(/--color-text-primary: #E8EAF0;/g, '--color-text-primary: #E8EAF0;'); // Text primary: #E8EAF0
content = content.replace(/--color-text-secondary: #9DA3B4;/g, '--color-text-secondary: #9DA3B4;'); // Text secondary: #9DA3B4
content = content.replace(/--color-text-muted: #5C6378;/g, '--color-text-muted: #5C6378;'); // Text muted: #5C6378

content = content.replace(/--color-border: #2A2D3A;/g, '--color-border: #2A2D3A;'); // Card borders: #2A2D3A
content = content.replace(/--color-border-subtle: #21253A;/g, '--color-border-subtle: #21253A;'); 
content = content.replace(/--color-border-active: #6366F1;/g, '--color-border-active: #6366F1;');

content = content.replace(/--color-indigo-accent: #6366F1;/g, '--color-indigo-accent: #6366F1;');
content = content.replace(/--color-indigo-glow: rgba\(99,102,241,0.15\);/g, '--color-indigo-glow: rgba(99,102,241,0.15);'); // Actually this variable isn't exact in the current css, but let's make sure our colors are right.

// Typography
content = content.replace(/font-size: 14px;/g, 'font-size: 14px;\n    min-font-size: 14px;');
content = content.replace(/line-height: 1.6;/g, 'line-height: 1.6;');
content = content.replace(/letter-spacing: 0.01em;/g, 'letter-spacing: 0.01em;');

// Fix focus visible to use correct glow
content = content.replace(/outline: 2px solid var\(--color-indigo-accent\);/g, 'outline: 2px solid var(--color-indigo-accent);');
content = content.replace(/box-shadow: 0 0 0 3px rgba\(99, 102, 241, 0.15\);/g, 'box-shadow: 0 0 0 3px var(--color-indigo-glow);');

// Global h2/h3 styles for section titles
content = content.replace(/h1, \n*h2, \n*h3, \n*h4, \n*h5, \n*h6 \{/g, 'h1, h2, h3, h4, h5, h6 {');
content = content.replace(/h1, h2, h3, h4, h5, h6 \{\n    font-family: var\(--font-display\);\n    font-weight: 700;\n    text-wrap: balance;\n\}/g, `h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 600;
    color: var(--color-text-primary);
    text-wrap: balance;
}

h2, h3 {
    font-size: clamp(20px, 4vw, 24px);
}`);

fs.writeFileSync(cssPath, content);
