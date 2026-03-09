import GalleryFilters from "@/components/gallery/GalleryFilters";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GallerySchema from "@/components/seo/GallerySchema";
import { listGallery } from "@/lib/server/gallery";

export default async function GalleryPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; mode?: string; contentType?: string }>;
}) {
    const params = await searchParams;
    const items = await listGallery({
        query: params.q,
        mode: params.mode,
        contentType: params.contentType,
    });

    return (
        <main className="page-shell-wide pb-24 pt-20 md:pt-24">
            <GallerySchema items={items} />

            <section className="section-space-compact border-b border-border">
                <div className="max-w-3xl">
                    <p className="eyebrow">Gallery</p>
                    <h1 className="mt-4 max-w-2xl text-4xl font-display leading-[1.02] tracking-[-0.04em] text-text-primary md:text-6xl">
                        Explore structured workspace templates and public starting points.
                    </h1>
                </div>
            </section>

            <section className="section-space-compact">
                <GalleryFilters />
                <div className="mt-8">
                    <GalleryGrid items={items} />
                </div>
            </section>
        </main>
    );
}
