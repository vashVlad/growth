export type PdfThemeName = 'minimal' | 'classic' | 'modern' | 'nature';

export interface PdfTheme {
    id: PdfThemeName;
    name: string;
    description: string;
    fonts: {
        body: string;
        header: string;
    };
    styles: {
        pagePadding: number;
        titleSize: number;
        bodySize: number;
        lineHeight: number;
        headerTransform?: 'uppercase' | 'none' | 'capitalize';
        headerSpacing: number;
        accentColor: string;
        entrySeparator: 'line' | 'none' | 'whitespace';
    };
}

export const PDF_THEMES: Record<PdfThemeName, PdfTheme> = {
    // 1. Minimal Calm
    minimal: {
        id: 'minimal',
        name: 'Minimal Calm',
        description: 'Clean, spacious, and breathable.',
        fonts: {
            body: 'Open Sans',
            header: 'Open Sans',
        },
        styles: {
            pagePadding: 50,
            titleSize: 22,
            bodySize: 10,
            lineHeight: 1.6,
            headerTransform: 'none',
            headerSpacing: 25,
            accentColor: '#000000',
            entrySeparator: 'whitespace',
        },
    },
    // 2. Classic Book
    classic: {
        id: 'classic',
        name: 'Classic Book',
        description: 'Traditional literary aesthetic.',
        fonts: {
            body: 'Crimson Text',
            header: 'Crimson Text',
        },
        styles: {
            pagePadding: 45,
            titleSize: 26,
            bodySize: 11,
            lineHeight: 1.5,
            headerTransform: 'capitalize',
            headerSpacing: 20,
            accentColor: '#333333',
            entrySeparator: 'line',
        },
    },
    // 3. Modern Editorial
    modern: {
        id: 'modern',
        name: 'Modern Editorial',
        description: 'Contemporary look with distinct headers.',
        fonts: {
            body: 'Open Sans',
            header: 'Montserrat',
        },
        styles: {
            pagePadding: 40,
            titleSize: 28,
            bodySize: 10,
            lineHeight: 1.5,
            headerTransform: 'uppercase',
            headerSpacing: 30,
            accentColor: '#000000',
            entrySeparator: 'line',
        },
    },
    // 4. Nature Notes
    nature: {
        id: 'nature',
        name: 'Nature Notes',
        description: 'Gentle and organic.',
        fonts: {
            body: 'Lora',
            header: 'Lora',
        },
        styles: {
            pagePadding: 55,
            titleSize: 24,
            bodySize: 11,
            lineHeight: 1.7,
            headerTransform: 'none',
            headerSpacing: 25,
            accentColor: '#5c5c5c',
            entrySeparator: 'whitespace',
        },
    },
};

export const getTheme = (name: PdfThemeName = 'minimal'): PdfTheme => {
    return PDF_THEMES[name] || PDF_THEMES['minimal'];
};
