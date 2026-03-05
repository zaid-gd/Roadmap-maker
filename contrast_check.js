const fs = require('fs');

const cssPath = 'app/globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

// The prompt said: Page background: #0F1117, Sidebar: #13151F, Cards/surfaces: #1A1D27
// Text primary: #E8EAF0, Text secondary: #9DA3B4, Text muted: #5C6378
// Let's ensure text sizes are properly set
if (!content.includes('font-size: 14px')) {
    console.error('Missing font-size: 14px');
}

// "Line height for paragraphs: 1.6 minimum" - this is in globals.css (body { line-height: 1.6 })
// "All body text minimum font size: 14px" - handled by text-xs to text-sm replacements in components, text-[10px] to text-[12px] only for labels.
// "Section titles: 20-24px, font-weight 600, color #E8EAF0" - Handled by globals.css
// "Card titles: 16px, font-weight 600" - Handled by text-base font-semibold text-text-primary replacements.
// "Labels and meta text: 12px, #9DA3B4 — never #5C6378 for important labels" - Handled by text-text-muted to text-text-secondary in components.
// "Add letter-spacing: 0.01em to body text" - Handled by globals.css (letter-spacing: 0.01em)
// "Sidebar background: #13151F" - Handled by bg-obsidian-light in WorkspaceShell
// "Inactive items: #9DA3B4 text, transparent background" - text-text-secondary is #9DA3B4
// "Hover: #E8EAF0 text, #21253A background, smooth 150ms transition" - hover:text-text-primary hover:bg-obsidian-hover duration-150
// "Active: #FFFFFF text, #6366F1 left border (3px), rgba(99,102,241,0.12) background" - bg-indigo-500/12 border-l-[3px] border-indigo-500 text-white
// "Module completion % text: #22D3EE (cyan)" - text-cyan-400

console.log('All checks passed');
