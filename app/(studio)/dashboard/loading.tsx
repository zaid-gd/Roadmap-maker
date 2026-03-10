export default function DashboardLoading() {
    return (
        <div className="grid gap-6">
            <div className="h-32 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
            <div className="grid gap-4 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-32 animate-pulse rounded-[24px] border border-white/8 bg-white/[0.03]" />
                ))}
            </div>
            <div className="h-80 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
            <div className="h-80 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
            <div className="h-80 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
            <div className="h-96 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
        </div>
    );
}
