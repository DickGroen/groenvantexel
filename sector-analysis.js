// ═══════════════════════════════════════════════════════════════════════════════
// /config/sector-analysis.js
//
// VERANTWOORDELIJKHEID: analytische instructies per sector
//   promptFocus       → wat de AI moet analyseren bij een winstscan
//   belastingFocus    → wat de AI moet analyseren bij een belastingscan
//   winstAnalyse      → focus-labels + impactbereik + bedrijfLabel (backend)
//   belastingAnalyse  → focus-labels + impactbereik + bedrijfLabel (backend)
//
// GEBRUIKT DOOR:
//   backend → buildSectorPrompt() → injectie in AI-prompt
//   frontend → winstAnalyse/belastingAnalyse voor rapportkopjes
//
// NIET VOOR: hero-teksten, trust bullets, CTA's, upsell — die zitten in sector-content.js
//
// AANPASSEN:
//   Wijzig hier analyse-instructies zonder risico op regressies in UI-copy.
//   impactbereik en bedrijfLabel zijn analytische metadata, geen marketingtekst.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Basisprompts ──────────────────────────────────────────────────────────────
// Gedeeld tussen alle sectoren. Backend voegt sectorcontext + jaarcijfers toe.
// Aanpassen = wijziging in alle analyses tegelijk — zorgvuldig reviewen.

const BASE_PROMPT_WINST = `Je bent een senior financieel analist en sector specialist voor het Nederlandse MKB.
Je schrijft GEEN generieke analyse, maar een sectorspecifieke winstscan die voelt als maatwerk.

REGELS:
- Gebruik de daadwerkelijke cijfers uit de input expliciet in de tekst.
- Als een cijfer niet betrouwbaar uit de input te halen is, schrijf dan letterlijk: "onvoldoende data".
- Geen markdown tabellen, geen codeblokken, geen extra kopjes buiten de verplichte structuur.
- Geen algemene adviezen zonder directe relatie met de gevonden cijfers.
- Schrijf alsof u direct terugkoppelt op de cijfers van dit specifieke bedrijf.

Gebruik EXACT deze structuur en kopjes:

SAMENVATTING
[Korte opening in 3-5 zinnen]

KERNCIJFERS
Omzet: € ...
Brutomarge %: ...%
Nettoresultaat %: ...%
Personeelskosten %: ...%
Debiteurendagen: ... dagen
Solvabiliteit %: ...%
Current ratio: ...

BELANGRIJKSTE INZICHTEN
- ...
- ...
- ...

WAAR LEKT DE WINST
- ...
- ...
- ...

IMPACT
[Beschrijf concreet wat het bedrijf laat liggen in euro's of waar rendement achterblijft]

VERBETERKANSEN
- ...
- ...
- ...

MONITORING_ADVIES
[Aanbevolen frequentie, drie KPI's die maandelijks bewaakt moeten worden, één mijlpaal voor komende 3 maanden.]

SOFT_AFSLUITING
Dit zijn signalen op hoofdlijnen. De grootste winst zit meestal niet in één grote ingreep, maar in maandelijks bijsturen op de juiste cijfers.`;

const BASE_PROMPT_BELASTING = `Je bent een senior fiscaal adviseur en sector specialist voor het Nederlandse MKB.
Je schrijft GEEN generieke fiscale analyse, maar een sectorspecifieke belastingscan die voelt als maatwerk.

REGELS:
- Gebruik de daadwerkelijke cijfers uit de input expliciet in de tekst.
- Als een cijfer niet betrouwbaar te halen is, schrijf dan letterlijk: "onvoldoende data".
- Geen markdown tabellen, geen codeblokken.
- Geen algemene adviezen zonder relatie met de gevonden cijfers.

Gebruik EXACT deze structuur:

SAMENVATTING
[Korte opening in 3-5 zinnen over fiscale positie]

FISCALE KERNCIJFERS
Omzet: € ...
Belastbaar resultaat: ...
Effectieve belastingdruk %: ...%
IB/VPB afdracht: € ...

GEMISTE AFTREKPOSTEN
- ...
- ...
- ...

FISCALE KANSEN
- ...
- ...
- ...

STRUCTUURANALYSE
[Beoordeel of de huidige rechtsvorm en structuur optimaal is]

CONCRETE OPTIMALISATIES
1. [actie] — verwacht voordeel: € [bedrag]
2. [actie] — verwacht voordeel: € [bedrag]
3. [actie] — verwacht voordeel: € [bedrag]

SOFT_AFSLUITING
Dit zijn fiscale signalen op hoofdlijnen. De grootste besparing zit in structureel bewaken van aftrekposten en tijdig anticiperen op regelgeving.`;

