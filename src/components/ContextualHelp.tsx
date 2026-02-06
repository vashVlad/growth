'use client';
import React, { useState, useRef, useEffect } from 'react';

interface ContextualHelpProps {
    title: string;
    content: React.ReactNode;
    color?: string;
}

import { createPortal } from 'react-dom';

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ title, content, color = 'var(--primary)' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scrolling background when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = () => setIsOpen(false);

    const sheetContent = (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(2px)',
                    animation: 'fadeIn 0.2s ease-out'
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
                    zIndex: 9999,
                    backgroundColor: 'var(--surface)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    padding: '1.5rem',
                    paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))', // iOS Safety
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                    borderTop: '1px solid var(--border)',
                    maxWidth: '600px',
                    margin: '0 auto', // Center on desktop
                    maxHeight: '85vh',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>
                        {title}
                    </h3>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'var(--surface-highlight)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--foreground)',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            lineHeight: 1
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--foreground)', overflowY: 'auto' }}>
                    {content}
                </div>
            </div>
        </>
    );

    return (
        <div
            className="contextual-help"
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '0.5rem' }}
        >
            <button
                type="button"
                onClick={() => setIsOpen(true)}
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

            {mounted && isOpen && createPortal(sheetContent, document.body)}
        </div>
    );
};
