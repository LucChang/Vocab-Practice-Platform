import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.word.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting word:', error);

        return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
    }
}
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { meaning, partOfSpeech, example } = body;

        const updatedWord = await prisma.word.update({
            where: { id },
            data: {
                meaning,
                partOfSpeech,
                example,
            },
        });

        return NextResponse.json(updatedWord);
    } catch (error) {
        console.error('Error updating word:', error);
        return NextResponse.json({ error: 'Failed to update word' }, { status: 500 });
    }
}
