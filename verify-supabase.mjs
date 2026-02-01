import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function verify() {
    console.log('🔍 Checking Supabase connection and data...');
    try {
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        const wordListCount = await prisma.wordList.count();
        console.log(`WordList count: ${wordListCount}`);

        const wordCount = await prisma.word.count();
        console.log(`Word count: ${wordCount}`);

        const questionCount = await prisma.question.count();
        console.log(`Question count: ${questionCount}`);

        const sessionCount = await prisma.practiceSession.count();
        console.log(`PracticeSession count: ${sessionCount}`);

        const answerCount = await prisma.answer.count();
        console.log(`Answer count: ${answerCount}`);

    } catch (e) {
        console.error('❌ Connection failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
