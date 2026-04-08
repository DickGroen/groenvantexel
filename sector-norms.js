// ═══════════════════════════════════════════════════════════════════════════════
// /config/sector-norms.js
//
// VERANTWOORDELIJKHEID: sectorspecifieke benchmarknormen
//   Financiële bandbreedtes en bronvermelding per sector.
//
// GEBRUIKT DOOR:
//   backend  → getSectorNormenTekst() → injectie in AI-prompt
//   frontend → visuele vergelijking met ingevoerde cijfers
//// NIET VOOR: copy, CTA's, promptfocus-instructies — die zitten elders
//
// NORMEN AANPASSEN:
//   Wijzig hier — backend én frontend pikken het automatisch op.
//   Bronvermelding bijhouden is verplicht (compliance/juridisch).
// ═══════════════════════════════════════════════════════════════════════════════

const SECTOR_NORMS = {

  installatie: {
    brutomarge:     [42, 52],
    netto:          [3,  7],
    personeel:      [55, 70],
    debiteur:       [35, 50],
    crediteurdagen: [30, 45],
    solv:           [20, 35],
    current:        [1.2, 1.6],
    cashflowMarge:  [4,  8],
    voorraad:       [20, 35],
    bron: 'CBS MKB StatLine 2023, Techniek Nederland, ING Sectorrapport',
  },

  bouw: {
    brutomarge:     [18, 28],
    netto:          [2,  5],
    personeel:      [40, 55],
    debiteur:       [40, 60],
    crediteurdagen: [35, 55],
    solv:           [15, 30],
    current:        [1.1, 1.5],
    cashflowMarge:  [3,  6],
    voorraad:       [15, 30],
    bron: 'CBS MKB 2023, Bouwend Nederland, ABN AMRO sectorrapport',
  },

  transport: {
    brutomarge:     [20, 32],
    netto:          [2,  5],
    personeel:      [50, 65],
    debiteur:       [30, 45],
    crediteurdagen: [30, 45],
    solv:           [15, 28],
    current:        [1.0, 1.4],
    cashflowMarge:  [3,  6],
    voorraad:       [5,  15],
    bron: 'CBS MKB 2023, TLN sectorrapport, Rabobank Transport',
  },

  groothandel: {
    brutomarge:     [18, 28],
    netto:          [2,  5],
    personeel:      [15, 25],
    debiteur:       [30, 45],
    crediteurdagen: [25, 40],
    solv:           [20, 35],
    current:        [1.3, 1.8],
    cashflowMarge:  [3,  6],
    voorraad:       [30, 60],
    bron: 'CBS MKB 2023, Rabobank Groothandel, ING Sectormonitor',
  },

  detailhandel: {
    brutomarge:     [32, 48],
    netto:          [2,  5],
    personeel:      [18, 28],
    debiteur:       [5,  15],
    crediteurdagen: [20, 35],
    solv:           [20, 35],
    current:        [1.1, 1.5],
    cashflowMarge:  [3,  6],
    voorraad:       [45, 75],
    bron: 'CBS MKB 2023, INretail, ABN AMRO Retail',
  },

  dienstverlening: {
    brutomarge:     [55, 75],
    netto:          [8,  15],
    personeel:      [55, 70],
    debiteur:       [25, 40],
    crediteurdagen: [20, 35],
    solv:           [25, 45],
    current:        [1.3, 1.8],
    cashflowMarge:  [8,  14],
    voorraad:       [0,  5],
    bron: 'CBS MKB 2023, MKB Nederland, Rabobank Dienstverlening',
  },

  horeca: {
    brutomarge:     [60, 75],
    netto:          [2,  6],
    personeel:      [30, 45],
    debiteur:       [5,  15],
    crediteurdagen: [15, 30],
    solv:           [10, 25],
    current:        [0.8, 1.2],
    cashflowMarge:  [4,  8],
    voorraad:       [10, 20],
    bron: 'CBS MKB 2023, Koninklijke Horeca Nederland, Rabobank Horeca',
  },

  zorg: {
    brutomarge:     [55, 70],
    netto:          [2,  6],
    personeel:      [60, 75],
    debiteur:       [20, 35],
    crediteurdagen: [20, 35],
    solv:           [20, 35],
    current:        [1.1, 1.5],
    cashflowMarge:  [3,  6],
    voorraad:       [5,  15],
    bron: 'CBS MKB 2023, NZa jaarrapport, Actiz benchmarkrapport',
  },

  ict: {
    brutomarge:     [45, 65],
    netto:          [8,  15],
    personeel:      [50, 65],
    debiteur:       [25, 40],
    crediteurdagen: [20, 35],
    solv:           [30, 50],
    current:        [1.4, 2.0],
    cashflowMarge:  [8,  14],
    voorraad:       [0,  5],
    bron: 'CBS MKB 2023, Dutch Tech Association, Rabobank ICT',
  },

  ecommerce: {
    brutomarge:     [30, 50],
    netto:          [3,  8],
    personeel:      [15, 30],
    debiteur:       [3,  10],
    crediteurdagen: [20, 40],
    solv:           [20, 40],
    current:        [1.2, 1.8],
    cashflowMarge:  [4,  9],
    voorraad:       [30, 60],
    bron: 'CBS MKB 2023, Thuiswinkel Markt Monitor, Rabobank E-commerce',
  },

  algemeen: {
    brutomarge:     [30, 45],
    netto:          [4,  9],
    personeel:      [45, 60],
    debiteur:       [30, 45],
    crediteurdagen: [25, 40],
    solv:           [20, 35],
    current:        [1.2, 1.6],
    cashflowMarge:  [4,  8],
    voorraad:       [15, 30],
    bron: 'CBS MKB StatLine 2023, MKB Nederland benchmark',
  },
};

export { SECTOR_NORMS };
