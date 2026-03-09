import type { Roadmap } from "@/types";
import { getRoadmapCompletionRate } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AtRiskAlerts({ roadmaps }: { roadmaps: Roadmap[] }) {
    const atRisk = roadmaps.filter((roadmap) => getRoadmapCompletionRate(roadmap) < 0.35);

    return (
        <Card className="h-full">
            <CardHeader>
                <p className="eyebrow">At-risk modules</p>
                <CardTitle className="mt-3 font-display text-2xl text-text-primary">Escalation watchlist</CardTitle>
            </CardHeader>
            <CardContent>
                {atRisk.length === 0 ? (
                    <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
                        No roadmaps are currently below the intervention threshold.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {atRisk.map((roadmap) => (
                            <div key={roadmap.id} className="rounded-[22px] border border-red-200 bg-red-50 p-4">
                                <p className="font-semibold text-red-800">{roadmap.title}</p>
                                <p className="mt-1 text-sm text-red-700">
                                    Completion is {Math.round(getRoadmapCompletionRate(roadmap) * 100)}%. Review tasks, unblock the next module, and log a coaching follow-up.
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
