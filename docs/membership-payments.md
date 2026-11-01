# Članstvo i uplate

Matea: Korisnici → Uredi → Članstvo i uplate. Unesite datum upisa i prve uplate; zadnja uplata početno se popunjava datumom prve uplate. Pritisnite **Spremi datume uplata** (odvojeno od spremanja ostalih osobnih podataka). Za novu korisnicu prvo kreirajte račun pa otvorite Uredi.

Nakon svake nove uplate promijenite datum zadnje uplate. Sljedeći rok računa se jedan kalendarski mjesec od zadnje uplate (31. siječnja → 28./29. veljače). Rok se ne pomiče automatski kada prođe. Korisnice svoje datume vide na vrhu korisničke nadzorne ploče.

Vercel pokreće `/api/cron/payment-reminders` svaki dan u 07:00 UTC (08:00 zimi, 09:00 ljeti u Zagrebu; na Hobby planu izvođenje može biti unutar tog sata). Poziv mora imati `Authorization: Bearer CRON_SECRET`. Potrebni su `RESEND_API_KEY` i verificirani `EMAIL_FROM`.

Odabiru se samo članice s rokom sljedećeg zagrebačkog kalendarskog dana. Baza bilježi poslani rok; privremena rezervacija slanja i Resend idempotency ključ sprječavaju dupliciranje pri istodobnim pozivima. Neuspjeh vraća 503 i ne označava podsjetnik poslanim; isti poziv može se ponoviti taj dan. Vercel dnevni raspored sam po sebi ne jamči ponovni pokušaj nakon ispada servisa.

Postojeće korisnice nemaju izmišljene datume. Podsjetnici počinju tek nakon administratorskog unosa.
