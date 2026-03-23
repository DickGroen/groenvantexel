// functions/api/analyse.js — Groen van Texel
// Cloudflare Pages Function — alle API calls

const SUPABASE_URL = 'https://yhctamsjmbkkqhndaiov.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0vdwwnPaC30Y-XcAoBZVjQ_ZJq7tvNs';

const sb = async (path, method = 'GET', body = null) => {
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
const getScan = async (tabel) => {
  const data = await sb(`${tabel}?order=bijgewerkt.desc`);
  return data;
};

const setScan = async (tabel, body) => {
  const { sleutel, html, gepubliceerd, datum } = body;
  const bestaand = await sb(`${tabel}?sleutel=eq.${encodeURIComponent(sleutel)}`);
  if (bestaand.length > 0) {
    await sb(`${tabel}?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', { html, gepubliceerd, datum, bijgewerkt: new Date().toISOString() });
  } else {
    await sb(tabel, 'POST', { sleutel, html, gepubliceerd, datum });
  }
};

const delScan = async (tabel, sleutel) => {
  await sb(`${tabel}?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
};

export async function onRequestPost({ request, env }) {
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
- Controleer rekensommen (bijv. verbeterpotentieel = som van actiepunten) vóór je ze invult.
- Gebruik Nederlandse sectornormen: brutomarge varieert sterk per sector (bouw ~20–30%, groothandel ~15–25%, zakelijke dienstverlening ~40–60%, horeca ~60–70%, detailhandel ~30–50%).
- Debiteurendagen norm: 30 dgn is goed, 45 dgn is acceptabel, >60 dgn is risico.
- Solvabiliteit norm MKB: >25% is voldoende, >40% is sterk.
- Nettoresultaat norm MKB: >5% is gezond, 2–5% is matig, <2% is kritiek.`;

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
      return new Response(JSON.stringify(await getScan('basisscans')), { headers: cors });
    }
    if (actie === 'setBasisscan') {
      await setScan('basisscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delBasisscan') {
      await delScan('basisscans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── SUBSIDIESCANS ─────────────────────────────────────────────────────
    if (actie === 'getSubsidiescans') {
      return new Response(JSON.stringify(await getScan('subsidiescans')), { headers: cors });
    }
    if (actie === 'setSubsidiescan') {
      await setScan('subsidiescans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delSubsidiescan') {
      await delScan('subsidiescans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── CASHFLOW STRESSTESTS ──────────────────────────────────────────────
    if (actie === 'getCashflowStresstests') {
      return new Response(JSON.stringify(await getScan('cashflowstresstests')), { headers: cors });
    }
    if (actie === 'setCashflowStresstest') {
      await setScan('cashflowstresstests', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delCashflowStresstest') {
      await delScan('cashflowstresstests', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── DEBITEUREN STRESSTESTS ────────────────────────────────────────────
    if (actie === 'getDebiteurenStresstests') {
      return new Response(JSON.stringify(await getScan('debiteurenstresstests')), { headers: cors });
    }
    if (actie === 'setDebiteurenStresstest') {
      await setScan('debiteurenstresstests', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delDebiteurenStresstest') {
      await delScan('debiteurenstresstests', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── OFFERTE MARGESCANS ────────────────────────────────────────────────
    if (actie === 'getOfferteMargescans') {
      return new Response(JSON.stringify(await getScan('offertemargeschans')), { headers: cors });
    }
    if (actie === 'setOfferteMargescan') {
      await setScan('offertemargeschans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delOfferteMargescan') {
      await delScan('offertemargeschans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── FISCALE SCANS ─────────────────────────────────────────────────────
    if (actie === 'getFiscaleScans') {
      return new Response(JSON.stringify(await getScan('fiscalescans')), { headers: cors });
    }
    if (actie === 'setFiscaleScan') {
      await setScan('fiscalescans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delFiscaleScan') {
      await delScan('fiscalescans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── INKOOPANALYSES ────────────────────────────────────────────────────
    if (actie === 'getInkoopanalyses') {
      return new Response(JSON.stringify(await getScan('inkoopanalyses')), { headers: cors });
    }
    if (actie === 'setInkoopanalyse') {
      await setScan('inkoopanalyses', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delInkoopanalyse') {
      await delScan('inkoopanalyses', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── VERZERKERINGSSCANS ────────────────────────────────────────────────
    if (actie === 'getVerzekeringsScans') {
      return new Response(JSON.stringify(await getScan('verzekeringsscans')), { headers: cors });
    }
    if (actie === 'setVerzekeringsScan') {
      await setScan('verzekeringsscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delVerzekeringsScan') {
      await delScan('verzekeringsscans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── PERSONEELSSCANS ───────────────────────────────────────────────────
    if (actie === 'getPersoneelsScans') {
      return new Response(JSON.stringify(await getScan('personeelsscans')), { headers: cors });
    }
    if (actie === 'setPersoneelsScan') {
      await setScan('personeelsscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delPersoneelsScan') {
      await delScan('personeelsscans', body.sleutel);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── EXIT SCANS ────────────────────────────────────────────────────────
    if (actie === 'getExitScans') {
      return new Response(JSON.stringify(await getScan('exitscans')), { headers: cors });
    }
    if (actie === 'setExitScan') {
      await setScan('exitscans', body);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delExitScan') {
      await delScan('exitscans', body.sleutel);
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
