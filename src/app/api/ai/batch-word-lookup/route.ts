import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { words } = await req.json();

        if (!words || !Array.isArray(words) || words.length === 0) {
            return NextResponse.json({ error: 'Words array is required' }, { status: 400 });
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
            // Fallback: just trim and remove quotes if regex doesn't match
            apiKey = apiKey.trim();
            if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
                apiKey = apiKey.slice(1, -1);
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // List of models to try in order
        const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-pro'];

        let finalText = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting batch lookup with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `
              Don't say a lot of polite words, Directly into the Topic. For each of the following English words, provide the meaning, part of speech, and a simple example sentence:
              ${JSON.stringify(words)}
        
              Return ONLY a VALID JSON array of objects.
              Each object MUST follow this structure:
              {
                "word": "The original English word from the list",
                "meaning": "A detailed definition in Traditional Chinese (繁體中文). Translate to Traditional Chinese if necessary.",
                "partOfSpeech": "The part of speech (e.g., noun, verb, adj) in English or Chinese.",
                "example": "A simple English example sentence containing the word."
              }
              
              For example, if the list contains "pale", one object in the array should be:
              { "word": "pale", "meaning": "缺乏鮮明的顏色；顏色很淺的；蒼白的", "partOfSpeech": "Adjective", "example": "Her face turned pale when she heard the bad news." }
        
              Ensure the "word" field exactly matches the input word to allow matching results back.
              Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
            `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                finalText = response.text();
                break; // Success!
            } catch (error: any) {
                console.warn(`Failed with model ${modelName}:`, error.message);
                lastError = error;
            }
        }

        if (!finalText) {
            console.error('All models failed. Last error:', lastError);
            return NextResponse.json({
                error: 'Failed to lookup words with available AI models',
                details: lastError?.message || String(lastError)
            }, { status: 500 });
        }

        // Clean up markdown if present
        const cleanedText = finalText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const json = JSON.parse(cleanedText);
            if (!Array.isArray(json)) {
                throw new Error("Response is not an array");
            }

            // Normalize keys to ensure they match expected schema (handle different casing from AI)
            const normalizedJson = json.map((item: any) => ({
                word: item.word || item.Word,
                meaning: item.meaning || item.Meaning || item.definition || item.Definition,
                partOfSpeech: item.partOfSpeech || item.PartOfSpeech || item.part_of_speech,
                example: item.example || item.Example || item.sentence || item.Sentence
            }));

            return NextResponse.json(normalizedJson);
        } catch (e) {
            console.error('Failed to parse Gemini batch response:', finalText);
            return NextResponse.json({ error: 'Failed to parse AI response', raw: finalText }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Error batch looking up words:', error);
        return NextResponse.json({ error: 'Failed to lookup words', details: error.message }, { status: 500 });
    }
}
