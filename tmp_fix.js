const fs = require('fs');
const file = 'c:/Users/Screen/Documents/Roadmap-maker/components/workspace/WorkspaceShell.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import SectionRenderer from "@/components/workspace/SectionRenderer";',
  'import SectionRenderer from "@/components/workspace/SectionRenderer";\nimport WorkspaceSplitView from "@/components/workspace/WorkspaceSplitView";'
);

const searchStr = `                        ) : activeSection ? (
                            <div className="p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto relative z-10 min-h-full">
                                    <SectionRenderer
                                        section={activeSection}
                                        roadmap={roadmap}
                                        onUpdate={(updater) => onUpdateSection?.(activeSection.id, updater)}
                                        onApiError={onApiError}
                                    />
                            </div>
                        ) : null}`;

// normalize line endings to find it
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedSearchStr = searchStr.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedSearchStr)) {
    const replaceStr = `                        ) : activeSection?.type === "module" || activeSection?.type === "milestones" ? (
                            <div className="flex-1 w-full relative z-10 min-h-full">
                                    <WorkspaceSplitView
                                        roadmap={roadmap}
                                        activeModuleId={activeSection.id}
                                        onUpdateSubtask={(moduleId, taskId, subtaskId) => {
                                            onUpdateSection?.(moduleId, (s) => {
                                                const ms = s;
                                                return {
                                                    ...ms,
                                                    data: {
                                                        ...ms.data,
                                                        tasks: (ms.data.tasks || []).map((t) =>
                                                            t.id === taskId
                                                                ? {
                                                                    ...t,
                                                                    subtasks: (t.subtasks || []).map((st) =>
                                                                        st.id === subtaskId ? { ...st, completed: !st.completed } : st
                                                                    ),
                                                                }
                                                                : t
                                                        ),
                                                    },
                                                };
                                            });
                                        }}
                                        onUpdateTask={(moduleId, taskId) => {
                                            onUpdateSection?.(moduleId, (s) => {
                                                const ms = s;
                                                return {
                                                    ...ms,
                                                    data: {
                                                        ...ms.data,
                                                        tasks: (ms.data.tasks || []).map((t) =>
                                                            t.id === taskId ? { ...t, completed: !t.completed } : t
                                                        ),
                                                    },
                                                };
                                            });
                                        }}
                                        onUpdateModule={(moduleId) => {
                                            onUpdateSection?.(moduleId, (s) => {
                                                const ms = s;
                                                const isCompleted = !ms.data.completed;
                                                return {
                                                    ...ms,
                                                    data: {
                                                        ...ms.data,
                                                        completed: isCompleted,
                                                        tasks: isCompleted ? (ms.data.tasks || []).map((t) => ({
                                                            ...t,
                                                            completed: true,
                                                            subtasks: (t.subtasks || []).map((st) => ({ ...st, completed: true }))
                                                        })) : ms.data.tasks
                                                    },
                                                };
                                            });
                                        }}
                                    />
                            </div>
                        ) : activeSection ? (
                            <div className="p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto relative z-10 min-h-full">
                                    <SectionRenderer
                                        section={activeSection}
                                        roadmap={roadmap}
                                        onUpdate={(updater) => onUpdateSection?.(activeSection.id, updater)}
                                        onApiError={onApiError}
                                    />
                            </div>
                        ) : null}`;
    
    // Just replace in normalized content and write it back
    const newContent = normalizedContent.replace(normalizedSearchStr, replaceStr);
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Successfully replaced content.');
} else {
    console.log('Could not find target content to replace.');
}
