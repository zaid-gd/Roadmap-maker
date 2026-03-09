export const MARKETING_NAV_ITEMS = [
    { href: "/", label: "Overview" },
    { href: "/gallery", label: "Gallery" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
] as const;

export const STUDIO_NAV_ITEMS = [
    { href: "/create", label: "Create" },
    { href: "/workspaces", label: "Workspaces" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/settings", label: "Settings" },
] as const;

export const FOOTER_NAV_GROUPS = [
    {
        title: "Explore",
        items: [
            { href: "/", label: "Overview" },
            { href: "/gallery", label: "Gallery" },
            { href: "/pricing", label: "Pricing" },
        ],
    },
    {
        title: "Studio",
        items: [
            { href: "/create", label: "Create" },
            { href: "/workspaces", label: "Workspaces" },
            { href: "/dashboard", label: "Dashboard" },
        ],
    },
    {
        title: "Company",
        items: [
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/contact", label: "Contact" },
        ],
    },
] as const;
