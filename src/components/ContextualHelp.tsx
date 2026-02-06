'use client';
import React, { useState, useRef, useEffect } from 'react';

interface ContextualHelpProps {
    title: string;
    content: React.ReactNode;
    color?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ title, content, color = 'var(--primary)' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside (though backdrop handles most cases, this is safe)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className="contextual-help"
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.5rem' }}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={`Help: ${title}`}
                style={{
                    background: 'none',
                    border: `1px solid ${color}`,
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: color,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    opacity: 0.7,
                    transition: 'opacity 0.2s'
                }}
            >
                ?
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 998,
                            backgroundColor: 'rgba(0,0,0,0.2)'
                        }}
                    />

                    {/* Bottom Sheet / Panel */}
                    <div
                        className="animate-slide-up"
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 999,
                            backgroundColor: 'var(--surface)',
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                            borderTop: '1px solid var(--border)',
                            maxWidth: '600px',
                            margin: '0 auto' // Center on desktop
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                                {title}
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    color: 'var(--foreground-muted)',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)' }}>
                            {content}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
