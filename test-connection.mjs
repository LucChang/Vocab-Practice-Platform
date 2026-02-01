import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log("------------------------------------------");
    console.log("📡 Testing Database Connection...");
    console.log(`URL: ${process.env.DATABASE_URL?.replace(/:[^:]+@/, ':****@')}`); // Hide password in logs
    console.log("------------------------------------------");

    try {
        // Attempt a raw query to check connectivity
        const startTime = Date.now();
        const result = await prisma.$queryRaw`SELECT NOW()`;
        const duration = Date.now() - startTime;

        console.log("✅ Connection Successful!");
        console.log(`⏱️  Response time: ${duration}ms`);
        console.log(`📅 Database Server Time:`, result[0]?.now);

        // Check if we can count users (logic check)
        const count = await prisma.user.count();
        console.log(`📊 Verified access to 'User' table. Count: ${count}`);

    } catch (error) {
        console.error("❌ Connection Failed!");
        console.error("------------------------------------------");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
