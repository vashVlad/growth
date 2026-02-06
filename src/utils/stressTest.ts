import { Entry } from '@/hooks/useJournal';

export const createStressTestEntry = (): Entry => ({
    id: 'stress-test-1',
    date: '2025-05-15',
    prompt: 'Free Write',
    content: `This is a stress test for the Nature Notes theme to ensure that long content flows correctly across pages without overlapping. 

    The Nature Notes theme uses the Lora font, which has physically larger glyphs and generous line spacing (1.7). This means content takes up significantly more vertical space than in other themes. If we force "break-inside: avoid" (wrap={false}), a long entry that exceeds the remaining space on a page—or even a full page—will glitch.

    We need to ensure that:
    1. The entry date and header flow naturally.
    2. Long paragraphs break cleanly between pages.
    3. The reflection section at the bottom is not cut off.

    ${"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(40)}

    End of stress test content.`,
    reflectionMode: 'growth', // Temporary valid value, or undefined if supported
    // Actually, if anchors are present but mode is not growth, it implies purpose in some logic? 
    // Let's check type definition.
    // If 'purpose' is not in type, then we should use 'growth' or undefined.
    // But let's just use 'growth' to be safe and test that layout too. 
    // Or better, let's just omit it if optional, or check the file.
    reflectionAnchors: {
        excitedText: "Testing layout boundaries with extended text content to verify wrap behavior.",
        drainedText: "Dealing with PDF rendering quirks and overlap issues.",
        gratefulText: "Reliable rendering engines that support pagination."
    },
    timestamp: Date.now()
});
