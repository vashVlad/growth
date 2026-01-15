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
            className={`card ${className}`}
            style={{
                position: 'relative',
                ...((onClick) ? { cursor: 'pointer' } : {})
            }}
        >
            {children}
            {actions && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                    {actions}
                </div>
            )}
        </div >
    );
};
