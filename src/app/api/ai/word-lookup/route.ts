import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(daabain: Request) {
    try {
        const { word } = await daabain.json();

        if (!word) {
            return NextResponse.json({ error: 'Word is required' }, { status: 400 });
        }

        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        // Robustly extract the API Key to handle accidental quotes or whitespace
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

        const prompt = `
      Don't say a lot of polite words, Directly into the Topic. Provide the meaning, part of speech, and a simple example sentence for the English word "${word}".
      Return ONLY a JSON object with the following keys:
      - meaning: A detail definition of the word in Traditional Chinese (繁體中文). translate to Traditional Chinese if necessary.
      - partOfSpeech: The part of speech (e.g., noun, verb, adj) in English or Chinese.
      - example: A simple English example sentence containing the word.
      For example, if the word is "pale", the response should be:
      { "meaning": "缺乏鮮明的顏色；顏色很淺的；蒼白的", "partOfSpeech": "Adjective", "example": "Her face turned pale when she heard the bad news.

" }
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

    } catch (error: any) {
        console.error('Error looking up word:', error);
        return NextResponse.json({ error: 'Failed to lookup word', details: error.message || String(error) }, { status: 500 });
    }
}
