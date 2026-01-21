import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, startOfWeek, format } from 'date-fns';

const prisma = new PrismaClient();

const TRAINING_TIMES = [
    { start: '08:00', end: '09:00' },
    { start: '09:00', end: '10:00' },
    { start: '18:00', end: '19:00' },
    { start: '19:00', end: '20:00' },
    { start: '20:00', end: '21:00' },
];

async function main() {
    console.log('🌱 Seeding database...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@ellevate.hr' },
        update: {},
        create: {
            email: 'admin@ellevate.hr',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Korisnik',
            oib: '12345678901',
            role: 'admin',
            address: 'Ulica primjera 1, Zagreb',
        },
    });

    console.log('✅ Admin korisnik kreiran:', admin.email);

    const testUsers = [
        {
            email: 'marko@example.com',
            firstName: 'Marko',
            lastName: 'Marković',
            oib: '11111111111',
            address: 'Ilica 10, Zagreb',
            dateOfBirth: new Date('1990-05-15'),
            heightCm: 180,
            weightKg: 80,
            characteristics: 'Početnik, želi izgubiti težinu',
        },
        {
            email: 'ana@example.com',
            firstName: 'Ana',
            lastName: 'Anić',
            oib: '22222222222',
            address: 'Maksimirska 20, Zagreb',
            dateOfBirth: new Date('1995-08-22'),
            heightCm: 165,
            weightKg: 58,
            characteristics: 'Napredna, fokus na snagu',
        },
        {
            email: 'ivan@example.com',
            firstName: 'Ivan',
            lastName: 'Ivić',
            oib: '33333333333',
            address: 'Savska 30, Zagreb',
            dateOfBirth: new Date('1988-03-10'),
            heightCm: 175,
            weightKg: 85,
            characteristics: 'Srednja razina, rehabilitacija koljena',
        },
    ];

    for (const userData of testUsers) {
        const userPassword = await bcrypt.hash('user123', 10);
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                ...userData,
                password: userPassword,
                role: 'user',
            },
        });
        console.log('✅ Testni korisnik kreiran:', user.email);
    }

    const today = new Date();
    const startDate = startOfWeek(today, { weekStartsOn: 1 });

    for (let week = 0; week < 2; week++) {
        for (let day = 0; day < 5; day++) {
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

    console.log('✅ Termini kreirani za sljedeća 2 tjedna');
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
