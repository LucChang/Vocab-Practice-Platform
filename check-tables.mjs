import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function checkTables() {
    console.log('🔍 Checking existing tables in public schema...');
    try {
        const result = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
        console.log('Tables found:', result);
    } catch (e) {
        console.error('❌ Query failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkTables();
