import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const wordList = await prisma.wordList.findUnique({
            where: { id },
            include: {
                words: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { questions: true },
                },
            },
        });

        if (!wordList) {
            return NextResponse.json({ error: 'List not found' }, { status: 404 });
        }

        return NextResponse.json(wordList);
    } catch (error) {
        console.error('Error fetching word list:', error);
        return NextResponse.json({ error: 'Failed to fetch word list' }, { status: 500 });
    }
}

// Add a word to the list
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { word, meaning, partOfSpeech, example } = body;

        if (!word) {
            return NextResponse.json({ error: 'Word is required' }, { status: 400 });
        }

        const newWord = await prisma.word.create({
            data: {
                word,
                meaning,
                partOfSpeech,
                example,
                wordListId: id,
            },
        });

        return NextResponse.json(newWord);
    } catch (error) {
        console.error('Error adding word:', error);
        return NextResponse.json({ error: 'Failed to add word' }, { status: 500 });
    }
}

// Update list details
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, description } = body;

        const updated = await prisma.wordList.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating list:', error);
        return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
    }
}

// Delete the list
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.wordList.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting list:', error);
        return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
    }
}
