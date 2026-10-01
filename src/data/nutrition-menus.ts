export type MealDay = {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
};

export const nutritionMenus: Record<'keto' | 'carnivore', { title: string; description: string; days: MealDay[] }> = {
    keto: {
        title: 'Keto jelovnik',
        description: 'Primjeri obroka s manje ugljikohidrata, uz povrće, ribu, jaja i nezasićene masnoće.',
        days: [
            { day: 'Ponedjeljak', breakfast: 'Omlet sa špinatom i avokadom', lunch: 'Piletina, zelena salata i maslinovo ulje', dinner: 'Losos i pečene tikvice' },
            { day: 'Utorak', breakfast: 'Grčki jogurt bez šećera, orasi i nekoliko malina', lunch: 'Salata s tunom, kuhanim jajem i krastavcem', dinner: 'Puretina s brokulom i maslinovim uljem' },
            { day: 'Srijeda', breakfast: 'Jaja, gljive i rajčica', lunch: 'Salata s piletinom, avokadom i sjemenkama', dinner: 'Bijela riba i cvjetača iz pećnice' },
            { day: 'Četvrtak', breakfast: 'Svježi sir, krastavac i bademi', lunch: 'Fritata s tikvicama i zelenom salatom', dinner: 'Pileći file i pirjani špinat' },
            { day: 'Petak', breakfast: 'Jaja s avokadom i rikulom', lunch: 'Sardine i salata od povrća', dinner: 'Pureći medaljoni s pečenim patlidžanom' },
            { day: 'Subota', breakfast: 'Grčki jogurt bez šećera i chia sjemenke', lunch: 'Pileća salata s maslinama i maslinovim uljem', dinner: 'Pastrva s brokulom' },
            { day: 'Nedjelja', breakfast: 'Omlet s paprikom i špinatom', lunch: 'Salata s jajima, tunom i avokadom', dinner: 'Pečena piletina i zelene mahune' },
        ],
    },
    carnivore: {
        title: 'Carnivore jelovnik',
        description: 'Primjeri obroka od namirnica životinjskog podrijetla; vrlo restriktivan način prehrane.',
        days: [
            { day: 'Ponedjeljak', breakfast: 'Jaja i svježi sir', lunch: 'Pečena piletina', dinner: 'Losos iz pećnice' },
            { day: 'Utorak', breakfast: 'Omlet i obični grčki jogurt', lunch: 'Pureća prsa', dinner: 'Goveđi odrezak' },
            { day: 'Srijeda', breakfast: 'Kuhana jaja i sir', lunch: 'Sardine i jaja', dinner: 'Pileći file' },
            { day: 'Četvrtak', breakfast: 'Jaja na oko i svježi sir', lunch: 'Pečena pastrva', dinner: 'Pureći medaljoni' },
            { day: 'Petak', breakfast: 'Omlet sa sirom', lunch: 'Goveđi odrezak', dinner: 'Bijela riba iz pećnice' },
            { day: 'Subota', breakfast: 'Jaja i obični grčki jogurt', lunch: 'Pečena piletina', dinner: 'Losos' },
            { day: 'Nedjelja', breakfast: 'Kuhana jaja i sir', lunch: 'Pureća prsa', dinner: 'Govedina iz pećnice' },
        ],
    },
};
