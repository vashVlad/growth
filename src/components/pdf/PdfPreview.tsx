'use client';
import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { PdfDocument } from './PdfDocument';
import { JournalDraft, Entry } from '@/hooks/useJournal';
import { PdfThemeName } from './themes';

interface PdfPreviewProps {
    draft: JournalDraft;
    entries: Entry[];
    themeName: PdfThemeName;
    className?: string;
    style?: React.CSSProperties;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ draft, entries, themeName, className, style }) => {
    return (
        <PDFViewer
            className={className}
            style={{ width: '100%', height: '100%', border: 'none', ...style } as any}
            showToolbar={true}
        >
            <PdfDocument draft={draft} entries={entries} themeName={themeName} />
        </PDFViewer>
    );
};
