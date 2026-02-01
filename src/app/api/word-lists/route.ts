import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // TODO: Get real user ID from session. For MVP, we'll use a hardcoded or first user.
        let user = await prisma.user.findFirst();

        if (!user) {
            // Create a demo user if none exists
            user = await prisma.user.create({
                data: {
                    email: 'demo@vocalab.com',
                    passwordHash: 'hashed_password', // In real app, hash this
                },
            });
        }

        const wordLists = await prisma.wordList.findMany({
            where: { userId: user.id },
            include: {
                _count: {
                    select: { words: true, questions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(wordLists);
    } catch (error) {
        console.error('Error fetching word lists:', error);
        return NextResponse.json({ error: 'Failed to fetch word lists' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, tags } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // TODO: Get real user ID
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'demo@vocalab.com',
                    passwordHash: 'hashed_password',
                },
            });
        }

        const newList = await prisma.wordList.create({
            data: {
                title,
                description,
                tags,
                userId: user.id,
            },
        });

        return NextResponse.json(newList);
    } catch (error) {
        console.error('Error creating word list:', error);
        return NextResponse.json({ error: 'Failed to create word list' }, { status: 500 });
    }
}
