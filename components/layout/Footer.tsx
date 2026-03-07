import Link from "next/link";
import { ArrowUpRight, Shield, Sparkles } from "lucide-react";
import { APP_NAME, APP_TAGLINE, BRAND_OWNER } from "@/lib/constants";
import { FOOTER_NAV_GROUPS } from "@/lib/navigation";

export default function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(11,13,18,0.98),rgba(8,9,13,1))]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(85,116,232,0.14),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(191,148,71,0.08),transparent_26%)]" />

            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 lg:px-10">
                <div className="grid gap-10 lg:grid-cols-[1.35fr,1fr]">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-sans-display uppercase tracking-[0.26em] text-text-secondary shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
                            <Sparkles size={12} className="text-amber-300" />
                            Editorial dark studio
                        </div>

                        <h2 className="mt-5 max-w-xl font-display text-3xl leading-tight text-white sm:text-4xl">
                            {APP_NAME}
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-text-secondary">
                            {APP_TAGLINE} Designed as a premium local-first course workspace, with account sync available only when you choose to enable it.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-3">
                        {FOOTER_NAV_GROUPS.map((group) => (
                            <nav key={group.title} aria-label={group.title} className="space-y-3">
                                <p className="text-[11px] font-sans-display uppercase tracking-[0.28em] text-text-secondary/70">
                                    {group.title}
                                </p>
                                <div className="flex flex-col gap-3">
                                    {group.items.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="group inline-flex items-center gap-2 text-sm text-text-primary transition-colors hover:text-indigo-200"
                                        >
                                            <span>{link.label}</span>
                                            <ArrowUpRight size={14} className="text-text-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-200" />
                                        </Link>
                                    ))}
                                </div>
                            </nav>
                        ))}

                        <div className="space-y-3">
                            <p className="text-[11px] font-sans-display uppercase tracking-[0.28em] text-text-secondary/70">
                                Operations
                            </p>
                            <div className="space-y-3 text-sm leading-7 text-text-secondary">
                                <p>
                                    Support:{" "}
                                    <a className="text-text-primary transition-colors hover:text-indigo-200" href="mailto:support@znsnexus.com">
                                        support@znsnexus.com
                                    </a>
                                </p>
                                <p>
                                    Studio partner:{" "}
                                    <a className="text-text-primary transition-colors hover:text-indigo-200" href="https://znsnexus.com" target="_blank" rel="noopener noreferrer">
                                        znsnexus.com
                                    </a>
                                </p>
                                <p>Stripe handles billing. Signed-in Supabase accounts scope sync to the owner of each roadmap set.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 border-t border-white/[0.08] pt-5 md:grid-cols-[1.2fr,1fr] md:items-center">
                    <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10">
                            <Shield size={16} className="text-emerald-300" />
                        </div>
                        <div>
                            <p className="text-[11px] font-sans-display uppercase tracking-[0.24em] text-text-secondary/70">
                                Trust Model
                            </p>
                            <p className="mt-2 text-sm leading-7 text-text-secondary">
                                Roadmaps stay in-browser by default. Account sync is optional, email-based, and isolated to the signed-in Supabase user.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 text-left md:items-end md:text-right">
                        <p className="text-[11px] font-sans-display uppercase tracking-[0.24em] text-text-secondary/70">
                            {BRAND_OWNER}
                        </p>
                        <p className="text-sm text-text-secondary">
                            {new Date().getFullYear()} ZNS Enterprises. Built for creators, teams, and client-facing roadmap delivery.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
