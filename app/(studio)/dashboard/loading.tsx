export default function DashboardLoading() {
    return (
        <div className="grid gap-6">
            <div className="h-40 animate-pulse rounded-[32px] border border-white/8 bg-white/[0.03]" />
            <div className="grid gap-6 xl:grid-cols-2">
                <div className="h-80 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
                <div className="h-80 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
            </div>
            <div className="h-96 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
        </div>
    );
}
