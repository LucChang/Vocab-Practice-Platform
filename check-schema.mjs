import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function checkSchema() {
    console.log('🔍 Database Schema Inspection');
    console.log('--------------------------------');
    try {
        // 1. List all tables in 'public' schema
        const publicTables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;

        console.log('📂 Tables in [public] schema:');
        if (publicTables.length === 0) {
            console.log('   (No tables found)');
        } else {
            publicTables.forEach(t => console.log(`   - ${t.table_name}`));
        }

        // 2. List all tables in 'auth' schema
        const authTables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'auth'
            ORDER BY table_name;
        `;

        console.log('\n🔐 Tables in [auth] schema (Supabase Auth):');
        if (authTables.length === 0) {
            console.log('   (No tables found or no permission)');
        } else {
            authTables.forEach(t => console.log(`   - ${t.table_name}`));
        }

    } catch (e) {
        console.error('❌ Error inspecting schema:', e.message);
    } finally {
        await prisma.$disconnect();
    }
    console.log('--------------------------------');
}

checkSchema();
