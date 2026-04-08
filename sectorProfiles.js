// ═══════════════════════════════════════════════════════════════════════════════
// /config/sectorProfiles.js — façade / assembler / bron van waarheid
//
// ROL VAN DIT BESTAND:
//   Eén bron van waarheid voor sectordata, lookups en promptlogica.
//   Assembleert de vijf gespecialiseerde configbestanden en exporteert
//   een stabiele publieke API voor zowel frontend als backend.
//
// DIT BESTAND BEVAT:
//   - assemblage van alle config-lagen tot SECTOR_PROFILES (backwards compat)
//   - canonieke lookupfuncties (sectorId, getSectorProfile, enz.)
//   - buildSectorPrompt() — enige correcte implementatie van promptbouw
//
// DIT BESTAND BEVAT NIET:
//   - DOM-manipulatie of UI-binding (dat doet sector-bootstrap.js)
//   - marketingcopy of CTA-teksten (die zitten in sector-content/sector-ctas)
//   - eigen data buiten de geïmporteerde config-lagen
//
// STRUCTUUR:
//   sector-definitions.js  → id, label, aliases, routing, extraBlokken
//   sector-norms.js        → benchmarknormen, bandbreedtes, bronvermelding
//   sector-analysis.js     → AI-instructies, promptFocus, analytische metadata
//   sector-content.js      → commerciële UI-copy, hero's, trust, upsell
//   sector-ctas.js         → CTA-teksten, knopteksten, conversiecopy
//   sectorProfiles.js      → dit bestand: assembler + exports
//
// GEBRUIK:
//   Backend  → import { buildSectorPrompt } from '../config/sectorProfiles.js'
//   Frontend → via sector-bootstrap.js (laadt dit bestand via dynamic import)
//              De backend gebruikt NOOIT sector-content.js of sector-ctas.js.
//
// NIEUWE SECTOR TOEVOEGEN:
//   1. sector-definitions.js  → definitie-object toevoegen
//   2. sector-norms.js        → normen-object toevoegen
//   3. sector-analysis.js     → analyse-instructies toevoegen
//   4. sector-content.js      → UI-copy toevoegen
//   5. sector-ctas.js         → knopteksten en softCta toevoegen
//   Dat is alles — dit bestand assembleert automatisch op basis van
//   Object.keys(SECTOR_DEFINITIONS).
// ═══════════════════════════════════════════════════════════════════════════════

import { SECTOR_DEFINITIONS, sectorId, getSectorDefinition, getSectorReportBlocks } from './sector-definitions.js';
import { SECTOR_NORMS }    from './sector-norms.js';
import { SECTOR_ANALYSIS, BASE_PROMPT_WINST, BASE_PROMPT_BELASTING } from './sector-analysis.js';
import { SECTOR_CONTENT }  from './sector-content.js';
import { SECTOR_CTAS }     from './sector-ctas.js';

// ── SECTOR_PROFILES: samengesteld object voor backwards compatibility ──────────
// Consumers die SECTOR_PROFILES[id].normen, .promptFocus, .winst, .cta, etc.
// direct aanspreken blijven werken zonder aanpassing.
const SECTOR_PROFILES = (() => {
  const profiles = {};
  for (const id of Object.keys(SECTOR_DEFINITIONS)) {
    const analysis = SECTOR_ANALYSIS[id]  || SECTOR_ANALYSIS.algemeen;
    const content  = SECTOR_CONTENT[id]   || SECTOR_CONTENT.algemeen;
    const ctas     = SECTOR_CTAS[id]      || SECTOR_CTAS.algemeen;

    profiles[id] = {
      ...SECTOR_DEFINITIONS[id],
      normen:           SECTOR_NORMS[id]    || SECTOR_NORMS.algemeen,
      promptFocus:      analysis.promptFocus,
      belastingFocus:   analysis.belastingFocus,
      winst:            content.winst,
      belasting:        content.belasting,
      // cta: backwards compat — tekst uit sector-ctas, knopTekst ook
      cta: {
        winst:     { tekst: ctas.winst.tekst,     knopTekst: ctas.winst.knopTekst },
        belasting: { tekst: ctas.belasting.tekst, knopTekst: ctas.belasting.knopTekst },
      },
      // winstAnalyse / belastingAnalyse: analytische metadata + softCta voor consumers
      // die dat pad gebruiken (softCta = cta.winst.tekst voor backwards compat)
      winstAnalyse: {
        ...analysis.winstAnalyse,
        softCta: ctas.winst.tekst,
      },
      belastingAnalyse: {
        ...analysis.belastingAnalyse,
        softCta: ctas.belasting.tekst,
      },
    };
  }
  return profiles;
})();

