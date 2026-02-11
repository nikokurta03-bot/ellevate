export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  category: string;
  content?: string;
}

export const blogArticles: BlogArticle[] = [
  {
    id: 1,
    slug: 'grupni-treninzi',
    title: 'Zašto su grupni treninzi učinkovitiji?',
    excerpt: 'Otkrijte kako zajednička energija i motivacija grupe može transformirati vaše fitness rezultate i učiniti vježbanje zabavnijim.',
    image: '/blog/group-training.png',
    readTime: '5 min',
    category: 'Motivacija',
    content: `## Snaga zajednice

Grupni treninzi nisu samo trend — oni su dokazano učinkovitiji od samostalnog vježbanja. Istraživanja pokazuju da ljudi koji vježbaju u grupi postižu **do 200% bolje rezultate** u usporedbi s onima koji vježbaju sami.

## Motivacija koja dolazi izvana

Kada vježbate u grupi, prirodno se javlja zdrava natjecateljska atmosfera. Vidite li da osoba pored vas daje sve od sebe, automatski ćete pojačati vlastiti intenzitet. To je **socijalni facilitacijski efekt** — fenomen koji psiholozi proučavaju već desetljećima.

## Odgovornost prema grupi

Jedno od najvećih prepreka redovitom vježbanju je nedostatak motivacije. Grupni treninzi rješavaju ovaj problem jer:

- Osjećate odgovornost prema grupi
- Trener vas motivira i korigira
- Raspored je fiksan — nema odgađanja
- Stvarate prijateljstva koja vas vraćaju

## Stručno vodstvo

Na grupnim treninzima uvijek imate stručnog trenera koji osigurava pravilnu tehniku izvođenja vježbi, čime se smanjuje rizik od ozljeda i povećava učinkovitost svake vježbe.

## Zaključak

Ako tražite način da unaprijedite svoje fitness rezultate, grupni treninzi su odličan izbor. Kombinacija stručnog vodstva, motivirajuće atmosfere i socijalne podrške čini ih idealnim za svakoga tko želi postići više.`,
  },
  {
    id: 2,
    slug: 'trening-snage',
    title: 'Osnove treninga snage za žene',
    excerpt: 'Razbijamo mitove o treningu snage i pokazujemo kako pravilno dizanje utega može oblikovati vaše tijelo.',
    image: '/blog/strength-training.png',
    readTime: '7 min',
    category: 'Snaga',
    content: `## Razbijamo mitove

Jedan od najčešćih mitova je da će žene od dizanja utega postati "prevelike" ili "muškobanjaste". Istina je potpuno drugačija — trening snage pomaže u oblikovanju vitkog, toniranog tijela.

## Prednosti treninga snage za žene

- **Ubrzava metabolizam** — mišići troše više kalorija čak i u mirovanju
- **Jača kosti** — smanjuje rizik od osteoporoze
- **Poboljšava držanje** — jača mišiće leđa i core
- **Smanjuje stres** — endorfini iz treninga poboljšavaju raspoloženje
- **Oblikuje tijelo** — stvara definirane linije

## Osnovna pravila

Za početak treninga snage, pridržavajte se ovih smjernica:

1. Počnite s lakšim utezima i naučite pravilnu tehniku
2. Fokusirajte se na složene pokrete (čučanj, mrtvo dizanje, potisak)
3. Trenirajte 2-3 puta tjedno s danom odmora između
4. Postupno povećavajte opterećenje (progresivno preopterećenje)

## Zaključak

Trening snage je jedan od najboljih oblika vježbanja za žene. Ne bojte se utega — oni su vaš saveznik na putu prema jačem, zdravijem i ljepšem tijelu.`,
  },
  {
    id: 3,
    slug: 'hiit-vs-kardio',
    title: 'HIIT vs. Kardio: Što je bolje za vas?',
    excerpt: 'Usporedba intenzivnog intervalnog treninga i tradicionalnog kardija - pronađite što odgovara vašim ciljevima.',
    image: '/blog/cardio-workout.png',
    readTime: '6 min',
    category: 'Kardio',
    content: `## Što je HIIT?

HIIT (High-Intensity Interval Training) je oblik treninga koji izmjenjuje kratke periode intenzivnog vježbanja s periodima odmora ili nižeg intenziteta.

## Što je tradicionalni kardio?

Tradicionalni kardio uključuje aktivnosti umjerenog intenziteta kroz duži period — trčanje, biciklizam, plivanje — obično 30-60 minuta.

## Usporedba

| | HIIT | Kardio |
|---|---|---|
| Trajanje | 15-30 min | 30-60 min |
| Kalorije | Više u kraćem vremenu | Umjereno |
| Afterburn efekt | Da | Minimalan |
| Mišićna masa | Čuva | Može smanjiti |

## Kada odabrati HIIT?

- Imate malo vremena
- Želite ubrzati metabolizam
- Želite sačuvati mišićnu masu
- Volite intenzivne izazove

## Kada odabrati kardio?

- Tek počinjete vježbati
- Želite se opustiti
- Imate problema sa zglobovima
- Uživate u dugim aktivnostima

## Zaključak

Najbolji pristup je kombinacija oba oblika treninga. HIIT za intenzitet i učinkovitost, kardio za izdržljivost i oporavak.`,
  },
  {
    id: 4,
    slug: 'istezanje-fleksibilnost',
    title: 'Važnost istezanja i fleksibilnosti',
    excerpt: 'Naučite zašto je fleksibilnost ključna za prevenciju ozljeda i kako ju poboljšati kroz svakodnevne vježbe.',
    image: '/blog/stretching-yoga.png',
    readTime: '4 min',
    category: 'Wellness',
    content: `## Zašto je istezanje važno?

Fleksibilnost je često zanemarena komponenta fitnessa, ali igra ključnu ulogu u prevenciji ozljeda, poboljšanju performansi i svakodnevnom funkcioniranju.

## Prednosti redovitog istezanja

- **Prevencija ozljeda** — fleksibilni mišići se teže istegnu ili potraju
- **Bolji opseg pokreta** — omogućuje pravilno izvođenje vježbi
- **Smanjenje boli** — posebno u leđima i vratu
- **Bolji oporavak** — ubrzava regeneraciju nakon treninga
- **Smanjenje stresa** — opuštanje mišića opušta i um

## Kada se istezati?

- **Prije treninga:** Dinamičko istezanje (zamasi, kruženja)
- **Nakon treninga:** Statičko istezanje (držanje pozicije 20-30 sekundi)
- **Ujutro:** Blago istezanje za pokretanje cirkulacije

## Zaključak

Uključite istezanje u svoju svakodnevnu rutinu. Već 10-15 minuta dnevno može značajno poboljšati vašu fleksibilnost i kvalitetu života.`,
  },
  {
    id: 5,
    slug: 'zdrave-navike',
    title: 'Zdrave navike za aktivni životni stil',
    excerpt: 'Praktični savjeti za održavanje energije, hidrataciju i oporavak koji će unaprijediti vaše treninge.',
    image: '/blog/healthy-lifestyle.png',
    readTime: '5 min',
    category: 'Lifestyle',
    content: `## Temelji zdravog životnog stila

Trening je samo jedan dio slagalice. Da biste postigli optimalne rezultate, potrebno je obratiti pažnju i na svakodnevne navike.

## Hidratacija

Voda je ključna za sve tjelesne funkcije:
- Pijte **2-3 litre vode dnevno**
- Povećajte unos na dane treninga
- Započnite dan čašom vode

## Prehrana

Pravilna prehrana podržava vaše treninge:
- Jedite raznoliko i uravnoteženo
- Unesite dovoljno proteina za oporavak mišića
- Ne preskačite obroke — posebno doručak
- Planirajte obroke unaprijed

## San i oporavak

Kvalitetan san je kada se tijelo regenerira:
- Ciljajte **7-9 sati sna** svake noći
- Održavajte redovit raspored spavanja
- Izbjegavajte ekrane sat vremena prije spavanja

## Upravljanje stresom

Kronični stres sabotira vaše fitness ciljeve:
- Prakticirajte duboko disanje ili meditaciju
- Pronađite aktivnosti koje vas opuštaju
- Ne pretjerujte s treningom — odmor je jednako važan

## Zaključak

Zdrave navike izvan teretane jednako su važne kao i sam trening. Fokusirajte se na hidrataciju, prehranu, san i upravljanje stresom za optimalne rezultate.`,
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find(a => a.slug === slug);
}