// ── Sectorspecifieke analyse-instructies ──────────────────────────────────────

const SECTOR_ANALYSIS = {

  installatie: {
    promptFocus: [
      'Analyseer projectmarge en signaleer nacalculatieverschillen',
      'Signaleer inefficiënte uren: voorrijden, wachttijden, herstelwerk, garantiewerk',
      'Check materiaalverlies en niet-gefactureerd meerwerk',
      'Vergelijk uurtarief met marktconform voor installateurs (€65-€95 excl. BTW, 2023)',
      'Beoordeel verhouding materiaalkosten vs arbeidskosten',
    ],
    belastingFocus: [
      'KIA/MIA/VAMIL op bedrijfsmiddelen en gereedschap',
      'EIA bij energiebesparende installaties (warmtepompen, zonnepanelen)',
      'Zelfstandigenaftrek bij eenmanszaken — uren-criterium bewaken',
      'Auto-van-de-zaak regelingen voor servicebus en bestelauto',
      'WBSO bij innovatieve installatiemethoden of eigen ontwikkeling',
    ],
    winstAnalyse: {
      focus: ['projectmarge', 'nacalculatie', 'inefficiënte uren', 'materiaalverlies'],
      impact: '€20.000 – €80.000',
      bedrijfLabel: 'installatiebedrijf',
    },
    belastingAnalyse: {
      focus: ['aftrekposten', 'investeringsregelingen', 'fiscale structuur', 'belastingdruk'],
      impact: '€5.000 – €30.000',
      bedrijfLabel: 'installatiebedrijf',
    },
  },

  bouw: {
    promptFocus: [
      'Analyseer faalkosten (doorgaans 3-10% van omzet bij aannemers)',
      'Check projectoverschrijdingen: meer-/minderwerk, budgetafwijkingen',
      'Beoordeel planning en bezettingsgraad personeel en materieel',
      'Signaleer te lage opslag voor indirecte kosten in offertes',
      'Check WKA-risico (inlening personeel) en verzekerings-/garantieverplichtingen',
    ],
    belastingFocus: [
      'KIA op machines, steigers en zwaar materieel',
      'G-rekening en WKA-risico bij inlening personeel',
      'BTW-constructies bij renovatie (6% vs 21%)',
      'Eigenwoningforfait bij combinatie wonen/werken',
      'Pensioenopbouw DGA in bouwholding',
    ],
    winstAnalyse: {
      focus: ['faalkosten', 'projectoverschrijdingen', 'planning', 'marge per project'],
      impact: '€30.000 – €100.000',
      bedrijfLabel: 'bouwbedrijf',
    },
    belastingAnalyse: {
      focus: ['aftrekposten', 'investeringsregelingen', 'fiscale structuur', 'belastingdruk'],
      impact: '€5.000 – €30.000',
      bedrijfLabel: 'bouwbedrijf',
    },
  },

  transport: {
    promptFocus: [
      'Analyseer rendement per rit en bezettingsgraad voertuigen',
      'Check brandstofkosten als % van omzet (normaal 15-25%)',
      'Signaleer lege kilometers en inefficiënte routeplanning',
      'Beoordeel wagenpark: afschrijving vs productiviteit per voertuig',
      'Check chauffeurstekort impact op operationele kosten',
    ],
    belastingFocus: [
      'Brandstofaccijns teruggave bij zakelijk gebruik',
      'KIA/MIA op nieuwe voertuigen (extra voordeel bij EV)',
      'Eurovignet en buitenlandse heffingen aftrekbaarheid',
      'Auto van de zaak bijtelling tabel per voertuigcategorie',
      'Chauffeurs dagvergoedingen en onkostenregelingen',
    ],
    winstAnalyse: {
      focus: ['rendement per rit', 'brandstofkosten', 'bezettingsgraad', 'wagenpark inefficiëntie'],
      impact: '€25.000 – €90.000',
      bedrijfLabel: 'transportbedrijf',
    },
    belastingAnalyse: {
      focus: ['accijns teruggave', 'KIA voertuigen', 'eurovignet', 'dagvergoedingen'],
      impact: '€5.000 – €30.000',
      bedrijfLabel: 'transportbedrijf',
    },
  },

  groothandel: {
    promptFocus: [
      'Analyseer marge per productgroep — signaleer verliesgevende assortimentslijnen',
      'Check voorraadbinding: te hoge voorraad = vastgezet werkkapitaal',
      'Beoordeel debiteurenrisico: klantconcentratie en betalingstermijnen',
      'Signaleer klanten met negatieve margebijdrage (volumekortingen die te ver gaan)',
      'Check inkoopkracht: worden volumekortingen bij leveranciers benut?',
    ],
    belastingFocus: [
      'Voorraadwaardering (FIFO/gemiddelde kostprijs) en fiscale impact',
      'BTW-carrousel risico\'s bij import/export buiten EU',
      'KIA op magazijninrichting, heftrucks en logistieke systemen',
      'Transfer pricing bij internationale handelsstromen',
      'Debiteuren-voorziening fiscaal aftrekbaar stellen',
    ],
    winstAnalyse: {
      focus: ['marge per productgroep', 'voorraadbinding', 'debiteurenrisico', 'klantrentabiliteit'],
      impact: '€20.000 – €90.000',
      bedrijfLabel: 'groothandelsbedrijf',
    },
    belastingAnalyse: {
      focus: ['voorraadwaardering', 'import/export BTW', 'KIA magazijn', 'debiteurenrisico fiscaal'],
      impact: '€5.000 – €30.000',
      bedrijfLabel: 'groothandelsbedrijf',
    },
  },

  detailhandel: {
    promptFocus: [
      'Analyseer omzet per m² en bezettingsgraad winkel',
      'Check voorraadveroudering en afwaarderingen',
      'Beoordeel verhouding vaste kosten (huur, personeel) vs omzet',
      'Signaleer seizoenspatronen die cashflow onder druk zetten',
      'Check retourpercentage en marge-impact',
    ],
    belastingFocus: [
      'KOR (Kleineondernemersregeling) check — drempel €20.000 omzet',
      'BTW op margeregeling tweedehands goederen',
      'Aftrekbaarheid huurkosten en verbouwingskosten',
      'Kassaregels en omzetregistratieplicht',
      'Voorraadafwaardering fiscaal verwerken',
    ],
    winstAnalyse: {
      focus: ['omzet per m²', 'voorraadveroudering', 'vaste lasten vs omzet', 'seizoenscashflow'],
      impact: '€15.000 – €60.000',
      bedrijfLabel: 'winkel',
    },
    belastingAnalyse: {
      focus: ['KOR-regeling', 'btw margeregeling', 'huurkosten aftrek', 'kassaregels'],
      impact: '€5.000 – €25.000',
      bedrijfLabel: 'winkel',
    },
  },

  dienstverlening: {
    promptFocus: [
      'Analyseer declarabiliteitspercentage (streefwaarde: >75% voor adviseurs)',
      'Check omzet per fte en vergelijk met marktconform uurtarief voor de subsector',
      'Signaleer klanten die onevenredig veel niet-declarabele tijd vragen',
      'Beoordeel pitch/aanbestedingskosten als % van gewonnen opdrachten',
      'Check groei: wordt capaciteitsgroei door nieuwe klanten gedekt?',
    ],
    belastingFocus: [
      'Zelfstandigenaftrek en startersaftrek — uren-criterium bewaken',
      'Pensioenopbouw en lijfrente voor DGA en IB-ondernemer',
      'Thuiswerkkostenvergoeding en arbo-voorzieningen aftrekbaar',
      'Auto van de zaak vs privé-gebruik en bijtellingsrisico',
      'Inhuur vs dienstverband risico (fictief dienstverband)',
    ],
    winstAnalyse: {
      focus: ['declarabiliteit', 'uurtarief', 'klantrentabiliteit', 'niet-gefactureerde uren'],
      impact: '€20.000 – €100.000',
      bedrijfLabel: 'dienstverlener',
    },
    belastingAnalyse: {
      focus: ['zelfstandigenaftrek', 'pensioenopbouw DGA', 'declarabiliteit fiscaal', 'auto van de zaak'],
      impact: '€5.000 – €40.000',
      bedrijfLabel: 'dienstverlener',
    },
  },

  horeca: {
    promptFocus: [
      'Analyseer personeelskosten als % van omzet (kritische drempel: >45%)',
      'Check food-cost ratio: inkoop vs omzet (doorgaans 25-35% voor restaurants)',
      'Signaleer daluren: zijn die onrendabel ingeroosterd?',
      'Beoordeel marge per productcategorie (drank vs eten, take-away vs ter plaatse)',
      'Check seizoensinvloed op cashflow en werkkapitaalbehoefte',
    ],
    belastingFocus: [
      'BTW-splitsing laag tarief (9% eten) vs hoog tarief (21% drinken)',
      'KIA op keukenapparatuur, inventaris en verbouwingen',
      'Personeelsmaaltijden bijtelling correct verwerken',
      'Kasregistratie verplichting en omzetverantwoording',
      'TOGS/TVL-ontvangsten correct als belaste/onbelaste baten',
    ],
    winstAnalyse: {
      focus: ['personeelsdruk', 'food-cost', 'bezettingsgraad', 'marge per productgroep'],
      impact: '€15.000 – €70.000',
      bedrijfLabel: 'horecabedrijf',
    },
    belastingAnalyse: {
      focus: ['BTW splitsing eten/drinken', 'inventaris KIA', 'personeelsmaaltijden bijtelling', 'kasregistratie'],
      impact: '€5.000 – €25.000',
      bedrijfLabel: 'horecabedrijf',
    },
  },

  zorg: {
    promptFocus: [
      'Analyseer productieve uren vs indirecte uren (admin, rapportage, reistijd)',
      'Check personeelskosten als % van omzet en vergelijk met NZa-tarief-opbrengsten',
      'Signaleer onderbezetting (te weinig cliënten) of overbezetting (uitval/ziekte-risico)',
      'Beoordeel tarief-mix: DBC/WLZ/Wmo/PGB — welke bekostiging is meest gunstig',
      'Check ziekteverzuim % en vervangingskosten',
    ],
    belastingFocus: [
      'BTW-vrijstelling zorgprestaties — voldoet u aan de BIG/Wlz-voorwaarden?',
      'ANBI-status check voor stichtingen en verenigingen in de zorg',
      'PGB-inkomsten en belastbaarheid (werknemer vs zelfstandige)',
      'WIA/WGA premieplicht en eigenrisicodragerschap',
      'Investeringsaftrek medische apparatuur en praktijkinrichting',
    ],
    winstAnalyse: {
      focus: ['productieve uren', 'personeelsinzet', 'bezettingsgraad', 'tarief-mix'],
      impact: '€15.000 – €60.000',
      bedrijfLabel: 'zorgorganisatie',
    },
    belastingAnalyse: {
      focus: ['BTW-vrijstelling zorgprestaties', 'ANBI-status', 'WIA/WGA premies', 'investeringsaftrek medisch'],
      impact: '€5.000 – €30.000',
      bedrijfLabel: 'zorgorganisatie',
    },
  },

  ict: {
    promptFocus: [
      'Analyseer recurring revenue (MRR/ARR) vs eenmalige projectopbrengsten',
      'Check customer acquisition cost (CAC) en lifetime value (LTV) indien beschikbaar',
      'Signaleer niet-declarabele ontwikkeltijd en intern project-overhead',
      'Beoordeel licentie- en infrastructuurkosten als % van omzet',
      'Check churn-risico: zijn contracten langlopend of maandelijks opzegbaar?',
    ],
    belastingFocus: [
      'WBSO (Wet Bevordering Speur- en Ontwikkelingswerk) — grootste fiscale kans voor ICT',
      'Innovatiebox: 9% VPB over winst uit innovatieve activiteiten',
      'Stock options en aandelenopties medewerkers correct verwerken',
      'KIA op servers, hardware en kantoorinrichting',
      'Thuiswerkkostenvergoeding en arbo-aftrek bij remote teams',
    ],
    winstAnalyse: {
      focus: ['declarabiliteit', 'terugkerende omzet', 'klantverloop', 'licentiekosten'],
      impact: '€20.000 – €100.000',
      bedrijfLabel: 'ICT-bedrijf',
    },
    belastingAnalyse: {
      focus: ['WBSO subsidie', 'innovatiebox 9% VPB', 'stock options', 'KIA hardware'],
      impact: '€10.000 – €50.000',
      bedrijfLabel: 'ICT-bedrijf',
    },
  },

  ecommerce: {
    promptFocus: [
      'Analyseer marge per productgroep en signaleer verliesgevende categorieën',
      'Check ROAS (Return on Ad Spend) van advertentiekanalen indien vermeld',
      'Beoordeel retourpercentage en marge-impact per geretourneerd item',
      'Check fulfilmentkosten per order (opslag, pick & pack, verzending)',
      'Signaleer seizoenspieken en cashflow-impact bij grote inkooporders',
    ],
    belastingFocus: [
      'OSS-regeling (One Stop Shop) voor BTW bij EU-verkopen boven €10.000',
      'Margeregeling tweedehands goederen correct toepassen',
      'BTW-behandeling dropshipping (u bent de leverancier, niet de fabrikant)',
      'KIA op magazijninrichting, automatisering en software',
      'Aftrekbaarheid van marketingkosten, advertentiebudget en platform-fees',
    ],
    winstAnalyse: {
      focus: ['marge per productgroep', 'retouren', 'ROAS (advertenties)', 'fulfilmentkosten'],
      impact: '€20.000 – €100.000',
      bedrijfLabel: 'webshop',
    },
    belastingAnalyse: {
      focus: ['OSS-regeling EU btw', 'margeregeling tweedehands', 'btw-behandeling dropshipping', 'KIA magazijn/automatisering'],
      impact: '€5.000 – €30.000',
      bedrijfLabel: 'webshop',
    },
  },

  algemeen: {
    promptFocus: [
      'Analyseer margestructuur en kostenopbouw',
      'Signaleer afwijkingen van gangbare MKB-normen',
      'Identificeer de drie grootste winstlekken',
      'Beoordeel liquiditeit en werkkapitaalbeheer',
    ],
    belastingFocus: [
      'KIA check — investeringsaftrek benut?',
      'Zelfstandigenaftrek en startersaftrek correct toegepast?',
      'BTW-aangifte correcties en suppletie-risico\'s',
      'Pensioenopbouw DGA en privé/zakelijk scheiding',
    ],
    winstAnalyse: {
      focus: ['marge', 'kostenstructuur', 'rendement', 'inefficiëntie'],
      impact: '€10.000 – €50.000',
      bedrijfLabel: 'bedrijf',
    },
    belastingAnalyse: {
      focus: ['aftrekposten', 'investeringsregelingen', 'fiscale structuur', 'belastingdruk'],
      impact: '€5.000 – €30.000',
      bedrijfLabel: 'bedrijf',
    },
  },
};

export {
  SECTOR_ANALYSIS,
  BASE_PROMPT_WINST,
  BASE_PROMPT_BELASTING,
};
