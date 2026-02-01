import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function compareUserCounts() {
    console.log("------------------------------------------");
    console.log("👥 Comparing User Tables");
    console.log("------------------------------------------");

    try {
        // 1. Count public.User (Your application table)
        const publicCount = await prisma.user.count();
        console.log(`🏠 public.User count:  ${publicCount}`);

        // 2. Count auth.users (Supabase Authentication table)
        try {
            const authResult = await prisma.$queryRaw`SELECT COUNT(*) FROM "auth"."users"`;
            const authCount = authResult[0].count; // safely access usually returned as BigInt or string
            console.log(`🔐 auth.users count:   ${authCount.toString()}`);
        } catch (err) {
            console.log(`🔐 auth.users count:   (Could not access - likely permission issue)`);
            // console.error(err.message);
        }

        console.log("------------------------------------------");
        if (publicCount === 0) {
            console.log("💡 diagnosis: Your 'public.User' table is empty.");
            console.log("   Prisma queries this table by default.");
            console.log("   Users in 'auth.users' are NOT automatically synced to 'public.User'.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

compareUserCounts();
