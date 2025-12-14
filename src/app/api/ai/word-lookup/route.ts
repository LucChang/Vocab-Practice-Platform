import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(daabain: Request) {
    try {
        const { word } = await daabain.json();

        if (!word) {
            return NextResponse.json({ error: 'Word is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
      Provide the meaning, part of speech, and a simple example sentence for the English word "${word}".
      Return ONLY a JSON object with the following keys:
      - meaning: a definition in Traditional Chinese (繁體中文).
      - partOfSpeech: The part of speech (e.g., noun, verb, adj) in English or Chinese.
      - example: A simple English example sentence containing the word.
      
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
        // Clean up potential markdown code blocks if Gemini adds them despite instructions
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        try {
            const json = JSON.parse(cleanedText);
            return NextResponse.json(json);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error looking up word:', error);
        return NextResponse.json({ error: 'Failed to lookup word' }, { status: 500 });
    }
}
