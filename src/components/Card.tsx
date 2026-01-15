import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, actions }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-sm border border-secondary p-4 ${className}`}
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid var(--secondary)',
                padding: '1.5rem',
                position: 'relative',
                ...((onClick) ? { cursor: 'pointer' } : {})
            }}
        >
            {actions && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {actions}
                </div>
            )}
            {children}
        </div>
    );
};
