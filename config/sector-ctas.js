// ═══════════════════════════════════════════════════════════════════════════════
// /config/sector-ctas.js
//
// VERANTWOORDELIJKHEID: alle CTA-copy per sector
//   knopTekst  → tekst op de conversiknop na een analyse
//   tekst      → soft-CTA afsluittekst in het analyserapport (vóór de knop)
//
// GEBRUIKT DOOR: uitsluitend frontend (rapportweergave, conversiflows)
// NIET GEBRUIKT DOOR: backend, AI-promptbouw, normenberekening
//
// AANPASSEN:
//   Knopteksten en soft-CTA's hier wijzigen heeft GEEN effect op
//   backendlogica, AI-analyses of normenberekeningen.
//   Veilig aan te passen voor A/B-tests, campagnes of rebrand.
//   Bij een rebrand van de belasting-knoptekst: één regel aanpassen
//   past het voor alle sectoren tegelijk.
//
// NIEUWE SECTOR TOEVOEGEN:
//   Voeg een object toe met dezelfde structuur als de bestaande sectoren.
// ═══════════════════════════════════════════════════════════════════════════════

const SECTOR_CTAS = {

  installatie: {
    winst: {
      knopTekst: 'Houd grip op mijn projectmarge →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar projectmarge wegvalt, waar uren uit de pas lopen en waar u direct moet bijsturen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder waar belastingdruk oploopt, welke aftrekposten u mist en waar u direct kunt optimaliseren.',
    },
  },

  bouw: {
    winst: {
      knopTekst: 'Houd grip op mijn projectrendement →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar faalkosten oplopen, waar projecten uit de bocht vliegen en waar u direct moet ingrijpen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder welke KIA-kansen u mist en hoe WKA-risico\'s uw belastingpositie raken.',
    },
  },

  transport: {
    winst: {
      knopTekst: 'Houd grip op mijn transportmarge →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar ritrendement wegvalt, waar brandstofdruk oploopt en waar capaciteit onbenut blijft.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder welke accijns- en KIA-kansen u mist en hoe u meer kunt aftrekken.',
    },
  },

  groothandel: {
    winst: {
      knopTekst: 'Houd grip op mijn werkkapitaal →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar werkkapitaal vastloopt, welke klanten marge kosten en waar u direct moet bijsturen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder waar belastingdruk oploopt, welke aftrekposten u mist en waar u direct kunt optimaliseren.',
    },
  },

  detailhandel: {
    winst: {
      knopTekst: 'Houd grip op mijn winkelrendement →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar omzet wegvalt, hoe voorraad uw cashflow belast en waar u direct kunt ingrijpen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder of de KOR-regeling voor u werkt en welke huurkosten u kunt aftrekken.',
    },
  },

  dienstverlening: {
    winst: {
      knopTekst: 'Houd grip op mijn declarabiliteit →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar declarabiliteit daalt, welke klanten te duur zijn en hoe u uw tarief kunt verdedigen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder hoe zelfstandigenaftrek en pensioenopbouw uw belastingdruk structureel verlagen.',
    },
  },

  horeca: {
    winst: {
      knopTekst: 'Houd grip op mijn horecawinst →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar personeelsdruk oploopt, waar food-cost uit balans raakt en waar u direct moet ingrijpen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder hoe BTW-splitsing en inventarisaftrek uw belastingdruk verlagen.',
    },
  },

  zorg: {
    winst: {
      knopTekst: 'Houd grip op mijn zorgrendement →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar productieve uren wegvallen, hoe roosters efficiënter kunnen en waar u direct moet ingrijpen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder of BTW-vrijstelling correct wordt toegepast en welke investeringsaftrekken u mist.',
    },
  },

  ict: {
    winst: {
      knopTekst: 'Houd grip op mijn ICT-rendement →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar uren niet renderen, welke klanten te weinig opbrengen en hoe u MRR kunt versterken.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder welke WBSO- en innovatiebox-kansen u laat liggen en hoe u de belastingdruk structureel verlaagt.',
    },
  },

  ecommerce: {
    winst: {
      knopTekst: 'Houd grip op mijn orderrendement →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar productmarge wegvalt, waar advertenties niet renderen en hoe retouren uw winst aantasten.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder hoe de OSS-regeling en aftrekposten uw belastingdruk verlagen.',
    },
  },

  algemeen: {
    winst: {
      knopTekst: 'Houd grip op mijn winst →',
      tekst: 'Met doorlopende begeleiding ziet u eerder waar marge wegvalt, waar kosten oplopen en waar u direct moet ingrijpen.',
    },
    belasting: {
      knopTekst: 'Houd grip op mijn fiscale positie →',
      tekst: 'Met fiscale begeleiding ziet u eerder waar belastingdruk oploopt en welke aftrekposten u mist.',
    },
  },
};

export { SECTOR_CTAS };
