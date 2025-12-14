import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Fetch the word list and its words
        const wordList = await prisma.wordList.findUnique({
            where: { id },
            include: { words: true },
        });

        if (!wordList) {
            return NextResponse.json({ error: 'Word list not found' }, { status: 404 });
        }

        if (wordList.words.length === 0) {
            return NextResponse.json({ error: 'Word list is empty' }, { status: 400 });
        }

        // 2. Prepare prompt for Gemini
        const wordsText = wordList.words.map(w => `${w.word} (${w.meaning})`).join(', ');
        const prompt = `
      Create a quiz for the following vocabulary words: ${wordsText}.
      Generate 1 multiple-choice question for EACH word.
      
      Return ONLY a JSON array of objects, where each object has:
      - type: "multiple-choice"
      - prompt: The question text (e.g. "What is the meaning of X?" or fill-in-the-blank).
      - options: An array of 4 strings (options).
      - correctAnswer: The string value of the correct option.
      - explanation: A brief explanation of why it is correct.
      
      The output must be valid JSON. Do not include markdown formatting.
    `;

        // 3. Call Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let questionsData;

        try {
            questionsData = JSON.parse(cleanedText);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        // 4. Save questions to database
        // We'll use a transaction to create them all
        const createdQuestions = await prisma.$transaction(
            questionsData.map((q: any) =>
                prisma.question.create({
                    data: {
                        wordListId: id,
                        type: q.type || 'multiple-choice',
                        prompt: q.prompt,
                        optionsJson: JSON.stringify(q.options),
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        createdByGemini: true,
                    },
                })
            )
        );

        return NextResponse.json({ count: createdQuestions.length });

    } catch (error) {
        console.error('Error generating questions:', error);
        return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }
}
