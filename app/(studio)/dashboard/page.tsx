import Link from "next/link";
import AtRiskAlerts from "@/components/dashboard/AtRiskAlerts";
import CoachingLog from "@/components/dashboard/CoachingLog";
import ModuleCompletionTable from "@/components/dashboard/ModuleCompletionTable";
import SkillHeatmap from "@/components/dashboard/SkillHeatmap";
import VelocityChart from "@/components/dashboard/VelocityChart";
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
                <section className="app-header-block">
                    <p className="eyebrow">Dashboard</p>
                    <h1 className="text-3xl font-display leading-tight text-text-primary md:text-5xl">
                        Sign in to view synced analytics.
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-text-secondary md:text-base">
                        Dashboard data is generated from account-scoped workspace history. Local work is still available without an account, but analytics and coaching history need sync.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Link href="/auth?next=%2Fdashboard" className="button-primary">
                            Enable sync
                        </Link>
                        <Link href="/create" className="button-secondary">
                            Create locally
                        </Link>
                    </div>
                </section>

                <section className="app-stat-grid">
                    {[
                        ["Storage", "Local-first", "Keep creating without an account."],
                        ["Analytics", "Account-scoped", "Progress history appears after sync."],
                        ["Coaching", "Session log", "Store notes and follow-up actions in one place."],
                        ["Reviews", "90-day summaries", "Generate structured review output from live history."],
                    ].map(([label, value, detail]) => (
                        <div key={label} className="app-stat-card">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-soft">{label}</p>
                            <p className="text-2xl font-semibold text-text-primary">{value}</p>
                            <p className="text-sm leading-6 text-text-secondary">{detail}</p>
                        </div>
                    ))}
                </section>
            </main>
        );
    }

    const [overview, velocity, roadmaps] = await Promise.all([
        getDashboardOverview(),
        getDashboardVelocity(),
        listUserWorkspaces(),
    ]);

    const statCards = [
        {
            label: "Intern roadmaps",
            value: String(overview.totalInternsTracked),
            detail: "Total synced workspaces included in this view.",
        },
        {
            label: "Average completion",
            value: formatPercent(overview.averageCompletion),
            detail: "Overall completion across tracked workspaces.",
        },
        {
            label: "Tasks this month",
            value: String(overview.totalTasksCompletedThisMonth),
            detail: "Completed tasks captured in the current period.",
        },
        {
            label: "Most completed module",
            value: overview.mostCompletedModule || "No module data",
            detail: "Strongest completion signal across synced work.",
        },
    ];

    return (
        <main className="studio-page">
            <section className="app-header-block">
                <p className="eyebrow">Dashboard</p>
                <h1 className="text-3xl font-display leading-tight text-text-primary md:text-5xl">
                    Monitor progress, review risk, and log coaching.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-text-secondary md:text-base">
                    This dashboard is now a linear review surface: headline metrics first, detailed sections below.
                </p>
            </section>

            <section className="app-stat-grid">
                {statCards.map((card) => (
                    <div key={card.label} className="app-stat-card">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-soft">{card.label}</p>
                        <p className="text-2xl font-semibold text-text-primary">{card.value}</p>
                        <p className="text-sm leading-6 text-text-secondary">{card.detail}</p>
                    </div>
                ))}
            </section>

            <section className="app-stack">
                <VelocityChart points={velocity} />
                <AtRiskAlerts roadmaps={roadmaps} />
                <SkillHeatmap roadmaps={roadmaps} />
                <CoachingLog roadmaps={roadmaps} />
                <ModuleCompletionTable roadmaps={roadmaps} />
            </section>
        </main>
    );
}
