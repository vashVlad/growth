import { Font } from '@react-pdf/renderer';

export const registerFonts = () => {
    // Open Sans (Minimal & Modern Body)
    Font.register({
        family: 'Open Sans',
        fonts: [
            { src: '/fonts/OpenSans-Regular.woff', fontWeight: 400 },
            { src: '/fonts/OpenSans-Italic.woff', fontWeight: 400, fontStyle: 'italic' },
            { src: '/fonts/OpenSans-Bold.woff', fontWeight: 700 },
        ]
    });

    // Crimson Text (Classic)
    Font.register({
        family: 'Crimson Text',
        fonts: [
            { src: '/fonts/CrimsonText-Regular.woff', fontWeight: 400 },
            { src: '/fonts/CrimsonText-Italic.woff', fontWeight: 400, fontStyle: 'italic' },
            { src: '/fonts/CrimsonText-Bold.woff', fontWeight: 700 },
        ]
    });

    // Lora (Nature)
    Font.register({
        family: 'Lora',
        fonts: [
            { src: '/fonts/Lora-Regular.woff', fontWeight: 400 },
            { src: '/fonts/Lora-Italic.woff', fontWeight: 400, fontStyle: 'italic' },
            { src: '/fonts/Lora-Bold.woff', fontWeight: 700 },
        ]
    });

    // Montserrat (Modern Header)
    Font.register({
        family: 'Montserrat',
        fonts: [
            { src: '/fonts/Montserrat-Regular.woff', fontWeight: 400 },
            { src: '/fonts/Montserrat-Bold.woff', fontWeight: 700 },
        ]
    });
};
