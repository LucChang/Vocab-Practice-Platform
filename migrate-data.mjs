import { PrismaClient } from '@prisma/client';
import initSqlite from 'better-sqlite3';

const prisma = new PrismaClient();
// 注意：這裡假設你的 SQLite 檔案路徑。請根據實際情況調整，例如 './prisma/dev.db' 或 './dev.db'
const db = initSqlite('./prisma/dev.db');

function parseDate(dateStr, fallback = new Date()) {
    if (!dateStr) return fallback;
    const d = new Date(typeof dateStr === 'number' ? dateStr : dateStr);
    return isNaN(d.getTime()) ? fallback : d;
}

async function migrate() {
    console.log('🚀 開始從 SQLite 遷移資料到 Supabase...');

    try {
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log('📝 SQLite 資料表:', tables.map(t => t.name).join(', '));
        const tableNames = tables.map(t => t.name);

        if (tableNames.includes('User')) {
            try {
                const users = db.prepare('SELECT * FROM User').all();
                console.log(`📦 搬運 ${users.length} 個使用者...`);
                for (const u of users) {
                    await prisma.user.upsert({
                        where: { id: u.id },
                        update: {},
                        create: {
                            id: u.id,
                            email: u.email,
                            passwordHash: u.passwordHash,
                            createdAt: parseDate(u.createdAt),
                            updatedAt: parseDate(u.updatedAt)
                        },
                    });
                }
            } catch (e) { console.error('❌ User 遷移失敗:', e.message); }
        }

        if (tableNames.includes('WordList')) {
            try {
                const wordLists = db.prepare('SELECT * FROM WordList').all();
                console.log(`📦 搬運 ${wordLists.length} 個單字本...`);
                for (const l of wordLists) {
                    await prisma.wordList.upsert({
                        where: { id: l.id },
                        update: {},
                        create: {
                            id: l.id,
                            title: l.title,
                            description: l.description,
                            tags: l.tags,
                            userId: l.userId,
                            createdAt: parseDate(l.createdAt),
                            updatedAt: parseDate(l.updatedAt)
                        },
                    });
                }
            } catch (e) { console.error('❌ WordList 遷移失敗:', e.message); }
        }

        if (tableNames.includes('Word')) {
            try {
                const words = db.prepare('SELECT * FROM Word').all();
                console.log(`📦 搬運 ${words.length} 個單字...`);
                if (words.length > 0) {
                    await prisma.word.createMany({
                        data: words.map(w => ({
                            id: w.id,
                            word: w.word,
                            meaning: w.meaning,
                            partOfSpeech: w.partOfSpeech,
                            example: w.example,
                            difficulty: w.difficulty,
                            wordListId: w.wordListId,
                            createdAt: parseDate(w.createdAt)
                        })),
                        skipDuplicates: true
                    });
                }
            } catch (e) { console.error('❌ Word 遷移失敗:', e.message); }
        }

        if (tableNames.includes('Question')) {
            try {
                const questions = db.prepare('SELECT * FROM Question').all();
                console.log(`📦 搬運 ${questions.length} 個題目...`);
                if (questions.length > 0) {
                    await prisma.question.createMany({
                        data: questions.map(q => ({
                            id: q.id,
                            type: q.type,
                            prompt: q.prompt,
                            optionsJson: q.optionsJson,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation,
                            createdByGemini: q.createdByGemini === 1,
                            wordListId: q.wordListId,
                            createdAt: parseDate(q.createdAt)
                        })),
                        skipDuplicates: true
                    });
                }
            } catch (e) { console.error('❌ Question 遷移失敗:', e.message); }
        }

        if (tableNames.includes('PracticeSession')) {
            try {
                const sessions = db.prepare('SELECT * FROM PracticeSession').all();
                console.log(`📦 搬運 ${sessions.length} 個練習紀錄...`);
                if (sessions.length > 0) {
                    await prisma.practiceSession.createMany({
                        data: sessions.map(s => ({
                            id: s.id,
                            startedAt: parseDate(s.startedAt),
                            endedAt: parseDate(s.endedAt, null),
                            correctCount: s.correctCount,
                            totalCount: s.totalCount,
                            userId: s.userId,
                            wordListId: s.wordListId
                        })),
                        skipDuplicates: true
                    });
                }
            } catch (e) { console.error('❌ PracticeSession 遷移失敗:', e.message); }
        }

        if (tableNames.includes('Answer')) {
            try {
                const answers = db.prepare('SELECT * FROM Answer').all();
                console.log(`📦 搬運 ${answers.length} 個回答...`);
                if (answers.length > 0) {
                    await prisma.answer.createMany({
                        data: answers.map(a => ({
                            id: a.id,
                            userAnswer: a.userAnswer,
                            isCorrect: a.isCorrect === 1,
                            timeSpent: a.timeSpent,
                            sessionId: a.sessionId || a.practiceSessionId, // Check both
                            questionId: a.questionId,
                            createdAt: parseDate(a.createdAt)
                        })),
                        skipDuplicates: true
                    });
                }
            } catch (e) { console.error('❌ Answer 遷移失敗:', e.message); }
        }

        console.log('✅ 遷移流程結束');
    } catch (error) {
        console.error('❌ 全域遷移失敗:', error.message);
    } finally {
        await prisma.$disconnect();
        db.close();
    }
}

migrate();
