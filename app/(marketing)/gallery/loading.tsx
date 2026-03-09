export default function GalleryLoading() {
    return (
        <div className="min-h-screen bg-obsidian pt-28">
            <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
                <div className="h-40 animate-pulse rounded-[32px] border border-white/8 bg-white/[0.03]" />
                <div className="mt-8 h-28 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="h-72 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
                    <div className="h-72 animate-pulse rounded-[28px] border border-white/8 bg-white/[0.03]" />
                </div>
            </div>
        </div>
    );
}
