import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nutritionMenus } from '@/data/nutrition-menus';

export const metadata: Metadata = {
    title: 'Prehrana · Administracija',
    robots: { index: false, follow: false },
};

type NutritionSearchParams = Promise<{ user?: string; plan?: string }>;

export default async function AdminNutritionPage({ searchParams }: { searchParams: NutritionSearchParams }) {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session) redirect('/');
    if (session.role !== 'admin') redirect('/dashboard');

    // Check the current database role as well as the signed token, so a revoked admin loses access immediately.
    const administrator = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (administrator?.role !== 'admin') redirect('/dashboard');

    const users = await prisma.user.findMany({
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
    const params = await searchParams;
    const requestedId = Number(params.user);
    const selectedUser = users.find((user) => user.id === requestedId) ?? users[0];
    const selectedPlan = params.plan === 'carnivore' ? 'carnivore' : 'keto';
    const menu = nutritionMenus[selectedPlan];

    return (
        <div className="min-h-screen">
            <AdminNav />
            <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl p-4 sm:p-6">
                <header className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-300">Administracija</p>
                    <h1 className="text-2xl font-bold sm:text-3xl">Prehrana</h1>
                    <p className="mt-2 text-sm text-slate-400">Generički tjedni jelovnici za pregled po korisnici. Korisnice trenutno nemaju pristup ovom odjeljku.</p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                    <aside className="glass-card h-fit" aria-label="Odabir računa">
                        <h2 className="font-semibold">Računi <span className="text-slate-400">({users.length})</span></h2>
                        <p className="mt-1 text-xs text-slate-400">Odaberite članicu ili administratoricu za pregled predložaka.</p>
                        {users.length === 0 ? (
                            <p className="mt-5 text-sm text-slate-400">Nema računa u sustavu.</p>
                        ) : (
                            <div className="mt-4 max-h-[32rem] space-y-2 overflow-y-auto">
                                {users.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={`/admin/nutrition?user=${user.id}&plan=${selectedPlan}`}
                                        aria-current={selectedUser?.id === user.id ? 'page' : undefined}
                                        className={`block rounded-xl px-3 py-3 transition-colors ${selectedUser?.id === user.id ? 'bg-pink-400/20 text-white ring-1 ring-pink-300/50' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                    >
                                        <span className="block font-medium">{user.firstName} {user.lastName}{user.role === 'admin' ? ' · Admin' : ''}</span>
                                        <span className="block truncate text-xs text-slate-400">{user.email}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </aside>

                    {selectedUser && (
                        <section aria-label={`Jelovnik za ${selectedUser.firstName} ${selectedUser.lastName}`}>
                            <div className="glass-card mb-5">
                                <p className="text-xs font-semibold uppercase tracking-widest text-pink-300">Pregled korisnice</p>
                                <h2 className="mt-2 text-xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                                <p className="mt-1 text-sm text-slate-400">Oba jelovnika su jednaki generički predlošci za sve korisnice; nisu prilagođeni zdravstvenom stanju, potrebama ni ciljevima ove osobe.</p>
                                <div className="mt-5 flex flex-wrap gap-2" aria-label="Vrsta jelovnika">
                                    {(['keto', 'carnivore'] as const).map((plan) => (
                                        <Link
                                            key={plan}
                                            href={`/admin/nutrition?user=${selectedUser.id}&plan=${plan}`}
                                            aria-current={selectedPlan === plan ? 'page' : undefined}
                                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${selectedPlan === plan ? 'bg-pink-400 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                        >
                                            {nutritionMenus[plan].title}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
                                <p className="font-semibold">Radni predložak, nije individualni plan prehrane</p>
                                <p className="mt-1">Keto i osobito carnivore prehrana mogu biti neprikladne za neke osobe. Prije primjene ili dijeljenja jelovnika s korisnicom potrebna je procjena liječnika ili kvalificiranog nutricionista/dijetetičara. Količine i kalorije namjerno nisu zadane.</p>
                            </div>

                            <div className="mb-4">
                                <h2 className="text-xl font-bold">{menu.title}</h2>
                                <p className="mt-1 text-sm text-slate-400">{menu.description}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {menu.days.map((day) => (
                                    <article key={day.day} className="glass-card">
                                        <h3 className="mb-4 border-b border-white/10 pb-3 text-lg font-semibold text-pink-200">{day.day}</h3>
                                        <dl className="space-y-3 text-sm">
                                            <div><dt className="font-semibold text-slate-400">Doručak</dt><dd className="mt-1">{day.breakfast}</dd></div>
                                            <div><dt className="font-semibold text-slate-400">Ručak</dt><dd className="mt-1">{day.lunch}</dd></div>
                                            <div><dt className="font-semibold text-slate-400">Večera</dt><dd className="mt-1">{day.dinner}</dd></div>
                                        </dl>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
