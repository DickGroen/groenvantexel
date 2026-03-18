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
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens, messages: [{ role: 'user', content: prompt }] }),
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
      // Upsert — vervang als zelfde bedrijf+periode al bestaat
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

    // ── SUBSIDIESCANS ─────────────────────────────────────────────────────────
    if (actie === 'getSubsidiescans') {
      const data = await sb('subsidiescans?order=bijgewerkt.desc');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setSubsidiescan') {
      const { sleutel, html, gepubliceerd, datum } = body;
      const bestaand = await sb(`subsidiescans?sleutel=eq.${encodeURIComponent(sleutel)}`);
      if (bestaand.length > 0) {
        await sb(`subsidiescans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', { html, gepubliceerd, datum, bijgewerkt: new Date().toISOString() });
      } else {
        await sb('subsidiescans', 'POST', { sleutel, html, gepubliceerd, datum });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delSubsidiescan') {
      const { sleutel } = body;
      await sb(`subsidiescans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── UPLOAD VERWIJDEREN ───────────────────────────────────────────────────
    if (actie === 'delUpload') {
      const { bedrijf, periode } = body;
      await sb(`uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── BASISSCANS ────────────────────────────────────────────────────────
    if (actie === 'getBasisscans') {
      const data = await sb('basisscans?order=bijgewerkt.desc');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setBasisscan') {
      const { sleutel, html, gepubliceerd, datum } = body;
      const bestaand = await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`);
      if (bestaand.length > 0) {
        await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', { html, gepubliceerd, datum, bijgewerkt: new Date().toISOString() });
      } else {
        await sb('basisscans', 'POST', { sleutel, html, gepubliceerd, datum });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delBasisscan') {
      const { sleutel } = body;
      await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
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
      const { bedrijf, periode, html, gepubliceerd, datum, omzet, brutomarge, debiteurendagen, solvabiliteit, nettoresultaat } = body;
      const bestaand = await sb(`maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`);
      const record = { bedrijf, periode, html, gepubliceerd: gepubliceerd||false, datum: datum||'', omzet: omzet||null, brutomarge: brutomarge||null, debiteurendagen: debiteurendagen||null, solvabiliteit: solvabiliteit||null, nettoresultaat: nettoresultaat||null, bijgewerkt: new Date().toISOString() };
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
