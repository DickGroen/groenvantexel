// ═══════════════════════════════════════════════════════════════════════════════
// /config/sector-content.js
//
// VERANTWOORDELIJKHEID: commerciële copy en UI-teksten per sector
//   winst     → hero, sub, bullets, reportTitle, upsell, pricing, impact,
//               trustTitle, trustBullets, receives, receivesBullets
//   belasting → zelfde structuur, fiscale variant
//
// GEBRUIKT DOOR: uitsluitend frontend (weergave en rendering)
// NIET GEBRUIKT DOOR: backend, AI-promptbouw, normenberekening
//
// AANPASSEN:
//   Copy, prijzen, hero's en trust bullets hier wijzigen heeft GEEN effect
//   op backendlogica, AI-analyses of normenberekeningen.
//   Veilig aan te passen voor A/B-tests, juridische review of rebrand.
//
// COMPLIANCE-NOTE:
//   Impactclaims (€-bereiken) hier zijn marketingtekst.
//   De analytische impactbedragen in sector-analysis.js zijn de bronwaarden.
//
// CTA-TEKSTEN:
//   knopTekst en softCta (afsluittekst na analyserapport) zitten in sector-ctas.js.
//   softCta is daar als `tekst` per sector/scantype.
// ═══════════════════════════════════════════════════════════════════════════════

