import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PdfImage } from '@react-pdf/renderer';
import { JournalDraft, Entry } from '@/hooks/useJournal';
import { formatDateForPdf } from '@/utils/date';
import { getTheme, PdfThemeName } from './themes';
import { registerFonts } from './fonts';

// Register fonts once module is loaded
registerFonts();

interface PdfDocumentProps {
    draft: JournalDraft;
    entries: Entry[];
    themeName?: PdfThemeName;
}

export const PdfDocument: React.FC<PdfDocumentProps> = ({ draft, entries, themeName = 'minimal' }) => {
    // Resolve theme using the new helper
    const theme = getTheme(themeName);

    // Dynamic Styles based on Theme
    const styles = React.useMemo(() => StyleSheet.create({
        page: {
            width: '6in',
            height: '9in',
            paddingTop: theme.styles.pagePadding,
            paddingBottom: theme.styles.pagePadding,
            paddingLeft: theme.styles.pagePadding * 0.8,
            paddingRight: theme.styles.pagePadding * 0.8,
            fontFamily: theme.fonts.body,
            fontSize: theme.styles.bodySize,
            lineHeight: theme.styles.lineHeight,
        },
        coverPage: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
        },
        title: {
            fontFamily: theme.fonts.header,
            fontSize: theme.styles.titleSize,
            marginBottom: 24,
            textAlign: 'center',
            textTransform: theme.styles.headerTransform,
            fontWeight: 700, // Make titles bold
        },
        dateRange: {
            fontSize: theme.styles.bodySize * 1.2,
            fontStyle: 'italic',
            fontFamily: theme.fonts.body, // Use body font with italic style
            marginBottom: 48,
            textAlign: 'center',
            color: '#666',
        },
        subTitle: {
            fontSize: theme.styles.bodySize,
            fontFamily: theme.fonts.body,
            color: '#666666',
            marginTop: 'auto',
            marginBottom: 24,
        },
        sectionTitle: {
            fontFamily: theme.fonts.header,
            fontSize: theme.styles.bodySize * 1.4,
            textTransform: theme.styles.headerTransform,
            letterSpacing: theme.styles.headerTransform === 'uppercase' ? 2 : 0,
            marginBottom: 24,
            textAlign: 'center',
            borderBottom: `1pt solid ${theme.styles.accentColor}`,
            paddingBottom: 8,
            fontWeight: 700,
        },
        prefaceText: {
            fontSize: theme.styles.bodySize,
            fontFamily: theme.fonts.body,
            fontStyle: 'italic',
            lineHeight: 1.8,
            textAlign: 'justify',
            marginHorizontal: 30,
        },
        entryContainer: {
            marginBottom: theme.styles.headerSpacing,
            paddingBottom: theme.styles.entrySeparator === 'line' ? 12 : 0,
            borderBottom: theme.styles.entrySeparator === 'line' ? '0.5pt solid #ddd' : 'none',
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
        },
        entryDate: {
            fontFamily: theme.fonts.header,
            fontSize: theme.styles.bodySize * 1.1,
            textTransform: theme.styles.headerTransform,
            fontWeight: 700,
        },
        entryPrompt: {
            fontSize: theme.styles.bodySize * 0.9,
            fontFamily: theme.fonts.body,
            fontStyle: 'italic',
            color: '#444444',
            marginBottom: 8,
        },
        entryContent: {
            textAlign: 'justify',
            fontSize: theme.styles.bodySize,
            fontFamily: theme.fonts.body,
            marginBottom: 12,
        },
        reflectionContainer: {
            marginTop: 8,
            paddingTop: 8,
            borderTop: '0.5pt solid #eee',
        },
        reflectionHeader: {
            fontFamily: theme.fonts.header,
            fontSize: theme.styles.bodySize * 0.8,
            textTransform: 'uppercase',
            color: '#666',
            marginBottom: 4,
            letterSpacing: 1,
            fontWeight: 700,
        },
        reflectionItem: {
            marginBottom: 6,
        },
        reflectionQuestion: {
            fontSize: theme.styles.bodySize * 0.9,
            fontFamily: theme.fonts.body,
            fontStyle: 'italic',
            color: '#444',
            marginBottom: 2,
        },
        reflectionAnswer: {
            fontSize: theme.styles.bodySize * 0.9,
            color: '#000',
        },
        closingPage: {
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
        },
        closingText: {
            fontStyle: 'italic',
            fontFamily: theme.fonts.body,
            color: '#888888',
        },
    }), [theme]);


    const sortedEntries = React.useMemo(() => draft.includedEntryIds
        .map(id => entries.find(e => e.id === id))
        .filter((e): e is Entry => !!e)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        [draft.includedEntryIds, entries]
    );

    // Calculate dynamic date range from actual content
    // Memoizing these dates is cheap but ensures consistency
    const { startDate, endDate } = React.useMemo(() => ({
        startDate: sortedEntries.length > 0 ? sortedEntries[0].date : draft.criteria.startDate || new Date().toISOString(),
        endDate: sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].date : draft.criteria.endDate || new Date().toISOString()
    }), [sortedEntries, draft.criteria.startDate, draft.criteria.endDate]);








    const renderStructuredResponse = (entry: Entry) => {
        // ... (render logic remains same, pure function)
        const isGrowth = entry.reflectionMode === 'growth';

        const fields = isGrowth ? [
            { label: 'What did I learn or improve upon today?', value: entry.learnedText },
            { label: 'Did my actions align with my values and goals?', value: entry.alignmentText },
            { label: 'What can I do differently tomorrow to improve?', value: entry.improveTomorrowText },
        ] : [
            { label: 'What excited you today?', value: entry.reflectionAnchors?.excitedText },
            { label: 'What drained your energy?', value: entry.reflectionAnchors?.drainedText },
            { label: 'What are you grateful for?', value: entry.reflectionAnchors?.gratefulText },
        ];

        const activeFields = fields.filter(f => f.value && f.value.trim().length > 0);

        if (activeFields.length === 0) return null;

        return (
            <View style={styles.reflectionContainer}>
                <Text style={styles.reflectionHeader}>
                    {isGrowth ? 'Growth Reflection' : 'Purpose Reflection'}
                </Text>
                {activeFields.map((field, idx) => (
                    <View key={idx} style={styles.reflectionItem}>
                        <Text style={styles.reflectionQuestion}>{field.label}</Text>
                        <Text style={styles.reflectionAnswer}>{field.value}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <Document
            title={draft.title}
            author="Growth Book User"
            creator="Growth Book"
            producer="Growth Book"
        >
            <Page size={[432, 648]} style={styles.page}>
                <View style={styles.coverPage}>
                    <PdfImage
                        src="/logo.png"
                        style={{ width: 120, height: 120, marginBottom: 32 }}
                    />
                    <Text style={styles.title}>{draft.title}</Text>
                    <Text style={styles.dateRange}>
                        {formatDateForPdf(startDate)} — {formatDateForPdf(endDate)}
                    </Text>
                    <Text style={styles.subTitle}>A Personal Record</Text>
                </View>
            </Page>

            {draft.intent && (
                <Page size={[432, 648]} style={styles.page}>
                    <View style={{ paddingTop: '30%' }}>
                        <Text style={styles.sectionTitle}>Preface</Text>
                        <Text style={styles.prefaceText}>{draft.intent}</Text>
                    </View>
                </Page>
            )}

            <Page size={[432, 648]} style={styles.page} wrap>
                {sortedEntries.map((entry, index) => (
                    <View key={entry.id} style={styles.entryContainer} wrap={true}>
                        <View style={styles.entryHeader}>
                            <Text style={styles.entryDate}>
                                {formatDateForPdf(entry.date)}
                            </Text>
                        </View>
                        {entry.prompt !== 'Free Write' && (
                            <Text style={styles.entryPrompt}>{entry.prompt}</Text>
                        )}
                        <Text style={styles.entryContent}>{entry.content}</Text>
                        {renderStructuredResponse(entry)}
                    </View>
                ))}
            </Page>

            <Page size={[432, 648]} style={styles.page}>
                <View style={styles.closingPage}>
                    <Text style={styles.closingText}>End of Volume I</Text>
                </View>
            </Page>
        </Document>
    );
};
