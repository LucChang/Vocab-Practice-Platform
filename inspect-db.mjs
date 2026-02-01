import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function inspectDatabase() {
    console.log('🔍 Inspecting ALL tables in public schema...');
    try {
        // Get all table names in public schema
        const tables = await prisma.$queryRaw`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename;
        `;

        if (tables.length === 0) {
            console.log('❌ No tables found in public schema.');
            return;
        }

        console.log(`Found ${tables.length} tables. Checking row counts...`);

        for (const t of tables) {
            const tableName = t.tablename;
            try {
                // Unsafe query to count rows for each table found
                // We use quote identifiers to handle case sensitivity
                const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "public"."${tableName}"`);
                const count = countResult[0].count.toString();

                // Detailed log
                if (parseInt(count) > 0) {
                    console.log(`✅ Table '${tableName}': ${count} rows`);
                } else {
                    console.log(`xc2x9x Table '${tableName}': 0 rows`);
                }
            } catch (e) {
                console.log(`⚠️  Could not count '${tableName}': ${e.message.split('\n')[0]}`);
            }
        }

    } catch (e) {
        console.error('❌ detailed inspection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectDatabase();
