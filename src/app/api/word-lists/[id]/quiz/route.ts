import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const questions = await prisma.question.findMany({
            where: { wordListId: id },
            orderBy: { createdAt: 'desc' }, // Or random? Maybe random is better for a quiz
        });

        // Shuffle questions for better variety if desired, but for now just return them
        // We can shuffle in the frontend or here.

        return NextResponse.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
