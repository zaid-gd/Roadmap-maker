import type { Roadmap, Section } from "@/types";

export interface WorkspaceVersion {
    versionNumber: number;
    createdAt: string;
    label: string;
    sections: Section[];
}

export function saveVersion(workspace: Roadmap) {
    const key = `zns_versions_${workspace.id}`;
    const existingStr = localStorage.getItem(key);
    let versions: WorkspaceVersion[] = existingStr ? JSON.parse(existingStr) : [];

    const versionNumber = versions.length > 0 ? versions[versions.length - 1].versionNumber + 1 : 1;
    const dateStr = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date());

    const newVersion: WorkspaceVersion = {
        versionNumber,
        createdAt: new Date().toISOString(),
        label: `v${versionNumber} · ${dateStr}`,
        sections: JSON.parse(JSON.stringify(workspace.sections)) // deep copy
    };

    versions.push(newVersion);
    if (versions.length > 5) {
        versions = versions.slice(versions.length - 5);
    }

    localStorage.setItem(key, JSON.stringify(versions));
    return newVersion;
}

export function getVersions(workspaceId: string): WorkspaceVersion[] {
    if (typeof window === "undefined") return [];
    const key = `zns_versions_${workspaceId}`;
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : [];
}
