import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'en-zh'; // 'en-zh' or 'zh-en'
        const count = parseInt(searchParams.get('count') || '10');

        // Fetch all words (or a large subset) to generate randomized questions
        // In a real production app with millions of words, use raw SQL for random selection.
        const allWords = await prisma.word.findMany({
            where: {
                meaning: { not: null }, // Ensure words have meanings
            },
            select: {
                id: true,
                word: true,
                meaning: true,
            },
        });

        if (allWords.length < 4) {
            return NextResponse.json({ error: 'Not enough words to generate a quiz (need at least 4)' }, { status: 400 });
        }

        // Shuffle words
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, Math.min(count, shuffled.length));

        const questions = selectedWords.map(target => {
            // Pick 3 distractors
            const distractors = allWords
                .filter(w => w.id !== target.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            let prompt: string;
            let correctAnswer: string;
            let options: string[];

            if (mode === 'zh-en') {
                // Chinese (Meaning) -> English (Word)
                prompt = target.meaning || '';
                correctAnswer = target.word;
                options = [target.word, ...distractors.map(d => d.word)];
            } else {
                // English (Word) -> Chinese (Meaning)
                prompt = target.word;
                correctAnswer = target.meaning || '';
                options = [target.meaning || '', ...distractors.map(d => d.meaning || '')];
            }

            // Shuffle options
            options = options.sort(() => 0.5 - Math.random());

            return {
                id: target.id,
                type: 'multiple-choice',
                prompt,
                correctAnswer,
                options,
            };
        });

        return NextResponse.json(questions);

    } catch (error) {
        console.error('Error generating general quiz:', error);
        return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
    }
}
