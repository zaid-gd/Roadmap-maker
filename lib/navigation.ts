export const PRIMARY_NAV_ITEMS = [
    { href: "/", label: "Home" },
    { href: "/create", label: "Create" },
    { href: "/workspaces", label: "Workspaces" },
    { href: "/pricing", label: "Pricing" },
    { href: "/settings", label: "Settings" },
] as const;

export const FOOTER_NAV_GROUPS = [
    {
        title: "Studio",
        items: [
            { href: "/", label: "Home" },
            { href: "/create", label: "Create a roadmap" },
            { href: "/workspaces", label: "Workspace library" },
        ],
    },
    {
        title: "Company",
        items: [
            { href: "/pricing", label: "Pricing" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/contact", label: "Contact" },
        ],
    },
] as const;
