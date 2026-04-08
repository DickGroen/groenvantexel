// ═══════════════════════════════════════════════════════════════════════════════
// /config/sector-definitions.js
//
// VERANTWOORDELIJKHEID: structurele sector-identiteit
//   id, label, aliases (voor routing/matching), tov, extraBlokken
//
// GEBRUIKT DOOR: frontend (routing, label-weergave) én backend (sectorId-lookup)
// NIET VOOR: normen, promptfocus, copy, CTA's — die zitten in eigen bestanden
//
// NIEUWE SECTOR TOEVOEGEN:
//   1. Voeg het object hier toe
//   2. Voeg normen toe in sector-norms.js
//   3. Voeg analyse-instructies toe in sector-analysis.js
//   4. Voeg copy toe in sector-content.js
// ═══════════════════════════════════════════════════════════════════════════════

const SECTOR_DEFINITIONS = {

  installatie: {
    id: 'installatie',
    label: 'Installatietechniek',
    aliases: ['installatietechniek', 'installatie', 'installateur'],
    tov: 'direct',
    extraBlokken: ['projectmarge', 'uurrendement'],
  },

  bouw: {
    id: 'bouw',
    label: 'Bouw & Aannemerij',
    aliases: ['bouw & aannemerij', 'bouw', 'aannemer', 'aannemerij'],
    tov: 'direct',
    extraBlokken: ['faalkosten', 'projectoverschrijding'],
  },

  transport: {
    id: 'transport',
    label: 'Transport & Logistiek',
    aliases: ['transport & logistiek', 'transport', 'logistiek', 'chauffeur'],
    tov: 'direct',
    extraBlokken: ['ritrendement', 'brandstofanalyse'],
  },

  groothandel: {
    id: 'groothandel',
    label: 'Groothandel',
    aliases: ['groothandel', 'groot handel', 'b2b handel'],
    tov: 'zakelijk',
    extraBlokken: ['voorraadbinding', 'debiteurenrisico'],
  },

  detailhandel: {
    id: 'detailhandel',
    label: 'Detailhandel',
    aliases: ['detailhandel', 'retail', 'winkel'],
    tov: 'direct',
    extraBlokken: ['voorraadveroudering', 'omzetperm2'],
  },

  dienstverlening: {
    id: 'dienstverlening',
    label: 'Zakelijke dienstverlening',
    aliases: ['zakelijke dienstverlening', 'dienstverlening', 'adviesbureau', 'consultancy', 'bureau'],
    tov: 'zakelijk',
    extraBlokken: ['declarabiliteit', 'tariefanalyse'],
  },

  horeca: {
    id: 'horeca',
    label: 'Horeca',
    aliases: ['horeca', 'restaurant', 'cafe', 'café', 'hotel'],
    tov: 'direct',
    extraBlokken: ['personeelsdruk', 'food_cost'],
  },

  zorg: {
    id: 'zorg',
    label: 'Zorg',
    aliases: ['zorg', 'thuiszorg', 'ggz', 'praktijk', 'tandarts'],
    tov: 'zorgvuldig',
    extraBlokken: ['productieve_uren', 'roosterefficiëntie'],
  },

  ict: {
    id: 'ict',
    label: 'ICT',
    aliases: ['ict', 'it', 'software', 'saas', 'tech'],
    tov: 'zakelijk',
    extraBlokken: ['declarabiliteit', 'mrr_analyse'],
  },

  ecommerce: {
    id: 'ecommerce',
    label: 'E-commerce / Webshop',
    aliases: ['e-commerce', 'ecommerce', 'webshop', 'webwinkel', 'e-commerce / webshop', 'online shop'],
    tov: 'zakelijk',
    extraBlokken: ['roas_analyse', 'retouranalyse'],
  },

  algemeen: {
    id: 'algemeen',
    label: 'Overig',
    aliases: ['overig', 'algemeen'],
    tov: 'zakelijk',
    extraBlokken: [],
  },
};

// ── Alias-index: gebouwd on-the-fly, geen apart bestand nodig ─────────────────
const _ALIAS_INDEX = (() => {
  const idx = {};
  for (const [id, p] of Object.entries(SECTOR_DEFINITIONS)) {
    for (const alias of (p.aliases || [])) idx[alias.toLowerCase()] = id;
    idx[id] = id;
  }
  return idx;
})();

/** 'Installatietechniek' | 'installatie' | 'installateur' → 'installatie' */
function sectorId(raw) {
  return _ALIAS_INDEX[String(raw || '').toLowerCase().trim()] || 'algemeen';
}

function getSectorDefinition(raw) {
  return SECTOR_DEFINITIONS[sectorId(raw)] || SECTOR_DEFINITIONS.algemeen;
}

function getSectorReportBlocks(raw) {
  const basis = ['samenvatting', 'kerncijfers', 'winstlekken', 'actieplan', 'monitoring'];
  return [...basis, ...(getSectorDefinition(raw).extraBlokken || [])];
}

export {
  SECTOR_DEFINITIONS,
  sectorId,
  getSectorDefinition,
  getSectorReportBlocks,
};
