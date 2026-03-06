import type { Roadmap } from "@/types";

export function exportAsMarkdown(workspace: Roadmap) {
    let md = `# ${workspace.title}\n\n`;
    if (workspace.summary) md += `${workspace.summary}\n\n`;

    workspace.sections.forEach(sec => {
        if (sec.type === "module" && sec.data) {
            md += `## ${sec.title}\n`;
            if (sec.data.description && typeof sec.data.description === "string") {
                md += `${sec.data.description}\n\n`;
            }
            if (sec.data.tasks && sec.data.tasks.length > 0) {
                md += `### Tasks\n`;
                sec.data.tasks.forEach(task => {
                    md += `- [${task.completed ? "x" : " "}] ${task.title}\n`;
                    if (task.subtasks) {
                        task.subtasks.forEach(st => {
                            md += `  - [${st.completed ? "x" : " "}] ${st.title}\n`;
                        });
                    }
                });
                md += `\n`;
            }
            if (sec.data.resources && sec.data.resources.length > 0) {
                md += `### Resources\n`;
                sec.data.resources.forEach(res => {
                    md += `- [${res.title}](${res.url})\n`;
                });
                md += `\n`;
            }
        }
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workspace.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportAsJSON(workspace: Roadmap) {
    const data = JSON.stringify(workspace, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workspace.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportAsPDF(workspace: Roadmap) {
    window.print();
}