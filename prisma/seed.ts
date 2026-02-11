import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

const TRAINING_TIMES = [
    { start: '09:00', end: '10:00' },
    { start: '19:15', end: '20:15' },
    { start: '20:30', end: '21:30' },
];

async function main() {
    console.log('🌱 Seeding database...');

    const adminPassword = process.env.ADMIN_PASSWORD || 'Ellevate123456';
    if (!process.env.ADMIN_PASSWORD) {
        console.warn('⚠️  ADMIN_PASSWORD not set, using default. Set ADMIN_PASSWORD env var in production!');
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: 'mateazadar11@gmail.com' },
        update: {
            password: hashedPassword,
        },
        create: {
            email: 'mateazadar11@gmail.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Mateazadar',
            role: 'admin',
            address: 'Ulica primjera 1, Zadar',
        },
    });

    console.log('✅ Admin korisnik kreiran:', admin.email);

    // Počni od ponedjeljka 9. veljače 2026.
    const startDate = new Date('2026-02-09');

    // Kreiraj termine za 4 tjedna unaprijed
    for (let week = 0; week < 4; week++) {
        for (let day = 0; day < 5; day++) { // Ponedjeljak do Petak
            const date = addDays(startDate, week * 7 + day);

            for (const time of TRAINING_TIMES) {
                await prisma.trainingSlot.upsert({
                    where: {
                        date_startTime: {
                            date: new Date(format(date, 'yyyy-MM-dd')),
                            startTime: time.start,
                        },
                    },
                    update: {},
                    create: {
                        date: new Date(format(date, 'yyyy-MM-dd')),
                        startTime: time.start,
                        endTime: time.end,
                        maxCapacity: 8,
                    },
                });
            }
        }
    }

    console.log('✅ Termini kreirani za sljedeća 4 tjedna (od 9.2.2026.)');
    console.log('🎉 Seeding završen!');
}

main()
    .catch((e) => {
        console.error('❌ Greška pri seedanju:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
