// functions/api/analyse.js — Groen van Texel
// Cloudflare Pages Function — alle API calls

// SUPABASE_URL en SUPABASE_KEY worden ingelezen via Cloudflare omgevingsvariabelen.
// Stel deze in via: Cloudflare Dashboard → Pages → Project → Settings → Environment variables.
// Voeg toe: SUPABASE_URL en SUPABASE_KEY

const maakSb = (env) => async (path, method = 'GET', body = null) => {
  const SUPABASE_URL = env.SUPABASE_URL;
  const SUPABASE_KEY = env.SUPABASE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase omgevingsvariabelen ontbreken (SUPABASE_URL, SUPABASE_KEY)');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : '',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Supabase fout (${r.status}): ${err}`);
  }
  const txt = await r.text();
  return txt ? JSON.parse(txt) : [];
};

// Generieke helper voor scan-tabellen
const getScan = async (sb, tabel) => {
  const data = await sb(`${tabel}?order=bijgewerkt.desc`);
  return data;
};

const setScan = async (sb, tabel, body) => {
  const { sleutel, html, gepubliceerd, datum } = body;
  const bestaand = await sb(`${tabel}?sleutel=eq.${encodeURIComponent(sleutel)}`);
  const nu = new Date().toISOString();
  if (bestaand.length > 0) {
    await sb(`${tabel}?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', { html, gepubliceerd, datum, bijgewerkt: nu });
  } else {
    // Fix: bijgewerkt meesturen bij nieuw record zodat sortering op bijgewerkt.desc correct werkt
    await sb(tabel, 'POST', { sleutel, html, gepubliceerd, datum, bijgewerkt: nu });
  }
};

const delScan = async (sb, tabel, sleutel) => {
  await sb(`${tabel}?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
};

export async function onRequestPost({ request, env }) {
  const sb = maakSb(env);
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { actie } = body;

    // ── AI ANALYSE ────────────────────────────────────────────────────────
    if (actie === 'analyse' || !actie) {
      const { prompt, max_tokens = 1500 } = body;
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: { message: 'API key ontbreekt' } }), { headers: cors });

      const SYSTEEM_PROMPT = `Je bent een senior financieel adviseur van Groen van Texel, gespecialiseerd in MKB-bedrijven in Nederland. Je werkt volgens de MKB Stresstest Methode™.

JOUW ROL:
- Je analyseert jaarcijfers, maandcijfers en financiële data van Nederlandse MKB-bedrijven (omzet €500K–€10M).
- Je vergelijkt altijd met sectorspecifieke normen voor het Nederlandse MKB.
- Je schrijft als een betrokken adviseur die begeleidt, niet als een controller die beoordeelt.
- Je bent direct, concreet en noemt altijd eurobedragen bij kansen en risico's.

TOON & STIJL:
- Professioneel maar toegankelijk — de ondernemer moet het begrijpen zonder accountantskennis.
- Altijd oplossingsgericht: elk probleem vergezeld van een concrete actie.
- Nooit alleen negatief: benoem ook wat goed gaat.
- Schrijf in correct Nederlands, geen anglicismen.

KWALITEITSEISEN:
- Volg het gevraagde outputformaat EXACT — geen extra tekst, koppen of uitleg buiten het formaat.
- Geef altijd getallen terug — nooit "onbekend" of een streepje als een berekening mogelijk is.
- Gebruik ALTIJD de onderstaande sectorspecifieke normen. Noem de norm expliciet bij elke vergelijking.

REKENREGELS — VERPLICHT STAP VOOR STAP UITVOEREN:
Voer elke berekening expliciet uit vóór je het bedrag invult. Rond af op € 100.

1. BALANSTOTAAL (als niet opgegeven):
   - Gebruik altijd het midden van de sectorspecifieke bandbreedte.
   - Installatietechniek: balanstotaal = 50% × omzet
   - Bouw & Aannemerij: balanstotaal = 55% × omzet
   - Groothandel: balanstotaal = 65% × omzet
   - Zakelijke dienstverlening: balanstotaal = 45% × omzet
   - Overige sectoren: balanstotaal = 50% × omzet
   - Als balanstotaal WEL opgegeven is, gebruik dat getal altijd.

2. SOLVABILITEIT te laag:
   - Alleen rapporteren als werkelijk% ONDER sectornorm_min% ligt.
   - Impact = (sectornorm_min% - werkelijk%) × balanstotaal
   - Voorbeeld: norm_min=30%, werkelijk=26,3%, balanstotaal=€717.900
     → (0,30 - 0,263) × 717.900 = 0,037 × 717.900 = € 26.600

3. BRUTOMARGE te laag:
   - Alleen rapporteren als werkelijk% ONDER sectornorm_gemiddeld% ligt.
   - Impact = (sectornorm_gem% - werkelijk%) × omzet
   - Voorbeeld: norm_gem=52%, werkelijk=49,7%, omzet=€1.435.800
     → (0,52 - 0,497) × 1.435.800 = 0,023 × 1.435.800 = € 33.000

4. DEBITEURENDAGEN te hoog:
   - Alleen rapporteren als werkelijk > sectornorm_max dagen.
   - Impact = (werkelijk_dagen - norm_max_dagen) / 365 × omzet
   - Voorbeeld: werkelijk=65 dgn, norm_max=50 dgn, omzet=€1.435.800
     → (65-50) / 365 × 1.435.800 = 15/365 × 1.435.800 = € 59.000

5. NETTORESULTAAT te laag:
   - Alleen rapporteren als werkelijk% ONDER sectornorm_min% ligt.
   - Gebruik sectornorm_min als referentie, NIET het gemiddelde.
   - Impact = (sectornorm_min% - werkelijk%) × omzet
   - Voorbeeld: norm_min=5%, werkelijk=3,2%, omzet=€1.435.800
     → (0,05 - 0,032) × 1.435.800 = 0,018 × 1.435.800 = € 25.800
   - LET OP: Als werkelijk% >= sectornorm_min%, is er GEEN impact. Rapporteer dit punt dan NIET.

6. TOTAAL VERBETERPOTENTIEEL:
   - Is altijd de exacte som van alle gerapporteerde impactbedragen.
   - Controleer: som van losse bedragen = totaalbedrag. Als dit niet klopt, herstel de som.

SIGNAALCODES:
   - ✅ = binnen of boven sectornorm
   - ⚠ = licht onder sectornorm (0–5 procentpunt)
   - 🔴 = ruim onder sectornorm (>5 procentpunt)

SECTORNORMEN (gebaseerd op Nederlandse branchebenchmarks 2024):

Installatietechniek:
  Brutomarge: 45–60% (gemiddeld 52%) | Nettoresultaat: 5–12% | Solvabiliteit: 30–45%
  Personeelskosten: 25–35% van omzet | Debiteurendagen: 30–50 dgn | Kostprijs montage-uur: €83–100

Bouw & Aannemerij:
  Brutomarge: 38–50% (gemiddeld 43,5% — bron CBS/Firmfocus) | Nettoresultaat: 8–14% | Solvabiliteit: 30–45%
  Personeelskosten: 18–25% van omzet | Debiteurendagen: 30–55 dgn

Groothandel:
  Brutomarge: 15–25% | Nettoresultaat: 2–6% | Solvabiliteit: 25–40%
  Personeelskosten: 10–20% van omzet | Debiteurendagen: 30–45 dgn

Detailhandel:
  Brutomarge: 30–50% | Nettoresultaat: 3–8% | Solvabiliteit: 25–40%
  Personeelskosten: 15–25% van omzet | Debiteurendagen: 0–15 dgn

Zakelijke dienstverlening:
  Brutomarge: 40–65% | Nettoresultaat: 8–20% | Solvabiliteit: 30–50%
  Personeelskosten: 40–60% van omzet | Debiteurendagen: 30–45 dgn

Horeca:
  Brutomarge: 55–75% | Nettoresultaat: 3–8% | Solvabiliteit: 20–40%
  Personeelskosten: 30–40% van omzet | Debiteurendagen: 0–10 dgn

Transport & Logistiek:
  Brutomarge: 15–28% | Nettoresultaat: 3–7% | Solvabiliteit: 25–40%
  Personeelskosten: 25–40% van omzet | Debiteurendagen: 30–45 dgn

Zorg:
  Brutomarge: 20–40% | Nettoresultaat: 2–6% | Solvabiliteit: 20–35%
  Personeelskosten: 50–70% van omzet | Debiteurendagen: 30–60 dgn

ICT:
  Brutomarge: 45–70% | Nettoresultaat: 8–18% | Solvabiliteit: 30–55%
  Personeelskosten: 40–60% van omzet | Debiteurendagen: 30–45 dgn

Algemeen MKB (fallback bij onbekende sector):
  Brutomarge: 30–50% | Nettoresultaat: 5–10% | Solvabiliteit: 25–40%
  Personeelskosten: 30–50% van omzet | Debiteurendagen: 30–45 dgn

- Debiteurendagen: 30 dgn = goed, 45 dgn = acceptabel, >60 dgn = risico.
- Solvabiliteit: onder sectornorm = aandacht, >sectornorm bovengrens = sterk.
- Nettoresultaat: >sectorgemiddelde = gezond, helft van norm = matig, negatief = kritiek.`;

      // Gebruik altijd minimaal het gevraagde aantal tokens, met een minimum van 1500
      const effectieve_tokens = Math.max(max_tokens, 1500);

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: effectieve_tokens,
          system: SYSTEEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), { headers: cors });
    }

    // ── KLANTEN ───────────────────────────────────────────────────────────
    if (actie === 'getKlanten') {
      const data = await sb('klanten?order=aangemaakt.asc');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setKlant') {
      const { naam, code, klanttype, email, sector } = body;
      await sb('klanten', 'POST', { naam, code, klanttype: klanttype || 'lead', email: email || '', sector: sector || '' });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'updateKlantType') {
      const { code, klanttype } = body;
      await sb(`klanten?code=eq.${encodeURIComponent(code)}`, 'PATCH', { klanttype });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delKlant') {
      const { code } = body;
      await sb(`klanten?code=eq.${encodeURIComponent(code)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── UPLOADS ───────────────────────────────────────────────────────────
    if (actie === 'getUploads') {
      const data = await sb('uploads?order=aangemaakt.desc');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setUpload') {
      const { bedrijf, periode, datum, sector, pdftekst } = body;
      await sb('uploads', 'POST', {
        bedrijf, periode, datum, sector: sector || '',
        pdftekst: (pdftekst || '').substring(0, 80000),
      });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'upsertUpload') {
      const { bedrijf, periode, datum, sector, pdftekst } = body;
      const bestaand = await sb(`uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`);
      if (bestaand.length > 0) {
        await sb(`uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'PATCH', {
          datum, sector: sector || '', pdftekst: (pdftekst || '').substring(0, 80000),
        });
      } else {
        await sb('uploads', 'POST', { bedrijf, periode, datum, sector: sector || '', pdftekst: (pdftekst || '').substring(0, 80000) });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delUpload') {
      const { bedrijf, periode } = body;
      await sb(`uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── ANALYSES ──────────────────────────────────────────────────────────
    if (actie === 'getAnalyse') {
      const { sleutel } = body;
      const data = await sb(`analyses?sleutel=eq.${encodeURIComponent(sleutel)}`);
      return new Response(JSON.stringify({ tekst: data[0]?.tekst || '' }), { headers: cors });
    }
    if (actie === 'setAnalyse') {
      const { sleutel, tekst } = body;
      const bestaand = await sb(`analyses?sleutel=eq.${encodeURIComponent(sleutel)}`);
      if (bestaand.length > 0) {
        await sb(`analyses?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', { tekst, bijgewerkt: new Date().toISOString() });
      } else {
        await sb('analyses', 'POST', { sleutel, tekst });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── RAPPORTEN 1-PAGER ─────────────────────────────────────────────────
    if (actie === 'getRapporten') {
      const data = await sb('rapporten?order=bijgewerkt.desc');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setRapport') {
      const { sleutel, html, gepubliceerd, datum } = body;
      const bestaand = await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`);
      if (bestaand.length > 0) {
        await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', { html, gepubliceerd, datum, bijgewerkt: new Date().toISOString() });
      } else {
        await sb('rapporten', 'POST', { sleutel, html, gepubliceerd, datum });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delRapport') {
      const { sleutel } = body;
      await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── BASISSCANS ────────────────────────────────────────────────────────
    if (actie === 'getBasisscans') {
      return new Response(JSON.stringify(await getScan(sb, 'basisscans')), { headers: cors });
    }
    if (actie === 'setBasisscan') {
      await setScan(sb, 'basisscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delBasisscan') {
      await delScan(sb, 'basisscans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── SUBSIDIESCANS ─────────────────────────────────────────────────────
    if (actie === 'getSubsidiescans') {
      return new Response(JSON.stringify(await getScan(sb, 'subsidiescans')), { headers: cors });
    }
    if (actie === 'setSubsidiescan') {
      await setScan(sb, 'subsidiescans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delSubsidiescan') {
      await delScan(sb, 'subsidiescans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── CASHFLOW STRESSTESTS ──────────────────────────────────────────────
    if (actie === 'getCashflowStresstests') {
      return new Response(JSON.stringify(await getScan(sb, 'cashflowstresstests')), { headers: cors });
    }
    if (actie === 'setCashflowStresstest') {
      await setScan(sb, 'cashflowstresstests', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delCashflowStresstest') {
      await delScan(sb, 'cashflowstresstests', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── DEBITEUREN STRESSTESTS ────────────────────────────────────────────
    if (actie === 'getDebiteurenStresstests') {
      return new Response(JSON.stringify(await getScan(sb, 'debiteurenstresstests')), { headers: cors });
    }
    if (actie === 'setDebiteurenStresstest') {
      await setScan(sb, 'debiteurenstresstests', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delDebiteurenStresstest') {
      await delScan(sb, 'debiteurenstresstests', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── OFFERTE MARGESCANS ────────────────────────────────────────────────
    if (actie === 'getOfferteMargescans') {
      return new Response(JSON.stringify(await getScan(sb, 'offertemargescans')), { headers: cors });
    }
    if (actie === 'setOfferteMargescan') {
      await setScan(sb, 'offertemargescans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delOfferteMargescan') {
      await delScan(sb, 'offertemargescans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── FISCALE SCANS ─────────────────────────────────────────────────────
    if (actie === 'getFiscaleScans') {
      return new Response(JSON.stringify(await getScan(sb, 'fiscalescans')), { headers: cors });
    }
    if (actie === 'setFiscaleScan') {
      await setScan(sb, 'fiscalescans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delFiscaleScan') {
      await delScan(sb, 'fiscalescans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── INKOOPANALYSES ────────────────────────────────────────────────────
    if (actie === 'getInkoopanalyses') {
      return new Response(JSON.stringify(await getScan(sb, 'inkoopanalyses')), { headers: cors });
    }
    if (actie === 'setInkoopanalyse') {
      await setScan(sb, 'inkoopanalyses', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delInkoopanalyse') {
      await delScan(sb, 'inkoopanalyses', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── VERZEKERINGSSCANS ─────────────────────────────────────────────────
    if (actie === 'getVerzekeringsScans') {
      return new Response(JSON.stringify(await getScan(sb, 'verzekeringsscans')), { headers: cors });
    }
    if (actie === 'setVerzekeringsScan') {
      await setScan(sb, 'verzekeringsscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delVerzekeringsScan') {
      await delScan(sb, 'verzekeringsscans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── PERSONEELSSCANS ───────────────────────────────────────────────────
    if (actie === 'getPersoneelsScans') {
      return new Response(JSON.stringify(await getScan(sb, 'personeelsscans')), { headers: cors });
    }
    if (actie === 'setPersoneelsScan') {
      await setScan(sb, 'personeelsscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delPersoneelsScan') {
      await delScan(sb, 'personeelsscans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── EXIT SCANS ────────────────────────────────────────────────────────
    if (actie === 'getExitScans') {
      return new Response(JSON.stringify(await getScan(sb, 'exitscans')), { headers: cors });
    }
    if (actie === 'setExitScan') {
      await setScan(sb, 'exitscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delExitScan') {
      await delScan(sb, 'exitscans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── MAANDOVERZICHTEN ─────────────────────────────────────────────────
    if (actie === 'getMaandoverzichten') {
      const { bedrijf } = body;
      const filter = bedrijf ? `bedrijf=eq.${encodeURIComponent(bedrijf)}&` : '';
      const data = await sb(`maandoverzichten?${filter}order=periode.desc`);
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setMaandoverzicht') {
      const { bedrijf, periode, html, gepubliceerd, datum, omzet, brutomarge, debiteurendagen, solvabiliteit, nettoresultaat, advies } = body;
      const bestaand = await sb(`maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`);
      const record = { bedrijf, periode, html, gepubliceerd: gepubliceerd||false, datum: datum||'', omzet: omzet||null, brutomarge: brutomarge||null, debiteurendagen: debiteurendagen||null, solvabiliteit: solvabiliteit||null, nettoresultaat: nettoresultaat||null, advies: advies||null, bijgewerkt: new Date().toISOString() };
      if (bestaand.length > 0) {
        await sb(`maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'PATCH', record);
      } else {
        await sb('maandoverzichten', 'POST', record);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delMaandoverzicht') {
      const { bedrijf, periode } = body;
      await sb(`maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    return new Response(JSON.stringify({ error: { message: 'Onbekende actie: ' + actie } }), { headers: cors });

  } catch (e) {
    return new Response(JSON.stringify({ error: { message: e.message } }), { status: 500, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
