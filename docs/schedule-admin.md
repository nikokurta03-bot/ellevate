# Raspored i administratorske ovlasti

Od 16. 11. 2026. termini imaju 9 mjesta. Redovni dani ostaju ponedjeljak, srijeda i petak, u 09:00, 17:15, 18:15, 19:20 i 20:30.

U **Admin → Raspored** odaberite tjedan i dan:

- **Otvori dan** dodaje standardne termine, i na vikend ili drugi izvanredni dan.
- **Zatvori dan** onemogućuje nove prijave. Postojeće prijave se čuvaju; korisnice vide da se trening ne održava. Ponovno otvaranje vraća te prijave. Zatvaranje samo po sebi ne šalje e-mail.
- **Upravljaj polaznicama** otvara popis i odabir postojeće korisnice. Dodavanje poštuje 9 mjesta i moguće je do početka treninga. Administratorica može ukloniti prijavu bez korisničkog roka od 3 sata.
- **Generiraj termine za ovaj tjedan** dopunjava redovne dane, preskače prošle i zatvorene dane i ne duplicira postojeće termine.

Migracija `20261116000000_schedule_admin` dodaje stanje dana, ažurira kapacitete samo od 16. 11. 2026. i dodaje 17:15 na već zakazane datume. Postojeći identifikatori termina i rezervacije ostaju sačuvani. Primijeniti migracije prije objave aplikacije.
