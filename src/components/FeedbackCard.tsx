import React, { useState } from 'react';

export const FeedbackCard: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [type, setType] = useState('Suggestion');
    const [message, setMessage] = useState('');
    const [includeContext, setIncludeContext] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const recipientEmail = "vladvashchuk2005@gmail.com";

    const handleSend = () => {
        if (!message.trim()) {
            setError('Please write a quick note first.');
            return;
        }

        setError('');

        const subject = `Growth Book Feedback – ${type}`;
        let body = `${message}\n\n`;

        if (includeContext) {
            body += `\n--- App Context ---\n`;
            body += `Date: ${new Date().toLocaleString()}\n`;
            body += `User Agent: ${navigator.userAgent}\n`;
            body += `Path: ${window.location.pathname}\n`;
        }

        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // Try to open mail client
        window.location.href = mailtoLink;

        // Fallback / UX enhancement: Copy to clipboard logic could go here if we wanted to be fancy,
        // but for now we'll just rely on the mailto. If we wanted to copy, we'd use navigator.clipboard.
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                style={{
                    width: '100%',
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: 'var(--foreground)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                }}
            >
                <span>Feedback</span>
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
            </button>
        );
    }

    return (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--foreground)', marginBottom: '0.25rem' }}>Feedback</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--foreground-muted)', margin: 0 }}>
                        Suggest improvements, report bugs, or request features.
                    </p>
                </div>
                <button
                    onClick={() => setIsExpanded(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--foreground-muted)',
                        fontSize: '1.5rem',
                        lineHeight: 1,
                        cursor: 'pointer',
                        padding: '0.25rem'
                    }}
                    aria-label="Close"
                >
                    ×
                </button>
            </div>

            {/* Type Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-highlight)', padding: '0.25rem', borderRadius: '8px' }}>
                {['Suggestion', 'Bug', 'Question'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setType(t)}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '6px',
                            background: type === t ? 'var(--surface)' : 'transparent',
                            color: type === t ? 'var(--primary)' : 'var(--foreground-muted)',
                            fontWeight: type === t ? '600' : 'normal',
                            boxShadow: type === t ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Textarea */}
            <textarea
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value);
                    if (error) setError('');
                }}
                placeholder="What should be improved? What happened? What would you like to see?"
                style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: error ? '1px solid #ff4d4f' : '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    resize: 'vertical'
                }}
            />
            {error && <div style={{ color: '#ff4d4f', fontSize: '0.85rem' }}>{error}</div>}

            {/* Context Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                    type="checkbox"
                    checked={includeContext}
                    onChange={(e) => setIncludeContext(e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>Include app context (date, device logic)</span>
            </label>

            {/* Send Button */}
            <button
                onClick={handleSend}
                style={{
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: 'var(--background)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    width: '100%'
                }}
            >
                Send
            </button>

            {/* Email Display */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <a
                    href={`mailto:${recipientEmail}`}
                    style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', textDecoration: 'none' }}
                >
                    Send directly to: <span style={{ textDecoration: 'underline' }}>{recipientEmail}</span>
                </a>
            </div>
        </div>
    );
};
