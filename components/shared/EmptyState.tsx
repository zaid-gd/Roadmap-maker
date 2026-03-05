interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
            <span className="text-4xl mb-3">{icon}</span>
            <h3 className="font-display font-bold text-text-primary text-text-primary text-lg mb-1">{title}</h3>
            <p className="text-text-secondary text-sm max-w-sm mb-4" style={{ textWrap: "balance" }}>
                {description}
            </p>
            {action ? (
                <button
                    type="button"
                    className="btn btn-secondary text-sm"
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            ) : null}
        </div>
    );
}
