'use client';
import React, { useState } from 'react';
import { JournalDraft, Entry } from '@/hooks/useJournal';
import { PdfDocument } from './PdfDocument';
import { PdfThemeName } from './themes';


interface PdfDownloadButtonProps {
    draft: JournalDraft;
    entries: Entry[];
    themeName?: PdfThemeName;
    className?: string;
    style?: React.CSSProperties;
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({ draft, entries, themeName = 'minimal', className, style }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    // Slugify helper: allows a-z and 0-9
    const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            // Generate the Journal Entries PDF
            // Dynamically import to avoid SSR issues with @react-pdf/renderer
            const { pdf } = await import('@react-pdf/renderer');
            const blob = await pdf(
                <PdfDocument draft={draft} entries={entries} themeName={themeName} />
            ).toBlob();

            // Generate filename
            const safeParseDate = (val: string | number | undefined | null): Date | null => {
                if (!val) return null;
                const num = Number(val);
                if (!isNaN(num) && num > 0) return new Date(num);
                const d = new Date(val);
                if (!isNaN(d.getTime())) return d;
                return null;
            };

            const start = safeParseDate(draft.criteria.startDate);
            const end = safeParseDate(draft.criteria.endDate);
            const startStr = start ? start.toISOString().split('T')[0] : 'start';
            const endStr = end ? end.toISOString().split('T')[0] : 'end';
            const fileName = `growth-book-${slugify(draft.title)}-${themeName}-${startStr}_${endStr}.pdf`;

            // Configurable link download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            className={className}
            style={style}
            onClick={handleDownload}
            disabled={isGenerating}
        >
            {isGenerating ? 'Preparing PDF...' : 'Save as PDF'}
        </button>
    );
};
