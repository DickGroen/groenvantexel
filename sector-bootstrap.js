// ══════════════════════════════════════════════════════════════════════════════
// sector-bootstrap.js — frontend integratielaag / compatibility layer
//
// ROL VAN DIT BESTAND:
//   - laadt /config/sectorProfiles.js (de enige bron van waarheid voor data
//     en promptlogica) via een dynamische import()
//   - herstelt alle globale helpers die de bestaande frontendcode verwacht
//     (getProfile, sectorId, buildPrompt, SectorCopy, renderAnalyse, enz.)
//   - koppelt UI-rendering aan de geladen config zonder de hele frontend
//     te hoeven refactoren
//
// DIT BESTAND BEVAT GEEN:
//   - sectordata of normen
//   - prompt-opbouwlogica (dat doet buildSectorPrompt in sectorProfiles.js)
//   - marketingcopy of CTA-teksten
//
// ROLVERDELING:
//   sectorProfiles.js  = bron van waarheid voor data, lookups, promptbouw
//   sector-bootstrap.js = UI glue: laadt de façade, herstelt globals, rendert DOM
//
// TE PLAATSEN: direct na het Bestanden-object, ter vervanging van de oude
//              inline SECTOR_PROFILES + lokale helpers in index.html.
// ══════════════════════════════════════════════════════════════════════════════

// ── Stubs — actief zolang de config nog niet geladen is ──────────────────────
// Voorkomen dat aanroepen vóór load een crash veroorzaken.
let SECTOR_PROFILES    = {};
let _sectorLoaded      = false;
let _buildSectorPrompt = null;   // wordt gevuld zodra de module geladen is

let sectorId   = (raw) => String(raw || '').toLowerCase().trim() || 'algemeen';
let getProfile = (raw) => SECTOR_PROFILES[sectorId(raw)] || SECTOR_PROFILES.algemeen || {};

// ── Dynamisch laden van de config-laag ───────────────────────────────────────
// import() werkt in alle moderne browsers, ook zonder type="module" op <script>.
(async () => {
  try {
    const mod = await import('/config/sectorProfiles.js');

    // Herschrijf stubs met echte implementaties uit de façade
    SECTOR_PROFILES    = mod.SECTOR_PROFILES;
    sectorId           = mod.sectorId;
    getProfile         = mod.getSectorProfile;
    _buildSectorPrompt = mod.buildSectorPrompt;  // enige bron van waarheid voor promptbouw

    _sectorLoaded = true;

    // Herrender UI-elementen die al bestaan en wachten op sectordata
    const fs = document.getElementById('f-sector');
    if (fs) {
      const huidigeSector = fs.value || 'algemeen';
      SectorCopy.apply(huidigeSector);
      SectorCopy.applyModal(huidigeSector);
      renderAnalyse(huidigeSector);
    }
    applySectorFromUrl();

  } catch (e) {
    console.error('[sector-bootstrap] Config laden mislukt:', e.message);
    // Geen crash — pagina werkt met lege stubs totdat dit opgelost is
  }
})();

// ── buildPrompt — delegeert volledig aan sectorProfiles.js ───────────────────
// Bevat GEEN eigen prompt-opbouwlogica.
// De façade (buildSectorPrompt) is de enige bron van waarheid voor promptbouw.
// Vóór load: geeft promptData terug als veilige fallback.
const buildPrompt = (promptData, sectorRaw, scanType) => {
  if (!_buildSectorPrompt) return promptData || '';
  return _buildSectorPrompt(promptData, sectorRaw, scanType);
};

// ── SectorCopy — rendert UI-elementen vanuit de content-laag ─────────────────
// Leest hero/sub/bullets/trust/upsell/impact uit p.winst / p.belasting
// (gevuld vanuit sector-content.js via de façade).
// Leest CTA's uit p.cta (gevuld vanuit sector-ctas.js via de façade).
const SectorCopy = {
  map(raw) { return sectorId(raw); },

  get(raw) {
    if (!_sectorLoaded) return {};
    const p = getProfile(raw);
    return currentScanType() === 'belasting' ? (p.belasting || {}) : (p.winst || {});
  },

  getAnalysis(raw) {
    if (!_sectorLoaded) return {};
    const p = getProfile(raw);
    return currentScanType() === 'belasting' ? (p.belastingAnalyse || {}) : (p.winstAnalyse || {});
  },

  apply(raw) {
    if (!_sectorLoaded) return {};
    const p = getProfile(raw);
    const c = currentScanType() === 'belasting' ? (p.belasting || {}) : (p.winst || {});

    setTxt('sector-hero',        c.hero             || '');
    setTxt('sector-sub',         c.sub              || '');
    setTxt('sector-trust-title', c.trustTitle       || '');
    setTxt('sector-trust-1',     c.trustBullets?.[0] || '');
    setTxt('sector-trust-2',     c.trustBullets?.[1] || '');
    setTxt('sector-trust-3',     c.trustBullets?.[2] || '');

    const bullets = document.getElementById('sector-bullets');
    if (bullets) bullets.innerHTML = (c.bullets || []).map(t => `<li>${UI.esc(t)}</li>`).join('');

    const wat = document.getElementById('form-wat');
    if (wat) wat.textContent = c.receivesBullets?.[0] || '';

    const extra = document.getElementById('form-resultaat-extra');
    if (extra) extra.innerHTML = (c.receivesBullets || []).map(t =>
      `<div style="display:flex;align-items:flex-start;gap:7px;margin-bottom:3px;">` +
      `<span style="color:var(--green);flex-shrink:0;font-weight:700;">✓</span>` +
      `<span>${UI.esc(t)}</span></div>`
    ).join('');

    const impact = document.getElementById('sector-impact');
    if (impact) impact.textContent = c.impact || '';

    return c;
  },

  applyModal(raw) {
    if (!_sectorLoaded) return {};
    const p = getProfile(raw);
    const c = currentScanType() === 'belasting' ? (p.belasting || {}) : (p.winst || {});

    setTxt('conv-modal-tekst',    c.upsell        || '');
    setTxt('conv-modal-bullet-1', c.bullets?.[0]  || '');
    setTxt('conv-modal-bullet-2', c.bullets?.[1]  || '');
    setTxt('conv-modal-bullet-3', c.bullets?.[2]  || '');

    const impact = document.getElementById('conv-modal-impact-box');
    if (impact) impact.textContent = c.impact || '';

    return c;
  },
};