// ── Hulpfuncties (zelfde signatuur als origineel) ─────────────────────────────

function getSectorProfile(raw)       { return SECTOR_PROFILES[sectorId(raw)] || SECTOR_PROFILES.algemeen; }
function getSectorNormen(raw)        { return SECTOR_NORMS[sectorId(raw)] || SECTOR_NORMS.algemeen; }

function getSectorUiContent(raw, scanType) {
  const content = SECTOR_CONTENT[sectorId(raw)] || SECTOR_CONTENT.algemeen;
  return (scanType === 'belasting' ? content.belasting : content.winst) || content.winst;
}

function getSectorAnalysisContent(raw, scanType) {
  const analysis = SECTOR_ANALYSIS[sectorId(raw)] || SECTOR_ANALYSIS.algemeen;
  return (scanType === 'belasting' ? analysis.belastingAnalyse : analysis.winstAnalyse) || analysis.winstAnalyse;
}

function getSectorCTA(raw, scanType) {
  const id   = sectorId(raw);
  const ctas = SECTOR_CTAS[id] || SECTOR_CTAS.algemeen;
  return (ctas[scanType] ?? ctas.winst) || SECTOR_CTAS.algemeen.winst;
}

/** Bouwt de normen-string voor gebruik in AI-prompts */
function getSectorNormenTekst(raw) {
  const def = getSectorDefinition(raw);
  const n   = getSectorNormen(raw);
  return `SECTORNORMEN ${def.label} (bron: ${n.bron || 'CBS MKB 2023'}):\n`
    + `- Brutomarge: ${n.brutomarge[0]}-${n.brutomarge[1]}%\n`
    + `- Nettoresultaat %: ${n.netto[0]}-${n.netto[1]}%\n`
    + `- Personeelskosten %: ${n.personeel[0]}-${n.personeel[1]}% van omzet\n`
    + `- Debiteurendagen: ${n.debiteur[0]}-${n.debiteur[1]} dagen\n`
    + `- Crediteurendagen: ${n.crediteurdagen[0]}-${n.crediteurdagen[1]} dagen\n`
    + `- Solvabiliteit: ${n.solv[0]}-${n.solv[1]}%\n`
    + `- Current ratio: ${n.current[0]}-${n.current[1]}\n`
    + `- Cashflow marge %: ${n.cashflowMarge[0]}-${n.cashflowMarge[1]}%\n`
    + `- Voorraadbinding: ${n.voorraad[0]}-${n.voorraad[1]} dagen`;
}

/** Bouwt de volledige AI-prompt — gebruikt door backend.
 *  Leest ALLEEN uit sector-definitions, sector-norms en sector-analysis.
 *  Raakt sector-content en sector-ctas NIET aan. */
function buildSectorPrompt(promptData, sectorRaw, scanType) {
  const def      = getSectorDefinition(sectorRaw);
  const base     = scanType === 'belasting' ? BASE_PROMPT_BELASTING : BASE_PROMPT_WINST;
  const analysis = SECTOR_ANALYSIS[sectorId(sectorRaw)] || SECTOR_ANALYSIS.algemeen;
  const focus    = (scanType === 'belasting' ? analysis.belastingFocus : analysis.promptFocus) || [];
  const focusTekst = focus.map(f => `- ${f}`).join('\n');
  const context  = `SECTOR: ${def.label}\n\nSECTORSPECIFIEKE FOCUS:\n${focusTekst}\n\n${getSectorNormenTekst(sectorRaw)}`;
  return `${base}\n\n${context}\n\nJAARCIJFERS:\n${promptData}`;
}

// ── Exports ───────────────────────────────────────────────────────────────────
// Identiek aan het origineel — geen breaking changes voor bestaande consumers.
export {
  SECTOR_PROFILES,       // backwards compat: samengesteld object
  SECTOR_DEFINITIONS,    // directe toegang tot definitielaag
  SECTOR_NORMS,          // directe toegang tot normenlaag
  SECTOR_ANALYSIS,       // directe toegang tot analyselaag
  SECTOR_CONTENT,        // directe toegang tot contentlaag
  SECTOR_CTAS,           // directe toegang tot CTA-laag
  BASE_PROMPT_WINST,
  BASE_PROMPT_BELASTING,
  sectorId,
  getSectorProfile,
  getSectorDefinition,
  getSectorNormen,
  getSectorNormenTekst,
  getSectorUiContent,
  getSectorAnalysisContent,
  getSectorCTA,
  getSectorReportBlocks,
  buildSectorPrompt,
};
