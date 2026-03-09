import Link from "next/link";
import AtRiskAlerts from "@/components/dashboard/AtRiskAlerts";
import CoachingLog from "@/components/dashboard/CoachingLog";
import ModuleCompletionTable from "@/components/dashboard/ModuleCompletionTable";
import SkillHeatmap from "@/components/dashboard/SkillHeatmap";
import VelocityChart from "@/components/dashboard/VelocityChart";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardOverview, getDashboardVelocity } from "@/lib/server/dashboard";
import { getServerAuthContext } from "@/lib/server/auth";
import { listUserWorkspaces } from "@/lib/server/workspaces";

function formatPercent(value: number) {
    return `${Math.round(value * 100)}%`;
}

export default async function DashboardPage() {
    const { user } = await getServerAuthContext();

    if (!user) {
        return (
            <main className="studio-page">
                <section className="studio-panel grid gap-6 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:p-8">
                    <div className="max-w-4xl">
                        <p className="eyebrow">Studio analytics</p>
                        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.98] text-text-primary md:text-5xl">
                            Sign in to unlock the manager dashboard.
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-8 text-text-secondary md:text-base">
                            Dashboard analytics, coaching history, and 90-day reviews are tied to your account-scoped roadmap data. Keep working locally, or sign in when you want synced analytics.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/auth?next=%2Fdashboard" className="button-primary">
                                Enable sync
                            </Link>
                            <Link href="/create" className="button-secondary">
                                Create locally
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardContent className="p-5">
                                <p className="eyebrow text-[10px]">Storage model</p>
                                <p className="mt-3 text-lg font-semibold text-text-primary">Local-first</p>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">
                                    Work stays usable without an account. Sign-in adds backup and synced analytics rather than replacing local control.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-5">
                                <p className="eyebrow text-[10px]">What unlocks</p>
                                <p className="mt-3 text-lg font-semibold text-text-primary">Reviews, risk, coaching</p>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">
                                    Once synced, this surface can track momentum, flag at-risk modules, and store manager follow-up notes across devices.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-3">
                    <Card>
                        <CardContent className="p-5">
                            <p className="eyebrow text-[10px]">Velocity</p>
                            <h2 className="mt-3 text-xl font-semibold text-text-primary">Measure recent movement.</h2>
                            <p className="mt-2 text-sm leading-7 text-text-secondary">
                                Track whether work is accelerating, flatlining, or slipping before progress stalls.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="eyebrow text-[10px]">Coaching</p>
                            <h2 className="mt-3 text-xl font-semibold text-text-primary">Keep action history visible.</h2>
                            <p className="mt-2 text-sm leading-7 text-text-secondary">
                                Log topics, follow-ups, and next steps in the same place you review roadmap completion.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="eyebrow text-[10px]">Reviews</p>
                            <h2 className="mt-3 text-xl font-semibold text-text-primary">Generate 90-day summaries.</h2>
                            <p className="mt-2 text-sm leading-7 text-text-secondary">
                                Use synced history to build clearer review narratives instead of reconstructing context manually.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </main>
        );
    }

    const [overview, velocity, roadmaps] = await Promise.all([
        getDashboardOverview(),
        getDashboardVelocity(),
        listUserWorkspaces(),
    ]);

    return (
        <main className="studio-page">
            <section className="studio-panel grid gap-6 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:p-8">
                <div className="max-w-4xl">
                    <p className="eyebrow">Manager dashboard</p>
                    <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.98] text-text-primary md:text-5xl">
                        Track momentum, flag risk, and log coaching actions.
                    </h1>
                    <p className="mt-5 max-w-3xl text-sm leading-8 text-text-secondary md:text-base">
                        This surface condenses roadmap completion, intern momentum, and follow-up actions into one practical review layer instead of another stacked report page.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="p-5">
                            <p className="eyebrow text-[10px]">Intern roadmaps</p>
                            <p className="mt-3 text-[2rem] font-semibold text-text-primary">{overview.totalInternsTracked}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="eyebrow text-[10px]">Average completion</p>
                            <p className="mt-3 text-[2rem] font-semibold text-text-primary">{formatPercent(overview.averageCompletion)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="eyebrow text-[10px]">Tasks completed this month</p>
                            <p className="mt-3 text-[2rem] font-semibold text-text-primary">{overview.totalTasksCompletedThisMonth}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <p className="eyebrow text-[10px]">Most completed module</p>
                            <p className="mt-3 text-base font-semibold text-text-primary">{overview.mostCompletedModule || "No module data yet"}</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
                <VelocityChart points={velocity} />
                <AtRiskAlerts roadmaps={roadmaps} />
            </section>

            <section className="grid gap-6 2xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)]">
                <SkillHeatmap roadmaps={roadmaps} />
                <CoachingLog roadmaps={roadmaps} />
            </section>

            <ModuleCompletionTable roadmaps={roadmaps} />
        </main>
    );
}