// ── Sectornormen — convenientwrapper voor normendata ─────────────────────────
const Sectornormen = {
  get(sector)  { return getProfile(sector).normen || {}; },
  // tekst() is alleen nog nodig als externe code het direct aanroept;
  // buildPrompt gebruikt getSectorNormenTekst intern via de façade.
  tekst(sector){ return _sectorLoaded ? (getProfile(sector).normen ? _normenTekst(sector) : '') : ''; },
};

// Interne helper — alleen gebruikt door Sectornormen.tekst() voor eventuele
// directe aanroepen vanuit de frontend. Promptbouw gebruikt dit NIET.
function _normenTekst(raw) {
  const p = getProfile(raw);
  const n = p.normen;
  if (!n) return '';
  return `SECTORNORMEN ${p.label || ''} (bron: ${n.bron || 'CBS MKB 2023'}):\n`
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

// ── currentScanType ───────────────────────────────────────────────────────────
function currentScanType() {
  return document.getElementById('f-scan-type')?.value || 'winst';
}

// ── getScanUiContent / getScanAnalysisContent — convenientwrappers ────────────
function getScanUiContent(sector, scanType) {
  const p = getProfile(sector);
  return scanType === 'belasting' ? (p.belasting || {}) : (p.winst || {});
}
function getScanAnalysisContent(sector, scanType) {
  const p = getProfile(sector);
  return scanType === 'belasting' ? (p.belastingAnalyse || {}) : (p.winstAnalyse || {});
}

// ── generateSectorFallback — fallback analyse-tekst als API faalt ─────────────
// Leest ALLEEN uit analytische lagen (winstAnalyse / belastingAnalyse).
// Raakt sector-content en sector-ctas niet aan.
function generateSectorFallback(sectorRaw) {
  const p   = getProfile(sectorRaw);
  const cfg = currentScanType() === 'belasting'
    ? (p.belastingAnalyse || {})
    : (p.winstAnalyse    || {});
  return (
    `In uw ${cfg.bedrijfLabel || 'bedrijf'} zien we signalen dat er verbetering mogelijk is.\n\n` +
    `FOCUSPUNTEN:\n${(cfg.focus || []).map(f => '• ' + f).join('\n')}\n\n` +
    `IMPACT:\nOp basis van vergelijkbare bedrijven gaat dit vaak om ${cfg.impact || 'tienduizenden euro\'s'} per jaar.\n\n` +
    (cfg.softCta || '')
  ).trim();
}

// ── renderAnalyse — toont CTA-blok na analyse ─────────────────────────────────
// Haalt knopTekst en CTA-tekst uit p.cta (gevuld vanuit sector-ctas.js).
// Valt terug op cfg.softCta (analytische laag) als CTA-tekst ontbreekt.
function renderAnalyse(sectorRaw) {
  const scanType = currentScanType();
  const p        = getProfile(sectorRaw);
  const scanCta  = p.cta?.[scanType] || p.cta?.winst || {};
  const cfg      = scanType === 'belasting' ? (p.belastingAnalyse || {}) : (p.winstAnalyse || {});

  const heeftAnalyse = !!(
    document.getElementById('ai-tekst')?.textContent?.trim() ||
    document.getElementById('rapport-analyse')?.textContent?.trim()
  );

  const ctaEl  = document.getElementById('rapport-soft-cta');
  const ctaTxt = document.getElementById('rapport-soft-cta-text');
  const ctaBtn = document.getElementById('rapport-soft-cta-btn');

  if (ctaEl)  ctaEl.style.display  = heeftAnalyse ? 'block' : 'none';
  if (ctaTxt) ctaTxt.textContent   = scanCta.tekst || cfg.softCta || '';
  if (ctaBtn) ctaBtn.textContent   = scanCta.knopTekst ||
    (scanType === 'belasting' ? 'Houd grip op mijn fiscale positie →' : 'Houd grip op mijn winst →');
}

// ── applySectorFromUrl — pre-selecteert sector op basis van URL ───────────────
function applySectorFromUrl() {
  const params = new URLSearchParams(window.location.search);
  let raw = params.get('sector') || '';
  if (!raw) {
    const seg = window.location.pathname
      .replace(/^\/+/, '').replace(/\/.*/, '').replace(/-/g, ' ');
    if (seg && sectorId(seg) !== 'algemeen') raw = seg;
  }
  if (!raw) return;
  const id = sectorId(raw);
  if (id === 'algemeen' && raw !== 'algemeen' && raw !== 'overig') return;
  const fs = document.getElementById('f-sector');
  if (!fs) return;
  const label = getProfile(id).label || '';
  for (const opt of fs.options) {
    if (sectorId(opt.value) === id || opt.value === label) {
      fs.value = opt.value;
      fs.dispatchEvent(new Event('change'));
      break;
    }
  }
}
