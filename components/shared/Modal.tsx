"use client";

import { useEffect, useCallback, useRef } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className={`relative ${maxWidth} w-full glass-elevated rounded-xl shadow-2xl animate-scale-in`}
                style={{ overscrollBehavior: "contain" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-display font-bold text-text-primary text-text-primary">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost p-1.5 text-text-secondary hover:text-text-primary"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
