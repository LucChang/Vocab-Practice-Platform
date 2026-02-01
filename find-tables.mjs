import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function findUserTables() {
    console.log('🔍 Searching for user-related tables...');
    try {
        const result = await prisma.$queryRaw`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name ILIKE '%user%' 
            ORDER BY table_schema, table_name;
        `;

        console.log('Found matches:', result);

        const allTables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `;
        console.log('ALL public tables:', allTables.map(t => t.table_name));

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

findUserTables();
