const fs = require('fs');

const shellPath = 'components/workspace/WorkspaceShell.tsx';
let content = fs.readFileSync(shellPath, 'utf8');

// Active sidebar item background: rgba(99,102,241,0.12) which is bg-indigo-500/12
// Active Sidebar item text: white (already set to text-white)
// Let's make sure the text is #FFFFFF. 'text-white' does this.

// Hover sidebar item: #E8EAF0 text, #21253A background (bg-obsidian-hover)
// "hover:text-text-primary hover:bg-obsidian-hover duration-150" is already there.

// Module Completion text cyan:
// <span className="text-cyan-400 font-bold">{progress.overall}%</span>
// Already done.

// Dashboard active item
content = content.replace(/bg-indigo-500\/12 border-l-\[3px\] border-indigo-500 text-white/g, 'bg-indigo-500/12 border-l-[3px] border-indigo-500 text-white font-medium');

// Let's ensure text size for active section items is text-sm
// text-sm is already in the class string:
// w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all duration-200 group text-sm
// Wait, for modules it uses text-sm on the inner span, let's fix the button directly:
content = content.replace(/className=\{`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all duration-200 group \$\{isActive/g, 'className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 group ${isActive');

fs.writeFileSync(shellPath, content);
console.log('done sidebar active fix');