const SECTOR_CONTENT = {

  installatie: {
    winst: {
      hero: 'De meeste installatiebedrijven laten €20.000–€80.000 per jaar liggen',
      sub: 'Ontdek waar dat in uw bedrijf gebeurt — binnen 2 minuten inzicht',
      bullets: [
        'Waar uw marge onder druk staat',
        'Waar geld blijft hangen in uw projecten',
        'Welke verbeteringen direct rendement opleveren',
      ],
      reportTitle: 'Dit zijn de grootste winstkansen in uw installatiebedrijf',
      upsell: 'Wilt u exact weten waar uw installatiebedrijf winst verliest? Ontvang een volledige doorlichting met concrete verbeteracties.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: "Installatiebedrijven laten gemiddeld tienduizenden euro's liggen in inefficiënte uren, niet-gefactureerd meerwerk en materiaalverlies.",
      trustTitle: 'Waarom installatiebedrijven ons vertrouwen',
      trustBullets: [
        'Inzicht in projectmarge en uurrendement',
        'Concreet en snel toepasbare verbeteracties',
        'Volledig vertrouwelijke verwerking van uw cijfers',
      ],
      receives: 'Wat u ontvangt:',
      receivesBullets: [
        'inzicht in marge en kosten per project',
        'de grootste financiële verbeterkansen',
        'concrete acties die direct resultaat opleveren',
      ],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw installatiebedrijf onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek waar fiscale kansen blijven liggen door gemiste aftrekposten, investeringen en een niet-optimale structuur.',
      bullets: [
        'Welke aftrekposten u mogelijk mist',
        'Waar uw fiscale structuur inefficiënt is',
        'Welke optimalisaties direct voordeel opleveren',
      ],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw installatiebedrijf',
      upsell: 'Wilt u exact weten waar uw installatiebedrijf belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Installatiebedrijven betalen vaak €5.000 – €30.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom installatiebedrijven dit gebruiken',
      trustBullets: [
        'Inzicht in fiscale kansen rond investeringen en materieel',
        'Scherper zicht op belastingdruk en structuur',
        'Volledig vertrouwelijke verwerking van uw cijfers',
      ],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: [
        'gemiste aftrekposten en fiscale kansen',
        'inzicht in structuur en belastingdruk',
        'concrete optimalisaties die direct voordeel kunnen opleveren',
      ],
    },
  },

  bouw: {
    winst: {
      hero: 'Zie binnen 2 minuten waar uw bouwbedrijf winst verliest — en hoeveel dat kost',
      sub: 'Krijg direct inzicht in faalkosten, projectrendement en waar uw marge onder druk staat.',
      bullets: ['Waar projectkosten uit de hand lopen', 'Waar faalkosten uw marge drukken', 'Welke verbeteringen direct rendement opleveren'],
      reportTitle: 'Dit zijn de belangrijkste winstkansen in uw bouwbedrijf',
      upsell: 'Wilt u exact weten waar uw bouwprojecten rendement verliezen? Ontvang een volledige doorlichting met concrete verbeteracties.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: "Bouwbedrijven laten gemiddeld tienduizenden euro's liggen in faalkosten en projectoverschrijdingen.",
      trustTitle: 'Waarom bouwbedrijven ons vertrouwen',
      trustBullets: ['Inzicht in faalkosten en projectrendement', 'Concreet en snel toepasbare verbeteracties', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in marge en kosten per project', 'de grootste financiële verbeterkansen', 'concrete acties die direct resultaat opleveren'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw bouwbedrijf onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek waar fiscale kansen blijven liggen door gemiste aftrekposten, investeringen en een niet-optimale structuur.',
      bullets: ['Welke aftrekposten u mogelijk mist', 'Waar uw fiscale structuur inefficiënt is', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw bouwbedrijf',
      upsell: 'Wilt u exact weten waar uw bouwbedrijf belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Bouwbedrijven betalen vaak €5.000 – €30.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom bouwbedrijven dit gebruiken',
      trustBullets: ['Inzicht in fiscale kansen rond projecten en investeringen', 'Scherper zicht op belastingdruk en structuur', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel kunnen opleveren'],
    },
  },

  transport: {
    winst: {
      hero: 'Zie binnen 2 minuten waar uw transportbedrijf winst verliest — en hoeveel dat kost',
      sub: 'Ontdek waar ritrendement, brandstofkosten en bezetting uw marge opvreten.',
      bullets: ['Waar ritrendement achterblijft', 'Hoe brandstofkosten uw marge drukken', 'Welke verbeteringen direct meer opleveren'],
      reportTitle: 'Dit zijn de belangrijkste winstkansen in uw transportbedrijf',
      upsell: 'Wilt u exact weten waar uw transportbedrijf rendement verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: 'Transportbedrijven laten gemiddeld tienduizenden euro\'s liggen in lege kilometers, brandstofverspilling en onderbezetting.',
      trustTitle: 'Waarom transportbedrijven ons vertrouwen',
      trustBullets: ['Inzicht in ritrendement en brandstofkosten', 'Concreet en snel toepasbare verbeteracties', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in kosten per rit en bezettingsgraad', 'de grootste financiële verbeterkansen', 'concrete acties die direct resultaat opleveren'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw transportbedrijf onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in accijns, materieel en vergoedingen.',
      bullets: ['Welke aftrekposten u mogelijk mist', 'Waar uw fiscale structuur inefficiënt is', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw transportbedrijf',
      upsell: 'Wilt u exact weten waar uw transportbedrijf belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Transportbedrijven betalen vaak €5.000 – €30.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom transportbedrijven dit gebruiken',
      trustBullets: ['Inzicht in fiscale kansen rond materieel en investeringen', 'Scherper zicht op belastingdruk en structuur', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel kunnen opleveren'],
    },
  },

  groothandel: {
    winst: {
      hero: 'De meeste groothandels laten €20.000–€90.000 per jaar liggen in werkkapitaal en marge',
      sub: 'Ontdek waar uw productmarge en voorraadbinding uw winst opvreten — binnen 2 minuten inzicht',
      bullets: ['Welke productgroepen uw marge drukken', 'Waar werkkapitaal onnodig vastzit in voorraad', 'Welke klanten per saldo te weinig opleveren'],
      reportTitle: 'Dit zijn de grootste winstlekken in uw groothandel',
      upsell: 'Wilt u exact weten waar uw groothandel marge en werkkapitaal verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: 'Groothandels laten gemiddeld €20.000 – €90.000 per jaar liggen in onbewaakte marge en voorraadbinding.',
      trustTitle: 'Waarom groothandels ons vertrouwen',
      trustBullets: ['Inzicht in marge per productgroep en klant', 'Concreet zicht op werkkapitaalbehoefte', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in marge per productgroep', 'voorraadbinding en debiteurenrisico in beeld', 'concrete acties die direct werkkapitaal vrijmaken'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw groothandel onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in voorraadbeheer, debiteuren en structuur.',
      bullets: ['Welke aftrekposten u mogelijk mist', 'Waar uw fiscale structuur inefficiënt is', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw groothandel',
      upsell: 'Wilt u exact weten waar uw groothandel belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Groothandels betalen vaak €5.000 – €30.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom groothandels dit gebruiken',
      trustBullets: ['Inzicht in fiscale kansen rond voorraad en debiteuren', 'Scherper zicht op belastingdruk en structuur', 'Volledig vertrouwelijke verwerking'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel kunnen opleveren'],
    },
  },

  detailhandel: {
    winst: {
      hero: 'De meeste winkels laten €15.000–€60.000 per jaar liggen in omzet en marge',
      sub: 'Ontdek waar uw voorraad, kosten en bezetting uw winst opvreten — binnen 2 minuten inzicht',
      bullets: ['Waar uw vaste lasten te zwaar drukken op omzet', 'Hoe voorraadveroudering uw marge aantast', 'Wat u kunt doen om direct meer te verdienen'],
      reportTitle: 'Dit zijn de grootste winstlekken in uw winkel',
      upsell: 'Wilt u exact weten waar uw winkel marge verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: 'Winkels betalen gemiddeld €15.000 – €60.000 per jaar te veel door onbewuste kosten en margedruk.',
      trustTitle: 'Waarom retailers ons vertrouwen',
      trustBullets: ['Inzicht in omzet, marge en vaste lasten', 'Concreet zicht op seizoenspatronen en cashflow', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in marge en kostenstructuur', "voorraad- en cashflow-risico's in beeld", 'concrete acties die direct resultaat opleveren'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw winkel onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in inkoop, huur en structuur.',
      bullets: ['Welke aftrekposten u mogelijk mist', 'Waar de KOR-regeling kansen biedt', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw winkel',
      upsell: 'Wilt u exact weten waar uw winkel belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Winkels betalen vaak €5.000 – €25.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom retailers dit gebruiken',
      trustBullets: ['Inzicht in KOR, huurkosten en aftrekposten', 'Scherper zicht op belastingdruk', 'Volledig vertrouwelijke verwerking'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties'],
    },
  },

  dienstverlening: {
    winst: {
      hero: 'De meeste dienstverleners laten €20.000–€100.000 per jaar liggen in niet-gefactureerde uren',
      sub: 'Ontdek waar uw declarabiliteit, tarieven en klantmix uw winst opvreten — binnen 2 minuten inzicht',
      bullets: ['Waar uw declarabiliteitspercentage achterblijft', 'Welke klanten per saldo te weinig opleveren', 'Hoe u uw tarief kunt verdedigen en verhogen'],
      reportTitle: 'Dit zijn de grootste winstlekken in uw dienstverlening',
      upsell: 'Wilt u exact weten waar uw praktijk of bureau marge verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: 'Dienstverleners laten gemiddeld €20.000 – €100.000 per jaar liggen in onbewuste niet-declarabele uren en te lage tarieven.',
      trustTitle: 'Waarom dienstverleners ons vertrouwen',
      trustBullets: ['Inzicht in declarabiliteit en urenrendement', 'Scherp zicht op klantrentabiliteit', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in declarabiliteit en tariefpositie', 'klantrentabiliteit in beeld', 'concrete acties die direct meer uren laten renderen'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw bedrijf onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in zelfstandigenaftrek, pensioen en structuur.',
      bullets: ['Welke aftrekposten u mogelijk mist', 'Hoe pensioenopbouw fiscaal efficiënter kan', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen voor uw dienstverlening',
      upsell: 'Wilt u exact weten waar uw praktijk of bureau belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Dienstverleners betalen vaak €5.000 – €40.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom dienstverleners dit gebruiken',
      trustBullets: ['Inzicht in zelfstandigenaftrek en pensioen', 'Scherper zicht op belastingdruk en structuur', 'Volledig vertrouwelijke verwerking'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel opleveren'],
    },
  },

  horeca: {
    winst: {
      hero: 'De meeste horecabedrijven laten €15.000–€70.000 per jaar liggen in personeels- en inkoopkosten',
      sub: 'Ontdek waar personeelsdruk en food-cost uw winst opvreten — binnen 2 minuten inzicht',
      bullets: ['Waar uw personeelskosten te hoog zijn t.o.v. omzet', 'Hoe uw inkoop- en food-cost verhouding uitpakt', 'Wat u kunt doen om direct meer over te houden'],
      reportTitle: 'Dit zijn de grootste winstlekken in uw horecabedrijf',
      upsell: 'Wilt u exact weten waar uw horecabedrijf marge verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: 'Horecabedrijven laten gemiddeld €15.000 – €70.000 per jaar liggen door onbewuste personeels- en inkoopdruk.',
      trustTitle: 'Waarom horecaondernemers ons vertrouwen',
      trustBullets: ['Inzicht in personeelskosten en food-cost ratio', 'Concreet zicht op bezetting en marge per product', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in personeelsdruk en food-cost', 'bezettingsgraad en margeanalyse', 'concrete acties die direct meer winst opleveren'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw horecabedrijf onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in BTW-splitsing, inventaris en personeelskosten.',
      bullets: ['Hoe BTW-splitsing eten/drinken u voordeel oplevert', 'Welke aftrekposten op inventaris u mist', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw horecabedrijf',
      upsell: 'Wilt u exact weten waar uw horecabedrijf belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Horecabedrijven betalen vaak €5.000 – €25.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom horecaondernemers dit gebruiken',
      trustBullets: ['Inzicht in BTW-splitsing en aftrekposten', 'Scherper zicht op belastingdruk', 'Volledig vertrouwelijke verwerking'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en BTW-optimalisaties', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel opleveren'],
    },
  },

  zorg: {
    winst: {
      hero: 'De meeste zorgorganisaties laten €15.000–€60.000 per jaar liggen in productiviteit en bezetting',
      sub: 'Ontdek waar indirecte uren en roostering uw rendement opvreten — binnen 2 minuten inzicht',
      bullets: ['Waar productieve uren verloren gaan aan indirecte taken', 'Hoe uw personeelsinzet zich verhoudt tot vergoedingen', 'Wat u kunt doen om direct meer rendement te halen'],
      reportTitle: 'Dit zijn de grootste verbeterkansen in uw zorgorganisatie',
      upsell: 'Wilt u exact weten waar uw zorgorganisatie rendement verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: 'Zorgorganisaties laten gemiddeld €15.000 – €60.000 per jaar liggen door onbewuste inefficiëntie in roostering en uren.',
      trustTitle: 'Waarom zorgorganisaties ons vertrouwen',
      trustBullets: ['Inzicht in productieve uren en personeelsinzet', 'Concreet zicht op bezetting en tarief-mix', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in productiviteit en bezettingsgraad', 'personeelsinzet vs vergoeding in beeld', 'concrete acties die direct meer rendement opleveren'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw zorgorganisatie onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in BTW-vrijstelling, investeringen en structuur.',
      bullets: ['Of BTW-vrijstelling correct wordt toegepast', 'Welke investeringsaftrekken u mogelijk mist', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen voor uw zorgorganisatie',
      upsell: 'Wilt u exact weten waar uw zorgorganisatie belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Zorgorganisaties betalen vaak €5.000 – €30.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom zorgorganisaties dit gebruiken',
      trustBullets: ['Inzicht in BTW-vrijstelling en aftrekposten', 'Scherper zicht op belastingdruk en structuur', 'Volledig vertrouwelijke verwerking'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in BTW-vrijstelling en structuur', 'concrete optimalisaties die direct voordeel opleveren'],
    },
  },

  ict: {
    winst: {
      hero: 'De meeste ICT-bedrijven laten €20.000–€100.000 per jaar liggen in niet-gedeclareerde uren en klantmix',
      sub: 'Ontdek waar declarabiliteit, tarieven en klantverloop uw winst opvreten — binnen 2 minuten inzicht',
      bullets: ['Waar uw uren niet renderen of niet worden gefactureerd', 'Welke klanten per saldo te weinig opleveren', 'Hoe u terugkerende omzet kunt versterken'],
      reportTitle: 'Dit zijn de grootste winstlekken in uw ICT-bedrijf',
      upsell: 'Wilt u exact weten waar uw ICT-bedrijf rendement verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: 'ICT-bedrijven laten gemiddeld €20.000 – €100.000 per jaar liggen in onbewuste niet-declarabele uren en te lage MRR.',
      trustTitle: 'Waarom ICT-bedrijven ons vertrouwen',
      trustBullets: ['Inzicht in declarabiliteit en urenrendement', 'Scherp zicht op klantrentabiliteit en MRR', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in declarabiliteit en tariefpositie', 'klantrentabiliteit en MRR-analyse', 'concrete acties die direct meer uren laten renderen'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw ICT-bedrijf onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in WBSO, innovatiebox en structuur.',
      bullets: ['Of u in aanmerking komt voor WBSO-subsidie', 'Hoe de innovatiebox uw belastingdruk verlaagt', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen voor uw ICT-bedrijf',
      upsell: 'Wilt u exact weten waar uw ICT-bedrijf belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'ICT-bedrijven laten gemiddeld €10.000 – €50.000 per jaar aan WBSO en innovatiebox-voordeel liggen.',
      trustTitle: 'Waarom ICT-bedrijven dit gebruiken',
      trustBullets: ['Inzicht in WBSO, innovatiebox en aftrekposten', 'Scherper zicht op belastingdruk en structuur', 'Volledig vertrouwelijke verwerking'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['WBSO en innovatiebox-kansen in beeld', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel opleveren'],
    },
  },

  ecommerce: {
    winst: {
      hero: 'De meeste webshops laten €20.000–€100.000 per jaar liggen in marge en advertentierendement',
      sub: 'Ontdek waar ROAS, retouren en fulfilmentkosten uw winst opvreten — binnen 2 minuten inzicht',
      bullets: ['Welke productgroepen uw marge opvreten', 'Waar advertentiebudget niet rendeert', 'Hoe retouren uw winst aantasten'],
      reportTitle: 'Dit zijn de grootste winstlekken in uw webshop',
      upsell: 'Wilt u exact weten waar uw webshop marge verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: "Webshops laten gemiddeld tienduizenden euro's liggen in onbewaakte productmarge, inefficiënte advertenties en te hoge retouren.",
      trustTitle: 'Waarom webshops ons vertrouwen',
      trustBullets: ['Inzicht in marge per productgroep en ROAS', 'Concreet zicht op retourkosten en fulfilment', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in marge en advertentierendement', 'retour- en fulfilmentkosten in beeld', 'concrete acties die direct meer winst opleveren'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw webshop onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek fiscale kansen in OSS-regeling, voorraad en structuur.',
      bullets: ['Welke aftrekposten u mogelijk mist', 'Hoe de OSS-regeling uw EU-BTW vereenvoudigt', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw webshop',
      upsell: 'Wilt u exact weten waar uw webshop belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Webshops betalen vaak €5.000 – €30.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom webshops dit gebruiken',
      trustBullets: ['Inzicht in OSS-regeling, aftrekposten en structuur', 'Scherper zicht op belastingdruk', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel opleveren'],
    },
  },

  algemeen: {
    winst: {
      hero: "De meeste ondernemers laten tienduizenden euro's per jaar liggen zonder dit te zien",
      sub: 'Ontdek binnen 2 minuten waar uw winst weglekt en wat u er aan kunt doen.',
      bullets: ['Waar uw marge onder druk staat', 'Waar kosten onnodig oplopen', 'Welke verbeteringen direct rendement opleveren'],
      reportTitle: 'Dit zijn de grootste winstkansen in uw bedrijf',
      upsell: 'Wilt u exact weten waar uw bedrijf winst verliest? Ontvang een volledige doorlichting.',
      pricing: 'Doorlopende begeleiding — €249 per maand',
      impact: "Ondernemers laten gemiddeld tienduizenden euro's liggen zonder dit te zien.",
      trustTitle: 'Waarom ondernemers ons vertrouwen',
      trustBullets: ['Inzicht in marge, kosten en winstkansen', 'Concreet en snel toepasbare verbeteracties', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'Wat u ontvangt:',
      receivesBullets: ['inzicht in marge en kosten', 'de grootste financiële verbeterkansen', 'concrete acties die direct resultaat opleveren'],
    },
    belasting: {
      hero: 'Zie binnen 2 minuten waar uw bedrijf onnodig belasting betaalt — en hoeveel dat kost',
      sub: 'Upload uw cijfers en ontdek waar fiscale kansen blijven liggen.',
      bullets: ['Welke aftrekposten u mogelijk mist', 'Waar uw fiscale structuur inefficiënt is', 'Welke optimalisaties direct voordeel opleveren'],
      reportTitle: 'Dit zijn de belangrijkste fiscale kansen in uw bedrijf',
      upsell: 'Wilt u exact weten waar uw bedrijf belasting kan besparen? Ontvang een volledige fiscale doorlichting.',
      pricing: 'Fiscale begeleiding — €249 per maand',
      impact: 'Ondernemers betalen vaak €5.000 – €30.000 per jaar te veel belasting zonder dit te weten.',
      trustTitle: 'Waarom ondernemers dit gebruiken',
      trustBullets: ['Inzicht in aftrekposten, structuur en belastingdruk', 'Concrete fiscale optimalisaties met directe impact', 'Volledig vertrouwelijke verwerking van uw cijfers'],
      receives: 'U ontvangt een persoonlijke fiscale scan met:',
      receivesBullets: ['gemiste aftrekposten en fiscale kansen', 'inzicht in structuur en belastingdruk', 'concrete optimalisaties die direct voordeel kunnen opleveren'],
    },
  },
};

export { SECTOR_CONTENT };
