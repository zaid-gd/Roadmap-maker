const fs = require('fs');

let content = fs.readFileSync('components/workspace/WorkspaceShell.tsx', 'utf8');

// Sidebar background: #13151F -> Use bg-obsidian-light (from globals.css)
content = content.replace(/bg-obsidian-surface\/60/g, 'bg-obsidian-light');

// Inactive items: #9DA3B4 text, transparent background
// Hover: #E8EAF0 text, #21253A background, smooth 150ms transition
// Active: #FFFFFF text, #6366F1 left border (3px), rgba(99,102,241,0.12) background
content = content.replace(/bg-indigo-500\/10 border-l-2 border-indigo-500 text-indigo-50/g, 'bg-indigo-500/12 border-l-[3px] border-indigo-500 text-white');
content = content.replace(/border-l-2 border-transparent text-text-secondary hover:text-text-primary/g, 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-obsidian-hover duration-150');
content = content.replace(/hover:bg-white\/5 group/g, 'group');

// Dashboard Active state update
content = content.replace(/bg-indigo-500\/10 text-indigo-300/g, 'bg-indigo-500/12 border-l-[3px] border-indigo-500 text-white');
content = content.replace(/text-text-secondary\s+\}\s+\$\{!sidebarOpen/g, 'border-l-[3px] border-transparent text-text-secondary hover:text-text-primary hover:bg-obsidian-hover duration-150 } ${!sidebarOpen');


// Module completion % text: #22D3EE (cyan) for visibility
content = content.replace(/text-indigo-400 font-bold">\{progress.overall\}%/g, 'text-cyan-400 font-bold">{progress.overall}%');

// Text size replacements
content = content.replace(/text-\[10px\]/g, 'text-xs');
// We don't want to replace text-xs to text-sm blindly if they are labels. But body text should be text-sm min.
// "All body text minimum font size: 14px — nothing smaller for readable content"
// The prompt says: "Labels and meta text: 12px, #9DA3B4 — never #5C6378 for important labels"
// Let's replace text-text-muted with text-text-secondary in WorkspaceShell for better readability
content = content.replace(/text-text-muted/g, 'text-text-secondary');

fs.writeFileSync('components/workspace/WorkspaceShell.tsx', content);
