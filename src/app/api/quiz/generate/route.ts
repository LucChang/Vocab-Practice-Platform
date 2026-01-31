import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode') || 'en-zh'; // 'en-zh' or 'zh-en'
        const count = parseInt(searchParams.get('count') || '10');
        const useAI = searchParams.get('ai') === 'true';

        // Fetch all words (or a large subset) to generate randomized questions
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

        let aiDistractorsMap: Record<string, string[]> = {};

        // ------------------------------------------------------------------
        // AI Generation Logic
        // ------------------------------------------------------------------
        if (useAI) {
            try {
                let apiKey = process.env.GEMINI_API_KEY;
                if (apiKey) {
                    // Extract API Key logic (same as word-lookup)
                    const keyMatch = apiKey.match(/(AIza[0-9A-Za-z\-_]{35})/);
                    if (keyMatch) {
                        apiKey = keyMatch[0];
                    } else {
                        apiKey = apiKey.trim();
                        if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
                            apiKey = apiKey.slice(1, -1);
                        }
                    }

                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                    const targets = selectedWords.map(w => ({ id: w.id, word: w.word, meaning: w.meaning }));

                    let prompt = "";
                    if (mode === 'zh-en') {
                        // Prompt: English Word -> Answer: Meaning.
                        // We need 3 distractors that are MEANINGS (Traditional Chinese).
                        prompt = `
                            You are a vocabulary quiz generator.
                            For each of the following words, generate 3 plausible but INCORRECT meanings (distractors) in Traditional Chinese (繁體中文).
                            The distractors should be related or confusing but definitely wrong.
                            
                            Words: ${JSON.stringify(targets)}
                            
                            Return ONLY a JSON object where keys are the word IDs and values are arrays of 3 distractor strings.
                            Example format: { "id1": ["wrong1", "wrong2", "wrong3"], "id2": [...] }
                            Do not use Markdown.
                        `;
                    } else {
                        // Prompt: Meaning -> Answer: English Word.
                        // We need 3 distractors that are ENGLISH WORDS.
                        prompt = `
                            You are a vocabulary quiz generator.
                            For each of the following definitions, generate 3 plausible but INCORRECT English words (distractors).
                            The distractors should be real English words that might be confused with the correct one.
                            
                            Defs: ${JSON.stringify(targets)}
                            
                            Return ONLY a JSON object where keys are the word IDs and values are arrays of 3 distractor strings.
                            Example format: { "id1": ["wrong1", "wrong2", "wrong3"], "id2": [...] }
                            Do not use Markdown.
                        `;
                    }

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                    aiDistractorsMap = JSON.parse(text);
                }
            } catch (e) {
                console.error("Gemini Generation Failed, falling back to random:", e);
                // Fallback will naturally happen as aiDistractorsMap will be empty/incomplete
            }
        }

        // ------------------------------------------------------------------
        // Question Construction
        // ------------------------------------------------------------------
        const questions = selectedWords.map(target => {
            let options: string[] = [];
            let prompt: string;
            let correctAnswer: string;

            // Try to use AI distractors first
            let distractors: string[] = [];
            if (useAI && aiDistractorsMap[target.id] && Array.isArray(aiDistractorsMap[target.id]) && aiDistractorsMap[target.id].length === 3) {
                distractors = aiDistractorsMap[target.id];
            } else {
                // Fallback: Pick 3 random distractors from DB
                distractors = allWords
                    .filter(w => w.id !== target.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(d => mode === 'zh-en' ? (d.meaning || '') : d.word);
            }

            if (mode === 'zh-en') {
                // English (Word) -> Chinese (Meaning)
                prompt = target.word;
                correctAnswer = target.meaning || '';
                options = [correctAnswer, ...distractors];
            } else {
                // Chinese (Meaning) -> English (Word)
                prompt = target.meaning || '';
                correctAnswer = target.word;
                options = [correctAnswer, ...distractors];
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
